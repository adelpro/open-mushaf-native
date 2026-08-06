/**
 * Type declarations for build-time dependencies.
 * The runtime app uses its own copies of these packages; the build scripts
 * import them directly from Node.
 */

declare module '@huggingface/transformers' {
  export interface FeatureExtractionPipeline {
    (
      input: string | string[],
      options?: Record<string, unknown>,
    ): Promise<{
      data: Float32Array;
      dims: number[];
    }>;
  }

  export function pipeline(
    task: 'feature-extraction',
    model: string,
    options?: Record<string, unknown>,
  ): Promise<FeatureExtractionPipeline>;

  export const env: {
    cacheDir?: string;
    allowLocalModels?: boolean;
    useFsCache?: boolean;
    backends?: {
      onnx?: {
        wasm?: { proxy?: boolean };
      };
    };
  };
}

declare module '@huggingface/hub' {
  export function createRepo(options: any): Promise<any>;

  export function uploadFile(options: any): Promise<any>;
}
