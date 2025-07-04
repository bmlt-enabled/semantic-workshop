<script lang="ts">
  import { Card, Checkbox, Helper, Input, Label, Radio, Select, Table, TableBody, TableBodyCell, TableBodyRow } from 'flowbite-svelte';
  import { onMount } from 'svelte';
  import ServiceBodiesTree from './ServiceBodiesTree.svelte';
  import { translations } from '../stores/localization';

  interface Props {
    availableFields: { key: string; description: string }[];
    formats: { key_string: string; id: string }[];
    serviceBodies: { name: string; id: string; parent_id: string }[];
    rootServerURL: string;
    parameters: string | null;
  }

  let { availableFields, formats, serviceBodies, rootServerURL, parameters = $bindable() }: Props = $props();
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
  let serverError: string = $state('');
  let selectedServiceBodies: string[] = $state([]);
  let rejectedServiceBodies: string[] = $state([]);
  let specificTextValue = $state('');
  const searchForTextMenuOptions = [
    { name: $translations.searchOptionGeneral, value: 'general' },
    { name: $translations.searchOptionLocation, value: 'location' }
  ];
  let searchType = $state('general');
  let textSearchRadius = $state('');
  let fieldOptions: { name: string; value: string }[] = $derived(availableFields.map((f: { key: string; description: string }) => ({ name: f.description, value: f.key })));
  let startsAfter = $state('');
  let startsBefore = $state('');
  let endsBefore = $state('');
  let minDuration = $state('');
  let maxDuration = $state('');
  let badTime = $derived(!validTime(startsAfter) || !validTime(startsBefore) || !validTime(endsBefore) || !validTime(minDuration) || !validTime(maxDuration));
  let latitude = $state('');
  let longitude = $state('');
  let latLonSearchRadius = $state('');
  const unitsMenuOptions = [
    { name: $translations.miles, value: 'miles' },
    { name: $translations.kilometers, value: 'kilometers' }
  ];
  let latLonSearchUnits = $state('miles');
  let selectedFields = $state(Array(availableFields.length).fill(false));
  // sortOrder[i] gives the sort order for availableFields[i], where a value of '1' means it's the first field to be used in the sort,
  // '2' means it's the second, etc.  '0' means that field isn't in the sort order.  Annoyingly, the flowbite-svelte version of Select
  // seems to want the values to be strings only, so the code is constantly converting between strings and ints for this array.
  let sortOrder: string[] = $state(new Array(availableFields.length).fill('0'));

  // return true if s represents a valid number (either integer or float is ok).  An empty string is also OK -- this indicates an entry
  // hasn't been made yet, but we don't want to fire off an error message in this case.
  function validNumber(s: string) {
    return !isNaN(Number(s));
  }

  // Return true if s represents a valid radius as far as the meeting search parameters are concerned.  A positive radius can be either an
  // integer or a float; a negative radius must be an integer (and actually will represent a meeting count or the like). Zero isn't allowed.
  // An empty string is OK though -- this indicates an entry hasn't been made yet.
  function validRadius(s: string) {
    if (s === '') {
      return true;
    }
    const n = Number(s);
    return !isNaN(n) && (n > 0 || (n < 0 && Number.isInteger(n)));
  }

  // This function is called when the user has selected a field for the "Search for meetings with a specific value of a field" option.
  // Get the existing values of that field in the database to populate the menu of existing values.  The Response URL should just be
  // GetSearchResults after this function is called, with no additional parameters -- that will get filled in after the user selects
  // an existing value of a field or types in a new one.
  async function computeMeetingKeyValues() {
    try {
      const response = await fetch(rootServerURL + 'client_interface/json/?switcher=GetFieldValues&meeting_key=' + encodeURIComponent(keyForMeetingKeyValue));
      if (!response.ok) {
        throw new Error('server response said not OK');
      } else {
        const j = await response.json();
        meetingKeyValues = j.map((f: Record<string, string>) => ({ name: f[keyForMeetingKeyValue], value: f[keyForMeetingKeyValue] }));
      }
    } catch (error) {
      meetingKeyValues = [];
      serverError = $translations.serverError + ' -- ' + error;
    }
    meetingFieldValue = '';
    parameters = '';
  }

  // Time is in 24 hour time and must be at least 00:01 and at most 23:59 (so you can't enter midnight exactly).  It also takes a rather
  // liberal view of allowed times, mostly so that intermediate entries when typing something in don't show up as errors.
  // Thus 9, 09, 09:, 09:0, and 09:00 are all legal and represent 9am.  However, 9x, 12:61, and 25:00 are not legal.
  function validTime(s: string): boolean {
    if (s === '') {
      return true;
    } else if (/^\d\d?(:\d?\d?)?$/.test(s)) {
      const hm = s.split(':');
      const h = parseInt(hm[0]);
      const m = hm.length === 2 && hm[1].length > 0 ? parseInt(hm[1]) : 0;
      return h < 24 && m < 60 && (h > 0 || m > 0);
    } else {
      return false;
    }
  }

  function timePart(what: string, time: string): string {
    if (time === '' || !validTime(time)) {
      return '';
    }
    const hm = time.split(':');
    const hPart = hm[0] === '' || hm[0] === '0' || hm[0] === '00' ? '' : '&' + what + 'H=' + hm[0];
    const mPart = hm.length < 2 || hm[1] === '' || hm[1] === '0' || hm[1] === '00' ? '' : '&' + what + 'M=' + hm[1];
    return hPart + mPart;
  }

  function computeSpecificFieldsPart(): string {
    const encodedNames = [];
    for (let i = 0; i < availableFields.length; i++) {
      if (selectedFields[i]) {
        encodedNames.push(encodeURIComponent(availableFields[i].key));
      }
    }
    return encodedNames.length === 0 ? '' : '&data_field_key=' + encodedNames.join(',');
  }

  function computeSortOrderPart(): string {
    const keys = new Array(sortOrder.length).fill('');
    for (let i = 0; i < sortOrder.length; i++) {
      if (sortOrder[i] !== '0') {
        keys[parseInt(sortOrder[i]) - 1] = availableFields[i].key;
      }
    }
    const usedKeys = keys.filter((k) => k !== '');
    return usedKeys.length === 0 ? '' : '&sort_keys=' + usedKeys.map(encodeURIComponent).join(',');
  }

  // This function is used to decide whether to enable or disable a menu option for the sort order menu for a given field.  Argument i
  // is the option position, and currentValue is the current position of that field (0 means not part of sort order, 1 means first, etc).
  // The Don't sort option is always enabled and is handled separately.
  function allowedSortChoice(i: number, currentValue: number): boolean {
    // it's ok to select the current position again (although this wouldn't change anything)
    if (i === currentValue) {
      return true;
    }
    // otherwise, if i is already used as a position, we can't pick it as a position for a different field
    if (sortOrder.includes(i.toString())) {
      return false;
    }
    // if the current position is the last position used, selecting the next available position wouldn't make sense, since after things
    // are fixed up we'd just be back to the same state
    if (currentValue > 0 && !sortOrder.includes((currentValue + 1).toString())) {
      return false;
    }
    // if i-1 is used as a position, that means i is the next available position, so enable it
    if (sortOrder.includes((i - 1).toString())) {
      return true;
    }
    return false;
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

    const selectedServiceBodiesKey = selectedServiceBodies.length > 1 ? '&services[]=' : '&services=';
    const selectedServiceBodiesPart = selectedServiceBodies.map((s) => selectedServiceBodiesKey + s).join('');
    const rejectedServiceBodiesKey = rejectedServiceBodies.length > 1 ? '&services[]=-' : '&services=-';
    const rejectedServiceBodiesPart = rejectedServiceBodies.map((s) => rejectedServiceBodiesKey + s).join('');

    const locationModifier = searchType === 'location' ? '&StringSearchIsAnAddress=1' : '';
    const radiusModifier = searchType === 'location' && textSearchRadius ? '&SearchStringRadius=' + textSearchRadius : '';
    const specificTextValuePart = specificTextValue ? '&SearchString=' + encodeURIComponent(specificTextValue) + locationModifier + radiusModifier : '';

    const meetingStartEndTimePart = timePart('StartsAfter', startsAfter) + timePart('StartsBefore', startsBefore) + timePart('EndsBefore', endsBefore);
    const meetingDurationPart = timePart('MinDuration', minDuration) + timePart('MaxDuration', maxDuration);

    const widthPart = '&geo_width' + (latLonSearchUnits === 'kilometers' ? '_km=' : '=') + latLonSearchRadius;
    const latLonSearchPart = latitude && longitude && latLonSearchRadius ? widthPart + '&long_val=' + longitude + '&lat_val=' + latitude : '';

    const specificFieldsPart = computeSpecificFieldsPart();
    const sortOrderPart = computeSortOrderPart();

    if ((textSearchRadius && !validRadius(textSearchRadius)) || badTime || !validNumber(latitude) || !validNumber(longitude) || !validRadius(latLonSearchRadius)) {
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
        selectedServiceBodiesPart +
        rejectedServiceBodiesPart +
        specificTextValuePart +
        meetingStartEndTimePart +
        meetingDurationPart +
        latLonSearchPart +
        specificFieldsPart +
        sortOrderPart;
    }
  }

  function computeParametersForSpecificTextValue() {
    // this resets searchType if specificTextValue was set back to the empty string (by erasing something that was there)
    // also reset textSearchRadius if we're back to general search type
    if (specificTextValue === '') {
      searchType = 'general';
    }
    if (searchType === 'general') {
      textSearchRadius = '';
    }
    computeParameters();
  }

  function computeParametersforSortOrder() {
    // update sort positions if necessary
    const sortCopy = [...sortOrder];
    for (let i = 0; i < sortCopy.length; i++) {
      if (!sortCopy.includes((i + 1).toString())) {
        // change subsequent positions to 1 less and stop looping
        for (let j = 0; j < sortCopy.length; j++) {
          if (parseInt(sortCopy[j]) > i + 1) {
            sortCopy[j] = (parseInt(sortCopy[j]) - 1).toString();
          }
        }
        break;
      }
    }
    computeParameters();
    sortOrder = sortCopy;
  }

  onMount(() => (parameters = ''));
