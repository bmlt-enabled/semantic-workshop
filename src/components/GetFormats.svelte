<script lang="ts">
  import { Checkbox, Label, Select, Card } from 'flowbite-svelte';
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
        <Label class="font-medium text-gray-700 dark:text-gray-300">
          {$translations.formatLanguage}:
        </Label>
        <Select class="w-full" items={formatLanguageOptions} placeholder={$translations.chooseOption} bind:value={formatLanguage} onchange={computeParameters} />
      </div>

      <div class="flex items-center space-x-2">
        <Checkbox
          bind:checked={showAllFormats}
          on:change={computeParameters}
          class="text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 h-4 w-4 rounded border-gray-300 bg-gray-100 focus:ring-2 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800"
        />
        <Label class="cursor-pointer font-medium text-gray-700 dark:text-gray-300">
          {$translations.showAllFormats}
        </Label>
      </div>
    </div>
  </Card>
</div>
