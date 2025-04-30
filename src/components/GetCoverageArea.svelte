<script lang="ts">
  import { P } from 'flowbite-svelte';
  import { onMount } from 'svelte';
  let { parameters = $bindable() } = $props();
  onMount(() => (parameters = ''));
</script>

<P class="dark:text-white">todo: not finished (also need to show map)</P>
