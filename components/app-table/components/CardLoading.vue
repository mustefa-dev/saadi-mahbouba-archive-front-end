<script setup lang="ts">

interface Props {
  cards: number,
  items: number,
}
const props = defineProps<Props>()
</script>
<template>
  <BaseCard v-for="_ in props.cards" class="space-y-3 p-5" rounded="md">
    <template v-for="_ in props.items">
      <BasePlaceload class="w-3/5 rounded h-4"/>
      <BasePlaceload class="w-full rounded h-4"/>
    </template>
  </BaseCard>
</template>
<style>
</style>
