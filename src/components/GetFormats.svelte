<script lang="ts">
  import { Card, Checkbox, Label, Select } from 'flowbite-svelte';
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

<div class="flex justify-center">
  <Card class="p-4" size="md">
    <div class="space-y-6">
      <div class="space-y-2">
        <Label class="font-medium dark:text-white">
          <div class="mb-2">
            {$translations.formatLanguage}:
          </div>
          <Select class="w-full" items={formatLanguageOptions} placeholder={$translations.chooseOption} bind:value={formatLanguage} onchange={computeParameters} />
        </Label>
      </div>
      <div class="flex items-center space-x-2">
        <Label class="flex items-center font-medium dark:text-white">
          <Checkbox bind:checked={showAllFormats} onchange={computeParameters} class="me-2" />
          {$translations.showAllFormats}
        </Label>
      </div>
    </div>
  </Card>
</div>
