<script lang="ts">
  import { Button } from 'flowbite-svelte';
  import { fetchData, processExportData } from '../utils/DataUtils';
  import * as XLSX from 'xlsx';
  import { translations } from '../stores/localization';

  interface Props {
    responseURL: string;
  }

  let { responseURL }: Props = $props();
  let isLoading = $state(false);
  let error = $state<string | null>(null);

  function generateFilename(): string {
    const now = new Date();
    const switcher = getSwitcherValue(responseURL);
    const pad = (n: number) => String(n).padStart(2, '0');

    return `BMLT_${switcher}_${now.getFullYear()}_${pad(now.getMonth() + 1)}_${pad(now.getDate())}_${pad(now.getHours())}_${pad(now.getMinutes())}_${pad(now.getSeconds())}.csv`;
  }

  function getSwitcherValue(url: string): string | null {
    const urlObj = new URL(url);
    return urlObj.searchParams.get('switcher');
  }

  function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const link = Object.assign(document.createElement('a'), {
      href: url,
      download: filename
    });

    link.click();
    URL.revokeObjectURL(url);
  }

  async function downloadCSV() {
    if (!responseURL) {
      error = 'Invalid URL';
      return;
    }

    isLoading = true;
    error = null;

    try {
      const data = await fetchData(responseURL);
      const processedData = processExportData(data);

      const ws = XLSX.utils.json_to_sheet(processedData);
      const csvString = XLSX.utils.sheet_to_csv(ws);

      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8' });
      downloadBlob(blob, generateFilename());
    } catch (err) {
      console.error('Error during download:', err);
      error = err instanceof Error ? err.message : 'An error occurred';
    } finally {
      isLoading = false;
    }
  }
</script>

{#if responseURL.includes('/json/')}
  <Button color="blue" size="xs" disabled={isLoading} onclick={downloadCSV} class={isLoading ? 'cursor-default' : 'cursor-pointer'}>
    {#if isLoading}
      <svg class="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      {$translations.downloading}
    {:else}
      {$translations.downloadAsCSV}
    {/if}
  </Button>

  {#if error}
    <p class="mt-2 text-sm text-red-600 dark:text-red-500">{error}</p>
  {/if}
{/if}
