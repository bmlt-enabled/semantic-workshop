<script lang="ts">
  import { Checkbox, Input, Label, Radio, Select, Table, TableBody, TableBodyCell, TableBodyRow } from 'flowbite-svelte';
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
  let fieldOptions: { name: string; value: string }[] = $state();
  let meetingKeyValues: { name: string; value: string }[] = $state();
  let meetingFieldValue = $state('');

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

    parameters =
      usedFormatsPart + onWeekdayPart + notOnWeekdayPart + hasVenueTypePart + doesNotHaveVenueTypePart + hasFormatPart + doesNotHaveFormatPart + formatsComparisonOperatorPart + specificFieldValuePart;
  }

  async function computeMeetingKeyValues() {
    try {
      const response = await fetch(rootServerURL + 'client_interface/json/?switcher=GetFieldValues&meeting_key=' + encodeURIComponent(keyForMeetingKeyValue));
      const j = await response.json();
      meetingKeyValues = j.map((f) => ({ name: f[keyForMeetingKeyValue], value: f[keyForMeetingKeyValue] }));
      meetingFieldValue = '';
      parameters = '';
    } catch (error) {
      // TO FILL IN
    }
  }

  function initialize() {
    parameters = '';
    fieldOptions = availableFields.map((f: { key: string; description: string }) => ({ name: f.description, value: f.key }));
  }

  onMount(initialize);
</script>

