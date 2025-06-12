<script lang="ts">
  import './app.css';
  import { Button, Heading, Helper, Label, P, Select } from 'flowbite-svelte';
  import { onMount } from 'svelte';

  import DarkMode from './components/DarkMode.svelte';
  import { translations } from './stores/localization';
  import GetMeetingSearchResults from './components/GetMeetingSearchResults.svelte';
  import GetFormats from './components/GetFormats.svelte';
  import GetChanges from './components/GetChanges.svelte';
  import GetFieldValues from './components/GetFieldValues.svelte';
  import GetNAWSDump from './components/GetNAWSDump.svelte';
  import GetOther from './components/GetOther.svelte';
  import Settings from './components/Settings.svelte';

  let showSettingsModal = $state(false);

  interface Server {
    id: string;
    name: string;
    rootURL: string;
  }

  let servers = $state<Server[]>([]);
  let selectedServer = $state<Server | undefined>(undefined);
  let isLoadingServers = $state(false);
  let showCustomServerInput = $state(false);

  // Get apiBaseUrl from query params or window.settings
  const urlParams = new URLSearchParams(window.location.search);
  const queryApiBaseUrl = urlParams.get('apiBaseUrl');
  const apiBaseUrl = queryApiBaseUrl || (typeof settings !== 'undefined' && settings.apiBaseUrl);

  const defaultRootServerURL = apiBaseUrl || 'https://bmlt.wszf.org/main_server/';
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

  function detectBrowserLanguage() {
    const browserLang = navigator.languages ? navigator.languages[0] : navigator.language;
    const shortLang = browserLang.slice(0, 2);
    const supported = allLanguages.map((l) => l.value);
    return supported.includes(shortLang) ? shortLang : 'en';
  }

  const initialLang = localStorage.getItem('workshopLanguage') || detectBrowserLanguage();
  let workshopLanguage = $state(initialLang);
  let rootServerURL: string = $state(defaultRootServerURL);
  let serverError: string = $state('');
  let customURL: string = $state('');
  let operation: string = $state('');
  let serverInfo: { langs: string }[] | undefined = $state();
  let serviceBodies: { name: string; id: string; parent_id: string }[] = $state([]);
  let availableFields: { key: string; description: string }[] = $state([]);
  let serverLangs: string[] = $state([]);
  let formats: { key_string: string; id: string }[] = $state([]);

  // state for response URL.  parameters === null implies that there isn't a valid response URL due to a missing parameter,
  // server error, or whatever.  parameters === '' is ok and just means there aren't any parameters for that operation.
  let parameters: string | null = $state('');
  let responseURL: string = $derived(
    rootServerURL === '' || serverError ? '' : rootServerURL + (operation ? `client_interface/${operation === 'GetNAWSDump' ? 'csv' : 'json'}/?switcher=` + operation + (parameters || '') : '')
  );

  async function updateRootServerURL(url: string) {
    const s = url.trim();
    // rootServerURL should always end in a '/', unless it's the empty string
    rootServerURL = s === '' || s.endsWith('/') ? s : s + '/';
    // Reset 'operation' when the root server URL changes.  There will also be state for the different operations, but since these are
    // in separate components that state gets reset when the component is rendered again.
    operation = rootServerURL ? 'GetServerInfo' : '';
    await getAllData();
  }

  async function getData(operation: string) {
    const response = await fetch(rootServerURL + 'client_interface/json/?switcher=' + operation);
    if (!response.ok) {
      throw new Error('server response said not OK');
    }
    return response.json();
  }

  // Get data from the server that will be needed for building some of the queries.  Just get it all for now - later we
  // could only get the data if it's needed for a particular operation.
  async function getAllData() {
    serverError = '';
    if (rootServerURL === '') {
      serverInfo = undefined;
      serverLangs = [];
      serviceBodies = [];
      availableFields = [];
    } else {
      try {
        serverInfo = await getData('GetServerInfo');
        serverLangs = serverInfo ? serverInfo[0].langs.split(',') : [];
        serviceBodies = await getData('GetServiceBodies');
        serviceBodies.sort((a, b) => a.name.localeCompare(b.name));
        availableFields = await getData('GetFieldKeys');
        availableFields.sort((a, b) => a.description.localeCompare(b.description));
        formats = await getData('GetFormats');
        formats.sort((a, b) => a.key_string.localeCompare(b.key_string));
      } catch (error) {
        serverError = $translations.serverError + ' -- ' + error;
        serverInfo = undefined;
        serverLangs = [];
        serviceBodies = [];
        availableFields = [];
        formats = [];
      }
    }
  }

  async function initialize() {
    translations.setLanguage(workshopLanguage);

    if (apiBaseUrl) {
      rootServerURL = apiBaseUrl;
      operation = 'GetServerInfo';
      await getAllData();
      return;
    }

    isLoadingServers = true;
    try {
      const response = await fetch('https://raw.githubusercontent.com/bmlt-enabled/tomato/refs/heads/master/rootServerList.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      servers = await response.json();
      servers.sort((a, b) => a.name.localeCompare(b.name));
      // Set initial server if defaultRootServerURL matches any server
      selectedServer = servers.find((s) => s.rootURL === defaultRootServerURL);
      if (selectedServer) {
        rootServerURL = selectedServer.rootURL;
        operation = 'GetServerInfo';
        await getAllData();
      }
    } catch (error) {
      console.error('Failed to fetch server list -- ' + error);
      serverError = $translations.failedToFetchServerList + ' ' + error;
    } finally {
      isLoadingServers = false;
    }
  }

  function handleServerSelect(event: Event) {
    const select = event.target as HTMLSelectElement;
    if (select.value === 'other') {
      showCustomServerInput = true;
      rootServerURL = '';
      customURL = '';
      operation = '';
      selectedServer = undefined;
    } else {
      showCustomServerInput = false;
      const server = servers.find((s) => s.id === select.value);
      updateRootServerURL(server ? server.rootURL : '');
    }
  }

  onMount(initialize);

  $effect(() => {
    localStorage.setItem('workshopLanguage', workshopLanguage);
    translations.setLanguage(workshopLanguage);
  });
</script>

<main class="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8 dark:bg-gray-900">
  <div class="mx-auto max-w-4xl space-y-8">
    <div class="flex items-center justify-between">
      <Heading class="text-3xl font-bold text-gray-900 dark:text-white">{$translations.title}</Heading>
      <div class="flex items-center gap-4">
        <button
          type="button"
          class="inline-flex items-center justify-center rounded-lg p-2.5 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:ring-4 focus:ring-gray-200 focus:outline-none dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700"
          onclick={() => (showSettingsModal = true)}
          title="Language Settings"
          aria-label="Open language settings"
        >
          <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.2" />
            <ellipse cx="12" cy="12" rx="10" ry="4" stroke="currentColor" stroke-width="1.2" fill="none" />
            <ellipse cx="12" cy="12" rx="4" ry="10" stroke="currentColor" stroke-width="1.2" fill="none" />
          </svg>
        </button>
        <DarkMode size="lg" class="inline-block transition-colors duration-200 hover:text-gray-900 dark:hover:text-white" />
      </div>
    </div>

    <Settings bind:showModal={showSettingsModal} bind:workshopLanguage {allLanguages} />

    <div class="rounded-lg bg-white shadow-sm dark:bg-gray-800">
      <!-- Fixed Response URL Section -->
      <div class="sticky top-0 z-20 border-b border-gray-500 bg-white p-6 shadow dark:border-gray-400 dark:bg-gray-800">
        <div class="space-y-2">
          <Label for="responseURL" class="font-medium text-gray-700 dark:text-gray-300">{$translations.responseURL}:</Label>
          <output id="responseURL" class="block">
            {#if responseURL && parameters !== null}
              <a href={responseURL} target="_blank" class="break-all text-blue-600 transition-colors duration-200 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                {responseURL}
              </a>
            {:else}
              <div class="text-gray-500 dark:text-gray-400">{$translations.none}</div>
            {/if}
          </output>
        </div>

        {#if operation === 'GetSearchResults' && parameters}
          <div class="mt-4 space-y-2">
            <Label for="clientQuery" class="font-medium text-gray-700 dark:text-gray-300">{$translations.clientQuery}:</Label>
            <output id="clientQuery" class="block">
              <button
                type="button"
                class="w-full cursor-pointer text-left break-all text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                onclick={() => parameters && navigator.clipboard.writeText(parameters)}
                title="Click to copy to clipboard"
              >
                {parameters}
              </button>
            </output>
          </div>
        {/if}
      </div>

      <!-- Scrollable Options Section -->
      <div class="p-6">
        <P class="mb-4 dark:text-white">{$translations.intro}</P>

        <div class="space-y-4">
          {#if !apiBaseUrl}
            <div class="space-y-2">
              <Label for="rootServerURL" class="font-medium text-gray-700 dark:text-gray-300">{$translations.rootServerURL}:</Label>
              <div class="flex gap-2">
                {#if isLoadingServers}
                  <div class="flex-1 p-2 text-gray-500 dark:text-gray-400">{$translations.loadingServers}</div>
                {:else}
                  <Select
                    id="rootServerURL"
                    class="flex-1"
                    items={[...servers.map((s) => ({ value: s.id, name: s.name })), { value: 'other', name: $translations.other }]}
                    value={selectedServer?.id || (showCustomServerInput ? 'other' : '')}
                    onchange={handleServerSelect}
                  />
                {/if}
              </div>
              {#if showCustomServerInput}
                <input
                  type="text"
                  class="mt-2 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                  placeholder={$translations.urlPlaceholder}
                  bind:value={customURL}
                />
                <Button onclick={() => updateRootServerURL(customURL)}>{$translations.updateURL}</Button>
              {/if}
              {#if serverError}
                <Helper class="text-red-500 dark:text-red-400">{serverError}</Helper>
              {/if}
            </div>
          {/if}

          <div class="space-y-2">
            <Label for="operation" class="font-medium text-gray-700 dark:text-gray-300">
              {$translations.operation}:
            </Label>
            <Select id="operation" class="w-full" items={operationOptions} disabled={rootServerURL === '' || serverError !== ''} bind:value={operation} />
          </div>
        </div>

        {#if operation}
          <div class="mt-6 border-t border-gray-500 pt-6 dark:border-gray-400">
            <div class="w-full">
              {#if operation === 'GetSearchResults'}
                <GetMeetingSearchResults {availableFields} {formats} {serviceBodies} {rootServerURL} bind:parameters />
              {:else if operation === 'GetFormats'}
                <GetFormats {serverLangs} {allLanguages} bind:parameters />
              {:else if operation === 'GetChanges'}
                <GetChanges {serviceBodies} bind:parameters />
              {:else if operation === 'GetFieldValues'}
                <GetFieldValues {availableFields} bind:parameters />
              {:else if operation === 'GetNAWSDump'}
                <GetNAWSDump {serviceBodies} bind:parameters />
              {:else if ['GetServiceBodies', 'GetFieldKeys', 'GetServerInfo', 'GetCoverageArea'].includes(operation)}
                <GetOther bind:parameters />
              {/if}
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
</main>
