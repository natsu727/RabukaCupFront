<script lang="ts">
	import { onMount } from "svelte";
	import { gameLogic } from "$lib/game.ts";

	const gameState = gameLogic.getStore();

	onMount(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (!(e.target instanceof HTMLTextAreaElement)) {
				gameLogic.handleKeyPress(e);
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
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
		<h1 class="text-left text-3xl font-bold mb-8">このサイトについて</h1>
		<div class="text-left">
			<span>brainfckの腕に自身がありますか？</span><br />
			<span
				>もしそうなら、このサイトはあなたの腕試しにぴったりかもしれません。</span
			><br />
			<span
				>このサイトはあなたを楽しませ、あなたの脳を破壊するために存在します。</span
			>
			<span
				>とめどなく流れる寿司を食いまくってもよし、あなたのライバルとオンラインで戦ってもよし。</span
			><br />
			<span
				>brainfckの腕に自身が無い？<span
					><br />
					<span
						>なら、先ずは <a class="text-blue-600" href="/practice"
							>練習場</a
						> に行ってみると良いでしょう。</span
					><br />
					<span>brainfckを知らない？何をしに此処へ来たんですか？</span
					>
					(<a
						class="text-blue-600"
						href="https://ja.wikipedia.org/wiki/Brainfuck"
						>wikipedia</a
					> を見る)
				</span></span
			>
		</div>
		<h1 class="text-3xl font-bold mb-8">タイピングゲーム</h1>

		{#if !$gameState.isGameActive}
			<div class="selectfield">
				<div>
					<button
						on:click={() => (window.location.href = "/practice")}
						class="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
						>練習場</button
					>
				</div>

				<div>
					<button
						on:click={() => (window.location.href = "/solo_mode")}
						class="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
						>寿司</button
					>
				</div>

				<div>
					<button
						on:click={() =>
							(window.location.href = "/battle/create")}
						class="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
						>ルーム作成</button
					>
				</div>

				<div class="join">
					<span>コードを入力して</span>

					<input
						type="text"
						id="room-id"
						style:outline="solid"
						minlength="16"
					/><br />

					<button
						on:click={() => {
							const roomId =
								document.querySelector("#room-id").value;
							window.location.href = `/battle/join/${roomId}`;
						}}
						class="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
						>joinする</button
					>
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
								bind:value={$gameState.userInput}
								on:input={(e) =>
									gameLogic.handleInput(
										e.currentTarget.value,
									)}
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
