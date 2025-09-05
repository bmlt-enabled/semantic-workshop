<script lang="ts">
  import { Card, Checkbox, Label } from 'flowbite-svelte';
  import { onMount } from 'svelte';
  import ServiceBodiesTree from './ServiceBodiesTree.svelte';
  import { translations } from '../stores/localization';

  interface Props {
    serviceBodies: { name: string; id: string; parent_id: string }[];
    parameters: string | null;
  }

  let { serviceBodies, parameters = $bindable() }: Props = $props();
  let selectedServiceBodies: string[] = $state([]);
  let rejectedServiceBodies: string[] = $state([]);
  let recursiveServiceBodies: boolean = $state(false);
  let includeParents: boolean = $state(false);

  function computeParameters() {
    const selectedServiceBodiesKey = selectedServiceBodies.length > 1 ? '&services[]=' : '&services=';
    const selectedServiceBodiesPart = selectedServiceBodies.map((s) => selectedServiceBodiesKey + s).join('');
    const rejectedServiceBodiesKey = rejectedServiceBodies.length > 1 ? '&services[]=-' : '&services=-';
    const rejectedServiceBodiesPart = rejectedServiceBodies.map((s) => rejectedServiceBodiesKey + s).join('');
    const recursiveServiceBodiesPart = recursiveServiceBodies && (selectedServiceBodies.length > 0 || rejectedServiceBodies.length > 0) ? '&recursive=1' : '';
    const includeParentsPart = includeParents && (selectedServiceBodies.length > 0 || rejectedServiceBodies.length > 0) ? '&parents=1' : '';

    parameters = selectedServiceBodiesPart + rejectedServiceBodiesPart + recursiveServiceBodiesPart + includeParentsPart;
  }

  onMount(() => (parameters = ''));
</script>

<div class="flex justify-center">
  <Card class="border-gray-500 p-4 dark:border-gray-400" size="lg">
    <div class="space-y-6">
      <fieldset class="rounded-lg border border-gray-500 bg-gray-50 p-6 shadow-sm dark:border-gray-400 dark:bg-gray-800">
        <legend class="text-lg font-semibold text-gray-900 dark:text-white">{$translations.getServiceBodiesInclude}</legend>
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        <div class="mb-2 text-sm font-semibold text-gray-900 dark:text-white">{@html $translations.getServiceBodiesIncludeExplanation}</div>
        <ServiceBodiesTree {serviceBodies} onchange={computeParameters} bind:selectedValues={selectedServiceBodies} />
      </fieldset>

      <fieldset class="rounded-lg border border-gray-500 bg-gray-50 p-6 shadow-sm dark:border-gray-400 dark:bg-gray-800">
        <legend class="text-lg font-semibold text-gray-900 dark:text-white">{$translations.getServiceBodiesExclude}</legend>
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        <div class="mb-2 text-sm font-semibold text-gray-900 dark:text-white">{@html $translations.getServiceBodiesExcludeExplanation}</div>
        <ServiceBodiesTree {serviceBodies} onchange={computeParameters} bind:selectedValues={rejectedServiceBodies} />
      </fieldset>

      <fieldset class="rounded-lg border border-gray-500 bg-white p-6 shadow-sm dark:border-gray-400 dark:bg-gray-800">
        <legend class="text-lg font-semibold text-gray-900 dark:text-white">{$translations.serviceBodyOptions}</legend>
        <div class="text-sm font-semibold text-gray-900 dark:text-white">{$translations.serviceBodyOptionsExplanation}</div>
        <div class="space-y-2">
          <div class="flex items-center space-x-2">
            <Label class="mt-4 flex items-center font-medium dark:text-white">
              <Checkbox bind:checked={recursiveServiceBodies} onchange={computeParameters} disabled={selectedServiceBodies.length === 0 && rejectedServiceBodies.length === 0} class="me-1" />
              {$translations.includeChildServiceBodies}
            </Label>
          </div>
          <div class="flex items-center space-x-2">
            <Label class="mt-4 flex items-center font-medium dark:text-white">
              <Checkbox bind:checked={includeParents} onchange={computeParameters} disabled={selectedServiceBodies.length === 0 && rejectedServiceBodies.length === 0} class="me-1" />
              {$translations.includeParentServiceBodies}
            </Label>
          </div>
        </div>
      </fieldset>
    </div>
  </Card>
</div>
