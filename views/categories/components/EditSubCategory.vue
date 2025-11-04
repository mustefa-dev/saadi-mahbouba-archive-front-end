<script setup lang="ts">
import type { SubCategory, SubCategoryUpdate } from '~/types/reports';

const props = defineProps<{
  subCategory: SubCategory;
}>();

const emit = defineEmits(['edited']);
const apiPaths = useApiPaths();

const isOpen = ref(false);
const isLoading = ref(false);

const form = ref<SubCategoryUpdate>({
  name: props.subCategory.name,
  nameAr: props.subCategory.nameAr,
  description: props.subCategory.description,
  displayOrder: props.subCategory.displayOrder,
  isActive: props.subCategory.isActive
});

watch(() => props.subCategory, (newSubCategory) => {
  form.value = {
    name: newSubCategory.name,
    nameAr: newSubCategory.nameAr,
    description: newSubCategory.description,
    displayOrder: newSubCategory.displayOrder,
    isActive: newSubCategory.isActive
  };
});

const handleSubmit = async () => {
  isLoading.value = true;
  try {
    await $fetch(apiPaths.subCategoryById(props.subCategory.id), {
      method: 'PUT',
      body: form.value
    });

    useToast().add({
      title: 'تم بنجاح',
      description: 'تم تحديث التصنيف الفرعي بنجاح',
      color: 'success'
    });

    isOpen.value = false;
    emit('edited');
  } catch (error: any) {
    useToast().add({
      title: 'خطأ',
      description: error.data?.message || 'حدث خطأ أثناء تحديث التصنيف الفرعي',
      color: 'danger'
    });
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div>
    <BaseButtonIcon @click="isOpen = true" size="sm" color="warning">
      <Icon name="ph:pencil-simple" class="h-4 w-4" />
    </BaseButtonIcon>

    <BaseModal :open="isOpen" @close="isOpen = false">
      <template #header>
        <div class="flex items-center gap-2">
          <Icon name="ph:pencil-simple" class="h-5 w-5" />
          <span>تعديل التصنيف الفرعي</span>
        </div>
      </template>

      <div class="space-y-4">
        <BaseInput
          v-model="form.nameAr"
          label="الاسم بالعربية"
          placeholder="أدخل اسم التصنيف الفرعي بالعربية"
          :required="true"
        />

        <BaseInput
          v-model="form.name"
          label="الاسم بالإنجليزية"
          placeholder="Enter subcategory name in English"
          :required="true"
        />

        <BaseTextarea
          v-model="form.description"
          label="الوصف"
          placeholder="أدخل وصف التصنيف الفرعي (اختياري)"
          rows="3"
        />

        <BaseInput
          v-model.number="form.displayOrder"
          type="number"
          label="ترتيب العرض"
          placeholder="0"
        />

        <BaseSwitchBall
          v-model="form.isActive"
          label="نشط"
        />
      </div>

      <template #footer>
        <div class="flex items-center justify-end gap-2">
          <BaseButton @click="isOpen = false" color="default" :disabled="isLoading">
            إلغاء
          </BaseButton>
          <BaseButton @click="handleSubmit" color="primary" :loading="isLoading">
            حفظ التغييرات
          </BaseButton>
        </div>
      </template>
    </BaseModal>
  </div>
</template>
