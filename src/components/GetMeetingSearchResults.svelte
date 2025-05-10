<script lang="ts">
  import { Card, Checkbox, Input, Label, Radio, Select, Table, TableBody, TableBodyCell, TableBodyRow } from 'flowbite-svelte';
  import { onMount } from 'svelte';
  import { translations } from '../stores/localization';

  let { availableFields, formats, rootServerURL, parameters = $bindable() } = $props();
  let getUsedFormats: boolean = $state(false);
  let getFormatsOnly: boolean = $state(false);
  let onWeekdays: boolean[] = $state(new Array(7).fill(false));
  let notOnWeekdays: boolean[] = $state(new Array(7).fill(false));
  let hasVenueType: boolean[] = $state(new Array(3).fill(false));
  let doesNotHaveVenueType: boolean[] = $state(new Array(3).fill(false));
  let hasFormat: boolean[] = $state(new Array(formats.length).fill(false));
  let formatsComparisonOperator: string = $state('AND');
  let doesNotHaveFormat: boolean[] = $state(new Array(formats.length).fill(false));
  let keyForMeetingKeyValue: string = $state('');
  let meetingKeyValues: { name: string; value: string }[] = $state([]);
  let meetingFieldValue = $state('');
  let specificTextValue = $state('');
  const searchForTextMenuOptions = [
    { name: $translations.searchOptionGeneral, value: 'general' },
    { name: $translations.searchOptionLocation, value: 'location' }
  ];
  let searchType = $state('general');
  let searchRadius = $state('');
  let badRadius = $derived(!/^-?\d*$/.test(searchRadius));
  let fieldOptions: { name: string; value: string }[] = $derived(availableFields.map((f: { key: string; description: string }) => ({ name: f.description, value: f.key })));

  async function computeMeetingKeyValues() {
    try {
      const response = await fetch(rootServerURL + 'client_interface/json/?switcher=GetFieldValues&meeting_key=' + encodeURIComponent(keyForMeetingKeyValue));
      const j = await response.json();
      meetingKeyValues = j.map((f: Record<string, string>) => ({ name: f[keyForMeetingKeyValue], value: f[keyForMeetingKeyValue] }));
      meetingFieldValue = '';
      parameters = '';
    } catch (error) {
      // TO FILL IN
    }
  }

  function computeParameters() {
    if (!getUsedFormats) {
      getFormatsOnly = false;
    }
    const usedFormatsPart = (getUsedFormats ? '&get_used_formats=1' : '') + (getFormatsOnly ? '&get_formats_only=1' : '');

    const onWeekdayOp = onWeekdays.filter((x) => x).length > 1 ? '[]=' : '=';
    const onWeekdayPart = onWeekdays.map((x, i) => (x ? '&weekdays' + onWeekdayOp + (i + 1) : '')).join('');
    const notOnWeekdayOp = notOnWeekdays.filter((x) => x).length > 1 ? '[]=-' : '=-';
    const notOnWeekdayPart = notOnWeekdays.map((x, i) => (x ? '&weekdays' + notOnWeekdayOp + (i + 1) : '')).join('');

    const hasVenueTypeOp = hasVenueType.filter((x) => x).length > 1 ? '[]=' : '=';
    const hasVenueTypePart = hasVenueType.map((x, i) => (x ? '&venue_types' + hasVenueTypeOp + (i + 1) : '')).join('');
    const doesNotHaveVenueTypeOp = doesNotHaveVenueType.filter((x) => x).length > 1 ? '[]=-' : '=-';
    const doesNotHaveVenueTypePart = doesNotHaveVenueType.map((x, i) => (x ? '&venue_types' + doesNotHaveVenueTypeOp + (i + 1) : '')).join('');

    const hasFormatCount = hasFormat.filter((x) => x).length;
    const hasFormatOp = hasFormatCount > 1 ? '[]=' : '=';
    const hasFormatPart = hasFormat.map((x, i) => (x ? '&formats' + hasFormatOp + formats[i].id : '')).join('');
    const doesNotHaveFormatOp = doesNotHaveFormat.filter((d) => d).length > 1 ? '[]=-' : '=-';
    const doesNotHaveFormatPart = doesNotHaveFormat.map((x, i) => (x ? '&formats' + doesNotHaveFormatOp + formats[i].id : '')).join('');
    const formatsComparisonOperatorPart = hasFormatCount > 0 && formatsComparisonOperator === 'OR' ? '&formats_comparison_operator=OR' : '';

    const specificFieldValuePart = meetingFieldValue ? '&meeting_key=' + encodeURIComponent(keyForMeetingKeyValue) + '&meeting_key_value=' + encodeURIComponent(meetingFieldValue) : '';

    const locationModifier = searchType === 'location' ? '&StringSearchIsAnAddress=1' : '';
    const radiusModifier = searchType === 'location' && searchRadius ? '&SearchStringRadius=' + searchRadius : '';
    const specificTextValuePart = specificTextValue ? '&SearchString=' + encodeURIComponent(specificTextValue) + locationModifier + radiusModifier : '';

    if (searchRadius && badRadius) {
      parameters = null;
    } else {
      parameters =
        usedFormatsPart +
        onWeekdayPart +
        notOnWeekdayPart +
        hasVenueTypePart +
        doesNotHaveVenueTypePart +
        hasFormatPart +
        doesNotHaveFormatPart +
        formatsComparisonOperatorPart +
        specificFieldValuePart +
        specificTextValuePart;
    }
  }

  function computeParametersForSpecificTextValue() {
    // this resets searchType if specificTextValue was set back to the empty string (by erasing something that was there)
    // also reset searchRadius if we're back to general search type
    if (specificTextValue === '') {
      searchType = 'general';
    }
    if (searchType === 'general') {
      searchRadius = '';
    }
    computeParameters();
  }

  onMount(() => (parameters = ''));
