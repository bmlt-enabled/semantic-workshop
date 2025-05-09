<script lang="ts">
  import { Card, Checkbox, Label, P, Select } from 'flowbite-svelte';
  import { onMount } from 'svelte';
  import { translations } from '../stores/localization';

  let { parameters = $bindable() } = $props();
  onMount(() => (parameters = ''));
</script>

<div class="flex justify-center">
  <Card class="p-4" size="md">
    <div class="space-y-6">
      <div class="space-y-2">
        <P class="text-center dark:text-white">{$translations.noParameters}</P>
      </div>
    </div>
  </Card>
</div>
