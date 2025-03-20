<script lang="ts">
  import { Datepicker, Input, Label, Select } from 'flowbite-svelte';
  import { onMount } from 'svelte';
  import { translations } from '../stores/localization';

  let { serviceBodies, parameters = $bindable() } = $props();
  let changesFrom: Date | undefined = $state();
  let changesTo: Date | undefined = $state();
  let changesMeetingId: number | undefined = $state();
  let changesServiceBodyId: string = $state('all');

  function computeParameters() {
    parameters = changesDateParam(changesFrom, 'start') +
          changesDateParam(changesTo, 'end') +
          (changesMeetingId ? '&meeting_id=' + changesMeetingId.toString() : '') +
          (changesServiceBodyId === 'all' ? '' : '&service_body_id=' + changesServiceBodyId);
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

  const bodies: { name: string, value: string }[] = serviceBodies.map( (b: { name: string, id: string }) => ({ name: b.name, value: b.id }));
  const serviceBodyOptions = [{value: 'all', name: $translations.allServiceBodies }].concat(bodies);
  onMount(() => parameters = '');
</script>

<div>
  <Label>
    {$translations.getChangesBetween}:
    <Datepicker range bind:rangeFrom={changesFrom} bind:rangeTo={changesTo} on:select={computeParameters} />
  </Label>
  <Label>
    {$translations.getChangesForMeeting}:
    <Input type="text" inputmode="numeric" bind:value={changesMeetingId} onchange={computeParameters} />
  </Label>
  <Label>
    {$translations.serviceBody}:
    <Select class="mt-2" items={serviceBodyOptions} placeholder={$translations.chooseOption} bind:value={changesServiceBodyId} onchange={computeParameters} />
  </Label>
</div>
