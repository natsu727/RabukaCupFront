<script lang="ts">
	import { onMount } from "svelte";
	import { bfInterpret } from "$lib/call_wasm.ts";
	import { sendData, createRoom, joinRoom } from "$lib/p2p.js";

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

	let words = ["JavaScript", "SvelteKit"];
	let currentWord = "";
	let userInput = "";
	let score = 0;
	let timeLeft = 60;
	let isGameActive = false;
	let mistakes = 0;
	let accuracy = 100;
	let totalTyped = 0;

	onMount(() => {
		window.addEventListener("keydown", handleKeyPress);
		return () => {
			window.removeEventListener("keydown", handleKeyPress);
		};
	});

	function startGame() {
		isGameActive = true;
		score = 0;
		timeLeft = 60;
		mistakes = 0;
		totalTyped = 0;
		accuracy = 100;
		userInput = "";
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

	function handleKeyPress(event: KeyboardEvent) {
		if (!isGameActive) return;

		if (event.key === "Backspace") {
			event.preventDefault();
			if (userInput.length > 0) {
				userInput = userInput.slice(0, -1);
			}
			return;
		}

		if (event.key === "Enter") {
			nextWord();
			return;
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

		if (userInput === currentWord) {
			score++;
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

<main class="container mx-auto p-4 max-w-2xl">
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
				<div class="text-xl">
					残り時間: <span class="font-bold">{timeLeft}</span>秒
				</div>

				<div
					class="float-left w-1/2 p-3 border rounded-lg text-center text-xl min-h-[10.5rem] bg-white"
				>
					<div class=" h-80 p-4 bg-gray-100 rounded-lg">
						<textarea id="dataSend"></textarea>
						<textarea id="dataReceive" readonly></textarea>
						<button
							class="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
							on:click={createRoom}>create room</button
						>
					</div>
				</div>
			</div>
			<span id="currentRoom"></span>
			<div>
				<input id="room-id" />
				<button
					class="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
					on:click={joinRoom}>join</button
				>
				<button
					on:click={sendData}
					class="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
					>send</button
				>
			</div>
		{/if}
	</div>
</main>
