<script setup lang="ts">
import type { Report, ReportsGroupedByCompany, ReportStatus } from '~/types/reports';
import { getReportStatusColor, getReportStatusLabel } from '~/types/reports';
import { formatDate } from '~/utils/helpers';
import ArchiveReport from '~/views/reports/components/ArchiveReport.vue';
import ChangeStatus from '~/views/reports/components/ChangeStatus.vue';
import AddReportForCompany from '~/views/reports/components/AddReportForCompany.vue';

useHead({
  title: "التقارير حسب الشركات"
});

definePageMeta({
  title: "التقارير حسب الشركات"
});

const apiPaths = useApiPaths();

const searchQuery = ref('');
const selectedStatus = ref<ReportStatus | undefined>(undefined);
const expandedCompanies = ref<Set<string>>(new Set());

// Fetch grouped reports
const { data: groupedData, refresh: refreshReports, pending: isLoading, error: fetchError } = useLazyFetch<ReportsGroupedByCompany[]>(
  apiPaths.reportsGrouped,
  {
    key: 'reports-grouped',
    query: computed(() => ({
      search: searchQuery.value,
      status: selectedStatus.value,
    })),
    transform: (response: any) => response.data || response || [],
    default: () => [],
    onResponseError({ response }) {
      console.error('Error fetching grouped reports:', response.status, response._data);
    }
  }
);

const groupedReports = computed<ReportsGroupedByCompany[]>(() => groupedData.value || []);

// Filter groups by search query
const filteredGroups = computed(() => {
  if (!searchQuery.value) return groupedReports.value;

  const query = searchQuery.value.toLowerCase();
  return groupedReports.value.filter(group =>
    group.companyName?.toLowerCase().includes(query) ||
    group.fullName?.toLowerCase().includes(query) ||
    group.code?.toLowerCase().includes(query)
  );
});

const toggleCompany = (userId: string) => {
  if (expandedCompanies.value.has(userId)) {
    expandedCompanies.value.delete(userId);
  } else {
    expandedCompanies.value.add(userId);
  }
};

const isExpanded = (userId: string) => expandedCompanies.value.has(userId);

const expandAll = () => {
  groupedReports.value.forEach(group => {
    expandedCompanies.value.add(group.userId);
  });
};

const collapseAll = () => {
  expandedCompanies.value.clear();
};

const getFileIcon = (fileName?: string) => {
  if (!fileName) return 'ph:file';
  const ext = fileName.split('.').pop()?.toLowerCase();

  const iconMap: Record<string, string> = {
    'pdf': 'ph:file-pdf',
    'doc': 'ph:file-doc',
    'docx': 'ph:file-doc',
    'xls': 'ph:file-xls',
    'xlsx': 'ph:file-xls',
    'jpg': 'ph:file-image',
    'jpeg': 'ph:file-image',
    'png': 'ph:file-image',
  };

  return iconMap[ext || ''] || 'ph:file';
};

const clearFilters = () => {
  searchQuery.value = '';
  selectedStatus.value = undefined;
};

