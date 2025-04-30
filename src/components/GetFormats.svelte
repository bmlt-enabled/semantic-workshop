<script lang="ts">
  import { Checkbox, Label, Select } from 'flowbite-svelte';
  import { onMount } from 'svelte';
  import { translations } from '../stores/localization';

  let { serverLangs, allLanguages, parameters = $bindable() } = $props();
  let formatLanguage: string = $state('servLang');
  let showAllFormats: boolean = $state(false);

  function computeParameters() {
    parameters = (formatLanguage !== 'servLang' ? '&lang_enum=' + formatLanguage : '') + (showAllFormats ? '&show_all=1' : '');
  }

  const filteredLangs = allLanguages.filter((x: { value: string; name: string }) => serverLangs.includes(x.value));
  const formatLanguageOptions = [{ value: 'servLang', name: 'Server language' }].concat(filteredLangs);
  onMount(() => (parameters = ''));
</script>

<div>
  <Label>
    {$translations.formatLanguage}:
    <Select class="mt-2" items={formatLanguageOptions} placeholder={$translations.chooseOption} bind:value={formatLanguage} onchange={computeParameters} />
  </Label>
  <Checkbox bind:checked={showAllFormats} on:change={computeParameters}>
    {$translations.showAllFormats}
  </Checkbox>
</div>
