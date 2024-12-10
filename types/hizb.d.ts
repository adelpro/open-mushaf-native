export type Hizb = {
  number: number;
  verses_count: number;
  first_verse_key: string; // e.g., "1:1"
  last_verse_key: string; // e.g., "2:74"
  verse_mapping: any;
  startingPage: number;
};
