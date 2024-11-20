/* Constants */
export const VALID_LOMAJI_CHARACTERS = new Set([..."abceghijklmnoprstu"]);
export const VALID_TONE_CHARACTERS = new Set([..."123456789"]);
export const VALID_VOWEL_CHARACTERS = new Set([..."aeiou"]);
export const INITIAL_CHARACTERS = new Set([..."pbtnlkghsjmc"]);
const NON_PTKH_TONES = new Set([1, 2, 3, 5, 6, 7, 9]);
const VALID_SYLLABLE_CODA_CHARACTERS = new Set([..."nmgptkh"]);
const VALID_VOWELS = new Set([
  "a",
  "ai",
  "au",
  "e",
  "i",
  "ia",
  "iau",
  "io",
  "iu",
  "o",
  "oo",
  "u",
  "ua",
  "uai",
  "ue",
  "ui",
  // TODO: POJ
]);
const VALID_SYLLABLE_CODAS = new Set([
  "n",
  "ng",
  "ngh",
  "nn",
  "nnh",
  "m",
  "mh",
  "p",
  "t",
  "k",
  "h",
]);
const TONE_MARK = [
  "",
  "\u0301",
  "\u0300",
  "",
  "\u0302",
  "\u030c",
  "\u0304",
  "\u030D",
  "\u030B",
];

export type Lomaji = {
  type: "lomaji";
  initial: string | undefined;
  vowel: string | undefined;
  syllableCoda: string | undefined;
  tone: number | undefined;
};

export type Hanji = {
  type: "hanji";
  hanji: string;
};

export type Symbol = {
  type: "symbol";
  symbol: string;
};

export type Ji = Lomaji | Hanji | Symbol;

export const newLomaji = (k: string): Lomaji =>
  pushToLomaji(
    {
      type: "lomaji",
      initial: undefined,
      vowel: undefined,
      syllableCoda: undefined,
      tone: undefined,
    },
    k,
  );

export const newSymbol = (k: string): Symbol => ({
  type: "symbol",
  symbol: k,
});

const injectAt = (s: string, index: number, t: string): string =>
  s.slice(0, index) + t + s.slice(index);

export const textualRepresentation = (ji: Ji): string => {
  switch (ji.type) {
    case "lomaji": {
      const toneMark = TONE_MARK[(ji.tone ?? 1) - 1];
      // TODO: add POJ rules
      if (
        ji.vowel &&
        (ji.vowel.length === 1 || ji.vowel === "oo" || ji.vowel === "ng")
      ) {
        return (
          (ji.initial ?? "") +
          injectAt(ji.vowel, 1, toneMark) +
          (ji.syllableCoda ?? "")
        );
      } else if (ji.vowel) {
        const aIndex = ji.vowel.toLowerCase().indexOf("a");
        if (aIndex >= 0) {
          // on "a"
          return (
            (ji.initial ?? "") +
            injectAt(ji.vowel, aIndex + 1, toneMark) +
            (ji.syllableCoda ?? "")
          );
        } else {
          // on the last one
          return (
            (ji.initial ?? "") + ji.vowel + toneMark + (ji.syllableCoda ?? "")
          );
        }
      } else {
        // incomplete
        return (ji.initial ?? "") + (ji.vowel ?? "") + (ji.syllableCoda ?? "");
      }
    }
    case "hanji":
      return ji.hanji;
    case "symbol":
      return ji.symbol;
  }
};

const endsWithPtkh = (s: string | undefined): boolean =>
  s !== undefined && [..."ptkh"].includes(s.toLowerCase()[s.length - 1]);

export const pushToLomaji = (lomaji: Lomaji, c: string): Lomaji => {
  const k = c.toLowerCase();
  if (lomaji.initial === undefined) {
    if (INITIAL_CHARACTERS.has(k)) {
      return {
        ...lomaji,
        initial: c,
      };
    } else if (VALID_VOWEL_CHARACTERS.has(k)) {
      return {
        ...lomaji,
        initial: "",
        vowel: c,
      };
    } else {
      throw Error(`Cannot start with ${c}`);
    }
  } else if (lomaji.vowel === undefined) {
    // already input partial initial, but no vowel yet
    if (
      ["ph", "th", "kh", "ng", "ts", "tsh", "ch", "chh"].includes(
        (lomaji.initial + k).toLowerCase(),
      )
    ) {
      return {
        ...lomaji,
        initial: lomaji.initial + c,
      };
    } else if (k === "n") {
      // mng, tng, hng
      return {
        ...lomaji,
        vowel: "",
        syllableCoda: c,
      };
    } else if (VALID_VOWEL_CHARACTERS.has(k)) {
      const vowel = (lomaji.vowel ?? "") + k;
      if (VALID_VOWELS.has(vowel.toLowerCase())) {
        return {
          ...lomaji,
          vowel,
        };
      } else {
        throw Error(`Invalid vowel: ${vowel}`);
      }
    } else if (VALID_TONE_CHARACTERS.has(k)) {
      const tone = c.charCodeAt(0) - "0".charCodeAt(0);
      if (["m", "ng"].includes(lomaji.initial.toLowerCase())) {
        if (NON_PTKH_TONES.has(tone)) {
          return {
            ...lomaji,
            initial: "",
            vowel: lomaji.initial,
            tone,
          };
        } else {
          throw Error(`Invalid tone ${tone} for ${lomaji}`);
        }
      } else {
        return {
          ...lomaji,
          tone,
        };
      }
    } else {
      throw Error(`Unknown error: ${k}`);
    }
  } else {
    // vowel has something
    if (VALID_SYLLABLE_CODA_CHARACTERS.has(k)) {
      const syllableCoda = (lomaji.syllableCoda ?? "") + c;
      if (VALID_SYLLABLE_CODAS.has(syllableCoda.toLowerCase())) {
        return {
          ...lomaji,
          syllableCoda,
          tone:
            endsWithPtkh(syllableCoda) && lomaji.tone !== 8 ? 4 : lomaji.tone,
        };
      } else {
        throw Error(`Not valid syllableCoda: ${syllableCoda}`);
      }
    } else if (VALID_VOWEL_CHARACTERS.has(k)) {
      const vowel = lomaji.vowel + k;
      if (VALID_VOWELS.has(vowel.toLowerCase())) {
        return {
          ...lomaji,
          vowel,
        };
      } else {
        throw Error(`Invalid vowel: ${vowel}`);
      }
    } else if (VALID_TONE_CHARACTERS.has(k)) {
      const tone = c.charCodeAt(0) - "0".charCodeAt(0);
      // check ptkh
      if (endsWithPtkh(lomaji.syllableCoda) !== (tone === 8 || tone === 4)) {
        throw Error(`Invalid tone: ${tone} for ${lomaji}`);
      } else {
        return {
          ...lomaji,
          tone,
        };
      }
    } else {
      throw Error(`Unknown error: ${k}`);
    }
  }
};
