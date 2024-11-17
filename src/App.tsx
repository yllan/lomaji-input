import { createSignal, onCleanup, onMount, For } from "solid-js";
import "./App.css";
import { inputMethod } from "./lomaji/inputMethod";
import type { Ji } from "./lomaji/lomaji";
import { textualRepresentation } from "./lomaji/lomaji";

function App() {
  const [marked, setMarked] = createSignal<Ji[]>([]);
  const [range, setRange] = createSignal({ start: 0, end: 0 });

  const jiClass = (ji: Ji): string => {
    switch (ji.type) {
      case "lomaji":
        if (ji.initial && ji.vowel && ji.tone) {
          return "lomaji-complete"
        } else {
          return "lomaji-incomplete"
        }
      case "hanji":
        return "hanji"
      case "symbol":
        return "symbol"      
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    const [newState, output] = inputMethod(
      { marked: marked(), range: range() },
      e,
    );
    setMarked(newState.marked);
    setRange(newState.range);

    console.log(marked());
    // ignore output so far
  };

  onMount(() => {
    document.addEventListener("keydown", handleKeyDown);
  });

  onCleanup(() => {
    document.removeEventListener("keydown", handleKeyDown);
  });

  return (
    <>
      <div id="input-buffer">
        <For each={marked()}>
          {(ji, idx) => <>
            {(range().start === range().end && range().start === idx()) && <span class="ibeam"></span>}
            <span class={jiClass(ji)}>{textualRepresentation(ji)}</span>
          </>}
        </For>
        { 
          (range().start === range().end && range().start === marked().length) && <span class="ibeam"></span>
        }
      </div>
    </>
  );
}

export default App;
