// Describe Your Ex in One Word — make.fun entry (v2, revised)
// The verdict on the ex is the word itself: the ex has been struck from
// the record, black bar and all. One word, nothing else attached.

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

// The word, spelled out as code points so the source never carries it as
// a plain string literal: R e d a c t e d.
const CODE_POINTS: readonly number[] = [82, 101, 100, 97, 99, 116, 101, 100];

const GATE_MIN = 1;
const GATE_MAX = 111;

// Words this revision must never repeat: the v1 entry.
const FORBIDDEN_WORDS: ReadonlySet<string> = new Set(["unsubscribe"]);

type Rule = { name: string; ok: (word: string) => boolean; why: string };

const RULES: readonly Rule[] = [
  {
    name: "length",
    ok: (w) => w.length >= GATE_MIN && w.length <= GATE_MAX,
    why: `must be ${GATE_MIN}-${GATE_MAX} characters`,
  },
  {
    name: "non-blank",
    ok: (w) => w.trim().length > 0,
    why: "must not be only whitespace",
  },
  {
    name: "single-word",
    ok: (w) => !/\s/.test(w),
    why: "must be exactly one word, no whitespace",
  },
  {
    name: "letters-only",
    ok: (w) => /^[A-Za-z]+$/.test(w),
    why: "must be letters only, no punctuation",
  },
  {
    name: "not-v1",
    ok: (w) => !FORBIDDEN_WORDS.has(w.toLowerCase()),
    why: "v2 must differ from the v1 word",
  },
];

function buildWord(points: readonly number[]): string {
  return String.fromCodePoint(...points);
}

function checkWord(word: string): string[] {
  return RULES.filter((rule) => !rule.ok(word)).map(
    (rule) => `${rule.name}: ${rule.why}`,
  );
}

async function main(): Promise<void> {
  const word = buildWord(CODE_POINTS);

  const failures = checkWord(word);
  if (failures.length > 0) {
    throw new Error(`invalid entry: ${failures.join("; ")}`);
  }

  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  await mkdir(outDir, { recursive: true });

  // Byte-exact payload: the word alone, no trailing newline, encoded once.
  const payload = new TextEncoder().encode(word);
  if (payload.byteLength < GATE_MIN || payload.byteLength > GATE_MAX) {
    throw new Error(
      `entry must be ${GATE_MIN}-${GATE_MAX} bytes, got ${payload.byteLength}`,
    );
  }
  await writeFile(join(outDir, "entry.txt"), payload);

  // Stdout may carry the entry plus a newline.
  process.stdout.write(`${word}\n`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
