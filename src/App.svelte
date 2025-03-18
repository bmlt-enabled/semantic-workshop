<script lang="ts">
  import { Button, Datepicker, Helper } from 'flowbite-svelte';
  import { onMount } from 'svelte';

  import DarkMode from './components/DarkMode.svelte';
  import { translations } from './stores/localization';

  // defaultRootServerURL can also be '' (that works)
  const defaultRootServerURL = 'https://bmlt.wszf.org/main_server/';
  const allLanguages: Record<string, string> = {
    de: 'Deutsch',
    dk: 'Dansk',
    en: 'English',
    es: 'Español',
    fa: 'فارسی',
    fr: 'Français',
    it: 'Italiano',
    pl: 'Polskie',
    pt: 'Português',
    ru: 'Русский',
    sv: 'Svenska'
  };

  // state that is separate from a particular operation
  let workshopLanguage = $state('en');
  // rootServerUrl is what gets typed in the URL textbox
  let rootServerURL = $state(defaultRootServerURL);
  // the savedRootServerURL will always end in a / (added if necessary to the rootServerURL)
  let savedRootServerURL = $state(defaultRootServerURL);
  let serverError = $state();
  let operation = $state();
  let serverInfo: { langs: string; nativeLang: string }[] | undefined = $state();
  let serviceBodies: { name: string; id: string }[] | undefined = $state();
  let availableFields: { key: string; description: string }[] | undefined = $state();
  let langs: string[] | undefined = $state();
  let nativeLang: string | undefined = $state();

  // state for response URL
  let parameters = $derived(computeParameters());
  let responseURL = $derived(savedRootServerURL === '' || serverError ? '' : savedRootServerURL + 'client_interface/json/?switcher=' + operation + parameters);

  // state for Get Formats operation
  let formatLanguage: string | undefined = $state();
  let showAllFormats: boolean = $state(false);

  // state for Get Changes operation
  let changesFrom: Date | undefined = $state();
  let changesTo: Date | undefined = $state();
  let changesMeetingId: number | undefined = $state();
  let changesServiceBodyId: string | undefined = $state();

  // state for Get Field Values operation
  let keyForGetFieldValues: string | undefined = $state();

  // state for NAWS dump operation
  let nawsDumpServiceBodyId: string | undefined = $state();

  async function updateRootServerURL() {
    const s = rootServerURL.trim();
    savedRootServerURL = s + (s === '' || s.endsWith('/') ? '' : '/');
    // reset state that won't be updated by getData();
    // this will be 'operation' itself, and also state for a particular operation
    operation = 'GetServiceBodies';
    formatLanguage = undefined;
    showAllFormats = false;
    keyForGetFieldValues = undefined;
    nawsDumpServiceBodyId = undefined;
    await getAllData();
  }

  async function getData(operation: string) {
    const response = await fetch(savedRootServerURL + 'client_interface/json/?switcher=' + operation);
    return response.json();
  }

  // Get data from the server that will be needed for building some of the queries.  Just get it all for now - later we
  // could only get the data if it's needed for a particular operation.
  async function getAllData() {
    if (savedRootServerURL === '') {
      serverInfo = undefined;
      langs = undefined;
      nativeLang = undefined;
      serviceBodies = [];
      availableFields = [];
    } else {
      try {
        serverInfo = await getData('GetServerInfo');
        langs = serverInfo?.[0].langs.split(',');
        nativeLang = serverInfo?.[0].nativeLang;
        serviceBodies = await getData('GetServiceBodies');
        serviceBodies?.sort((a, b) => a.name.localeCompare(b.name));
        availableFields = await getData('GetFieldKeys');
        availableFields?.sort((a, b) => a.description.localeCompare(b.description));
      } catch (error) {
        serverError = $translations.serverError + ' -- ' + error;
        serverInfo = undefined;
        langs = undefined;
        nativeLang = undefined;
        serviceBodies = undefined;
        availableFields = undefined;
      }
    }
  }

  function computeParameters() {
    switch (operation) {
      case 'GetSearchResults':
        // TODO: not completed
        return '';
      case 'GetFormats':
        return (formatLanguage ? '&lang_enum=' + formatLanguage : '') + (showAllFormats ? '&show_all=1' : '');
      case 'GetChanges':
        return (
          changesDateParam(changesFrom, 'start') +
          changesDateParam(changesTo, 'end') +
          (changesMeetingId ? '&meeting_id=' + changesMeetingId.toString() : '') +
          (changesServiceBodyId ? '&service_body_id=' + changesServiceBodyId : '')
        );
      case 'GetFieldValues':
        return keyForGetFieldValues ? '&meeting_key=' + keyForGetFieldValues : '';
      case 'GetNAWSDump':
        return '&sb_id=' + nawsDumpServiceBodyId;
      default:
        // GetServiceBodies, GetFieldKeys, GetServerInfo, and GetCoverageArea take no parameters
        return '';
    }
  }

  function changesDateParam(date: Date | undefined, what: string) {
    if (date) {
      const monthStr = (date.getMonth() + 1).toString().padStart(2, '0');
      const dayStr = date.getDate().toString().padStart(2, '0');
      return '&' + what + '_date=' + date.getFullYear() + '-' + monthStr + '-' + dayStr;
    } else {
      return '';
    }
  }

  async function initialize() {
    translations.setLanguage(workshopLanguage);
    getAllData();
  }

  onMount(initialize);