</script>

<div class="flex justify-center">
  <Card class="p-4" size="lg">
    <div class="space-y-6">
      <fieldset class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <legend class="text-lg font-semibold text-gray-900 dark:text-white">{$translations.formatOptions}</legend>
        <div class="space-y-2">
          <div class="flex items-center space-x-2">
            <Label class="mt-4 flex items-center font-medium dark:text-white">
              <Checkbox bind:checked={getUsedFormats} on:change={computeParameters} class="me-1" />
              {$translations.getUsedFormats}
            </Label>
          </div>
          <div class="flex items-center space-x-2">
            <Label class="mt-4 flex items-center font-medium dark:text-white">
              <Checkbox bind:checked={getFormatsOnly} disabled={!getUsedFormats} on:change={computeParameters} class="me-1" />
              {$translations.getFormatsOnly}
            </Label>
          </div>
        </div>
      </fieldset>

      <fieldset class="rounded-lg border border-gray-200 bg-gray-50 p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <legend class="text-lg font-semibold text-gray-900 dark:text-white">{$translations.meetingSchedule}</legend>
        <div class="space-y-4">
          <Label class="font-medium text-gray-700 dark:text-gray-300">{$translations.meetingsOnSpecificDays}</Label>
          <div class="grid grid-cols-7 gap-2">
            {#each $translations.weekdays as day, i}
              <div class="flex items-center space-x-2">
                <Label class="mt-4 flex text-sm dark:text-white">
                  <Checkbox bind:checked={onWeekdays[i]} on:change={computeParameters} class="me-1" />
                  {day}
                </Label>
              </div>
            {/each}
          </div>
        </div>
        <div class="mt-6 space-y-4">
          <Label class="font-medium text-gray-700 dark:text-gray-300">{$translations.meetingsNotOnSpecificDays}</Label>
          <div class="grid grid-cols-7 gap-2">
            {#each $translations.weekdays as day, i}
              <div class="flex items-center space-x-2">
                <Label class="mt-4 flex text-sm dark:text-white">
                  <Checkbox bind:checked={notOnWeekdays[i]} on:change={computeParameters} class="me-1" />
                  {day}
                </Label>
              </div>
            {/each}
          </div>
        </div>
      </fieldset>

      <fieldset class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <legend class="text-lg font-semibold text-gray-900 dark:text-white">{$translations.venueOptions}</legend>
        <div class="space-y-4">
          <Label class="font-medium text-gray-700 dark:text-gray-300">{$translations.hasVenueType}</Label>
          <div class="grid grid-cols-3 gap-2">
            {#each $translations.venueTypes as vt, i}
              <div class="flex items-center space-x-2">
                <Label class="mt-4 flex text-sm dark:text-white">
                  <Checkbox bind:checked={hasVenueType[i]} on:change={computeParameters} class="me-1" />
                  {vt}
                </Label>
              </div>
            {/each}
          </div>
        </div>
        <div class="mt-6 space-y-4">
          <Label class="font-medium text-gray-700 dark:text-gray-300">{$translations.doesNotHaveVenueType}</Label>
          <div class="grid grid-cols-3 gap-2">
            {#each $translations.venueTypes as vt, i}
              <div class="flex items-center space-x-2">
                <Label class="mt-4 flex text-sm dark:text-white">
                  <Checkbox bind:checked={doesNotHaveVenueType[i]} on:change={computeParameters} class="me-1" />
                  {vt}
                </Label>
              </div>
            {/each}
          </div>
        </div>
      </fieldset>

      <fieldset class="rounded-lg border border-gray-200 bg-gray-50 p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <legend class="text-lg font-semibold text-gray-900 dark:text-white">{$translations.formatFilters}</legend>
        <div class="space-y-4">
          <Label class="font-medium text-gray-700 dark:text-gray-300">{$translations.hasFormat}</Label>
          <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {#each formats as f, i}
              <div class="flex items-center space-x-2">
                <Label class="mt-4 flex text-sm dark:text-white">
                  <Checkbox bind:checked={hasFormat[i]} on:change={computeParameters} class="me-1" />
                  {f.key_string}
                </Label>
              </div>
            {/each}
          </div>
          <div class="flex items-center space-x-4">
            <Label class="font-medium text-gray-700 dark:text-gray-300">{$translations.formatsComparisonOperator}:</Label>
            <div class="flex items-center space-x-2">
              <Radio id="and-comparison" bind:group={formatsComparisonOperator} value="AND" on:change={computeParameters} />
              <Label for="and-comparison" class="text-sm dark:text-white">{$translations.and}</Label>
            </div>
            <div class="flex items-center space-x-2">
              <Radio id="or-comparison" bind:group={formatsComparisonOperator} value="OR" on:change={computeParameters} />
              <Label for="or-comparison" class="text-sm dark:text-white">{$translations.or}</Label>
            </div>
          </div>

          <div class="mt-6 space-y-4">
            <Label class="font-medium text-gray-700 dark:text-gray-300">{$translations.doesNotHaveFormat}</Label>
            <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {#each formats as f, i}
                <div class="flex items-center space-x-2">
                  <Label class="mt-4 flex text-sm dark:text-white">
                    <Checkbox bind:checked={doesNotHaveFormat[i]} on:change={computeParameters} class="me-1" />
                    {f.key_string}
                  </Label>
                </div>
              {/each}
            </div>
          </div>
        </div>
      </fieldset>

      <fieldset class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <legend class="text-lg font-semibold text-gray-900 dark:text-white">{$translations.meetingKeyValue}</legend>
        <div class="space-y-4">
          <div>
            <Label class="mb-2 block text-sm text-gray-700 dark:text-gray-300">
              <div class="mb-2">
                {$translations.field}:
              </div>
              <Select class="w-full" items={fieldOptions} placeholder={$translations.chooseOption} bind:value={keyForMeetingKeyValue} onchange={computeMeetingKeyValues} />
            </Label>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label class="mb-2 block text-sm text-gray-700 dark:text-gray-300">
                <div class="mb-2">
                  {$translations.selectExistingValue}:
                </div>
                <Select
                  class="w-full"
                  items={meetingKeyValues}
                  placeholder={$translations.chooseOption}
                  disabled={keyForMeetingKeyValue === ''}
                  bind:value={meetingFieldValue}
                  onchange={computeParameters}
                />
              </Label>
            </div>
            <div>
              <Label for="enter-new-value" class="mb-2 block text-sm text-gray-700 dark:text-gray-300">
                <div class="mb-2">
                  {$translations.enterNewValue}:
                </div>
                <Input type="text" id="enter-new-value" disabled={keyForMeetingKeyValue === ''} placeholder="" bind:value={meetingFieldValue} on:input={computeParameters} />
              </Label>
            </div>
          </div>
        </div>
      </fieldset>

      <fieldset class="rounded-lg border border-gray-200 bg-gray-50 p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <legend class="text-lg font-semibold text-gray-900 dark:text-white">{$translations.searchString}</legend>
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label for="search-for-text" class="mb-2 block text-sm text-gray-700 dark:text-gray-300">
                <div class="mb-2">
                  {$translations.searchForThisText}:
                </div>
                <Input type="text" id="search-for-text" placeholder="" bind:value={specificTextValue} on:input={computeParametersForSpecificTextValue} />
              </Label>
            </div>
            <div>
              <Label for="search-type" class="mb-2 block text-sm text-gray-700 dark:text-gray-300">
                <div class="mb-2">
                  {$translations.searchType}:
                </div>
                <Select
                  id="search-type"
                  class="w-full"
                  items={searchForTextMenuOptions}
                  placeholder={$translations.chooseOption}
                  disabled={specificTextValue === ''}
                  bind:value={searchType}
                  onchange={computeParametersForSpecificTextValue}
                />
              </Label>
            </div>
          </div>
          {#if searchType === 'location'}
            <div>
              <Label for="search-radius" class="mb-2 block text-sm text-gray-700 dark:text-gray-300">
                <div class="mb-2">
                  {$translations.searchRadius}:
                </div>
                <Input type="text" id="search-radius" placeholder="" bind:value={searchRadius} on:input={computeParametersForSpecificTextValue} />
              </Label>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{$translations.searchRadiusExplanation}</p>
              {#if badRadius}
                <div class="mt-1 text-sm text-red-500 dark:text-red-400">{$translations.invalidRadius}</div>
              {/if}
            </div>
          {/if}
        </div>
      </fieldset>
    </div>
  </Card>
</div>
