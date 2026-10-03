/**
 * QR-encoder — byte-modus, versies 1 t/m 10, alle vier de foutcorrectieniveaus.
 * Volledig zelf geschreven volgens ISO/IEC 18004, zonder dependencies.
 *
 * Geeft een vierkante matrix terug: true = donkere module.
 */

export type QrErrorLevel = "L" | "M" | "Q" | "H";

export interface QrEncodeOptions {
  /** Foutcorrectie: L ~7%, M ~15%, Q ~25%, H ~30% herstelbaar. */
  level?: QrErrorLevel;
  /** Vast maskerpatroon 0-7. Standaard kiest de encoder het beste. */
  mask?: number;
  /** Minimale versie (1-10); de encoder kan hoger gaan als de data niet past. */
  minVersion?: number;
}

/** Hoogste versie die deze encoder ondersteunt. */
export const QR_MAX_VERSION = 10;

/**
 * Per versie (index 0 = versie 1):
 * [ec-codewords per blok, blokken groep 1, datacodewords groep 1, blokken groep 2, datacodewords groep 2]
 */
const BLOCKS: Record<QrErrorLevel, ReadonlyArray<readonly [number, number, number, number, number]>> = {
  L: [
    [7, 1, 19, 0, 0], [10, 1, 34, 0, 0], [15, 1, 55, 0, 0], [20, 1, 80, 0, 0], [26, 1, 108, 0, 0],
    [18, 2, 68, 0, 0], [20, 2, 78, 0, 0], [24, 2, 97, 0, 0], [30, 2, 116, 0, 0], [18, 2, 68, 2, 69],
  ],
  M: [
    [10, 1, 16, 0, 0], [16, 1, 28, 0, 0], [26, 1, 44, 0, 0], [18, 2, 32, 0, 0], [24, 2, 43, 0, 0],
    [16, 4, 27, 0, 0], [18, 4, 31, 0, 0], [22, 2, 38, 2, 39], [22, 3, 36, 2, 37], [26, 4, 43, 1, 44],
  ],
  Q: [
    [13, 1, 13, 0, 0], [22, 1, 22, 0, 0], [18, 2, 17, 0, 0], [26, 2, 24, 0, 0], [18, 2, 15, 2, 16],
    [24, 4, 19, 0, 0], [18, 2, 14, 4, 15], [22, 4, 18, 2, 19], [20, 4, 16, 4, 17], [24, 6, 19, 2, 20],
  ],
  H: [
    [17, 1, 9, 0, 0], [28, 1, 16, 0, 0], [22, 2, 13, 0, 0], [16, 4, 9, 0, 0], [22, 2, 11, 2, 12],
    [28, 4, 15, 0, 0], [26, 4, 13, 1, 14], [26, 4, 14, 2, 15], [24, 4, 12, 4, 13], [28, 6, 15, 2, 16],
  ],
};

/** Middelpunten van de uitlijnpatronen per versie (index 0 = versie 1). */
const ALIGNMENT: ReadonlyArray<readonly number[]> = [
  [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50],
];

/** Bits van het foutcorrectieniveau in de formaat-informatie. */
const LEVEL_BITS: Record<QrErrorLevel, number> = { L: 0b01, M: 0b00, Q: 0b11, H: 0b10 };

/* ------------------------------------------------------------------ */
/* GF(256), primitieve veelterm 0x11D                                  */
/* ------------------------------------------------------------------ */
const EXP = new Uint8Array(512);
const LOG = new Uint8Array(256);

for (let i = 0, x = 1; i < 255; i += 1) {
  EXP[i] = x;
  LOG[x] = i;
  x <<= 1;
  if (x & 0x100) x ^= 0x11d;
}
for (let i = 255; i < 512; i += 1) EXP[i] = EXP[i - 255];

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return EXP[LOG[a] + LOG[b]];
}

