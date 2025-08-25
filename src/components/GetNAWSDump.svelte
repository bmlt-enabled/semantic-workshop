<script lang="ts">
  import { Card, Helper, Label, Select } from 'flowbite-svelte';
  import { onMount } from 'svelte';
  import { translations } from '../stores/localization';

  interface Props {
    serviceBodies: { name: string; id: string; parent_id: string }[];
    parameters: string | null;
  }

  let { serviceBodies, parameters = $bindable() }: Props = $props();
  let nawsDumpServiceBodyId: string | undefined = $state();
  const serviceBodyOptions: { name: string; value: string }[] = serviceBodies.map((b: { name: string; id: string }) => ({ name: b.name, value: b.id }));

  // If nawsDumpServiceBodyId is null, no service body has been selected and so we should not have a response URL yet.
  // Set parameters to null in computeParameters and onMount to indicate this.
  function computeParameters() {
    parameters = nawsDumpServiceBodyId ? '&sb_id=' + nawsDumpServiceBodyId : null;
  }

  onMount(() => (parameters = null));
</script>

<div class="flex justify-center">
  <Card class="border-gray-500 p-4 dark:border-gray-400" size="md">
    <div class="space-y-6">
      <div class="space-y-2">
        <Label class="font-medium text-gray-700 dark:text-gray-300">
          <div class="mb-2">
            {$translations.serviceBody}:
          </div>
          <Select class="w-full" items={serviceBodyOptions} placeholder={$translations.chooseOption} bind:value={nawsDumpServiceBodyId} onchange={computeParameters} />
        </Label>
        <Helper class="text-gray-500 dark:text-gray-400">
          {$translations.selectServiceBodyForNAWS}
        </Helper>
      </div>
    </div>
  </Card>
</div>
