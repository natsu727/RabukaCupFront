<script lang="ts">
	import { onMount } from "svelte";
	import { createRoom, joinRoom } from "$lib/p2p.js";
	import { gameLogic } from "$lib/game.ts";

	const gameState = gameLogic.getStore();

	onMount(() => {
		window.addEventListener("keydown", (e) => gameLogic.handleKeyPress(e));
		return () => {
			window.removeEventListener("keydown", (e) =>
				gameLogic.handleKeyPress(e),
			);
		};
	});
	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === "Enter" && !event.shiftKey) {
			event.preventDefault();
			gameLogic.handleKeyPress(event);
		}
	}
</script>

<main class="container mx-auto p-4 max-w-2xl">
	<div class="text-center space-y-6">
		<h1 class="text-3xl font-bold mb-8">タイピングゲーム</h1>

		{#if !$gameState.isGameActive}
			<button
				class="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
				on:click={() => gameLogic.startGame()}
			>
				ゲームスタート
			</button>
		{:else}
			<div class="space-y-4">
				<div class="text-xl">
					残り時間: <span class="font-bold"
						>{$gameState.timeLeft}</span
					>秒
				</div>
				<div class="mb-4 bg-gray-100 p-4 rounded-lg">
					<h2 class="text-lg font-bold mb-2">
						問題: {$gameState.currentProblem.text}
					</h2>
				</div>
				<div class="bg-white rounded-lg p-4">
					<div class="bg-gray-100 rounded-lg p-4 mb-4">
						<div class="flex gap-4">
							<textarea
								id="dataSend"
								placeholder="your code here"
								value={$gameState.userInput}
								on:keydown={handleKeyDown}
								class="flex-1 h-32 p-2 font-mono rounded-lg"
							></textarea>
							<textarea
								id="dataReceive"
								readonly
								class="flex-1 h-32 p-2 bg-gray-50 rounded-lg"
							></textarea>
						</div>
					</div>
					<button
						class="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
						on:click={createRoom}
					>
						create room
					</button>
				</div>
				<div>
					<input id="room-id" class="p-2 rounded-lg mr-2" />
					<button
						class="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
						on:click={joinRoom}
					>
						join
					</button>
				</div>
				<span id="currentRoom"></span>
			</div>
		{/if}
	</div>
</main>
