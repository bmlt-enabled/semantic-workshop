<script lang="ts">
  import { Card, Checkbox, Label, Select } from 'flowbite-svelte';
  import { onMount } from 'svelte';
  import { translations } from '../stores/localization';

  interface Props {
    serverLangs: string[];
    allLanguages: { value: string; name: string }[];
    formats: { key_string: string; id: string }[];
    parameters: string | null;
  }

  let { serverLangs, allLanguages, formats, parameters = $bindable() }: Props = $props();
  let formatLanguage: string = $state('servLang');
  let showAllFormats: boolean = $state(false);
  let includeFormatIds: boolean[] = $state([]);
  let excludeFormatIds: boolean[] = $state([]);
  let includeKeyStrings: boolean[] = $state([]);

  let filteredLangs = $derived(allLanguages.filter((x: { value: string; name: string }) => serverLangs.includes(x.value)));
  let formatLanguageOptions = $derived([{ value: 'servLang', name: 'Server language' }].concat(filteredLangs));

  // Initialize arrays when formats change
  $effect(() => {
    const formatCount = formats ? formats.length : 0;
    if (includeFormatIds.length !== formatCount) {
      includeFormatIds = new Array(formatCount).fill(false);
    }
    if (excludeFormatIds.length !== formatCount) {
      excludeFormatIds = new Array(formatCount).fill(false);
    }
    if (includeKeyStrings.length !== formatCount) {
      includeKeyStrings = new Array(formatCount).fill(false);
    }
  });

  function computeFormatIdsPart(): string {
    const includeIds = [];
    const excludeIds = [];

    for (let i = 0; i < formats.length; i++) {
      if (includeFormatIds[i]) {
        includeIds.push(formats[i].id);
      }
      if (excludeFormatIds[i]) {
        excludeIds.push('-' + formats[i].id);
      }
    }

    const allIds = [...includeIds, ...excludeIds];
    if (allIds.length === 0) {
      return '';
    } else if (allIds.length === 1) {
      return '&format_ids=' + allIds[0];
    } else {
      return allIds.map((id) => '&format_ids[]=' + id).join('');
    }
  }

  function computeKeyStringsPart(): string {
    const keyStrings = [];

    for (let i = 0; i < formats.length; i++) {
      if (includeKeyStrings[i]) {
        keyStrings.push(encodeURIComponent(formats[i].key_string));
      }
    }

    if (keyStrings.length === 0) {
      return '';
    } else if (keyStrings.length === 1) {
      return '&key_strings=' + keyStrings[0];
    } else {
      return '&key_strings=' + keyStrings.join(',');
    }
  }

  function computeParameters() {
    const languagePart = formatLanguage !== 'servLang' ? '&lang_enum=' + formatLanguage : '';
    const showAllPart = showAllFormats ? '&show_all=1' : '';
    const formatIdsPart = computeFormatIdsPart();
    const keyStringsPart = computeKeyStringsPart();

    parameters = languagePart + showAllPart + formatIdsPart + keyStringsPart;
  }
  onMount(() => (parameters = ''));
</script>

<div class="flex justify-center">
  <Card class="border-gray-500 p-4 dark:border-gray-400" size="lg">
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

      {#if formats.length > 0}
        <fieldset class="rounded-lg border border-gray-500 bg-white p-4 shadow-sm dark:border-gray-400 dark:bg-gray-800">
          <legend class="text-lg font-semibold text-gray-900 dark:text-white">{$translations.formatIds}</legend>
          <div class="mb-4 text-sm font-semibold text-gray-900 dark:text-white">{$translations.formatIdsExplanation}</div>
          <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {#each formats as format, i}
              <div class="flex items-center space-x-2">
                <Label class="flex text-sm dark:text-white">
                  <Checkbox
                    checked={includeFormatIds[i] || false}
                    onchange={(e) => {
                      const target = e.target as HTMLInputElement;
                      includeFormatIds[i] = target.checked;
                      computeParameters();
                    }}
                    class="me-2"
                  />
                  {format.key_string} ({format.id})
                </Label>
              </div>
            {/each}
          </div>
        </fieldset>

        <fieldset class="rounded-lg border border-gray-500 bg-gray-50 p-4 shadow-sm dark:border-gray-400 dark:bg-gray-800">
          <legend class="text-lg font-semibold text-gray-900 dark:text-white">{$translations.formatIdsExclude}</legend>
          <div class="mb-4 text-sm font-semibold text-gray-900 dark:text-white">{$translations.formatIdsExcludeExplanation}</div>
          <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {#each formats as format, i}
              <div class="flex items-center space-x-2">
                <Label class="flex text-sm dark:text-white">
                  <Checkbox
                    checked={excludeFormatIds[i] || false}
                    onchange={(e) => {
                      const target = e.target as HTMLInputElement;
                      excludeFormatIds[i] = target.checked;
                      computeParameters();
                    }}
                    class="me-2"
                  />
                  {format.key_string} ({format.id})
                </Label>
              </div>
            {/each}
          </div>
        </fieldset>

        <fieldset class="rounded-lg border border-gray-500 bg-white p-4 shadow-sm dark:border-gray-400 dark:bg-gray-800">
          <legend class="text-lg font-semibold text-gray-900 dark:text-white">{$translations.formatKeyStrings}</legend>
          <div class="mb-4 text-sm font-semibold text-gray-900 dark:text-white">{$translations.formatKeyStringsExplanation}</div>
          <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {#each formats as format, i}
              <div class="flex items-center space-x-2">
                <Label class="flex text-sm dark:text-white">
                  <Checkbox
                    checked={includeKeyStrings[i] || false}
                    onchange={(e) => {
                      const target = e.target as HTMLInputElement;
                      includeKeyStrings[i] = target.checked;
                      computeParameters();
                    }}
                    class="me-2"
                  />
                  {format.key_string}
                </Label>
              </div>
            {/each}
          </div>
        </fieldset>
      {/if}
    </div>
  </Card>
</div>
