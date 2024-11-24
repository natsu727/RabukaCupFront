<script lang="ts">
    import { onMount } from "svelte";
    import { joinRoomById } from "$lib/p2p.js";
    /** @type {import('./$types').PageData} */
    export let data;
    const passcode = data.passcode;
    onMount(async () => {
        await joinRoomById(passcode);
    });
</script>

<h1>passcode: {data.passcode}</h1>
