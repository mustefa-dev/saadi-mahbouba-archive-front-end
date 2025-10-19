<script lang="ts" setup>
import type { TableHeader } from '../types';

interface Props {
  headers: TableHeader[]
}
const props = defineProps<Props>()
const headers = computed(() => props.headers)
const slots = useSlots()
const hasSlot = (name: string) => !!slots[name]
</script>
<template>
  <tr>
    <th v-for="header in headers" :key="header.key" uppercase spaced :class="`${header.center?'text-center':'text-right'}`">
      <span v-if="!hasSlot(`header-${header.key}`)" :id="`header-${header.key}`">
        {{ header.label }}
      </span>
      <slot v-else :name="`header-${header.key}`" />
    </th>
  </tr>
</template>
