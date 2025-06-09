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
  let error: string | null = $state(null);

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
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(processedData);
      XLSX.utils.book_append_sheet(wb, ws, 'Data');
      const csvString = XLSX.write(wb, { bookType: 'csv', type: 'string' });
      const blob = new Blob([csvString], { type: 'text/csv' });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'bmlt_data.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Error during download:', err);
      error = err instanceof Error ? err.message : 'An error occurred';
    } finally {
      isLoading = false;
    }
  }
</script>

<Button color="blue" size="xs" disabled={isLoading} onclick={() => downloadCSV()}>
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