/** Generatorveelterm voor n ec-codewords: (x - a^0)(x - a^1)...(x - a^(n-1)). */
function generator(n: number): Uint8Array {
  let poly = new Uint8Array([1]);
  for (let i = 0; i < n; i += 1) {
    const next = new Uint8Array(poly.length + 1);
    for (let j = 0; j < poly.length; j += 1) {
      next[j] ^= poly[j];
      next[j + 1] ^= gfMul(poly[j], EXP[i]);
    }
    poly = next;
  }
  return poly;
}

/** Reed-Solomon-restwaarde: de foutcorrectiecodewords bij één blok data. */
export function ecCodewords(data: Uint8Array, count: number): Uint8Array {
  const gen = generator(count);
  const rest = new Uint8Array(data.length + count);
  rest.set(data);

  for (let i = 0; i < data.length; i += 1) {
    const factor = rest[i];
    if (factor === 0) continue;
    for (let j = 0; j < gen.length; j += 1) rest[i + j] ^= gfMul(gen[j], factor);
  }
  return rest.slice(data.length);
}

/* ------------------------------------------------------------------ */
/* BCH voor formaat- en versie-informatie                              */
/* ------------------------------------------------------------------ */
function bch(value: number, poly: number, bits: number): number {
  let rest = value << bits;
  const top = 1 << (bits + degree(poly));
  for (let i = top; i >= 1 << bits; i >>= 1) {
    if (rest & i) rest ^= poly * (i >> bits);
  }
  return rest;
}

function degree(poly: number): number {
  let d = -1;
  for (let v = poly; v; v >>= 1) d += 1;
  return d;
}

/** 15 bits formaat-informatie: niveau + masker, BCH(15,5) + XOR-masker. */
function formatBits(level: QrErrorLevel, mask: number): number {
  const data = (LEVEL_BITS[level] << 3) | mask;
  return ((data << 10) | bch(data, 0b10100110111, 10)) ^ 0b101010000010010;
}

/** 18 bits versie-informatie (alleen versie 7 en hoger). */
function versionBits(version: number): number {
  return (version << 12) | bch(version, 0b1111100100101, 12);
}

/* ------------------------------------------------------------------ */
/* Bitbuffer                                                           */
/* ------------------------------------------------------------------ */
class BitBuffer {
  private bits: number[] = [];

  push(value: number, length: number): void {
    for (let i = length - 1; i >= 0; i -= 1) this.bits.push((value >> i) & 1);
  }

  get length(): number {
    return this.bits.length;
  }

  toBytes(total: number): Uint8Array {
    const bytes = new Uint8Array(total);
    for (let i = 0; i < this.bits.length; i += 1) {
      if (this.bits[i]) bytes[i >> 3] |= 0x80 >> (i & 7);
    }
    return bytes;
  }
}

/* ------------------------------------------------------------------ */
/* Functiepatronen                                                     */
/* ------------------------------------------------------------------ */
type Grid = { modules: (boolean | null)[][]; reserved: boolean[][]; size: number };

function emptyGrid(size: number): Grid {
  return {
    size,
    modules: Array.from({ length: size }, () => Array<boolean | null>(size).fill(null)),
    reserved: Array.from({ length: size }, () => Array<boolean>(size).fill(false)),
  };
}

function set(grid: Grid, row: number, column: number, dark: boolean, reserve = true): void {
  grid.modules[row][column] = dark;
  if (reserve) grid.reserved[row][column] = true;
}

function finder(grid: Grid, row: number, column: number): void {
  for (let r = -1; r <= 7; r += 1) {
    for (let c = -1; c <= 7; c += 1) {
      const rr = row + r;
      const cc = column + c;
      if (rr < 0 || cc < 0 || rr >= grid.size || cc >= grid.size) continue;
      const inRing = (r === 0 || r === 6) && c >= 0 && c <= 6;
      const inSide = (c === 0 || c === 6) && r >= 0 && r <= 6;
      const inCore = r >= 2 && r <= 4 && c >= 2 && c <= 4;
      set(grid, rr, cc, inRing || inSide || inCore);
    }
  }
}

