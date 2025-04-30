<script lang="ts">
  import { A, Button, Heading, Helper, Input, Label, P, Select } from 'flowbite-svelte';
  import { onMount } from 'svelte';

  import DarkMode from './components/DarkMode.svelte';
  import { translations } from './stores/localization';
  import GetMeetingSearchResults from './components/GetMeetingSearchResults.svelte';
  import GetFormats from './components/GetFormats.svelte';
  import GetChanges from './components/GetChanges.svelte';
  import GetFieldValues from './components/GetFieldValues.svelte';
  import GetNAWSDump from './components/GetNAWSDump.svelte';
  import GetCoverageArea from './components/GetCoverageArea.svelte';
  import GetOther from './components/GetOther.svelte';

  // defaultRootServerURL can also be '' (that works)
  const defaultRootServerURL = 'https://bmlt.wszf.org/main_server/';
  const allLanguages = [
    { value: 'de', name: 'Deutsch' },
    { value: 'dk', name: 'Dansk' },
    { value: 'en', name: 'English' },
    { value: 'es', name: 'Español' },
    { value: 'fa', name: 'فارسی' },
    { value: 'fr', name: 'Français' },
    { value: 'it', name: 'Italiano' },
    { value: 'pl', name: 'Polskie' },
    { value: 'pt', name: 'Português' },
    { value: 'sv', name: 'Svenska' }
  ];

  const operationOptions = [
    { name: $translations.getSearchResults, value: 'GetSearchResults' },
    { name: $translations.getFormats, value: 'GetFormats' },
    { name: $translations.getServiceBodies, value: 'GetServiceBodies' },
    { name: $translations.getChanges, value: 'GetChanges' },
    { name: $translations.getFieldKeys, value: 'GetFieldKeys' },
    { name: $translations.getFieldValues, value: 'GetFieldValues' },
    { name: $translations.getNAWSDump, value: 'GetNAWSDump' },
    { name: $translations.getServerInfo, value: 'GetServerInfo' },
    { name: $translations.getCoverageArea, value: 'GetCoverageArea' }
  ];

  let workshopLanguage = $state('en');
  // rootServerUrl is what gets typed in the URL textbox
  let rootServerURL = $state(defaultRootServerURL);
  // the savedRootServerURL will always end in a / (added if necessary to the rootServerURL)
  let savedRootServerURL = $state(defaultRootServerURL);
  let serverError = $state('');
  let operation: string = $state('');
  let serverInfo: { langs: string; nativeLang: string }[] | undefined = $state();
  let serviceBodies: { name: string; id: string }[] | undefined = $state();
  let availableFields: { key: string; description: string }[] | undefined = $state();
  let serverLangs: string[] | undefined = $state();
  let nativeLang: string | undefined = $state();
  let formats: { key_string: string; id: string }[] = $state();

  // state for response URL.  parameters === null implies that there isn't a valid response URL due to a missing parameter,
  // server error, or whatever.
  let parameters: string | null = $state('');
  let responseURL = $derived(
    operation === '' || savedRootServerURL === '' || serverError || parameters === null ? '' : savedRootServerURL + 'client_interface/json/?switcher=' + operation + parameters
  );

  async function updateRootServerURL() {
    const s = rootServerURL.trim();
    savedRootServerURL = s + (s === '' || s.endsWith('/') ? '' : '/');
    // reset state that won't be updated by getData();
    // this will be 'operation' itself, and also state for a particular operation
    operation = '';
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
      serverLangs = undefined;
      nativeLang = undefined;
      serviceBodies = [];
      availableFields = [];
    } else {
      try {
        serverInfo = await getData('GetServerInfo');
        serverLangs = serverInfo?.[0].langs.split(',');
        nativeLang = serverInfo?.[0].nativeLang;
        serviceBodies = await getData('GetServiceBodies');
        serviceBodies?.sort((a, b) => a.name.localeCompare(b.name));
        availableFields = await getData('GetFieldKeys');
        availableFields?.sort((a, b) => a.description.localeCompare(b.description));
        formats = await getData('GetFormats');
        formats?.sort((a, b) => a.key_string.localeCompare(b.key_string));
        serverError = '';
      } catch (error) {
        serverError = $translations.serverError + ' -- ' + error;
        serverInfo = undefined;
        serverLangs = undefined;
        nativeLang = undefined;
        serviceBodies = undefined;
        availableFields = undefined;
        formats = undefined;
      }
    }
  }

  async function initialize() {
    translations.setLanguage(workshopLanguage);
    getAllData();
  }

  onMount(initialize);
</script>

<main>
  <Heading>{$translations.title}</Heading>

  <P>{$translations.intro}</P>

  <DarkMode size="lg" class="inline-block hover:text-gray-900 dark:hover:text-white" />

  <Label>
    {$translations.language}:
    <Select class="mt-2" items={allLanguages} placeholder={$translations.chooseOption} bind:value={workshopLanguage} onchange={() => translations.setLanguage(workshopLanguage)} />
  </Label>

  <Label for="responseURL">{$translations.responseURL}:</Label>
  <output id="responseURL">
    {#if responseURL}
      <a href={responseURL} target="_blank" class="font-medium text-blue-600 underline hover:no-underline dark:text-blue-500">{responseURL}</a>
    {:else}
      <div class="dark:text-white">{$translations.none}</div>
    {/if}
  </output>

  <Label for="rootServerURL">{$translations.rootServerURL}:</Label>
  <Input type="url" id="rootServerURL" placeholder={$translations.urlPlaceholder} bind:value={rootServerURL} />
  <Button disabled={savedRootServerURL === rootServerURL} on:click={updateRootServerURL}>{$translations.updateURL}</Button>
  <Helper>
    {#if serverError}
      <div class="text-red-500">{serverError}</div>
    {/if}
  </Helper>

  <Label for="operation" class="mb-2"
    >{$translations.operation}:
    <Select id="operation" class="mt-2" items={operationOptions} disabled={serverError !== ''} bind:value={operation} />
  </Label>

  {#if operation === 'GetSearchResults'}
    <GetMeetingSearchResults {availableFields} {formats} {rootServerURL} bind:parameters />
  {:else if operation === 'GetFormats'}
    <GetFormats {serverLangs} {allLanguages} bind:parameters />
  {:else if operation === 'GetChanges'}
    <GetChanges {serviceBodies} bind:parameters />
  {:else if operation === 'GetFieldValues'}
    <GetFieldValues {availableFields} bind:parameters />
  {:else if operation === 'GetNAWSDump'}
    <GetNAWSDump {serviceBodies} bind:parameters />
  {:else if operation === 'GetCoverageArea'}
    <GetCoverageArea bind:parameters />
  {:else if ['GetServiceBodies', 'GetFieldKeys', 'GetServerInfo', 'GetCoverageArea'].includes(operation)}
    <GetOther bind:parameters />
  {/if}
</main>
