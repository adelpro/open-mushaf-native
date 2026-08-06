---
base_model: aubmindlab/bert-base-arabertv02
datasets:
- akhooli/arabic-triplets-1m-curated-sims-len
language:
- ar
library_name: onnx
license: apache-2.0
pipeline_tag: feature-extraction
tags:
- sentence-transformers
- onnx
- transformers.js
- feature-extraction
- sentence-similarity
- dataset_size:75000
- loss:MatryoshkaLoss
- loss:MultipleNegativesRankingLoss
---

# Arabic Triplet Matryoshka V2 (ATM-V2) — INT8 ONNX (Web / transformers.js)

This is an **INT8 dynamic-quantized ONNX export** of
`Omartificial-Intelligence-Space/Arabic-Triplet-Matryoshka-V2`, the
state-of-the-art Arabic embedding model (`ATM2`), laid out for the
**transformers.js** (`@huggingface/transformers`) web runtime. It powers the
"بالذكاء الاصطناعي" (AI) semantic-search tab of the open-mushaf Quran reader
in the browser (PWA).

The model maps Arabic sentences and verses to a 768-dimensional dense vector
space for semantic search, similarity, IR, and clustering. It is fine-tuned
from [aubmindlab/bert-base-arabertv02](https://huggingface.co/aubmindlab/bert-base-arabertv02)
and described in the paper
[GATE: General Arabic Text Embedding for Enhanced Semantic Textual Similarity with Hybrid Loss Training](https://huggingface.co/papers/2505.24581).

## Model Description

Arabic-Triplet-Matryoshka-V2-Model is a state-of-the-art Arabic language
embedding model based on the [sentence-transformers](https://www.SBERT.net)
framework and specifically designed to capture the rich semantic nuances of
Arabic text.

| Attribute | Value |
|---|---|
| Base model | `aubmindlab/bert-base-arabertv02` |
| Embedding dimension | 768 |
| Parameters | 135M |
| Pretrained model format | fp32 safetensors |
| This export | **INT8 dynamic-quantized ONNX** (`onnx/model_quantized.onnx`) |
| Runtime | `@huggingface/transformers` (transformers.js) WASM backend |
| License | Apache-2.0 |

## Key Features

- **State-of-the-Art Performance**: Achieved 0.85 on STS17 and 0.64 on
  STS22.v2 with an average score of 74.5 on Arabic semantic similarity.
- **MatryoshkaLoss Training**: Nested embeddings at multiple resolutions.
- **Full Arabic Support**: Handles the complexity and morphological richness
  of Arabic.
- **Browser-ready**: runs in-browser via transformers.js with the `q8` dtype.

## Training Details

- **Loss functions**: `MatryoshkaLoss` + `MultipleNegativesRankingLoss`.
- **Dataset**: `akhooli/arabic-triplets-1m-curated-sims-len` (1M samples).
- **Epochs**: 3 · **Final loss**: 0.718 · **Embedding dim**: 768.

## Performance

From the original model card (Arabic semantic similarity benchmarks):

| Model | Dim | Params | STS17 | STS22-v2 | Avg |
|---|---|---|---|---|---|
| **ATM-V2 (this repo base)** | 768 | 135M | 85 | 64 | 75 |

See the upstream
[`Omartificial-Intelligence-Space/Arabic-Triplet-Matryoshka-V2`](https://huggingface.co/Omartificial-Intelligence-Space/Arabic-Triplet-Matryoshka-V2)
card for the full comparison table.

## Use Cases

- Semantic textual similarity, document retrieval, question answering,
  clustering, and classification of Arabic text.
- Client-side semantic search in the browser (as used by the open-mushaf PWA).

## File layout (transformers.js)

This repo hosts the **web** layout expected by `transformers.js`:

```
config.json
tokenizer.json
tokenizer_config.json
special_tokens_map.json
onnx/model_quantized.onnx
```

With the pipeline configured as `dtype: 'q8'`, transformers.js resolves the
`q8` precision to `onnx/model_quantized.onnx`. The repo **must remain
public** — transformers.js fetches these files over plain HTTPS with no auth.

A companion native layout lives in
[`adelpro/atm-v2-int8-onnx`](https://huggingface.co/adelpro/atm-v2-int8-onnx).

## Usage (@huggingface/transformers)

```js
import { pipeline } from '@huggingface/transformers';

const extractor = await pipeline('feature-extraction', 'adelpro/atm-v2-web', {
  dtype: 'q8',
  device: 'wasm',
});

const out = await extractor('الرَّحْمَنُ عَلَّمَ الْقُرْآنَ', {
  pooling: 'mean',
  normalize: true,
});
// out.data is the 768-dim L2-normalized embedding.
```

> **Note:** the vector index built for this model uses **mean pooling +
> L2 normalization** with **no `query:`/`passage:` prefixes** (the upstream
> model card shows plain `encode()`, not an E5-style prefix convention). Keep
> query and stored passages in the same unprefixed space. The WASM backend
> runs single-threaded to avoid SharedArrayBuffer / cross-origin isolation
> requirements.

## Limitations

- May not perform optimally on highly technical / domain-specific Arabic that
  was underrepresented in training.
- A one-word short query (e.g. a proper noun) embeds weakly relative to long
  passages; semantically-linked epithets may not surface at high cosine.
- Int8 dynamic quantization introduces small weight-precision loss compared
  to the fp32 original.

## Ethical Considerations
Intended for research and applications that benefit Arabic language
processing. Biases that may exist in the training data should be considered.

## Citation
Cite the upstream paper when referencing this model's methodology:

```bibtex
@article{nacar2025gate,
  title={GATE: General Arabic Text Embedding for Enhanced Semantic Textual Similarity with Matryoshka Representation Learning and Hybrid Loss Training},
  author={Nacar, Omer and Koubaa, Anis and Sibaee, Serry and Al-Habashi, Yasser and Ammar, Adel and Boulila, Wadii},
  journal={arXiv preprint arXiv:2505.24581},
  year={2025}
}
```

## Acknowledgements
Built on [aubmindlab/bert-base-arabertv02](https://huggingface.co/aubmindlab/bert-base-arabertv02)
and the [akhooli/arabic-triplets-1m-curated-sims-len](https://huggingface.co/datasets/akhooli/arabic-triplets-1m-curated-sims-len)
dataset.

---

*Derived from
[Omartificial-Intelligence-Space/Arabic-Triplet-Matryoshka-V2](https://huggingface.co/Omartificial-Intelligence-Space/Arabic-Triplet-Matryoshka-V2)
(Apache-2.0). This ONNX export is the browser runtime model for the
[open-mushaf-native](https://github.com/adelpro/open-mushaf-native) Quran
reader.*