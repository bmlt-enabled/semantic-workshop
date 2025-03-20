<script lang="ts">
  import { Checkbox } from 'flowbite-svelte';
  import { onMount } from 'svelte';
  import { translations } from '../stores/localization';

  let { parameters = $bindable() } = $props();
  let getUsedFormats: boolean = $state(false);
  let getFormatsOnly: boolean = $state(false);

  function computeParameters() {
    if (!getUsedFormats) {
        getFormatsOnly = false;
    }
    parameters = (getUsedFormats ? '&get_used_formats=1' : '') + (getFormatsOnly ? '&get_formats_only=1' : '');
  }

  onMount(() => parameters = '');
</script>

<div>
  <Checkbox bind:checked={getUsedFormats} on:change={computeParameters} >
    {$translations.getUsedFormats}
  </Checkbox>
  <Checkbox bind:checked={getFormatsOnly} disabled={!getUsedFormats} on:change={computeParameters} class="text-gray-900 dark:text-gray-300 contrast-100" >
    {$translations.getFormatsOnly}
  </Checkbox>
</div>
