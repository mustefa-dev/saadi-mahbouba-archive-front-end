<script setup lang="ts">
import type { SubCategoryForm } from '~/types/reports';

const props = defineProps<{
  categoryId: string;
  categoryName: string;
}>();

const emit = defineEmits<{
  added: [];
}>();

const helpers = useHelpers();
const apiPaths = useApiPaths();
const isOpen = ref(false);
const isLoading = ref(false);

const formData = reactive<SubCategoryForm>({
  name: '',
  nameAr: '',
  categoryId: props.categoryId,
  description: '',
  displayOrder: 0,
  isActive: true
});

const addSubCategory = async () => {
  isLoading.value = true;
  try {
    await $fetch(apiPaths.subCategories, {
      method: 'POST',
      body: formData
    });

    helpers.setSuccessMessage('ar', 'Subcategory added successfully', 'تم إضافة التصنيف الفرعي بنجاح');
    isOpen.value = false;

    // Reset form
    formData.name = '';
    formData.nameAr = '';
    formData.categoryId = props.categoryId;
    formData.description = '';
    formData.displayOrder = 0;
    formData.isActive = true;

    emit('added');
  } catch (error: any) {
    helpers.setErrorMessage(error, 'ar', 'Failed to add subcategory', 'فشل إضافة التصنيف الفرعي');
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div>
    <BaseButton
      size="sm"
      color="success"
      variant="pastel"
      @click="isOpen = true"
    >
      <Icon name="ph:plus" class="size-4" />
    </BaseButton>

    <TairoModal :open="isOpen" size="md" @close="isOpen = false">
      <template #header>
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3 class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white">
            إضافة تصنيف فرعي لـ: {{ categoryName }}
          </h3>
          <BaseButtonClose @click="isOpen = false" />
        </div>
      </template>

      <form @submit.prevent="addSubCategory" class="p-4 md:p-6 space-y-4">
        <BaseInput
          v-model="formData.nameAr"
          label="الاسم بالعربية"
          placeholder="أدخل اسم التصنيف الفرعي بالعربية"
          :disabled="isLoading"
          required
        />

        <BaseInput
          v-model="formData.name"
          label="الاسم بالإنجليزية"
          placeholder="Enter subcategory name in English"
          :disabled="isLoading"
          required
        />

        <BaseTextarea
          v-model="formData.description"
          label="الوصف"
          placeholder="أدخل وصف التصنيف الفرعي (اختياري)"
          rows="3"
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
