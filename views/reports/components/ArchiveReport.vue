<script setup lang="ts">
import type { Report, ArchiveReportForm } from '~/types/reports';

const props = defineProps<{
  report: Report;
}>();

const emit = defineEmits<{
  archived: [];
}>();

const apiPaths = useApiPaths();
const isOpen = ref(false);
const isLoading = ref(false);

const form = ref<ArchiveReportForm>({
  fileYear: new Date().getFullYear(),
  archiveFileName: '',
  categoryId: '',
  archiveNotes: '',
  isVisibleToClient: true
});

const openModal = () => {
  form.value = {
    fileYear: new Date().getFullYear(),
    archiveFileName: props.report.fileName || props.report.title || '',
    categoryId: props.report.categoryId || '',
    archiveNotes: '',
    isVisibleToClient: true
  };
  isOpen.value = true;
};

const closeModal = () => {
  isOpen.value = false;
};

const handleArchive = async () => {
  if (!form.value.archiveFileName || !form.value.categoryId) {
    return;
  }

  isLoading.value = true;
  try {
    await $fetch(apiPaths.archiveReport(props.report.id), {
      method: 'POST',
      body: form.value
    });

    emit('archived');
    closeModal();
  } catch (error: any) {
    console.error('Error archiving report:', error);
  } finally {
    isLoading.value = false;
  }
};

// Generate year options (last 50 years)
const yearOptions = computed(() => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear; i >= currentYear - 50; i--) {
    years.push(i);
  }
  return years;
});
</script>

<template>
  <div>
    <BaseButtonIcon
      size="sm"
      color="success"
      flavor="pastel"
      data-nui-tooltip="أرشفة"
      @click="openModal"
    >
      <Icon name="ph:archive-duotone" class="h-4 w-4" />
    </BaseButtonIcon>

    <TairoModal :open="isOpen" size="lg" @close="closeModal">
      <template #header>
        <div class="flex items-center gap-3 p-4" dir="rtl">
          <div class="flex items-center justify-center w-10 h-10 rounded-full bg-success-100 dark:bg-success-500/20">
            <Icon name="ph:archive-duotone" class="h-5 w-5 text-success-500" />
          </div>
          <div>
            <BaseHeading size="lg" weight="medium">أرشفة التقرير</BaseHeading>
            <BaseParagraph size="xs" class="text-muted-400">{{ report.title }}</BaseParagraph>
          </div>
        </div>
      </template>

      <div class="space-y-4 p-6" dir="rtl">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <BaseSelect
            v-model="form.fileYear"
            label="سنة الملف"
            :classes="{ wrapper: 'w-full' }"
          >
            <option v-for="year in yearOptions" :key="year" :value="year">
              {{ year }}
            </option>
          </BaseSelect>

          <BaseInput
            v-model="form.archiveFileName"
            label="اسم الملف"
            placeholder="أدخل اسم الملف"
            :classes="{ wrapper: 'w-full' }"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-muted-700 dark:text-muted-300 mb-2">
            التصنيف <span class="text-danger-500">*</span>
          </label>
          <CategorySelector
            v-model="form.categoryId"
            placeholder="اختر التصنيف..."
          />
        </div>

        <div class="flex items-center gap-3">
          <BaseCheckbox
            v-model="form.isVisibleToClient"
            label="العميل يمكنه رؤية هذا الملف"
            color="primary"
          />
        </div>

        <BaseTextarea
          v-model="form.archiveNotes"
          label="الملاحظات"
          placeholder="أدخل ملاحظات الأرشفة (اختياري)"
          rows="3"
          :classes="{ wrapper: 'w-full' }"
        />
      </div>

      <template #footer>
        <div class="flex items-center justify-end gap-2 p-4" dir="rtl">
          <BaseButton color="muted" @click="closeModal">
            إلغاء
          </BaseButton>
          <BaseButton
            color="success"
            :loading="isLoading"
            :disabled="!form.archiveFileName || !form.categoryId"
            @click="handleArchive"
          >
            <Icon name="ph:archive-duotone" class="h-4 w-4" />
            <span>أرشفة</span>
          </BaseButton>
        </div>
      </template>
    </TairoModal>
  </div>
</template>
