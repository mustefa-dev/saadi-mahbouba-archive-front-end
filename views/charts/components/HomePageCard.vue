<script setup lang="ts">
const props = defineProps<{
  title:string
  data:any
  icon:string
  color:string
}>()
</script>
<template>
    <BaseCard class="p-6">
      <div class="flex flex-col gap-3">
        <div class="flex gap-2">
          <BaseAvatar :color="props.color">
            <Icon :name="props.icon"/>
          </BaseAvatar>
          <div class="flex-grow flex flex-col items-center">
          <span class="text-md">{{props.title}}</span>
          <span class="text-xl font-bold">{{props.data}}</span>
          </div>
        </div>
      </div>
    </BaseCard>
</template>
