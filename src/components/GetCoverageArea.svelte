<script lang="ts">
  import { Card, P } from 'flowbite-svelte';
  import { onMount, onDestroy } from 'svelte';
  import { translations } from '../stores/localization';
  import type { Map as LeafletMap } from 'leaflet';

  interface Props {
    parameters: string | null;
    rootServerURL: string;
  }

  let { parameters = $bindable(), rootServerURL }: Props = $props();

  let mapContainer: HTMLElement | undefined = $state();
  let map: LeafletMap | null = $state(null);
  let coverageData: {
    nw_corner_latitude: number;
    nw_corner_longitude: number;
    se_corner_latitude: number;
    se_corner_longitude: number;
  } | null = $state(null);
  let isLoading = $state(true);
  let error = $state('');

  async function fetchCoverageArea() {
    if (!rootServerURL) return;

    isLoading = true;
    error = '';

    try {
      const response = await fetch(rootServerURL + 'client_interface/json/?switcher=GetCoverageArea');
      if (!response.ok) {
        throw new Error('Failed to fetch coverage area data');
      }
      const data = await response.json();
      if (data && data.length > 0) {
        coverageData = data[0];
        initializeMap();
      } else {
        throw new Error('No coverage area data available');
      }
    } catch (e) {
      error = e instanceof Error ? e.message : 'Unknown error occurred';
      console.error('Error fetching coverage area:', e);
    } finally {
      isLoading = false;
    }
  }

  async function initializeMap() {
    if (!coverageData || !mapContainer) return;

    const L = await import('leaflet');
    await import('leaflet/dist/leaflet.css');

    await new Promise((resolve) => setTimeout(resolve, 100));

    map = L.map(mapContainer, {
      scrollWheelZoom: false,
      zoomControl: true,
      doubleClickZoom: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    map.invalidateSize();

    const bounds = L.latLngBounds([coverageData.se_corner_latitude, coverageData.nw_corner_longitude], [coverageData.nw_corner_latitude, coverageData.se_corner_longitude]);

    map.fitBounds(bounds);

    L.rectangle(bounds, {
      color: '#000000',
      weight: 0,
      fillColor: '#663300',
      fillOpacity: 0.25
    }).addTo(map);
  }

  onMount(() => {
    parameters = '';
    fetchCoverageArea();
  });

  onDestroy(() => {
    if (map) {
      map.remove();
      map = null;
    }
  });

  $effect(() => {
    if (rootServerURL) {
      fetchCoverageArea();
    }
  });
</script>

<div class="flex justify-center">
  <Card class="w-full border-gray-500 p-4 dark:border-gray-400" size="xl">
    <div class="space-y-6">
      <div class="space-y-2">
        <P class="text-center dark:text-white">{$translations.coverageAreaDescription || 'Coverage area for this BMLT server'}</P>
      </div>

      {#if isLoading}
        <div class="flex h-96 items-center justify-center">
          <P class="text-gray-500 dark:text-gray-400">Loading coverage area...</P>
        </div>
      {:else if error}
        <div class="flex h-96 items-center justify-center">
          <P class="text-red-500 dark:text-red-400">{error}</P>
        </div>
      {:else if coverageData}
        <div class="h-96 overflow-hidden rounded-lg">
          <div bind:this={mapContainer} class="h-full w-full"></div>
        </div>
      {/if}
    </div>
  </Card>
</div>

<style>
  :global(.leaflet-container) {
    height: 100%;
    width: 100%;
  }
</style>