// Check if report can be archived (under review status)
const canArchive = (report: Report) => {
  const status = report.status?.toLowerCase();
  return status === 'under_review' || status === 'pending';
};
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <BaseHeading size="2xl" weight="bold">التقارير حسب الشركات</BaseHeading>
        <BaseParagraph size="sm" class="text-muted-400">
          عرض جميع التقارير مجمّعة حسب اسم الشركة
        </BaseParagraph>
      </div>
      <div class="flex items-center gap-2">
        <BaseButton size="sm" color="default" @click="expandAll">
          <Icon name="ph:arrows-out-simple" class="h-4 w-4" />
          <span>توسيع الكل</span>
        </BaseButton>
        <BaseButton size="sm" color="default" @click="collapseAll">
          <Icon name="ph:arrows-in-simple" class="h-4 w-4" />
          <span>طي الكل</span>
        </BaseButton>
      </div>
    </div>

    <!-- Filters -->
    <BaseCard class="p-6">
      <div class="flex flex-wrap items-center gap-4">
        <BaseInput
          v-model="searchQuery"
          placeholder="البحث بالشركة أو الاسم..."
          icon="ph:magnifying-glass-duotone"
          class="w-full max-w-xs"
        />

        <BaseSelect v-model="selectedStatus" class="w-48">
          <option :value="undefined">جميع الحالات</option>
          <option :value="0">قيد الانتظار</option>
          <option :value="1">قيد المراجعة</option>
          <option :value="2">مقبول</option>
          <option :value="3">مرفوض</option>
        </BaseSelect>

        <BaseButton color="default" @click="clearFilters">
          <Icon name="ph:x" class="h-4 w-4" />
          <span>مسح الفلاتر</span>
        </BaseButton>
      </div>
    </BaseCard>

    <!-- Loading State -->
    <div v-if="isLoading" class="space-y-4">
      <BaseCard v-for="i in 3" :key="i" class="p-4">
        <BasePlaceload class="h-16 w-full rounded" />
      </BaseCard>
    </div>

    <!-- Error State -->
    <BaseCard v-else-if="fetchError" class="p-12 text-center">
      <Icon name="ph:warning-circle" class="h-16 w-16 mx-auto text-danger-500 mb-4" />
      <BaseHeading size="lg" weight="semibold" class="mb-2">حدث خطأ</BaseHeading>
      <BaseParagraph class="text-muted-400 mb-4">
        حدث خطأ أثناء تحميل البيانات. يرجى المحاولة مرة أخرى.
      </BaseParagraph>
      <BaseButton color="primary" @click="refreshReports">
        <Icon name="ph:arrow-clockwise" class="h-4 w-4" />
        <span>إعادة المحاولة</span>
      </BaseButton>
    </BaseCard>

    <!-- Empty State -->
    <BaseCard v-else-if="filteredGroups.length === 0" class="p-12 text-center">
      <Icon name="ph:buildings" class="h-16 w-16 mx-auto text-muted-400 mb-4" />
      <BaseParagraph class="text-muted-400">لا توجد تقارير</BaseParagraph>
    </BaseCard>

    <!-- Grouped Reports -->
    <div v-else class="space-y-4">
      <BaseCard
        v-for="group in filteredGroups"
        :key="group.userId"
        class="overflow-hidden"
      >
        <!-- Company Header -->
        <div
          class="flex items-center justify-between p-4 cursor-pointer hover:bg-muted-50 dark:hover:bg-muted-900/50 transition-colors"
          @click="toggleCompany(group.userId)"
        >
          <div class="flex items-center gap-4">
            <div class="flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-500/20">
              <Icon name="ph:buildings-duotone" class="h-6 w-6 text-primary-500" />
            </div>
            <div>
              <BaseHeading size="md" weight="semibold">{{ group.companyName || 'غير محدد' }}</BaseHeading>
              <div class="flex items-center gap-2 text-sm text-muted-400">
                <span>{{ group.fullName }}</span>
                <span v-if="group.code" class="text-xs bg-muted-100 dark:bg-muted-800 px-2 py-0.5 rounded">
                  {{ group.code }}
                </span>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <!-- Status Summary -->
            <div class="hidden md:flex items-center gap-2">
              <BaseTag v-if="group.pendingCount > 0" color="warning" flavor="pastel" size="sm">
                {{ group.pendingCount }} قيد الانتظار
              </BaseTag>
              <BaseTag v-if="group.underReviewCount > 0" color="info" flavor="pastel" size="sm">
                {{ group.underReviewCount }} قيد المراجعة
              </BaseTag>
              <BaseTag v-if="group.archivedCount > 0" color="success" flavor="pastel" size="sm">
                {{ group.archivedCount }} مؤرشف
              </BaseTag>
              <BaseTag v-if="group.rejectedCount > 0" color="danger" flavor="pastel" size="sm">
                {{ group.rejectedCount }} مرفوض
              </BaseTag>
            </div>

            <div class="flex items-center gap-3">
              <!-- Add Report Button -->
              <AddReportForCompany
                :user-id="group.userId"
                :company-name="group.companyName || group.fullName"
                @added="refreshReports"
              />

              <span class="text-sm font-medium text-muted-600 dark:text-muted-300">
                {{ group.totalReports }} تقرير
              </span>
              <Icon
                :name="isExpanded(group.userId) ? 'ph:caret-up' : 'ph:caret-down'"
                class="h-5 w-5 text-muted-400 transition-transform"
              />
            </div>
          </div>
        </div>

        <!-- Reports Table (Expandable) -->
        <div
          v-show="isExpanded(group.userId)"
          class="border-t border-muted-200 dark:border-muted-700"
        >
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-muted-50 dark:bg-muted-900/50">
                <tr>
                  <th class="px-6 py-3 text-right text-xs font-medium text-muted-500 uppercase tracking-wider">العنوان</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-muted-500 uppercase tracking-wider">التصنيف</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-muted-500 uppercase tracking-wider">الملف</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-muted-500 uppercase tracking-wider">الحالة</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-muted-500 uppercase tracking-wider">التاريخ</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-muted-500 uppercase tracking-wider">الإجراءات</th>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-muted-800 divide-y divide-muted-200 dark:divide-muted-700">
                <tr
                  v-for="report in group.reports"
                  :key="report.id"
                  class="hover:bg-muted-50 dark:hover:bg-muted-900/50 transition-colors"
                >
                  <td class="px-6 py-4">
                    <div class="max-w-xs">
                      <div class="text-sm font-medium text-muted-900 dark:text-white truncate">{{ report.title }}</div>
                      <div class="text-xs text-muted-500 truncate">{{ report.description }}</div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-muted-600 dark:text-muted-300">
                      {{ report.categoryPath || report.categoryName || '-' }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div v-if="report.fileName" class="flex items-center gap-2">
                      <Icon :name="getFileIcon(report.fileName)" class="h-5 w-5 text-primary-500" />
                      <div class="text-sm text-muted-600 dark:text-muted-300 max-w-[150px] truncate">
                        {{ report.fileName }}
                      </div>
                    </div>
                    <span v-else class="text-sm text-muted-400">-</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <BaseTag
                      :color="getReportStatusColor(report.status)"
                      flavor="pastel"
                      size="sm"
                    >
                      {{ getReportStatusLabel(report.status) }}
                    </BaseTag>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-muted-600 dark:text-muted-300">{{ formatDate(report.createdAt) }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center gap-2">
                      <ChangeStatus :report="report" @status-changed="refreshReports" />
                      <ArchiveReport
                        v-if="canArchive(report)"
                        :report="report"
                        @archived="refreshReports"
                      />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </BaseCard>
    </div>
  </div>
</template>
