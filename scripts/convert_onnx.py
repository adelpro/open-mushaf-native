"""
Phase 1b — Convert + INT8-quantize the Arabic-Triplet-Matryoshka-V2 model
to ONNX, for the React Native runtime.

This step cannot be done in pure JavaScript:
  - The upstream model ships only safetensors (no prebuilt ONNX).
  - No Xenova pre-quantized port exists for this specific model
    (HF API returns 401 on every Xenova/* path we tested).
  - @huggingface/transformers in Node cannot do safetensors→ONNX
    conversion (only the browser WASM backend can).
  - optimum-cli (the standard tool) is Python-only.

So this Python script is the only realistic path. It is run once, offline,
to produce the ONNX artifact. The resulting 4 files (model + tokenizer) are
then either:
  - committed to assets/ai-search/atm-v2-onnx/ (local), OR
  - uploaded to the hosted HF Hub repo (yarn build:model:upload adelpro/atm-v2-int8-onnx)

NOTE: The model is already hosted at:
    https://huggingface.co/adelpro/atm-v2-int8-onnx
You only need to run this script if you want to regenerate or update the model.
Most contributors only need: yarn build:vectors

Run from the repo root:

    python scripts/convert_onnx.py [--emit-web-layout]

Adds the `--emit-web-layout` flag for the @huggingface/transformers (web)
runtime, which expects a different directory layout than the native
flat-file layout:

    out/model.int8.onnx           (native — kept as-is)
    out/tokenizer.json
    out/tokenizer_config.json
    out/special_tokens_map.json
    out/web/onnx/model_quantized.onnx   (web; copied from int8 ONNX)
    out/web/config.json                 (web; fetched from base repo)

The web layout is what `transformers.js`'s `pipeline()` expects when given
a HF repo id with `dtype: 'q8'` — see embedderRuntime.web.ts. Default
`out` is `assets/ai-search/atm-v2-onnx/`; web files land in `out/web/`.

Requires (one-off, local venv):
    pip install optimum[onnxruntime] onnx onnxruntime transformers huggingface_hub

Outputs (NOT committed by default; use .gitignore):
    out/model.int8.onnx         ~140 MB
    out/tokenizer.json            ~2 MB
    out/tokenizer_config.json
    out/special_tokens_map.json
    (only with --emit-web-layout:)
    out/web/onnx/model_quantized.onnx
    out/web/config.json
"""

from __future__ import annotations

import argparse
import shutil
import sys
from pathlib import Path

MODEL_NAME = "Omartificial-Intelligence-Space/Arabic-Triplet-Matryoshka-V2"
EMBEDDING_DIM = 768


