<script setup lang="ts">
import { useAppCrudStore } from '../store/AppCrudStore';
const appCrudStore = useAppCrudStore()
const isDeleteModalOpen = computed({
    get: () => appCrudStore.isDeleteModalOpen,
    set: (value) => appCrudStore.isDeleteModalOpen = value
})

const isLoading = ref(false)

const deleteItem = async () => {
    try {
        isLoading.value = true
        if (appCrudStore.modelService?.delete)
            await appCrudStore.modelService.delete(appCrudStore.item)
        else
            throw new Error("No delete service provided")
    } catch (e) {
        console.error(e);
    } finally {
        isLoading.value = false
        isDeleteModalOpen.value = false;
    }
}
</script>
<template>
    <AppDialog size="lg" title="تأكيد الحذف" v-model="isDeleteModalOpen" :loading="isLoading" color="none">
        <div>
          <img src="~/assets/images/trash.gif" class="h-[200px] mx-auto"/>
        </div>
        <template #actions>
            <BaseButton @click="deleteItem" color="danger">
                <Icon name="ph:trash" />
                حذف
            </BaseButton>
        </template>
    </AppDialog>
</template>
