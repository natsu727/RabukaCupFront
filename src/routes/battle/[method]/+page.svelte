<script lang="ts">
	import { onMount } from "svelte";
	import { createRoom } from "$lib/p2p.js";
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
	/** @type {import('./$types').PageData} */
	export let data;

	const method = data.method;

	onMount(async () => {
		await createRoom();
	});
</script>

<!-- battle view here -->
<main class="container mx-auto p-4 max-w-2xl">
	<h1>slug: {data.method}</h1>
	<h1 id="currentRoom"></h1>
	<div class="space-y-4">
		<div class="text-xl">
			残り時間: <span class="font-bold">{$gameState.timeLeft}</span>秒
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
							gameLogic.handleInput(e.currentTarget.value)}
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
			<span id="currentRoom"></span>
		</div>
	</div>
</main>
