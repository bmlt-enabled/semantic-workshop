<script lang="ts">
  import './app.css';
  import { Heading, Helper, Label, P, Select } from 'flowbite-svelte';
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
  import Settings from './components/Settings.svelte';

  let showSettingsModal = $state(false);

  interface Server {
    id: string;
    name: string;
    rootURL: string;
  }

  let servers = $state<Server[]>([]);
  let selectedServer = $state<Server | undefined>(undefined);
  let isLoadingServers = $state(true);
  let showCustomServerInput = $state(false);

  // Get apiBaseUrl from query params or window.settings
  const urlParams = new URLSearchParams(window.location.search);
  const queryApiBaseUrl = urlParams.get('apiBaseUrl');
  const settings = {
    apiBaseUrl: queryApiBaseUrl || (typeof window.settings !== 'undefined' ? window.settings.apiBaseUrl : undefined)
  };

  // defaultRootServerURL can also be '' (that works)
  const defaultRootServerURL = settings.apiBaseUrl || 'https://bmlt.wszf.org/main_server/';
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
  let formats: { key_string: string; id: string }[] | undefined = $state();

  // state for response URL.  parameters === null implies that there isn't a valid response URL due to a missing parameter,
  // server error, or whatever.
  let parameters: string | null = $state('');
  let responseURL = $derived(savedRootServerURL === '' || serverError ? '' : savedRootServerURL + (operation ? 'client_interface/json/?switcher=' + operation + (parameters || '') : ''));

  async function updateRootServerURL() {
    const s = rootServerURL.trim();
    savedRootServerURL = s + (s === '' || s.endsWith('/') ? '' : '/');
    // reset state that won't be updated by getData();
    // this will be 'operation' itself, and also state for a particular operation
    operation = savedRootServerURL ? 'GetServerInfo' : '';
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

    if (typeof settings !== 'undefined' && settings.apiBaseUrl) {
      rootServerURL = settings.apiBaseUrl;
      savedRootServerURL = settings.apiBaseUrl;
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
        savedRootServerURL = selectedServer.rootURL;
        operation = 'GetServerInfo';
      }
    } catch (error) {
      console.error('Failed to fetch server list:', error);
      serverError = 'Failed to load server list. Please try again later.';
    } finally {
      isLoadingServers = false;
    }
    await getAllData();
  }

  function handleServerSelect(event: Event) {
    const select = event.target as HTMLSelectElement;
    if (select.value === 'other') {
      showCustomServerInput = true;
      selectedServer = undefined;
      return;
    }
    showCustomServerInput = false;
    const server = servers.find((s) => s.id === select.value);
    if (server) {
      rootServerURL = server.rootURL;
      savedRootServerURL = server.rootURL;
      updateRootServerURL();
    }
  }

  function handleCustomServerInput() {
    if (rootServerURL.trim()) {
      updateRootServerURL();
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
      <div class="border-b border-gray-200 p-6 dark:border-gray-700 sticky top-0 z-20 bg-white dark:bg-gray-800 shadow">
        <div class="space-y-2">
          <Label for="responseURL" class="font-medium text-gray-700 dark:text-gray-300">{$translations.responseURL}:</Label>
          <output id="responseURL" class="block">
            {#if responseURL}
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
            <Label for="clientQuery" class="font-medium text-gray-700 dark:text-gray-300">Client Query:</Label>
            <output id="clientQuery" class="block">
              <button
                type="button"
                class="w-full text-left break-all text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer"
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
        <P class="dark:text-white mb-4">{$translations.intro}</P>

        <div class="space-y-4">
          {#if !(typeof settings !== 'undefined' && settings.apiBaseUrl)}
            <div class="space-y-2">
              <Label for="rootServerURL" class="font-medium text-gray-700 dark:text-gray-300">{$translations.rootServerURL}:</Label>
              <div class="flex gap-2">
                {#if isLoadingServers}
                  <div class="flex-1 p-2 text-gray-500 dark:text-gray-400">Loading servers...</div>
                {:else}
                  <Select
                    id="rootServerURL"
                    class="flex-1"
                    items={[...servers.map((s) => ({ value: s.id, name: s.name })), { value: 'other', name: 'Other...' }]}
                    value={selectedServer?.id || (showCustomServerInput ? 'other' : '')}
                    on:change={handleServerSelect}
                  />
                {/if}
              </div>
              {#if showCustomServerInput}
                <div class="mt-2">
                  <input
                    type="text"
                    class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                    placeholder="Enter server URL"
                    bind:value={rootServerURL}
                    onblur={handleCustomServerInput}
                  />
                </div>
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
            <Select id="operation" class="w-full" items={operationOptions} disabled={serverError !== ''} bind:value={operation} />
          </div>
        </div>

        {#if operation}
          <div class="mt-6 border-t border-gray-200 pt-6 dark:border-gray-700">
            <div class="w-full">
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
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
</main>
