<script lang="ts">
  let count: number = $state(0);
  const increment = () => {
    count += 1;
  };
</script>

<div class="max-w-sm rounded overflow-hidden shadow-lg">
  <div class="px-6 py-4">
    <div class="font-bold text-xl mb-2">The Baddest Poet</div>
    <p class="text-gray-700 text-base">
      <button onclick={increment} class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        count is {count}
      </button>
    </p>
  </div>
  <div class="px-6 pt-4 pb-2">
    <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">#need</span>
    <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">#one</span>
    <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">#mic</span>
  </div>
</div>
