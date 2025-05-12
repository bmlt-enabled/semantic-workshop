<script lang="ts">
  import { Label, Select } from 'flowbite-svelte';
  import { translations } from '../stores/localization';

  interface Props {
    showModal: boolean;
    workshopLanguage: string;
    allLanguages: { value: string; name: string }[];
  }

  let { showModal = $bindable(), workshopLanguage = $bindable(), allLanguages }: Props = $props();
</script>

{#if showModal}
  <div class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
    <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
      <div class="mb-4 flex items-center justify-between">
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Settings</h3>
        <button
          type="button"
          class="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white"
          onclick={() => (showModal = false)}
          aria-label="Close settings"
        >
          <svg class="h-3 w-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
          </svg>
        </button>
      </div>
      <div class="space-y-4">
        <div>
          <Label for="language" class="mb-2 block text-sm font-medium text-gray-900 dark:text-white">Language</Label>
          <Select id="language" class="w-full" items={allLanguages} bind:value={workshopLanguage} onchange={() => translations.setLanguage(workshopLanguage)} />
        </div>
        <div class="flex justify-end">
          <button
            type="button"
            class="rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 focus:outline-none dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            onclick={() => (showModal = false)}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}
