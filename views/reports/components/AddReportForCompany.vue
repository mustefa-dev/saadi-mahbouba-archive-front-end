<script setup lang="ts">
import type { ReportForm } from '~/types/reports';

const props = defineProps<{
  userId: string;
  companyName?: string;
}>();

const emit = defineEmits<{
  added: [];
}>();

const helpers = useHelpers();
const apiPaths = useApiPaths();

const isOpen = ref(false);
const isLoading = ref(false);

const formData = reactive<Omit<ReportForm, 'categoryId'>>({
  title: '',
  description: '',
  file: null
});

const fileInput = ref<HTMLInputElement | null>(null);
const selectedFileName = ref('');

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    formData.file = target.files[0];
    selectedFileName.value = target.files[0].name;
  }
};

const resetForm = () => {
  formData.title = '';
  formData.description = '';
  formData.file = null;
  selectedFileName.value = '';
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const addReport = async () => {
  if (!formData.file) {
    helpers.setErrorMessage({ message: 'يرجى اختيار ملف' }, 'ar', 'Please select a file', 'يرجى اختيار ملف');
    return;
  }

  if (!formData.title.trim()) {
    helpers.setErrorMessage({ message: 'يرجى إدخال عنوان التقرير' }, 'ar', 'Please enter report title', 'يرجى إدخال عنوان التقرير');
    return;
  }

  isLoading.value = true;
  try {
    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('description', formData.description || '');
    formDataToSend.append('userId', props.userId);
    formDataToSend.append('file', formData.file);

    await $fetch(apiPaths.reports, {
      method: 'POST',
      body: formDataToSend
    });

    helpers.setSuccessMessage('ar', 'Report added successfully', 'تم إضافة التقرير بنجاح');

    resetForm();
    isOpen.value = false;
    emit('added');
  } catch (error: any) {
    helpers.setErrorMessage(error, 'ar', 'Failed to add report', 'فشل إضافة التقرير');
  } finally {
    isLoading.value = false;
  }
};

const openDialog = () => {
  resetForm();
  isOpen.value = true;
};
</script>

<template>
  <div>
    <BaseButton
      size="sm"
      color="primary"
      variant="pastel"
      @click.stop="openDialog"
      data-nui-tooltip="إضافة تقرير"
    >
      <Icon name="ph:plus" class="size-4" />
    </BaseButton>

    <TairoModal :open="isOpen" size="lg" @close="isOpen = false">
      <template #header>
        <div class="flex w-full items-center justify-between p-4 md:p-6" dir="rtl">
          <div>
            <h3 class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white">
              إضافة تقرير جديد
            </h3>
            <p v-if="companyName" class="text-sm text-muted-400 mt-1">
              للشركة: {{ companyName }}
            </p>
          </div>
          <BaseButtonClose @click="isOpen = false" />
        </div>
      </template>

      <form @submit.prevent="addReport" class="p-4 md:p-6 space-y-4" dir="rtl">
        <BaseInput
          v-model="formData.title"
          label="عنوان التقرير *"
          placeholder="أدخل عنوان التقرير"
          :disabled="isLoading"
          required
        />

        <BaseTextarea
          v-model="formData.description"
          label="وصف التقرير"
          placeholder="أدخل وصف التقرير (اختياري)"
          :disabled="isLoading"
          rows="3"
        />

        <div>
          <label class="block text-sm font-medium text-muted-700 dark:text-muted-300 mb-2">
            الملف <span class="text-danger-500">*</span>
          </label>
          <div class="relative">
            <input
              ref="fileInput"
              type="file"
              @change="handleFileChange"
              class="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
              :disabled="isLoading"
            />
            <BaseButton
              @click="fileInput?.click()"
              color="default"
              class="w-full"
              type="button"
              :disabled="isLoading"
            >
              <Icon name="ph:paperclip" class="h-4 w-4" />
              <span>{{ selectedFileName || 'اختر ملف' }}</span>
            </BaseButton>
          </div>
          <p class="text-xs text-muted-400 mt-1">
            الملفات المدعومة: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG
          </p>
        </div>

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
            <Icon name="ph:plus" class="size-4 me-1" />
            إضافة
          </BaseButton>
        </div>
      </form>
    </TairoModal>
  </div>
</template>
