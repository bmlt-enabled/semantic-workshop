<script lang="ts">
  import { Label, Select } from 'flowbite-svelte';
  import { onMount } from 'svelte';
  import { translations } from '../stores/localization';

  let { availableFields, parameters = $bindable() } = $props();
  let keyForGetFieldValues: string | undefined = $state();

  function computeParameters() {
    parameters = keyForGetFieldValues ? '&meeting_key=' + keyForGetFieldValues : null;
  }

  const fieldOptions: { name: string, value: string }[] = availableFields.map( (f: { key: string, description: string }) => ({ name: f.description, value: f.key }));
  onMount(() => parameters = null);
</script>

<Label>
  {$translations.field}:
  <Select class="mt-2" items={fieldOptions} placeholder={$translations.chooseOption} bind:value={keyForGetFieldValues} onchange={computeParameters} />
</Label>
