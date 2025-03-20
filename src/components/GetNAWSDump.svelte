<script lang="ts">
  import { Checkbox, Label, Select } from 'flowbite-svelte';
  import { onMount } from 'svelte';
  import { translations } from '../stores/localization';

  let { serviceBodies, parameters = $bindable() } = $props();
  let nawsDumpServiceBodyId: string | undefined = $state();

  function computeParameters() {
    parameters = nawsDumpServiceBodyId ? '&sb_id=' + nawsDumpServiceBodyId : null;
  }

  const serviceBodyOptions: { name: string, value: string }[] = serviceBodies.map( (b: { name: string, id: string }) => ({ name: b.name, value: b.id }));
  onMount(() => parameters = null);
</script>

<Label>
  {$translations.serviceBody}:
  <Select class="mt-2" items={serviceBodyOptions} placeholder={$translations.chooseOption}
    bind:value={nawsDumpServiceBodyId} onchange={computeParameters} />
</Label>
