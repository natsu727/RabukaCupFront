<script lang='ts'>
	import { onMount } from "svelte";
	import { createRoom } from "$lib/p2p.js";
	/** @type {import('./$types').PageData} */
	export let data;

	const method = data.method;

	onMount(async () => {
		await createRoom();
	});
</script>

<h1>slug: {data.method}</h1>
<h1 id="currentRoom"></h1>

<!-- battle view here -->

