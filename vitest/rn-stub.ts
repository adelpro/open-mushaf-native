/**
 * Lightweight stub for react-native + related native modules.
 *
 * Replaces the real packages in Vitest so unit tests can import code that
 * transitively pulls in `react-native` (Flow-annotated, not parseable by
 * Rolldown). Only the surface used by the AI-search pipeline is mocked;
 * extend as needed for other test suites.
 */

// --- Platform enum (mirrors react-native's Platform.OS) ---
export const Platform = {
  OS: 'web' as 'web' | 'ios' | 'android',
  select<T>(spec: {
    web?: T;
    ios?: T;
    android?: T;
    default?: T;
  }): T | undefined {
    return spec.web ?? spec.default;
  },
};

// --- react-native-mmkv (used by loadEmbedderModel for cache path) ---
export class MMKV {
  private store = new Map<string, string | number | boolean>();

  set(key: string, value: string | number | boolean): void {
    this.store.set(key, value);
  }
  getString(key: string): string | undefined {
    const v = this.store.get(key);
    return typeof v === 'string' ? v : undefined;
  }
  getNumber(key: string): number | undefined {
    const v = this.store.get(key);
    return typeof v === 'number' ? v : undefined;
  }
  getBoolean(key: string): boolean | undefined {
    const v = this.store.get(key);
    return typeof v === 'boolean' ? v : undefined;
  }
  delete(key: string): void {
    this.store.delete(key);
  }
  clearAll(): void {
    this.store.clear();
  }
  addOnValueChangedListener(_listener: (key: string) => void): {
    remove: () => void;
  } {
    return { remove: () => {} };
  }
}

// --- expo-file-system (new class API) ---
type PathLike = string | { path?: string; uri?: string };

function normalize(p: PathLike): string {
  if (typeof p === 'string') return p;
  return p.uri ?? p.path ?? '';
}

export class File {
  public path: PathLike;
  public name?: string;
  constructor(path: PathLike, name?: string) {
    this.path = path;
    this.name = name;
  }
  get uri(): string {
    if (this.name) {
      return `${normalize(this.path).replace(/\/$/, '')}/${this.name}`;
    }
    return normalize(this.path);
  }
  get exists(): boolean {
    return false;
  }
  text(): Promise<string> {
    return Promise.resolve('');
  }
  write(_data: ArrayBuffer | Uint8Array | string): void {}
  delete(): void {}
  create(): void {}
}

export class Directory {
  public path: PathLike;
  public name?: string;
  constructor(path: PathLike, name?: string) {
    this.path = path;
    this.name = name;
  }
  get uri(): string {
    if (this.name) {
      return `${normalize(this.path).replace(/\/$/, '')}/${this.name}`;
    }
    return normalize(this.path);
  }
  get exists(): boolean {
    return true;
  }
  create(_options?: { intermediates?: boolean }): void {}
}

export const Paths = {
  get cache(): Directory {
    return new Directory('/tmp');
  },
};

// Default export placeholder so `import File from 'expo-file-system'` works.
export default { File, Directory, Paths };

// --- expo-file-system/legacy (createJSONStorage fallback path) ---
export const documentDirectory = '/tmp';
export const cacheDirectory = '/tmp';