</script>

<main>
  <h1 class="mb-4 dark:text-white">{$translations.title}</h1>

  <DarkMode size="lg" class="inline-block hover:text-gray-900 dark:hover:text-white" />
<form class="mb-4 w-3/12">

  <label for="workshopLanguage" class="mt-6 block text-sm font-medium text-gray-900 dark:text-white">{$translations.language}:</label>
  <select
    id="workshopLanguage"
    class="mb-4 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5
        text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white
        dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
    bind:value={workshopLanguage}
    onchange={() => translations.setLanguage(workshopLanguage)}
  >
    {#each translations.getAvailableLanguages() as key}
      <option value={key}>{allLanguages[key]}</option>
    {/each}
  </select>
</form>

  <p class="mt-4 mb-4 dark:text-white">
    {$translations.intro}
  </p>

  <label for="responseURL" class="mt-6 block text-sm font-medium text-gray-900 dark:text-white">{$translations.responseURL}:</label>
  <output id="responseURL">
    {#if responseURL}
      <a href={responseURL} target="_blank" class="font-medium text-blue-600 underline hover:no-underline dark:text-blue-500">{responseURL}</a>
    {/if}
  </output>

  <form class="mb-4 w-3/12">
    <label for="rootServerURL" class="mt-6 block text-sm font-medium text-gray-900 dark:text-white">Root server URL:</label>
    <input
      type="url"
      id="rootServerURL"
      class="block w-full rounded-lg border border-gray-300 bg-gray-50
    p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700
    dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
      placeholder={$translations.urlPlaceholder}
      required
      bind:value={rootServerURL}
    />
    <Button
      disabled={savedRootServerURL === rootServerURL}
      on:click={updateRootServerURL}
      class="bg-blue-400! block rounded-lg border border-gray-300 p-2.5
    text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700
    dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
    >
    {$translations.updateURL}
    </Button>
    <Helper>
      {#if serverError}
        <div class="text-red-500">{serverError}</div>
      {/if}
    </Helper>

    <label for="operation" class="mt-6 block text-sm font-medium text-gray-900 dark:text-white">{$translations.operation}:</label>
    <select
      id="operation"
      class="mb-4 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5
        text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white
        dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
      bind:value={operation}
    >
      <option value="GetServiceBodies">{$translations.getServiceBodies}</option>
      <option value="GetSearchResults">{$translations.getSearchResults}</option>
      <option value="GetFormats">{$translations.getFormats}</option>
      <option value="GetChanges">{$translations.getChanges}</option>
      <option value="GetFieldKeys">{$translations.getFieldKeys}</option>
      <option value="GetFieldValues">{$translations.getFieldValues}</option>
      <option value="GetNAWSDump">{$translations.getNAWSDump}</option>
      <option value="GetServerInfo">{$translations.getServerInfo}</option>
      <option value="GetCoverageArea">{$translations.getCoverageArea}</option>
    </select>

    {#if operation === 'GetSearchResults'}
    <div class="dark:text-white">todo: not finished</div>
    {:else if operation === 'GetFormats'}
      <label for="formatLanguage" class="mt-6 block text-sm font-medium text-gray-900 dark:text-white">{$translations.formatLanguage}:</label>
      <select
        id="formatLanguage"
        class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm
          text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400
          dark:focus:border-blue-500 dark:focus:ring-blue-500"
        bind:value={formatLanguage}
      >
        <option value="">{$translations.serverLanguage}</option>
        {#each langs as string[] as key}
          <option value={key}>{allLanguages[key]}</option>
        {/each}
      </select>
      <label>
        <input type="checkbox" bind:checked={showAllFormats} />
        <div class="dark:text-white">{$translations.showAllFormats}</div>
      </label>
    {:else if operation === 'GetChanges'}
      <label for="changesDates" class="mt-6 block text-sm font-medium text-gray-900 dark:text-white">{$translations.getChangesBetween}:</label>
      <Datepicker range bind:rangeFrom={changesFrom} bind:rangeTo={changesTo} />
      <label for="changesMeetingId" class="mt-6 block text-sm font-medium text-gray-900 dark:text-white">{$translations.getChangesForMeeting}:</label>
      <input
        type="text"
        inputmode="numeric"
        id="changesMeetingId"
        class="block w-full rounded-lg border border-gray-300 bg-gray-50
    p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700
    dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
        bind:value={changesMeetingId}
      />
      <label for="changesServiceBodyId" class="mt-6 block text-sm font-medium text-gray-900 dark:text-white">{$translations.serviceBody}:</label>
      <select
        id="changesServiceBodyId"
        class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm
          text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400
          dark:focus:border-blue-500 dark:focus:ring-blue-500"
        bind:value={changesServiceBodyId}
      >
        <option value="">{$translations.noServiceBodySelected}</option>
        {#each serviceBodies as { name: string; id: string }[] as s}
          <option value={s.id}>{s.name}</option>
        {/each}
      </select>
    {:else if operation === 'GetFieldValues'}
      <label for="keyForGetFieldValues" class="mt-6 block text-sm font-medium text-gray-900 dark:text-white">{$translations.field}:</label>
      <select
        id="keyForGetFieldValues"
        class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm
        text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400
        dark:focus:border-blue-500 dark:focus:ring-blue-500"
        bind:value={keyForGetFieldValues}
      >
        {#each availableFields as { key: string; description: string }[] as f}
          <option value={f.key}>{f.description}</option>
        {/each}
      </select>
    {:else if operation === 'GetNAWSDump'}
      <label for="nawsDumpServiceBodyId" class="mt-6 block text-sm font-medium text-gray-900 dark:text-white">{$translations.serviceBody}:</label>
      <select
        id="nawsDumpServiceBodyId"
        class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm
          text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400
          dark:focus:border-blue-500 dark:focus:ring-blue-500"
        bind:value={nawsDumpServiceBodyId}
      >
        {#each serviceBodies as { name: string; id: string }[] as s}
          <option value={s.id}>{s.name}</option>
        {/each}
      </select>
    {:else if operation === 'GetCoverageArea'}
    <div class="dark:text-white">todo: not finished (also need to show map)</div>
    {/if}
    <!-- no parameters for GetServiceBodies, GetFieldKeys, GetServerInfo, or GetCoverageArea -->
  </form>
</main>
