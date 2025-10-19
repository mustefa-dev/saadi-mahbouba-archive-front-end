<script setup lang="ts">
import { useAppCrudStore } from '../store/AppCrudStore';

const appCrudStore = useAppCrudStore()

const isRestoreModalOpen = computed({
    get: () => appCrudStore.isRestoreModalOpen,
    set: (value) => appCrudStore.isRestoreModalOpen = value
})

const isLoading = ref(false)

const restoreItem = async () => {
    try {
        isLoading.value = true
        if (appCrudStore.modelService?.restore)
            await appCrudStore.modelService.restore(appCrudStore.item)
        else
            throw new Error("No restore service provided")
    } catch (e) {
        console.error(e);
    } finally {
        isLoading.value = false
        isRestoreModalOpen.value = false;
    }
}
</script>
<template>
    <AppDialog size="lg" title="تأكيد الاسترجات" v-model="isRestoreModalOpen" :loading="isLoading" color="none">
        <div>
          هل انت متاكد من اعادة الاسترجاع
        </div>
        <template #actions>
            <BaseButton @click="restoreItem" color="info">
                <Icon name="ph:recycle-bold" />
                تأكيد
            </BaseButton>
        </template>
    </AppDialog>
</template>