function alignment(grid: Grid, version: number): void {
  const centers = ALIGNMENT[version - 1];
  for (const row of centers) {
    for (const column of centers) {
      // Niet bovenop de zoekpatronen.
      const corner =
        (row === 6 && column === 6) ||
        (row === 6 && column === grid.size - 7) ||
        (row === grid.size - 7 && column === 6);
      if (corner) continue;
      for (let r = -2; r <= 2; r += 1) {
        for (let c = -2; c <= 2; c += 1) {
          const ring = Math.max(Math.abs(r), Math.abs(c));
          set(grid, row + r, column + c, ring !== 1);
        }
      }
    }
  }
}

function timing(grid: Grid): void {
  for (let i = 8; i < grid.size - 8; i += 1) {
    const dark = i % 2 === 0;
    set(grid, 6, i, dark);
    set(grid, i, 6, dark);
  }
}

/** Reserveert de plaatsen van formaat- en versie-informatie plus de vaste donkere module. */
function reserveInfo(grid: Grid, version: number): void {
  for (let i = 0; i < 9; i += 1) {
    if (!grid.reserved[8][i]) set(grid, 8, i, false);
    if (!grid.reserved[i][8]) set(grid, i, 8, false);
  }
  for (let i = 0; i < 8; i += 1) {
    set(grid, 8, grid.size - 1 - i, false);
    set(grid, grid.size - 1 - i, 8, false);
  }
  // Vaste donkere module, links onder het rechterzoekpatroon.
  set(grid, grid.size - 8, 8, true);

  if (version >= 7) {
    for (let i = 0; i < 18; i += 1) {
      const row = Math.floor(i / 3);
      const column = i % 3;
      set(grid, row, grid.size - 11 + column, false);
      set(grid, grid.size - 11 + column, row, false);
    }
  }
}

function writeFormat(grid: Grid, level: QrErrorLevel, mask: number): void {
  const bits = formatBits(level, mask);
  /** Positie 0 is de meest significante bit — zo staat het in de norm. */
  const at = (index: number) => ((bits >> (14 - index)) & 1) === 1;

  // Eerste kopie: rond het linkerbovenzoekpatroon.
  for (let i = 0; i <= 5; i += 1) set(grid, 8, i, at(i));
  set(grid, 8, 7, at(6));
  set(grid, 8, 8, at(7));
  set(grid, 7, 8, at(8));
  for (let i = 9; i <= 14; i += 1) set(grid, 14 - i, 8, at(i));

  // Tweede kopie: onder links (7 modules, de achtste is de vaste donkere) en rechtsboven.
  for (let i = 0; i <= 6; i += 1) set(grid, grid.size - 1 - i, 8, at(i));
  for (let i = 7; i <= 14; i += 1) set(grid, 8, grid.size - 15 + i, at(i));
}

function writeVersion(grid: Grid, version: number): void {
  if (version < 7) return;
  const bits = versionBits(version);
  for (let i = 0; i < 18; i += 1) {
    const dark = ((bits >> i) & 1) === 1;
    const row = Math.floor(i / 3);
    const column = i % 3;
    set(grid, row, grid.size - 11 + column, dark);
    set(grid, grid.size - 11 + column, row, dark);
  }
}

