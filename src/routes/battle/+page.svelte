<script lang="ts">
	import { onMount } from "svelte";
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
</script>

<main class="container mx-auto p-4 max-w-2xl">
	<div class="text-center space-y-6">
		<h1 class="text-3xl font-bold mb-8">対戦</h1>

		{#if !$gameState.isGameActive}
		<div class='selectfield'>
			<div>
				<button
					on:click={() => window.location.href="/practice"}
					class="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
				>練習場</button>
			</div>

			<div>
				<button
					on:click={() => window.location.href="/solo_mode"}
					class="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
				>寿司</button>
			</div>

			<div>
				<button
					on:click={() => window.location.href="/practice"}
					class="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
				>ルーム作成</button>
			</div>

			<div class='join'>
				<span>コードを入力して</span>

				<input type="text" id='room-id' style:outline="solid" minlength="16"/><br>

				<button
					on:click={() => window.location.href="/practice"}
					class="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
				>joinする</button>
			</div>

			<!-- <button
				class="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
				on:click={() => gameLogic.startGame()}
			>
				ゲームスタート
			</button> -->
		</div>
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
					<div class=" h-80 p-4 bg-gray-100 rounded-lg">
						<textarea id="dataSend" placeholder="your code here"
						></textarea>
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
			</div>
		{/if}
	</div>
</main>

<style>
.selectfield {
	display: flex;
}

.selectfield div {
	margin: 0 8px;	
}

.join {
	display: flex;
	flex-direction: column;
}
</style>
