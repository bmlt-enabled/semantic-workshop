<script lang="ts">
  import { Card, Checkbox, Label, Select } from 'flowbite-svelte';
  import { onMount } from 'svelte';
  import { translations } from '../stores/localization';

  let { availableFields, parameters = $bindable() } = $props();
  let keyForGetFieldValues: string | undefined = $state();
  const fieldOptions: { name: string; value: string }[] = availableFields.map((f: { key: string; description: string }) => ({ name: f.description, value: f.key }));

  // If keyForGetFieldValues is null, no field has been selected and so we should not have a response URL yet.
  // Set parameters to null in computeParameters and onMount to indicate this.
  function computeParameters() {
    parameters = keyForGetFieldValues ? '&meeting_key=' + encodeURIComponent(keyForGetFieldValues) : null;
  }

  onMount(() => (parameters = null));
</script>

<div class="flex justify-center">
  <Card class="p-4" size="md">
    <div class="space-y-6">
      <Label>
        {$translations.field}:
        <Select class="mt-2" items={fieldOptions} placeholder={$translations.chooseOption} bind:value={keyForGetFieldValues} onchange={computeParameters} />
      </Label>
    </div>
  </Card>
</div>