def emit_web_layout(native_out_dir: Path, web_out_dir: Path) -> None:
    """
    Copy the native ONNX + tokenizer files into the layout that
    @huggingface/transformers expects, plus fetch `config.json` from the
    base repo. transformers.js needs `config.json` at the repo root and
    `onnx/model_quantized.onnx` for the q8 dtype.

    Why fetch `config.json` from the base repo rather than deriving it from
    the optimum export? The optimum export writes a different schema (with
    `task`, `optimum_version`, etc.). transformers.js's `pipeline()` validates
    `model_type` and `architectures` and bails out on the wrong shape.
    """
    web_out_dir.mkdir(parents=True, exist_ok=True)
    web_onnx_dir = web_out_dir / "onnx"
    web_onnx_dir.mkdir(parents=True, exist_ok=True)

    src_int8 = native_out_dir / "model.int8.onnx"
    dst_quantized = web_onnx_dir / "model_quantized.onnx"
    print(f"  → {dst_quantized.name} (copy from {src_int8.name})")
    shutil.copy2(src_int8, dst_quantized)

    for fname in ("tokenizer.json", "tokenizer_config.json", "special_tokens_map.json"):
        src = native_out_dir / fname
        dst = web_out_dir / fname
        if src.exists():
            print(f"  → {fname}")
            shutil.copy2(src, dst)
        else:
            print(f"  ! {fname} missing in native layout — skipping")

    # transformers.js's config.json validation is strict: model_type must be
    # one of the supported architectures, hidden_size must match, and the
    # transformers.js session loader needs `tokenizer_class`. Pull the
    # sentence-transformers config from the base repo, which is already
    # transformer-shaped.
    try:
        from huggingface_hub import hf_hub_download
    except ImportError:
        sys.exit(
            "--emit-web-layout needs the `huggingface_hub` Python package. "
            "Run `pip install huggingface_hub`."
        )

    config_path = Path(
        hf_hub_download(
            repo_id=MODEL_NAME,
            filename="config.json",
            local_dir=str(web_out_dir),
        )
    )
    print(f"  → config.json (downloaded from {MODEL_NAME})")

    # Some sentence-transformers repos ship `1_Pooling/config.json` with
    # `pooling_mode_mean_tokens: true`. transformers.js's pipeline looks at
    # only the root `config.json`, so merge the pooling block in if present.
    try:
        pooling_path = Path(
            hf_hub_download(
                repo_id=MODEL_NAME,
                filename="1_Pooling/config.json",
                local_dir=str(web_out_dir),
            )
        )
        import json

        with config_path.open("r", encoding="utf-8") as f:
            cfg = json.load(f)
        with pooling_path.open("r", encoding="utf-8") as f:
            pooling = json.load(f)
        # Only merge if not already present.
        if "pooling_mode_mean_tokens" not in cfg:
            cfg["pooling_mode_mean_tokens"] = pooling.get(
                "pooling_mode_mean_tokens", True
            )
        with config_path.open("w", encoding="utf-8") as f:
            json.dump(cfg, f, indent=2)
        print("  → merged 1_Pooling/config.json into config.json")
    except Exception as err:  # noqa: BLE001 — 1_Pooling is optional
        print(f"  (no 1_Pooling/config.json — {err})")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--out",
        default="assets/ai-search/atm-v2-onnx",
        help="Output directory (relative to repo root). Default: assets/ai-search/atm-v2-onnx/",
    )
    parser.add_argument(
        "--opset",
        type=int,
        default=17,
        help="ONNX opset (default 17).",
    )
    parser.add_argument(
        "--emit-web-layout",
        action="store_true",
        help=(
            "Also produce the @huggingface/transformers (web) layout under "
            "out/web/ — config.json + onnx/model_quantized.onnx + tokenizer "
            "files. Use with yarn build:model:upload --target=web."
        ),
    )
    args = parser.parse_args()

    repo_root = Path(__file__).resolve().parent.parent
    out_dir = (repo_root / args.out).resolve()
    out_dir.mkdir(parents=True, exist_ok=True)

    print(f"Loading {MODEL_NAME} from Hugging Face...")
    from optimum.onnxruntime import ORTModelForFeatureExtraction
    from transformers import AutoTokenizer

    print("Exporting to ONNX (fp32)...")
    tmp_dir = out_dir / "fp32_tmp"
    model = ORTModelForFeatureExtraction.from_pretrained(
        MODEL_NAME,
        export=True,
    )
    model.save_pretrained(tmp_dir)

    fp32_onnx = tmp_dir / "model.onnx"
    if not fp32_onnx.exists():
        candidates = list(tmp_dir.glob("*.onnx"))
        if candidates:
            fp32_onnx = candidates[0]
        else:
            sys.exit("Could not find exported ONNX file in fp32_tmp/")

    print(f"  fp32 ONNX: {fp32_onnx} ({fp32_onnx.stat().st_size / 1e6:.2f} MB)")

    print("Quantizing to INT8 (dynamic, weights only)...")
    from onnxruntime.quantization import QuantType, quantize_dynamic

    int8_path = out_dir / "model.int8.onnx"
    quantize_dynamic(
        model_input=str(fp32_onnx),
        model_output=str(int8_path),
        weight_type=QuantType.QInt8,
    )
    print(f"  int8 ONNX: {int8_path} ({int8_path.stat().st_size / 1e6:.2f} MB)")

    del model
    import gc
    gc.collect()
    shutil.rmtree(tmp_dir, ignore_errors=True)

    print("Exporting tokenizer files...")
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    tokenizer.save_pretrained(out_dir)
    for fname in ("tokenizer.json", "tokenizer_config.json", "special_tokens_map.json"):
        target = out_dir / fname
        if target.exists():
            print(f"  {fname} ({target.stat().st_size / 1024:.1f} KB)")

    if args.emit_web_layout:
        web_out_dir = out_dir / "web"
        print()
        print(f"Emitting web layout → {web_out_dir}/")
        emit_web_layout(out_dir, web_out_dir)

    print()
    print("Next steps:")
    print("  The native model is already hosted at:")
    print("    https://huggingface.co/adelpro/atm-v2-int8-onnx")
    print("  To update it:")
    print("    yarn build:model:upload --target=native adelpro/atm-v2-int8-onnx")
    if args.emit_web_layout:
        print("  The web layout is in: " + str(out_dir / "web"))
        print("  To upload it (first time only — create the repo in HF UI):")
        print("    yarn build:model:upload --target=web adelpro/atm-v2-web")
    print("  Or to run everything in one shot (maintainers only):")
    print("    yarn build:ai:full")
    print("Done.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