<div>
  <Checkbox bind:checked={getUsedFormats} on:change={computeParameters}>
    {$translations.getUsedFormats}
  </Checkbox>
  <Checkbox bind:checked={getFormatsOnly} disabled={!getUsedFormats} on:change={computeParameters} class="text-gray-900 contrast-100 dark:text-gray-300">
    {$translations.getFormatsOnly}
  </Checkbox>

  <Table>
    <caption class="bg-white p-5 text-left text-lg font-semibold text-gray-900 dark:bg-gray-800 dark:text-white">
      {$translations.meetingsOnSpecificDays}
      <p class="mt-1 text-sm font-normal text-gray-500 dark:text-gray-400">{$translations.meetingsOnSpecificDaysExplanation}</p>
    </caption>
    <TableBody>
      <TableBodyRow>
        {#each $translations.weekdays as day, i}
          <TableBodyCell><Checkbox bind:checked={onWeekdays[i]} on:change={computeParameters}>{day}</Checkbox></TableBodyCell>
        {/each}
      </TableBodyRow>
    </TableBody>
  </Table>

  <Table>
    <caption class="bg-white p-5 text-left text-lg font-semibold text-gray-900 dark:bg-gray-800 dark:text-white">
      {$translations.meetingsNotOnSpecificDays}
      <p class="mt-1 text-sm font-normal text-gray-500 dark:text-gray-400">{$translations.meetingsNotOnSpecificDaysExplanation}</p>
    </caption>
    <TableBody>
      <TableBodyRow>
        {#each $translations.weekdays as day, i}
          <TableBodyCell><Checkbox bind:checked={notOnWeekdays[i]} on:change={computeParameters}>{day}</Checkbox></TableBodyCell>
        {/each}
      </TableBodyRow>
    </TableBody>
  </Table>

  <Table>
    <caption class="bg-white p-5 text-left text-lg font-semibold text-gray-900 dark:bg-gray-800 dark:text-white">
      {$translations.hasVenueType}
      <p class="mt-1 text-sm font-normal text-gray-500 dark:text-gray-400">{$translations.hasVenueTypeExplanation}</p>
    </caption>
    <TableBody>
      <TableBodyRow>
        {#each $translations.venueTypes as vt, i}
          <TableBodyCell><Checkbox bind:checked={hasVenueType[i]} on:change={computeParameters}>{vt}</Checkbox></TableBodyCell>
        {/each}
      </TableBodyRow>
    </TableBody>
  </Table>

  <Table>
    <caption class="bg-white p-5 text-left text-lg font-semibold text-gray-900 dark:bg-gray-800 dark:text-white">
      {$translations.doesNotHaveVenueType}
      <p class="mt-1 text-sm font-normal text-gray-500 dark:text-gray-400">{$translations.doesNotHaveVenueTypeExplanation}</p>
    </caption>
    <TableBody>
      <TableBodyRow>
        {#each $translations.venueTypes as vt, i}
          <TableBodyCell><Checkbox bind:checked={doesNotHaveVenueType[i]} on:change={computeParameters}>{vt}</Checkbox></TableBodyCell>
        {/each}
      </TableBodyRow>
    </TableBody>
  </Table>

  <Table>
    <caption class="bg-white p-5 text-left text-lg font-semibold text-gray-900 dark:bg-gray-800 dark:text-white">
      {$translations.hasFormat}
      <p class="mt-1 text-sm font-normal text-gray-500 dark:text-gray-400">{$translations.hasFormatExplanation}</p>
    </caption>
    <TableBody>
      <TableBodyRow>
        {#each formats as f, i}
          <TableBodyCell><Checkbox bind:checked={hasFormat[i]} on:change={computeParameters}>{f.key_string}</Checkbox></TableBodyCell>
        {/each}
      </TableBodyRow>
    </TableBody>
  </Table>
  <Table>
    <TableBody>
      <TableBodyRow>
        <TableBodyCell>{$translations.formatsComparisonOperator}:</TableBodyCell>
        <TableBodyCell><Radio bind:group={formatsComparisonOperator} value="AND" on:change={computeParameters}>{$translations.and}</Radio></TableBodyCell>
        <TableBodyCell><Radio bind:group={formatsComparisonOperator} value="OR" on:change={computeParameters}>{$translations.or}</Radio></TableBodyCell>
      </TableBodyRow>
    </TableBody>
  </Table>

  <Table>
    <caption class="bg-white p-5 text-left text-lg font-semibold text-gray-900 dark:bg-gray-800 dark:text-white">
      {$translations.doesNotHaveFormat}
      <p class="mt-1 text-sm font-normal text-gray-500 dark:text-gray-400">{$translations.doesNotHaveFormatExplanation}</p>
    </caption>
    <TableBody>
      <TableBodyRow>
        {#each formats as f, i}
          <TableBodyCell><Checkbox bind:checked={doesNotHaveFormat[i]} on:change={computeParameters}>{f.key_string}</Checkbox></TableBodyCell>
        {/each}
      </TableBodyRow>
    </TableBody>
  </Table>

  <Table>
    <caption class="bg-white p-5 text-left text-lg font-semibold text-gray-900 dark:bg-gray-800 dark:text-white">
      {$translations.meetingKeyValue}
      <p class="mt-1 text-sm font-normal text-gray-500 dark:text-gray-400">{$translations.meetingKeyValueExplanation}</p>
    </caption>
    <TableBody>
      <TableBodyRow>
        <TableBodyCell>
          <Label for="select-key" class="mb-2">{$translations.field}:</Label>
          <Select id="select-key" class="mt-2" items={fieldOptions} placeholder={$translations.chooseOption} bind:value={keyForMeetingKeyValue} onchange={computeMeetingKeyValues} />
        </TableBodyCell>
        <TableBodyCell></TableBodyCell>
      </TableBodyRow>
      <TableBodyRow>
        <TableBodyCell>
          <Label for="select-value" class="mb-2">{$translations.selectExistingValue}:</Label>
          <Select
            id="select-value"
            class="mt-2"
            items={meetingKeyValues}
            placeholder={$translations.chooseOption}
            disabled={keyForMeetingKeyValue === ''}
            bind:value={meetingFieldValue}
            onchange={computeParameters}
          />
        </TableBodyCell>
        <TableBodyCell>
          <Label for="enter-new-value" class="mb-2">{$translations.enterNewValue}:</Label>
          <Input type="text" id="enter-new-value" disabled={keyForMeetingKeyValue === ''} placeholder="" bind:value={meetingFieldValue} on:input={computeParameters} />
        </TableBodyCell>
      </TableBodyRow>
    </TableBody>
  </Table>
</div>
