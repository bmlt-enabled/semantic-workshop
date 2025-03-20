<script lang="ts">
  import { P } from 'flowbite-svelte';
  import { onMount } from 'svelte';
  import { translations } from '../stores/localization';

  let { parameters = $bindable() } = $props();
  onMount(() => parameters = '');
</script>
  
<P class="dark:text-white">{$translations.noParameters}</P>
