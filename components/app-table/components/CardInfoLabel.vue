<script lang="ts" setup>
interface Props {
  icon?: string
  label?: string
  value?: any
}
defineProps<Props>()
const slots = useSlots()
const hasSlot = (name: string) => !!slots[name]
defineSlots<{
  'default':()=>void
}>()
</script>
<template>
  <div class="flex flex-col gap-4">
    <div class="flex gap-3 justify-center items-center">
      <Icon :name="icon ?? 'ph:info'" class="rounded-lg bg-primary-500/5 border-1 border-primary-500 text-primary-500"/>
      <p class="text-muted font-bold text-sm">
        {{ label }}
      </p>
    </div>
    <p v-if="!hasSlot('default')">
      {{ value }}
    </p>
    <slot v-else/>
  </div>
</template>
