<script setup lang="ts">
import type { CategoryForm } from '~/types/reports';

const emit = defineEmits<{
  added: [];
}>();

const helpers = useHelpers();
const apiPaths = useApiPaths();
const isOpen = ref(false);
const isLoading = ref(false);

const formData = reactive<CategoryForm>({
  name: '',
  nameAr: '',
  description: '',
  icon: '',
  displayOrder: 0,
  isActive: true
});

const addCategory = async () => {
  isLoading.value = true;
  try {
    await $fetch(apiPaths.categories, {
      method: 'POST',
      body: formData
    });

    helpers.setSuccessMessage('ar', 'Category added successfully', 'تم إضافة التصنيف بنجاح');
    isOpen.value = false;

    // Reset form
    formData.name = '';
    formData.nameAr = '';
    formData.description = '';
    formData.icon = '';
    formData.displayOrder = 0;
    formData.isActive = true;

    emit('added');
  } catch (error: any) {
    helpers.setErrorMessage(error, 'ar', 'Failed to add category', 'فشل إضافة التصنيف');
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div>
    <BaseButton
      color="primary"
      @click="isOpen = true"
    >
      <Icon name="ph:plus" class="size-4" />
      <span>إضافة تصنيف</span>
    </BaseButton>

    <TairoModal :open="isOpen" size="md" @close="isOpen = false">
      <template #header>
        <div class="flex w-full items-center justify-between p-4 md:p-6" dir="rtl">
          <h3 class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white">
            إضافة تصنيف جديد
          </h3>
          <BaseButtonClose @click="isOpen = false" />
        </div>
      </template>

      <form @submit.prevent="addCategory" class="p-4 md:p-6 space-y-4" dir="rtl">
        <BaseInput
          v-model="formData.nameAr"
          label="الاسم بالعربية"
          placeholder="أدخل اسم التصنيف بالعربية"
          :disabled="isLoading"
          required
        />

        <BaseInput
          v-model="formData.name"
          label="الاسم بالإنجليزية"
          placeholder="Enter category name in English"
          :disabled="isLoading"
          required
        />

        <BaseTextarea
          v-model="formData.description"
          label="الوصف"
          placeholder="أدخل وصف التصنيف (اختياري)"
          rows="3"
          :disabled="isLoading"
        />

        <BaseInput
          v-model="formData.icon"
          label="الأيقونة"
          placeholder="ph:folder (اختياري)"
          :disabled="isLoading"
        />

        <BaseInput
          v-model.number="formData.displayOrder"
          type="number"
          label="ترتيب العرض"
          placeholder="0"
          :disabled="isLoading"
        />

        <div class="flex gap-x-2 justify-end pt-4">
          <BaseButton
            type="button"
            color="default"
            @click="isOpen = false"
            :disabled="isLoading"
          >
            إلغاء
          </BaseButton>
          <BaseButton
            type="submit"
            color="primary"
            :loading="isLoading"
            :disabled="isLoading"
          >
            إضافة
          </BaseButton>
        </div>
      </form>
    </TairoModal>
  </div>
</template>
