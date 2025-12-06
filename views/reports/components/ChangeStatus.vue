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

const startReview = () => changeStatus(ReportStatus.UnderReview);
const rejectReport = () => changeStatus(ReportStatus.Rejected);
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
      @click="startReview"
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
      @click="rejectReport"
    >
      <Icon name="ph:x-circle-duotone" class="h-4 w-4" />
    </BaseButtonIcon>
  </div>
</template>
