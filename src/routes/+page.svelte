<script lang="ts">
	import { onMount } from "svelte";
	import { gameLogic } from "$lib/game.ts";
	import { sendData, createRoom, joinRoom } from "$lib/p2p.js";

	const gameState = gameLogic.getStore();

	onMount(() => {
		window.addEventListener("keydown", (e) => gameLogic.handleKeyPress(e));
		return () => {
			window.removeEventListener("keydown", (e) =>
				gameLogic.handleKeyPress(e),
			);
		};
	});
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

				<div
					class="float-left w-1/2 p-3 border rounded-lg text-center text-xl min-h-[10.5rem] bg-white"
				>
					<div class="h-80 p-4 bg-gray-100 rounded-lg">
						<textarea id="dataSend" />
						<textarea id="dataReceive" readonly />
						<button
							class="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
							on:click={createRoom}>create room</button
						>
					</div>
				</div>
			</div>
			<span id="currentRoom" />
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