/* ------------------------------------------------------------------ */
/* Maskers en straf-score                                              */
/* ------------------------------------------------------------------ */
const MASKS: Array<(row: number, column: number) => boolean> = [
  (r, c) => (r + c) % 2 === 0,
  (r) => r % 2 === 0,
  (_r, c) => c % 3 === 0,
  (r, c) => (r + c) % 3 === 0,
  (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
  (r, c) => ((r * c) % 2) + ((r * c) % 3) === 0,
  (r, c) => (((r * c) % 2) + ((r * c) % 3)) % 2 === 0,
  (r, c) => (((r + c) % 2) + ((r * c) % 3)) % 2 === 0,
];

function penalty(matrix: boolean[][]): number {
  const size = matrix.length;
  let score = 0;

  // Regel 1: reeksen van 5 of meer gelijke modules.
  for (let i = 0; i < size; i += 1) {
    for (const horizontal of [true, false]) {
      let run = 1;
      for (let j = 1; j < size; j += 1) {
        const current = horizontal ? matrix[i][j] : matrix[j][i];
        const previous = horizontal ? matrix[i][j - 1] : matrix[j - 1][i];
        if (current === previous) {
          run += 1;
        } else {
          if (run >= 5) score += run - 2;
          run = 1;
        }
      }
      if (run >= 5) score += run - 2;
    }
  }

  // Regel 2: blokken van 2x2 in dezelfde kleur.
  for (let r = 0; r < size - 1; r += 1) {
    for (let c = 0; c < size - 1; c += 1) {
      const v = matrix[r][c];
      if (v === matrix[r][c + 1] && v === matrix[r + 1][c] && v === matrix[r + 1][c + 1]) score += 3;
    }
  }

  // Regel 3: het patroon 1:1:3:1:1 met vier lichte modules ernaast.
  const a = [true, false, true, true, true, false, true, false, false, false, false];
  const b = [false, false, false, false, true, false, true, true, true, false, true];
  for (let i = 0; i < size; i += 1) {
    for (let j = 0; j + 11 <= size; j += 1) {
      let matchA = true;
      let matchB = true;
      let matchAv = true;
      let matchBv = true;
      for (let k = 0; k < 11; k += 1) {
        const h = matrix[i][j + k];
        const v = matrix[j + k][i];
        if (h !== a[k]) matchA = false;
        if (h !== b[k]) matchB = false;
        if (v !== a[k]) matchAv = false;
        if (v !== b[k]) matchBv = false;
      }
      if (matchA) score += 40;
      if (matchB) score += 40;
      if (matchAv) score += 40;
      if (matchBv) score += 40;
    }
  }

  // Regel 4: afwijking van 50% donkere modules.
  let dark = 0;
  for (const row of matrix) for (const cell of row) if (cell) dark += 1;
  const percent = (dark * 100) / (size * size);
  score += Math.floor(Math.abs(percent - 50) / 5) * 10;

  return score;
}

/* ------------------------------------------------------------------ */
/* Encoder                                                             */
/* ------------------------------------------------------------------ */
function utf8(value: string): Uint8Array {
  if (typeof TextEncoder !== "undefined") return new TextEncoder().encode(value);
  const bytes: number[] = [];
  for (const char of value) {
    let point = char.codePointAt(0) ?? 0;
    if (point < 0x80) bytes.push(point);
    else if (point < 0x800) bytes.push(0xc0 | (point >> 6), 0x80 | (point & 0x3f));
    else if (point < 0x10000) bytes.push(0xe0 | (point >> 12), 0x80 | ((point >> 6) & 0x3f), 0x80 | (point & 0x3f));
    else {
      bytes.push(
        0xf0 | (point >> 18),
        0x80 | ((point >> 12) & 0x3f),
        0x80 | ((point >> 6) & 0x3f),
        0x80 | (point & 0x3f)
      );
    }
  }
  return Uint8Array.from(bytes);
}

function dataCapacity(version: number, level: QrErrorLevel): number {
  const [, blocks1, data1, blocks2, data2] = BLOCKS[level][version - 1];
  return blocks1 * data1 + blocks2 * data2;
}

function pickVersion(byteLength: number, level: QrErrorLevel, minVersion: number): number {
  for (let version = Math.max(1, minVersion); version <= QR_MAX_VERSION; version += 1) {
    const countBits = version < 10 ? 8 : 16;
    const needed = 4 + countBits + byteLength * 8;
    if (needed <= dataCapacity(version, level) * 8) return version;
  }
  throw new Error(
    `QR: ${byteLength} bytes passen niet in versie ${QR_MAX_VERSION} met niveau ${level}. Kort de tekst in of kies een lager foutcorrectieniveau.`
  );
}

/** Data + foutcorrectie in de juiste volgorde: blokken interleaved. */
function buildCodewords(bytes: Uint8Array, version: number, level: QrErrorLevel): Uint8Array {
  const [ecPerBlock, blocks1, data1, blocks2, data2] = BLOCKS[level][version - 1];
  const capacity = dataCapacity(version, level);
  const countBits = version < 10 ? 8 : 16;

  const buffer = new BitBuffer();
  buffer.push(0b0100, 4);
  buffer.push(bytes.length, countBits);
  for (const byte of bytes) buffer.push(byte, 8);
  buffer.push(0, Math.min(4, capacity * 8 - buffer.length));

  const data = buffer.toBytes(capacity);
  const used = Math.ceil(buffer.length / 8);
  for (let i = used, pad = 0; i < capacity; i += 1, pad += 1) data[i] = pad % 2 === 0 ? 0xec : 0x11;

  const dataBlocks: Uint8Array[] = [];
  const ecBlocks: Uint8Array[] = [];
  let offset = 0;
  for (const [count, size] of [
    [blocks1, data1],
    [blocks2, data2],
  ]) {
    for (let i = 0; i < count; i += 1) {
      const block = data.slice(offset, offset + size);
      offset += size;
      dataBlocks.push(block);
      ecBlocks.push(ecCodewords(block, ecPerBlock));
    }
  }

  const result: number[] = [];
  const longest = Math.max(data1, data2);
  for (let i = 0; i < longest; i += 1) {
    for (const block of dataBlocks) if (i < block.length) result.push(block[i]);
  }
  for (let i = 0; i < ecPerBlock; i += 1) {
    for (const block of ecBlocks) result.push(block[i]);
  }
  return Uint8Array.from(result);
}

/** Zigzag van rechtsonder naar boven, kolom 6 overgeslagen. */
function placeData(grid: Grid, codewords: Uint8Array): void {
  let bit = 0;
  let upward = true;

  for (let right = grid.size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let step = 0; step < grid.size; step += 1) {
      const row = upward ? grid.size - 1 - step : step;
      for (const column of [right, right - 1]) {
        if (grid.reserved[row][column]) continue;
        const byte = codewords[bit >> 3] ?? 0;
        set(grid, row, column, ((byte >> (7 - (bit & 7))) & 1) === 1, false);
        bit += 1;
      }
    }
    upward = !upward;
  }
}

