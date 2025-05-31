<script lang="ts">
  import { Card, Checkbox, Label, P, Select } from 'flowbite-svelte';
  import { onMount } from 'svelte';
  import { translations } from '../stores/localization';

  interface Props {
    parameters: string | null;
  }

  let { parameters = $bindable() }: Props = $props();
  onMount(() => (parameters = ''));
</script>

<div class="flex justify-center">
  <Card class="border-gray-500 p-4 dark:border-gray-400" size="md">
    <div class="space-y-6">
      <div class="space-y-2">
        <P class="text-center dark:text-white">{$translations.noParameters}</P>
      </div>
    </div>
  </Card>
</div>
