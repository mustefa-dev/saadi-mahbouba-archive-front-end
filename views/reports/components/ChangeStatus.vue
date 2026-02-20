<script setup lang="ts">
import type { Report } from '~/types/reports';
import { ReportStatus, ReportStatusLabels, ReportStatusColors } from '~/types/reports';

const props = defineProps<{
  report: Report;
}>();

const emit = defineEmits<{
  statusChanged: [];
}>();

const apiPaths = useApiPaths();
const isLoading = ref(false);

// Confirmation dialog state
const showConfirm = ref(false);
const pendingAction = ref<'startReview' | 'reject' | null>(null);

// Convert status string to ReportStatus enum
const getCurrentStatus = (): ReportStatus => {
  const status = props.report.status?.toLowerCase();
  switch (status) {
    case 'pending':
      return ReportStatus.Pending;
    case 'under_review':
      return ReportStatus.UnderReview;
    case 'approved':
      return ReportStatus.Approved;
    case 'rejected':
      return ReportStatus.Rejected;
    default:
      return ReportStatus.Pending;
  }
};

const currentStatus = computed(() => getCurrentStatus());

// Determine which action button to show based on current status
const showStartReview = computed(() => currentStatus.value === ReportStatus.Pending);
const showReject = computed(() =>
  currentStatus.value === ReportStatus.Pending ||
  currentStatus.value === ReportStatus.UnderReview
);

const changeStatus = async (newStatus: ReportStatus) => {
  isLoading.value = true;
  try {
    await $fetch(apiPaths.changeReportStatus(props.report.id), {
      method: 'POST',
      body: { status: newStatus }
    });

    emit('statusChanged');
  } catch (error: any) {
    console.error('Error changing status:', error);
  } finally {
    isLoading.value = false;
  }
};

const confirmActionLabel = computed(() => {
  if (pendingAction.value === 'startReview') return 'بدء المراجعة';
  if (pendingAction.value === 'reject') return 'رفض التقرير';
  return '';
});

const confirmActionDescription = computed(() => {
  if (pendingAction.value === 'startReview') return 'هل أنت متأكد من بدء مراجعة التقرير';
  if (pendingAction.value === 'reject') return 'هل أنت متأكد من رفض التقرير';
  return '';
});

const confirmActionColor = computed(() => {
  if (pendingAction.value === 'startReview') return 'info';
  if (pendingAction.value === 'reject') return 'danger';
  return 'default';
});

const confirmActionIcon = computed(() => {
  if (pendingAction.value === 'startReview') return 'ph:eye-duotone';
  if (pendingAction.value === 'reject') return 'ph:x-circle-duotone';
  return '';
});

const openConfirm = (action: 'startReview' | 'reject') => {
  pendingAction.value = action;
  showConfirm.value = true;
};

const executeConfirmedAction = async () => {
  if (pendingAction.value === 'startReview') {
    await changeStatus(ReportStatus.UnderReview);
  } else if (pendingAction.value === 'reject') {
    await changeStatus(ReportStatus.Rejected);
  }
  showConfirm.value = false;
  pendingAction.value = null;
};

const cancelConfirm = () => {
  showConfirm.value = false;
  pendingAction.value = null;
};
</script>

<template>
  <div class="flex items-center gap-1">
    <!-- Start Review Button -->
    <BaseButtonIcon
      v-if="showStartReview"
      size="sm"
      color="info"
      flavor="pastel"
      data-nui-tooltip="بدء المراجعة"
      :loading="isLoading"
      @click="openConfirm('startReview')"
    >
      <Icon name="ph:eye-duotone" class="h-4 w-4" />
    </BaseButtonIcon>

    <!-- Reject Button -->
    <BaseButtonIcon
      v-if="showReject"
      size="sm"
      color="danger"
      flavor="pastel"
      data-nui-tooltip="رفض"
      :loading="isLoading"
      @click="openConfirm('reject')"
    >
      <Icon name="ph:x-circle-duotone" class="h-4 w-4" />
    </BaseButtonIcon>

    <!-- Confirmation Modal -->
    <TairoModal :open="showConfirm" size="sm" @close="cancelConfirm">
      <template #header>
        <div class="flex w-full items-center justify-between p-4 md:p-6" dir="rtl">
          <h3 class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white">
            {{ confirmActionLabel }}
          </h3>
          <BaseButtonClose @click="cancelConfirm" />
        </div>
      </template>

      <div class="p-4 md:p-6" dir="rtl">
        <div class="mx-auto w-full text-center">
          <div class="flex justify-center mb-4">
            <Icon :name="confirmActionIcon" class="h-12 w-12" :class="pendingAction === 'reject' ? 'text-danger-500' : 'text-info-500'" />
          </div>
          <p class="text-muted-500 dark:text-muted-400 mb-2">
            {{ confirmActionDescription }}
          </p>
          <p class="text-muted-900 dark:text-white font-semibold mb-6">
            {{ report.title }}؟
          </p>

          <div class="flex gap-x-2 justify-center">
            <BaseButton
              color="default"
              @click="cancelConfirm"
            >
              إلغاء
            </BaseButton>
            <BaseButton
              :color="confirmActionColor"
              :loading="isLoading"
              :disabled="isLoading"
              @click="executeConfirmedAction"
            >
              {{ confirmActionLabel }}
            </BaseButton>
          </div>
        </div>
      </div>
    </TairoModal>
  </div>
</template>
