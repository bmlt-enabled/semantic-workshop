<script lang="ts">
  import { Card, Datepicker, Helper, Input, Label, Select } from 'flowbite-svelte';
  import { onMount } from 'svelte';
  import { translations } from '../stores/localization';

  interface Props {
    serviceBodies: { name: string; id: string; parent_id: string }[];
    parameters: string | null;
  }

  let { serviceBodies, parameters = $bindable() }: Props = $props();
  let changesFrom: Date | undefined = $state();
  let changesTo: Date | undefined = $state();
  let changesMeetingId: string = $state('');
  let badChangesMeetingId: boolean = $state(false);
  let changesServiceBodyId: string = $state('all');
  let serviceBodyOptions = $derived([{ value: 'all', name: $translations.allServiceBodies }, ...serviceBodies.map((b: { name: string; id: string }) => ({ name: b.name, value: b.id }))]);

  function computeParameters() {
    badChangesMeetingId = /[^\d]/.test(changesMeetingId);
    if (badChangesMeetingId) {
      parameters = null;
    } else {
      parameters =
        changesDateParam(changesFrom, 'start') +
        changesDateParam(changesTo, 'end') +
        (changesMeetingId ? '&meeting_id=' + changesMeetingId : '') +
        (changesServiceBodyId === 'all' ? '' : '&service_body_id=' + changesServiceBodyId);
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
  onMount(() => (parameters = ''));
</script>

<div class="flex justify-center">
  <Card class="border-gray-500 p-4 dark:border-gray-400" size="md">
    <div class="space-y-6">
      <div class="space-y-2">
        <Label class="font-medium text-gray-700 dark:text-gray-300">
          <div class="mb-2">
            {$translations.getChangesBetween}:
          </div>
          <Datepicker range bind:rangeFrom={changesFrom} bind:rangeTo={changesTo} onselect={computeParameters} />
        </Label>
      </div>

      <div class="space-y-2">
        <Label class="font-medium text-gray-700 dark:text-gray-300">
          <div class="mb-2">
            {$translations.getChangesForMeeting}:
          </div>
          <Input type="text" bind:value={changesMeetingId} onInput={computeParameters} class="w-full" placeholder={$translations.enterMeetingId} />
        </Label>
        {#if badChangesMeetingId}
          <Helper class="text-red-500 dark:text-red-400">
            {$translations.invalidMeetingId}
          </Helper>
        {/if}
      </div>

      <div class="space-y-2">
        <Label class="font-medium text-gray-700 dark:text-gray-300">
          <div class="mb-2">
            {$translations.serviceBody}:
          </div>
          <Select class="w-full" items={serviceBodyOptions} placeholder={$translations.chooseOption} bind:value={changesServiceBodyId} onchange={computeParameters} />
        </Label>
      </div>
    </div>
  </Card>
</div>
