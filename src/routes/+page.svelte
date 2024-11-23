<script lang="ts">
  import { onMount } from "svelte";
  import { bfInterpret } from "$lib/call_wasm.ts";

  let output = "";
  var input = `+++++++++[>++++++++>+++++++++++>+++>+<<<<-]>
		.
		>++
		.
		+++++++
		.
		.
		+++
		.
		>+++++
		.
		<<+++++++++++++++
		.
		>
		.
		+++
		.
		------
		.
		--------
		.
		>+
		.
		>+
		.`;

  // bfInterpret(input).then((out) => {
  // 	console.log(`input : ${input}`);
  // 	console.log(`output: ${out}`);
  // });
  let test = input.split("\n");

  let words = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
  let currentWord = "";
  let userInput = "";
  let score = 0;
  let timeLeft = 60;
  let isGameActive = false;
  let mistakes = 0;
  let accuracy = 100;
  let totalTyped = 0;

  async function updateOutput() {
    try {
      const out = await bfInterpret(userInput);
      output = out ?? "";
      console.log(`input : ${userInput}`);
      console.log(`output: ${out}`);
    } catch (error) {
      console.error("Error interpreting input:", error);
    }
  }

  onMount(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  });

  function startGame() {
    isGameActive = true;
    active = true;
    score = 0;
    timeLeft = 60;
    mistakes = 0;
    totalTyped = 0;
    accuracy = 100;
    userInput = "";
    output = "";
    nextWord();

    const timer = setInterval(() => {
      timeLeft--;
      if (timeLeft <= 0) {
        clearInterval(timer);
        // endGame();
      }
    }, 1000);
  }

  function nextWord() {
    const index = Math.floor(Math.random() * words.length);
    currentWord = words[index];
    userInput = "";
  }

  async function handleKeyPress(event: KeyboardEvent) {
    if (!isGameActive) return;

    if (event.key === "ArrowUp") {
      userInput += test.shift();
    }

    if (event.key === "Backspace") {
      event.preventDefault();
      if (userInput.length > 0) {
        userInput = userInput.slice(0, -1);
        await updateOutput();
      }
      return;
    }

    if (event.key === "Enter") {
      userInput += "\n";
      await updateOutput();
      // 	nextWord();
      // 	return;
    }

    if (event.key === "Escape") {
      endGame();
    }

    if (
      event.key.length !== 1 ||
      event.ctrlKey ||
      event.altKey ||
      event.metaKey
    ) {
      return;
    }

    userInput += event.key;
    totalTyped++;
    await updateOutput();

    if (userInput === currentWord) {
      score++;
      blurRevel--;
      setTimeout(nextWord, 100);
    } else if (userInput.length >= currentWord.length) {
      mistakes++;
      accuracy = Math.round(((totalTyped - mistakes) / totalTyped) * 100);
    }
  }

  function endGame() {
    isGameActive = false;
    active = false;
    blurRevel = 5;
    alert(`ゲーム終了!\nスコア: ${score}\n正確性: ${accuracy}%`);
  }

  export let videoElem: HTMLVideoElement | undefined;
  export let active: boolean = false;
  $: if (active) {
    startCapture();
  }

  function startCapture() {
    // Web カメラのストリームを取得して video 要素に紐付ける
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((mediaStream: MediaStream) => {
        if (videoElem) {
          videoElem.srcObject = mediaStream;
          videoElem.play();
        }
      })
      .catch((err) => {
        console.error("Web カメラの取得に失敗しました:", err);
      });
  }

  let blurRevel = 5;

  const revel = [
    "blur-none",
    "blur-sm",
    "blur-md",
    "blur-lg",
    "blur-xl",
    "blur-2xl",
  ];
</script>

<main class="container mx-auto p-4">
  <div class="text-center space-y-6">
    <h1 class="text-3xl font-bold mb-8">タイピングゲーム</h1>

    {#if !isGameActive}
      <button
        class="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
        on:click={startGame}
      >
        ゲームスタート
      </button>
    {:else}
      <div class="space-y-4">
        <div class="flex justify-center flex-row">
          <div class="border w-60 max-h-fit">
            <video
              id="webcam"
              bind:this={videoElem}
              class={revel[blurRevel]}
              playsinline
            >
              <track kind="captions" />
            </video>
          </div>

          <div class="text-xl p-20">
            残り時間: <span class="font-bold">{timeLeft}</span>秒
          </div>
          <div class="border w-60 max-h-fit">
            <div class=""></div>
          </div>
        </div>

        <div class=" h-80 p-4 bg-gray-100 rounded-lg">
          <div class="text-2xl font-bold mb-4">
            {currentWord}
          </div>
          <div class="flex">
            <div class="flex flex-col w-1/2">
              <div
                class="mx-5 p-3 border rounded-lg text-center text-xl bg-white break-words whitespace-pre-wrap"
              >
                {output}
              </div>
              <div
                class="mx-5 mt-2 p-3 border rounded-lg text-start text-xl min-h-[10.5rem] bg-white break-words whitespace-pre-wrap"
              >
                {userInput}
              </div>
            </div>
            <div
              class="mx-5 w-1/2 p-3 border rounded-lg text-center text-xl min-h-[10.5rem] bg-white break-words"
            >
              <!-- ここに相手のInputを表示 -->
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
</main>
