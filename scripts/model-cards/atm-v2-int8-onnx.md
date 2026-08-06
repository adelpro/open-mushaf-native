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
- feature-extraction
- sentence-similarity
- onnxruntime-react-native
- dataset_size:75000
- loss:MatryoshkaLoss
- loss:MultipleNegativesRankingLoss
---

# Arabic Triplet Matryoshka V2 (ATM-V2) — INT8 ONNX (Native)

This is an **INT8 dynamic-quantized ONNX export** of
`Omartificial-Intelligence-Space/Arabic-Triplet-Matryoshka-V2`, the
state-of-the-art Arabic embedding model (`ATM2`). It is the runtime model
bundled **on-device** by the open-mushaf Quran reader app for its "بالذكاء
الاصطناعي" (AI) semantic-search tab.

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
| This export | **INT8 dynamic-quantized ONNX** (~135 MB, graph opset 17) |
| License | Apache-2.0 |

## Key Features

- **State-of-the-Art Performance**: Achieved 0.85 on STS17 and 0.64 on
  STS22.v2 with an average score of 74.5 on Arabic semantic similarity.
- **MatryoshkaLoss Training**: Nested embeddings at multiple resolutions.
- **Full Arabic Support**: Handles the complexity and morphological richness
  of Arabic.
- **Small, offline-friendly**: ~135 MB INT8 matches a swap-light-mobile
  budget and runs fully on-device with `onnxruntime-react-native`.

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
- On-device semantic search (as used by open-mushaf).

## File layout (native, flat directory)

This repo hosts the **native** flat layout consumed by the React Native
app via `expo-file-system` + `onnxruntime-react-native`:

```
model.int8.onnx              (~135 MB, INT8 dynamic-quantized)
tokenizer.json
tokenizer_config.json
special_tokens_map.json
```

These 4 files are streamed to the app cache on first AI-search use and reused
offline afterwards. A companion web layout lives in
[`adelpro/atm-v2-web`](https://huggingface.co/adelpro/atm-v2-web).

## Usage (onnxruntime-react-native)

```typescript
import { InferenceSession, Tensor } from 'onnxruntime-react-native';

const session = await InferenceSession.create(modelPath, {
  executionProviders: ['cpu'],
  graphOptimizationLevel: 'all',
});

// Tokenize with the matching tokenizer.json, build input_ids + attention_mask.
const results = await session.run({ input_ids, attention_mask });

// Mean-pool the last hidden state over non-pad tokens, then L2-normalize
// to get the 768-dim embedding — identical to what the web runtime produces,
// so the two platforms share one vector space.
const embedding = meanPoolL2Normalize(results);
```

> **Note:** the vector index built for this model uses **mean pooling +
> L2 normalization** with **no `query:`/`passage:` prefixes** (the upstream
> model card shows plain `encode()`, not an E5-style prefix convention). Keep
> query and stored passages in the same unprefixed space.

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
(Apache-2.0). This ONNX export is the on-device runtime model for the
[open-mushaf-native](https://github.com/adelpro/open-mushaf-native) Quran
reader.*