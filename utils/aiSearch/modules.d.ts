/**
 * Module declarations for binary asset files that have no type info.
 * Metro resolves these to URLs (native: asset URI, web: bundled URL).
 */

declare module '*.bin' {
  const url: string;
  export default url;
}
