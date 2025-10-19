<script setup lang="ts">
interface Props {
    size: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
    title: string
    loading?: boolean
}
const props = withDefaults(defineProps<Props>(), {
    size: 'md',
    title: 'اضافة'
})
const isDialogOpen = defineModel({
    default: false
})
const isLoading = computed(() => props.loading)
const slots = useSlots()
const hasSlot = (name: string) => !!slots[name]

</script>

<template>
    <TairoModal :open="isDialogOpen" :size="size" @close="isDialogOpen = true" class="bg-red-900" color="none">
        <template #header>
            <!-- Header -->
            <div v-if="!hasSlot('header')" dir="rtl" class="flex w-full items-center justify-between p-4 md:p-6">
                <h3 class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white">
                    {{ title }}
                </h3>

                <BaseButtonClose @click="isDialogOpen = false" />
            </div>
            <slot name="header" />
        </template>

        <!-- Body -->

        <div dir="rtl" class="text-right px-4 md:px-6">
            <slot v-if="!isLoading" />
            <AppLoading v-else></AppLoading>
        </div>

        <template #footer>
            <!-- Footer -->

            <div dir="rtl" class="flex w-full items-center justify-end p-4 md:p-6 gap-2" :disabled="useAppTableStore().isLoading">
                <BaseButton variant="pastel" color="muted" @click="isDialogOpen = false">
                    اغلاق
                </BaseButton>
                <slot name="actions"></slot>
            </div>
            <slot name="footer" />
        </template>
    </TairoModal>
</template>