</script>

<div class="flex justify-center">
  <Card class="border-gray-500 p-4 dark:border-gray-400" size="lg">
    <div class="space-y-6">
      <fieldset class="rounded-lg border border-gray-500 bg-white p-6 shadow-sm dark:border-gray-400 dark:bg-gray-800">
        <legend class="text-lg font-semibold text-gray-900 dark:text-white">{$translations.formatOptions}</legend>
        <div class="space-y-2">
          <div class="flex items-center space-x-2">
            <Label class="mt-4 flex items-center font-medium dark:text-white">
              <Checkbox bind:checked={getUsedFormats} onchange={computeParameters} class="me-1" />
              {$translations.getUsedFormats}
            </Label>
          </div>
          <div class="flex items-center space-x-2">
            <Label class="mt-4 flex items-center font-medium dark:text-white">
              <Checkbox bind:checked={getFormatsOnly} disabled={!getUsedFormats} onchange={computeParameters} class="me-1" />
              {$translations.getFormatsOnly}
            </Label>
          </div>
        </div>
      </fieldset>

      <fieldset class="rounded-lg border border-gray-500 bg-gray-50 p-6 shadow-sm dark:border-gray-400 dark:bg-gray-800">
        <legend class="text-lg font-semibold text-gray-900 dark:text-white">{$translations.meetingsOnSpecificDays}</legend>
        <div class="text-sm font-semibold text-gray-900 dark:text-white">{$translations.meetingsOnSpecificDaysExplanation}</div>
        <div class="grid gap-2 sm:grid-cols-1 lg:grid-cols-7">
          {#each $translations.weekdays as day, i}
            <div class="flex items-center space-x-2">
              <Label class="mt-4 flex text-sm dark:text-white">
                <Checkbox bind:checked={onWeekdays[i]} onchange={computeParameters} class="me-1" />
                {day}
              </Label>
            </div>
          {/each}
        </div>
      </fieldset>

      <fieldset class="rounded-lg border border-gray-500 bg-gray-50 p-6 shadow-sm dark:border-gray-400 dark:bg-gray-800">
        <legend class="text-lg font-semibold text-gray-900 dark:text-white">{@html $translations.meetingsNotOnSpecificDays}</legend>
        <div class="text-sm font-semibold text-gray-900 dark:text-white">{$translations.meetingsNotOnSpecificDaysExplanation}</div>
        <div class="grid gap-2 sm:grid-cols-1 lg:grid-cols-7">
          {#each $translations.weekdays as day, i}
            <div class="flex items-center space-x-2">
              <Label class="mt-4 flex text-sm dark:text-white">
                <Checkbox bind:checked={notOnWeekdays[i]} onchange={computeParameters} class="me-1" />
                {day}
              </Label>
            </div>
          {/each}
        </div>
      </fieldset>

      <fieldset class="rounded-lg border border-gray-500 bg-white p-6 shadow-sm dark:border-gray-400 dark:bg-gray-800">
        <legend class="text-lg font-semibold text-gray-900 dark:text-white">{$translations.hasVenueType}</legend>
        <div class="text-sm font-semibold text-gray-900 dark:text-white">{$translations.hasVenueTypeExplanation}</div>
        <div class="grid grid-cols-3 gap-2">
          {#each $translations.venueTypes as vt, i}
            <div class="flex items-center space-x-2">
              <Label class="mt-4 flex text-sm dark:text-white">
                <Checkbox bind:checked={hasVenueType[i]} onchange={computeParameters} class="me-1" />
                {vt}
              </Label>
            </div>
          {/each}
        </div>
      </fieldset>

      <fieldset class="rounded-lg border border-gray-500 bg-white p-6 shadow-sm dark:border-gray-400 dark:bg-gray-800">
        <legend class="text-lg font-semibold text-gray-900 dark:text-white">{@html $translations.doesNotHaveVenueType}</legend>
        <div class="text-sm font-semibold text-gray-900 dark:text-white">{$translations.doesNotHaveVenueTypeExplanation}</div>
        <div class="grid grid-cols-3 gap-2">
          {#each $translations.venueTypes as vt, i}
            <div class="flex items-center space-x-2">
              <Label class="mt-4 flex text-sm dark:text-white">
                <Checkbox bind:checked={doesNotHaveVenueType[i]} onchange={computeParameters} class="me-1" />
                {vt}
              </Label>
            </div>
          {/each}
        </div>
      </fieldset>

      <fieldset class="rounded-lg border border-gray-500 bg-gray-50 p-6 shadow-sm dark:border-gray-400 dark:bg-gray-800">
        <legend class="text-lg font-semibold text-gray-900 dark:text-white">{$translations.hasFormat}</legend>
        <div class="text-sm font-semibold text-gray-900 dark:text-white">{$translations.hasFormatExplanation}</div>
        <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {#each formats as f, i}
            <div class="flex items-center space-x-2">
              <Label class="mt-4 flex text-sm dark:text-white">
                <Checkbox bind:checked={hasFormat[i]} onchange={computeParameters} class="me-1" />
                {f.key_string}
              </Label>
            </div>
          {/each}
        </div>
        <div class="flex items-center space-x-4">
          <Label class="font-medium text-gray-700 dark:text-gray-300">{$translations.formatsComparisonOperator}:</Label>
          <div class="flex items-center space-x-2">
            <Radio id="and-comparison" bind:group={formatsComparisonOperator} value="AND" onchange={computeParameters} />
            <Label for="and-comparison" class="text-sm dark:text-white">{$translations.and}</Label>
          </div>
          <div class="flex items-center space-x-2">
            <Radio id="or-comparison" bind:group={formatsComparisonOperator} value="OR" onchange={computeParameters} />
            <Label for="or-comparison" class="text-sm dark:text-white">{$translations.or}</Label>
          </div>
        </div>
      </fieldset>

      <fieldset class="rounded-lg border border-gray-500 bg-gray-50 p-6 shadow-sm dark:border-gray-400 dark:bg-gray-800">
        <legend class="text-lg font-semibold text-gray-900 dark:text-white">{@html $translations.doesNotHaveFormat}</legend>
        <div class="text-sm font-semibold text-gray-900 dark:text-white">{$translations.doesNotHaveFormatExplanation}</div>
        <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {#each formats as f, i}
            <div class="flex items-center space-x-2">
              <Label class="mt-4 flex text-sm dark:text-white">
                <Checkbox bind:checked={doesNotHaveFormat[i]} onchange={computeParameters} class="me-1" />
                {f.key_string}
              </Label>
            </div>
          {/each}
        </div>
      </fieldset>

      <fieldset class="rounded-lg border border-gray-500 bg-white p-6 shadow-sm dark:border-gray-400 dark:bg-gray-800">
        <legend class="text-lg font-semibold text-gray-900 dark:text-white">{$translations.meetingKeyValue}</legend>
        <div class="text-sm font-semibold text-gray-900 dark:text-white">{$translations.meetingKeyValueExplanation}</div>
        <div class="space-y-4">
          <div>
            <Label class="mb-2 block text-sm text-gray-700 dark:text-gray-300">
              <div class="mb-2">
                {$translations.field}:
              </div>
              <Select class="w-full" items={fieldOptions} placeholder={$translations.chooseOption} bind:value={keyForMeetingKeyValue} onchange={computeMeetingKeyValues} />
            </Label>
            {#if serverError}
              <Helper class="text-red-500 dark:text-red-400">{serverError}</Helper>
            {/if}
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
                  disabled={keyForMeetingKeyValue === '' || serverError !== ''}
                  bind:value={meetingFieldValue}
                  onchange={computeParameters}
                />
              </Label>
            </div>
            <div>
              <Label class="mb-2 block text-sm text-gray-700 dark:text-gray-300">
                <div class="mb-2">
                  {$translations.enterNewValue}:
                </div>
                <Input type="text" disabled={keyForMeetingKeyValue === '' || serverError !== ''} placeholder="" bind:value={meetingFieldValue} onInput={computeParameters} />
              </Label>
            </div>
          </div>
        </div>
      </fieldset>

      <fieldset class="rounded-lg border border-gray-500 bg-gray-50 p-6 shadow-sm dark:border-gray-400 dark:bg-gray-800">
        <legend class="text-lg font-semibold text-gray-900 dark:text-white">{$translations.specificServiceBodies}</legend>
        <div class="mb-2 text-sm font-semibold text-gray-900 dark:text-white">{$translations.specificServiceBodiesExplanation}</div>
        <ServiceBodiesTree {serviceBodies} onchange={computeParameters} bind:selectedValues={selectedServiceBodies} />
      </fieldset>

      <fieldset class="rounded-lg border border-gray-500 bg-gray-50 p-6 shadow-sm dark:border-gray-400 dark:bg-gray-800">
        <legend class="text-lg font-semibold text-gray-900 dark:text-white">{@html $translations.notSpecificServiceBodies}</legend>
        <div class="mb-2 text-sm font-semibold text-gray-900 dark:text-white">{@html $translations.notSpecificServiceBodiesExplanation}</div>
        <ServiceBodiesTree {serviceBodies} onchange={computeParameters} bind:selectedValues={rejectedServiceBodies} />
      </fieldset>

      <fieldset class="rounded-lg border border-gray-500 bg-gray-50 p-6 shadow-sm dark:border-gray-400 dark:bg-gray-800">
        <legend class="text-lg font-semibold text-gray-900 dark:text-white">{$translations.meetingSearchString}</legend>
        <div class="text-sm font-semibold text-gray-900 dark:text-white">{$translations.meetingSearchStringExplanation}</div>
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <Label class="mb-2 block text-sm text-gray-700 dark:text-gray-300">
              <div class="mb-2">
                {$translations.searchForThisText}:
              </div>
              <Input type="text" placeholder="" bind:value={specificTextValue} onInput={computeParametersForSpecificTextValue} />
            </Label>
            <Label class="mb-2 block text-sm text-gray-700 dark:text-gray-300">
              <div class="mb-2">
                {$translations.meetingSearchType}:
              </div>
              <Select
                class="w-full"
                items={searchForTextMenuOptions}
                placeholder={$translations.chooseOption}
                disabled={specificTextValue === ''}
                bind:value={searchType}
                onchange={computeParametersForSpecificTextValue}
              />
            </Label>
          </div>
          {#if searchType === 'location'}
            <div>
              <Label class="mb-2 block text-sm text-gray-700 dark:text-gray-300">
                <div class="mb-2">
                  {$translations.meetingSearchRadius}:
                </div>
                <Input type="text" placeholder="" bind:value={textSearchRadius} onInput={computeParametersForSpecificTextValue} />
              </Label>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{$translations.meetingSearchRadiusExplanation}</p>
              {#if !validRadius(textSearchRadius)}
                <div class="mt-1 text-sm text-red-500 dark:text-red-400">{$translations.invalidRadius}</div>
              {/if}
            </div>
          {/if}
        </div>
      </fieldset>

      <fieldset class="rounded-lg border border-gray-500 bg-gray-50 p-6 shadow-sm dark:border-gray-400 dark:bg-gray-800">
        <legend class="text-lg font-semibold text-gray-900 dark:text-white">{$translations.meetingStartOrEndTime}</legend>
        <div class="text-sm font-semibold text-gray-900 dark:text-white">{$translations.meetingStartOrEndTimeExplanation}</div>
        <div class="space-y-4">
          <div>
            <Label class="mb-2 block text-sm text-gray-700 dark:text-gray-300">
              <div class="mb-2">
                {$translations.meetingStartsAfter}:
              </div>
              <Input type="text" placeholder="" bind:value={startsAfter} onInput={computeParameters} />
            </Label>
            {#if !validTime(startsAfter)}
              <div class="mt-1 text-sm text-red-500 dark:text-red-400">{$translations.invalidTime}</div>
            {/if}
          </div>
          <div>
            <Label class="mb-2 block text-sm text-gray-700 dark:text-gray-300">
              <div class="mb-2">
                {$translations.meetingStartsBefore}:
              </div>
              <Input type="text" placeholder="" bind:value={startsBefore} onInput={computeParameters} />
            </Label>
            {#if !validTime(startsBefore)}
              <div class="mt-1 text-sm text-red-500 dark:text-red-400">{$translations.invalidTime}</div>
            {/if}
          </div>
          <div>
            <Label class="mb-2 block text-sm text-gray-700 dark:text-gray-300">
              <div class="mb-2">
                {$translations.meetingEndsBefore}:
              </div>
              <Input type="text" placeholder="" bind:value={endsBefore} onInput={computeParameters} />
            </Label>
            {#if !validTime(endsBefore)}
              <div class="mt-1 text-sm text-red-500 dark:text-red-400">{$translations.invalidTime}</div>
            {/if}
          </div>
        </div>
      </fieldset>

      <fieldset class="rounded-lg border border-gray-500 bg-gray-50 p-6 shadow-sm dark:border-gray-400 dark:bg-gray-800">
        <legend class="text-lg font-semibold text-gray-900 dark:text-white">{$translations.meetingDuration}</legend>
        <div class="text-sm font-semibold text-gray-900 dark:text-white">{$translations.meetingDurationExplanation}</div>
        <div class="space-y-4">
          <div>
            <Label class="mb-2 block text-sm text-gray-700 dark:text-gray-300">
              <div class="mb-2">
                {$translations.meetingLastsAtLeast}:
              </div>
              <Input type="text" placeholder="" bind:value={minDuration} onInput={computeParameters} />
            </Label>
            {#if !validTime(minDuration)}
              <div class="mt-1 text-sm text-red-500 dark:text-red-400">{$translations.invalidTime}</div>
            {/if}
          </div>
          <div>
            <Label class="mb-2 block text-sm text-gray-700 dark:text-gray-300">
              <div class="mb-2">
                {$translations.meetingLastsAtMost}:
              </div>
              <Input type="text" placeholder="" bind:value={maxDuration} onInput={computeParameters} />
            </Label>
            {#if !validTime(maxDuration)}
              <div class="mt-1 text-sm text-red-500 dark:text-red-400">{$translations.invalidTime}</div>
            {/if}
          </div>
        </div>
      </fieldset>

      <fieldset class="rounded-lg border border-gray-500 bg-gray-50 p-6 shadow-sm dark:border-gray-400 dark:bg-gray-800">
        <legend class="text-lg font-semibold text-gray-900 dark:text-white">{$translations.meetingLatitudeLongitudeSearch}</legend>
        <div class="text-sm font-semibold text-gray-900 dark:text-white">{$translations.meetingLatitudeLongitudeSearchExplanation}</div>
        <div class="space-y-4">
          <div>
            <Label class="mb-2 block text-sm text-gray-700 dark:text-gray-300">
              <div class="mb-2">
                {$translations.latitude}:
              </div>
              <Input type="text" placeholder="" bind:value={latitude} onInput={computeParameters} />
            </Label>
            {#if !validNumber(latitude)}
              <div class="mt-1 text-sm text-red-500 dark:text-red-400">{$translations.invalidLatitude}</div>
            {/if}
          </div>
          <div>
            <Label class="mb-2 block text-sm text-gray-700 dark:text-gray-300">
              <div class="mb-2">
                {$translations.longitude}:
              </div>
              <Input type="text" placeholder="" bind:value={longitude} onInput={computeParameters} />
            </Label>
            {#if !validNumber(longitude)}
              <div class="mt-1 text-sm text-red-500 dark:text-red-400">{$translations.invalidLongitude}</div>
            {/if}
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label class="mb-2 block text-sm text-gray-700 dark:text-gray-300">
                <div class="mb-2">
                  {$translations.latLonSearchRadius}:
                </div>
                <Input type="text" placeholder="" bind:value={latLonSearchRadius} onInput={computeParameters} />
              </Label>
              {#if !validRadius(latLonSearchRadius)}
                <div class="mt-1 text-sm text-red-500 dark:text-red-400">{$translations.invalidRadius}</div>
              {/if}
            </div>
            <Label class="mb-2 block text-sm text-gray-700 dark:text-gray-300">
              <div class="mb-2">
                {$translations.units}:
              </div>
              <Select class="w-full" placeholder={$translations.chooseOption} bind:value={latLonSearchUnits} onchange={computeParameters}>
                {#if !latLonSearchRadius.startsWith('-')}
                  <option selected value="miles">{$translations.miles}</option>
                  <option value="kilometers">{$translations.kilometers}</option>
                {/if}
              </Select>
            </Label>
          </div>
        </div>
      </fieldset>

      <fieldset class="rounded-lg border border-gray-500 bg-gray-50 p-6 shadow-sm dark:border-gray-400 dark:bg-gray-800">
        <legend class="text-lg font-semibold text-gray-900 dark:text-white">{$translations.meetingSpecificFields}</legend>
        <div class="text-sm font-semibold text-gray-900 dark:text-white">{$translations.meetingSpecificFieldsExplanation}</div>
        <div class="mt-2 grid grid-cols-1 gap-2">
          {#each fieldOptions as f, i}
            <div class="flex items-center space-x-2">
              <Label class="flex text-sm dark:text-white">
                <Checkbox class="me-2" bind:checked={selectedFields[i]} onchange={computeParameters} />
                {f.name}
              </Label>
            </div>
          {/each}
        </div>
      </fieldset>

      <fieldset class="rounded-lg border border-gray-500 bg-gray-50 p-6 shadow-sm dark:border-gray-400 dark:bg-gray-800">
        <legend class="text-lg font-semibold text-gray-900 dark:text-white">{$translations.meetingResponseSortOrder}</legend>
        <div class="text-sm font-semibold text-gray-900 dark:text-white">{$translations.meetingResponseSortOrderExplanation}</div>
        <div class="mt-2 grid grid-cols-1 gap-2">
          {#each fieldOptions as f, n}
            <div class="flex items-center space-x-2">
              <Label class="flex text-sm dark:text-white">
                <Select class="me-2" bind:value={sortOrder[n]} onchange={computeParametersforSortOrder}>
                  <option selected value="0">{$translations.dontSort}</option>
                  {#each fieldOptions as _, i}
                    <option value={(i + 1).toString()} disabled={!allowedSortChoice(i + 1, parseInt(sortOrder[n]))}>{i + 1}</option>
                  {/each}
                </Select>
                {f.name}
              </Label>
            </div>
          {/each}
        </div>
      </fieldset>
    </div>
  </Card>
</div>
