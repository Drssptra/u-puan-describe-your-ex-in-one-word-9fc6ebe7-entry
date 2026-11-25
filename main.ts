// Describe Your Ex in One Word — make.fun entry
// One word, no punctuation, no caption. The joke is the word itself: an ex
// reduced to a mailing list you finally opted out of. Nothing else attached.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY = "Unsubscribe";

// The gate allows 1 to 111 characters; fail loudly rather than write a
// word the scorer would refuse.
if (ENTRY.length < 1 || ENTRY.length > 111) {
  throw new Error(`entry must be 1-111 characters, got ${ENTRY.length}`);
}
if (/\s/.test(ENTRY)) {
  throw new Error("entry must be exactly one word, no spaces");
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });

// No trailing newline: the scorer reads the file byte for byte.
writeFileSync(join(outDir, "entry.txt"), ENTRY, "utf8");

// Stdout may carry the entry plus a newline.
console.log(ENTRY);
