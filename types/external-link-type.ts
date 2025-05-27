export type ExternalLinkType =
  | `http${string}`
  | `https${string}`
  | `mailto${string}`
  | `tel${string}`;
