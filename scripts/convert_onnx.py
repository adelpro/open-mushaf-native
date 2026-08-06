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

    python scripts/convert_onnx.py

Requires (one-off, local venv):
    pip install optimum[onnxruntime] onnx onnxruntime transformers

Outputs (NOT committed by default; use .gitignore):
    out/model.int8.onnx         ~140 MB
    out/tokenizer.json            ~2 MB
    out/tokenizer_config.json
    out/special_tokens_map.json
"""

from __future__ import annotations

import argparse
import shutil
import sys
from pathlib import Path

MODEL_NAME = "Omartificial-Intelligence-Space/Arabic-Triplet-Matryoshka-V2"
EMBEDDING_DIM = 768


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

    print()
    print("Next steps:")
    print("  The model is already hosted at:")
    print("    https://huggingface.co/adelpro/atm-v2-int8-onnx")
    print("  The runtime reads the CDN URL from constants/aiSearch.ts.")
    print("  To update the hosted model with these new files:")
    print("    yarn build:model:upload adelpro/atm-v2-int8-onnx")
    print("  Or to run everything in one shot (maintainers only):")
    print("    yarn build:ai:full")
    print("Done.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
