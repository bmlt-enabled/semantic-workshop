<script lang="ts">
  import { Datepicker, Helper, Input, Label, Select } from 'flowbite-svelte';
  import { onMount } from 'svelte';
  import { translations } from '../stores/localization';

  let { serviceBodies, parameters = $bindable() } = $props();
  let changesFrom: Date | undefined = $state();
  let changesTo: Date | undefined = $state();
  let changesMeetingId: string = $state('');
  let badChangesMeetingId: boolean = $state(false);
  let changesServiceBodyId: string = $state('all');

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

  const bodies: { name: string; value: string }[] = serviceBodies.map((b: { name: string; id: string }) => ({ name: b.name, value: b.id }));
  const serviceBodyOptions = [{ value: 'all', name: $translations.allServiceBodies }].concat(bodies);
  onMount(() => (parameters = ''));
</script>

<div>
  <Label>
    {$translations.getChangesBetween}:
    <Datepicker range bind:rangeFrom={changesFrom} bind:rangeTo={changesTo} on:select={computeParameters} />
  </Label>
  <Label>
    {$translations.getChangesForMeeting}:
    <Input type="text" bind:value={changesMeetingId} on:input={computeParameters} />
    {#if badChangesMeetingId}
      <div class="text-red-500">{$translations.invalidMeetingId}</div>
    {/if}
  </Label>
  <Label>
    {$translations.serviceBody}:
    <Select class="mt-2" items={serviceBodyOptions} placeholder={$translations.chooseOption} bind:value={changesServiceBodyId} onchange={computeParameters} />
  </Label>
</div>