export interface QrResult {
  matrix: boolean[][];
  version: number;
  level: QrErrorLevel;
  mask: number;
  size: number;
}

/** Bouwt de volledige QR-matrix. true = donkere module. */
export function encodeQr(value: string, options: QrEncodeOptions = {}): QrResult {
  const level = options.level ?? "M";
  const bytes = utf8(value);
  const version = pickVersion(bytes.length, level, options.minVersion ?? 1);
  const size = version * 4 + 17;
  const codewords = buildCodewords(bytes, version, level);

  const base = emptyGrid(size);
  finder(base, 0, 0);
  finder(base, 0, size - 7);
  finder(base, size - 7, 0);
  alignment(base, version);
  timing(base);
  reserveInfo(base, version);
  writeVersion(base, version);
  placeData(base, codewords);

  const candidates = options.mask === undefined ? [0, 1, 2, 3, 4, 5, 6, 7] : [options.mask];
  let best: { matrix: boolean[][]; mask: number; score: number } | null = null;

  for (const mask of candidates) {
    const grid: Grid = {
      size,
      modules: base.modules.map((row) => row.slice()),
      reserved: base.reserved.map((row) => row.slice()),
    };
    for (let row = 0; row < size; row += 1) {
      for (let column = 0; column < size; column += 1) {
        if (grid.reserved[row][column]) continue;
        if (MASKS[mask](row, column)) grid.modules[row][column] = !grid.modules[row][column];
      }
    }
    writeFormat(grid, level, mask);

    const matrix = grid.modules.map((row) => row.map((cell) => cell === true));
    const score = candidates.length === 1 ? 0 : penalty(matrix);
    if (!best || score < best.score) best = { matrix, mask, score };
  }

  return { matrix: best!.matrix, version, level, mask: best!.mask, size };
}
