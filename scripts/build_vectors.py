"""
Build the Quran vector database assets for offline AI search.

Encodes 6,236 Quran verses (prefixed with Tafseer Al-Muyassar) into a quantized
Int8 vector index (quran_vectors.bin + quran_vectors_meta.json).

Usage:
    python scripts/build_vectors.py [--model MODEL_ID] [--dim DIM]

Prerequisites checked before execution:
    - Input files existence (quran.json, muyassar.json)
    - Model availability on HuggingFace / local cache
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

DEFAULT_MODEL = "Omartificial-Intelligence-Space/Arabic-Triplet-Matryoshka-V2"
DEFAULT_DIM = 768


def strip_html(s: str) -> str:
    return re.sub(r"</?p>", "", s).strip()


def check_prerequisites(quran_path: Path, tafseer_path: Path, model_id: str) -> tuple[bool, str]:
    """Check inputs and model availability before committing to long encoding tasks."""
    if not quran_path.exists():
        return False, f"Missing Quran metadata file: {quran_path}"
    if not tafseer_path.exists():
        return False, f"Missing Tafseer file: {tafseer_path}"

    print(f"Checking availability of model '{model_id}'...")
    try:
        from transformers import AutoTokenizer, AutoModel
        # Test loading tokenizer & model header
        AutoTokenizer.from_pretrained(model_id)
        AutoModel.from_pretrained(model_id)
        print(f"[OK] Model '{model_id}' is available and loaded successfully.")
    except Exception as e:
        return False, (
            f"Failed to load model '{model_id}' from HuggingFace/cache.\n"
            f"Error details: {e}\n"
            f"Please verify your internet connection or check if model ID is correct."
        )

    return True, ""



def main() -> int:
    parser = argparse.ArgumentParser(description="Build Quran vector index for AI search.")
    parser.add_argument("--model", default=DEFAULT_MODEL, help=f"HuggingFace model ID (default: {DEFAULT_MODEL})")
    parser.add_argument("--dim", type=int, default=DEFAULT_DIM, help=f"Vector dimension (default: {DEFAULT_DIM})")
    args = parser.parse_args()

    repo_root = Path(__file__).resolve().parent.parent
    quran_path = repo_root / "assets" / "quran-metadata" / "shared" / "quran.json"
    tafseer_path = repo_root / "assets" / "tafaseer" / "muyassar.json"
    out_dir = repo_root / "assets" / "ai-search"
    out_dir.mkdir(parents=True, exist_ok=True)

    out_bin = out_dir / "quran_vectors.bin"
    out_meta = out_dir / "quran_vectors_meta.json"

    # Step 1: Explicit availability check
    ok, error_msg = check_prerequisites(quran_path, tafseer_path, args.model)
    if not ok:
        print("\n" + "=" * 60)
        print("ERROR: PREREQUISITE CHECK FAILED")
        print("=" * 60)
        print(error_msg)
        print("=" * 60 + "\n")
        return 1

    # Step 2: Load input data
    print("\nLoading Quran verses and Tafseer Al-Muyassar...")
    with open(quran_path, "r", encoding="utf-8") as f:
        quran_data = json.load(f)
    quran_data.sort(key=lambda x: x["gid"])

    with open(tafseer_path, "r", encoding="utf-8") as f:
        tafseer_raw = json.load(f)

    tafseer_map = {}
    for t in tafseer_raw:
        clean = strip_html(t.get("text", ""))
        if clean:
            tafseer_map[f"{t['sura']}:{t['aya']}"] = clean

    passages = []
    meta = []
    for v in quran_data:
        sura = v["sura_id"]
        aya = v["aya_id"]
        t_text = tafseer_map.get(f"{sura}:{aya}", "")
        clean_text = v.get("standard", "")
        passage = f"{clean_text} | تفسير: {t_text}"
        passages.append(passage)

        meta.append({
            "gid": v["gid"],
            "sura_id": sura,
            "aya_id": aya,
            "text_uthmani": v.get("uthmani", ""),
            "text_clean": clean_text,
        })

    print(f"Loaded {len(passages)} passages across {len(quran_data)} verses.")

    # Step 3: Compute embeddings
    print(f"Encoding {len(passages)} passages with {args.model} (dim={args.dim})...")
    import os
    import torch
    from transformers import AutoTokenizer, AutoModel

    tokenizer = AutoTokenizer.from_pretrained(args.model)
    model = AutoModel.from_pretrained(args.model)
    model.eval()

    cuda_available = torch.cuda.is_available()
    if cuda_available:
        device = "cuda"
        print(f"Using compute device: CUDA GPU ({torch.cuda.get_device_name(0)})")
    else:
        device = "cpu"
        num_cpus = os.cpu_count() or 4
        torch.set_num_threads(num_cpus)
        print(f"Using compute device: CPU (PyTorch CUDA not detected; utilizing {num_cpus} CPU threads)")
        print("Note: To enable NVIDIA GPU acceleration, run: pip install torch --index-url https://download.pytorch.org/whl/cu121")

    model.to(device)

    batch_size = 64 if not cuda_available else 128
    all_embeddings = []


    for i in range(0, len(passages), batch_size):
        batch_text = passages[i : i + batch_size]
        inputs = tokenizer(
            batch_text,
            padding=True,
            truncation=True,
            max_length=256,
            return_tensors="pt",
        ).to(device)

        with torch.no_grad():
            outputs = model(**inputs)
            # outputs.last_hidden_state: [batch_size, seq_len, hidden_dim]
            last_hidden = outputs.last_hidden_state
            attention_mask = inputs["attention_mask"].unsqueeze(-1).expand(last_hidden.size()).float()

            sum_embeddings = torch.sum(last_hidden * attention_mask, 1)
            sum_mask = torch.clamp(attention_mask.sum(1), min=1e-9)
            mean_pooled = sum_embeddings / sum_mask

            # Truncate if Matryoshka dim requested is less than hidden dim
            if args.dim < mean_pooled.shape[1]:
                mean_pooled = mean_pooled[:, : args.dim]

            # L2 normalize
            norm = torch.norm(mean_pooled, p=2, dim=1, keepdim=True)
            norm = torch.clamp(norm, min=1e-9)
            normalized = mean_pooled / norm
            all_embeddings.append(normalized.cpu())

        if (i // batch_size + 1) % 10 == 0 or i + batch_size >= len(passages):
            print(f"  Processed {min(i + batch_size, len(passages))}/{len(passages)} verses...")

    tensor_all = torch.cat(all_embeddings, dim=0) # shape (6236, dim)

    # Step 4: Quantize to Int8 (-127 to 127)
    print("Quantizing embeddings to Int8...")
    scaled = torch.clamp(tensor_all, -1.0, 1.0) * 127.0
    int8_bytes = torch.round(scaled).to(torch.int8).numpy().tobytes()

    # Step 5: Save outputs
    with open(out_bin, "wb") as f:
        f.write(int8_bytes)
    print(f"Saved binary index: {out_bin} ({len(int8_bytes) / 1e6:.2f} MB)")

    with open(out_meta, "w", encoding="utf-8") as f:
        json.dump(meta, f, ensure_ascii=False)
    print(f"Saved metadata index: {out_meta} ({len(meta)} records)")

    print("\n[SUCCESS] Vector database generation completed successfully!")
    return 0


if __name__ == "__main__":
    if sys.platform == "win32":
        try:
            sys.stdout.reconfigure(encoding="utf-8")
        except Exception:
            pass
    sys.exit(main())

