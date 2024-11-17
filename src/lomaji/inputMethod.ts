import type { Ji, Lomaji } from "./lomaji";
import {
  pushToLomaji,
  newLomaji,
  newSymbol,
  INITIAL_CHARACTERS,
  VALID_LOMAJI_CHARACTERS,
  VALID_TONE_CHARACTERS,
  VALID_VOWEL_CHARACTERS,
} from "./lomaji";

type Range = {
  start: number;
  end: number;
};

type InputState = {
  marked: Ji[];
  range: Range;
};

const isEmptyRange = (r: Range): boolean => r.start === r.end;
const emptyRangeAt = (idx: number): Range => ({ start: idx, end: idx });
const replaceRangeWith = <E>(m: E[], r: Range, e: E): E[] => {
  const mm = [...m];
  mm.splice(r.start, r.end - r.start, e);
  return mm;
};

export const inputMethod = (
  state: InputState,
  e: KeyboardEvent,
): [InputState, string] => {
  const { marked, range } = state;

  if (e.key.length === 1) {
    let k = e.key.toLowerCase();

    if (!isEmptyRange(range)) {
      // replace it
      const j = INITIAL_CHARACTERS.has(k) ? newLomaji(k) : newSymbol(k);

      return [
        {
          marked: replaceRangeWith(marked, range, j),
          range: emptyRangeAt(range.start + 1),
        },
        "",
      ];
    }

    if (
      range.start > 0 &&
      marked[range.start - 1].type === "lomaji" &&
      (VALID_LOMAJI_CHARACTERS.has(k) || VALID_TONE_CHARACTERS.has(k))
    ) {
      const j: Lomaji = marked[range.start - 1] as Lomaji;
      try {
        const newLomaji = pushToLomaji(j, e.key);
        return [
          {
            marked: replaceRangeWith(
              marked,
              { start: range.start - 1, end: range.start },
              newLomaji,
            ),
            range: emptyRangeAt(range.start),
          },
          "",
        ];
      } catch (e) {
        console.log(e);
        // can't push to current lomaji. create new one
        const j =
          INITIAL_CHARACTERS.has(k) || VALID_VOWEL_CHARACTERS.has(k)
            ? newLomaji(k)
            : newSymbol(k);

        return [
          {
            marked: replaceRangeWith(marked, range, j),
            range: emptyRangeAt(range.start + 1),
          },
          "",
        ];
      }
    } else {
      const j =
        INITIAL_CHARACTERS.has(k) || VALID_VOWEL_CHARACTERS.has(k)
          ? newLomaji(k)
          : newSymbol(k);

      return [
        {
          marked: replaceRangeWith(marked, range, j),
          range: emptyRangeAt(range.start + 1),
        },
        "",
      ];
    }
  } else if (e.key === "ArrowLeft") {
    if (!isEmptyRange(range)) {
      return [
        {
          marked,
          range: emptyRangeAt(range.start),
        },
        "",
      ];
    } else {
      return [
        {
          marked,
          range: emptyRangeAt(Math.max(0, range.start - 1)),
        },
        "",
      ];
    }
  } else if (e.key === "ArrowRight") {
    if (!isEmptyRange(range)) {
      return [
        {
          marked,
          range: emptyRangeAt(range.end),
        },
        "",
      ];
    } else {
      return [
        {
          marked,
          range: emptyRangeAt(Math.min(marked.length, range.start + 1)),
        },
        "",
      ];
    }
  } else if (e.key === "Backspace") {
    if (!isEmptyRange(range)) {
      return [
        {
          marked: marked.slice(0, range.start).concat(marked.slice(range.end)),
          range: emptyRangeAt(range.start),
        },
        "",
      ];
    } else if (range.start > 0) {
      return [
        {
          marked: marked
            .slice(0, range.start - 1)
            .concat(marked.slice(range.start)),
          range: emptyRangeAt(range.start - 1),
        },
        "",
      ];
    }
  }
  return [state, ""];
};
