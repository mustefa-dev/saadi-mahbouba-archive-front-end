<script setup lang="ts" generic="T">
import { useAppCrudStore } from '../store/AppCrudStore';

interface Props {
  item: T
  hideDelete?: boolean
  hideUpdate?: boolean
  hideRestore?: boolean
}
const props = defineProps<Props>()
const item = computed(() => props.item)
const appCrudStore = useAppCrudStore()
const onEdit = (currentItem: T) => {
  appCrudStore.modelService?.editButtonAction(JSON.parse(JSON.stringify(currentItem)));
}
const onDelete = (currentItem: T) => {
  appCrudStore.setItem(currentItem)
  appCrudStore.isDeleteModalOpen = true
}
const onRestore = (currentItem: T) => {
  appCrudStore.setItem(currentItem)
  appCrudStore.isRestoreModalOpen = true
}
const isDeleted = computed<boolean>(()=>{
  return !props.hideRestore && useRoute().query.isDeleted=='true';
})
</script>
<template>
  <div class="items-center flex gap-2 justify-center">
    <BaseButton v-if="!hideUpdate && !isDeleted" variant="pastel" class="size-9" color="primary" rounded="full"
      @click="onEdit(item as T)">
      <span class=" flex size-9 items-center justify-center rounded-full">
        <Icon name="ph:pen" class="text-primary-500 size-5" />
      </span>
    </BaseButton>
    <BaseButton v-if="!hideDelete && !isDeleted" variant="pastel" class="size-9" color="danger" rounded="full"
      @click="onDelete(item as T)">
      <span class="flex size-9 items-center justify-center rounded-full">
        <Icon name="ph:trash" class="text-danger-400 size-5" />
      </span>
    </BaseButton>
    <BaseButton v-if="isDeleted" variant="pastel" class="size-9" color="info" rounded="full"
      @click="onRestore(item as T)">
      <span class="flex size-9 items-center justify-center rounded-full">
        <Icon name="ph:recycle-bold" class="text-info-400 size-5" />
      </span>
    </BaseButton>
    <slot/>
  </div>
</template>
