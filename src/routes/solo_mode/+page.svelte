<script lang="ts">

    import { onMount } from "svelte";
    import { bfInterpret } from "$lib/call_wasm.ts";
  
    let output = "";
     let words = ["A","B","c","d"];
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
      score = 0;
      timeLeft = 90;
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
          endGame();
        }
        if(timeLeft%15==0){nextWord()}
      }, 1000);
    }
  
    function nextWord() {
      const index = Math.floor(Math.random() * words.length);
      currentWord = words[index];
      userInput = "";
    }
  
    async function handleKeyPress(event: KeyboardEvent) {
      if (!isGameActive) return;
  
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
  
      if(event.key ==="Escape"){
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
  
      if (output === currentWord) {
        score++;
        timeLeft+=10;
        output=""
        setTimeout(nextWord, 100);
      } else if (userInput.length >= currentWord.length) {
        mistakes++;
        accuracy = Math.round(((totalTyped - mistakes) / totalTyped) * 100);
      }
    }
  
    function endGame() {
      isGameActive = false;
      alert(`ゲーム終了!\nスコア: ${score}\n正確性: ${accuracy}%`);
    }
  
    function getCharacterClass(index: number): string {
      if (!userInput[index]) return "text-gray-400";
      if (userInput[index] === currentWord[index]) return "text-green-500";
      return "text-red-500";
    }
  
  </script>
  
<main class="container mx-auto p-4">
    <div class="text-center space-y-6">
      <h1 class="text-3xl font-bold mb-8">タイピングゲーム</h1>
      <h4 class=" text-gray-500">ソロモード</h4>
  
  
  {#if !isGameActive}
  <button
  class="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
  on:click={startGame}
  >
  ゲームスタート
  </button><br/>
  <a href="/" >対戦モード</a>
  {:else}
  <div class="space-y-4">
    <div class="flex justify-center flex-row">  
      <div class="text-xl p-20">
        残り時間: <span class="font-bold">{timeLeft}</span>秒
      </div>
    </div>
  
          <div class=" h-80 p-4 bg-gray-100 rounded-lg">
            <div class="text-2xl font-bold mb-4">
              {#each currentWord.split("") as char, i}
                <span class={getCharacterClass(i)}>{char}</span>
              {/each}
              <div id="limit" class=" w-5/6 h-2 m-auto my-5 rounded-md"></div>
            </div>
            
            <div class="flex flex-col">
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
            
          </div>
        </div>
      {/if}
    </div>
  </main>

  <style>
    #limit{
        animation: limit 15s linear infinite;
        background:red;
    }
    @keyframes limit{
        0%{
            width: 80%;
        }
        100%{
            width: 0%;
        }
    }
  </style>