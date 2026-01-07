<script setup lang="ts">
import HomePageCard from './HomePageCard.vue';

interface DashboardStatistics {
  totalReports: number;
  pendingReports: number;
  underReviewReports: number;
  approvedReports: number;
  rejectedReports: number;
  reportsToday: number;
  totalCompanies: number;
  activeCompanies: number;
  totalCategories: number;
  totalFiles: number;
}

const apiPaths = useApiPaths();

const statistics = ref<DashboardStatistics>({
  totalReports: 0,
  pendingReports: 0,
  underReviewReports: 0,
  approvedReports: 0,
  rejectedReports: 0,
  reportsToday: 0,
  totalCompanies: 0,
  activeCompanies: 0,
  totalCategories: 0,
  totalFiles: 0
});

const isLoading = ref(true);

// Get current greeting based on time
const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 12) return 'صباح الخير';
  if (hour < 17) return 'مساء الخير';
  return 'مساء الخير';
});

// Format current date in Arabic
const currentDate = computed(() => {
  return new Date().toLocaleDateString('ar-SA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

onMounted(async () => {
  try {
    const response = await $fetch<any>(apiPaths.archiveDashboard);
    const data = response?.data || response;
    if (data) {
      statistics.value = {
        totalReports: data.totalReports ?? 0,
        pendingReports: data.pendingReports ?? 0,
        underReviewReports: data.underReviewReports ?? 0,
        approvedReports: data.approvedReports ?? 0,
        rejectedReports: data.rejectedReports ?? 0,
        reportsToday: data.reportsToday ?? 0,
        totalCompanies: data.totalCompanies ?? 0,
        activeCompanies: data.activeCompanies ?? 0,
        totalCategories: data.totalCategories ?? 0,
        totalFiles: data.totalFiles ?? 0
      };
    }
  } catch (error) {
    console.error('Error fetching dashboard statistics:', error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="space-y-6" dir="rtl">
    <!-- Welcome Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
      <div>
        <h1 class="text-2xl md:text-3xl font-bold text-muted-800 dark:text-white mb-1">
          {{ greeting }}
        </h1>
        <p class="text-muted-500 dark:text-muted-400">
          {{ currentDate }}
        </p>
      </div>
      <div class="flex items-center gap-3">
        <BaseButton color="primary" to="/archive" class="gap-2">
          <Icon name="ph:archive-duotone" class="w-5 h-5" />
          <span>الأرشيف</span>
        </BaseButton>
      </div>
    </div>

    <!-- Reports Statistics Section -->
    <div>
      <div class="flex items-center gap-2 mb-4">
        <div class="w-1 h-6 bg-primary-500 rounded-full"></div>
        <h2 class="text-lg font-semibold text-muted-800 dark:text-white">إحصائيات التقارير</h2>
      </div>
      <div class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <HomePageCard
          :data="statistics.totalReports"
          color="primary"
          icon="ph:files-duotone"
          title="إجمالي التقارير"
          :loading="isLoading"
        />
        <HomePageCard
          :data="statistics.pendingReports"
          color="warning"
          icon="ph:clock-duotone"
          title="قيد الانتظار"
          subtitle="بانتظار المراجعة"
          :loading="isLoading"
        />
        <HomePageCard
          :data="statistics.approvedReports"
          color="success"
          icon="ph:check-circle-duotone"
          title="المؤرشفة"
          subtitle="تمت الموافقة عليها"
          :loading="isLoading"
        />
        <HomePageCard
          :data="statistics.rejectedReports"
          color="danger"
          icon="ph:x-circle-duotone"
          title="المرفوضة"
          :loading="isLoading"
        />
      </div>
    </div>

    <!-- Companies & System Statistics Section -->
    <div>
      <div class="flex items-center gap-2 mb-4">
        <div class="w-1 h-6 bg-info-500 rounded-full"></div>
        <h2 class="text-lg font-semibold text-muted-800 dark:text-white">إحصائيات النظام</h2>
      </div>
      <div class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <HomePageCard
          :data="statistics.activeCompanies"
          color="success"
          icon="ph:buildings-duotone"
          title="الشركات النشطة"
          :subtitle="`من أصل ${statistics.totalCompanies} شركة`"
          :loading="isLoading"
        />
        <HomePageCard
          :data="statistics.totalCategories"
          color="info"
          icon="ph:folders-duotone"
          title="التصنيفات"
          subtitle="تصنيفات الأرشيف"
          :loading="isLoading"
        />
        <HomePageCard
          :data="statistics.totalFiles"
          color="primary"
          icon="ph:file-cloud-duotone"
          title="الملفات المرفوعة"
          subtitle="إجمالي الملفات"
          :loading="isLoading"
        />
      </div>
    </div>

    <!-- Quick Actions Section -->
    <div>
      <div class="flex items-center gap-2 mb-4">
        <div class="w-1 h-6 bg-success-500 rounded-full"></div>
        <h2 class="text-lg font-semibold text-muted-800 dark:text-white">الوصول السريع</h2>
      </div>
      <div class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <NuxtLink to="/archive" class="block">
          <BaseCard class="p-5 hover:shadow-lg hover:shadow-primary-500/10 hover:border-primary-500/50 transition-all duration-300 cursor-pointer group">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Icon name="ph:archive-duotone" class="w-6 h-6 text-primary-500" />
              </div>
              <div>
                <p class="font-semibold text-muted-800 dark:text-white">الأرشيف</p>
                <p class="text-sm text-muted-500">إدارة ملفات الشركات</p>
              </div>
            </div>
          </BaseCard>
        </NuxtLink>

        <NuxtLink to="/users" class="block">
          <BaseCard class="p-5 hover:shadow-lg hover:shadow-info-500/10 hover:border-info-500/50 transition-all duration-300 cursor-pointer group">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl bg-info-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Icon name="ph:users-duotone" class="w-6 h-6 text-info-500" />
              </div>
              <div>
                <p class="font-semibold text-muted-800 dark:text-white">المستخدمين</p>
                <p class="text-sm text-muted-500">إدارة حسابات الشركات</p>
              </div>
            </div>
          </BaseCard>
        </NuxtLink>

        <NuxtLink to="/categories" class="block">
          <BaseCard class="p-5 hover:shadow-lg hover:shadow-warning-500/10 hover:border-warning-500/50 transition-all duration-300 cursor-pointer group">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl bg-warning-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Icon name="ph:folder-open-duotone" class="w-6 h-6 text-warning-500" />
              </div>
              <div>
                <p class="font-semibold text-muted-800 dark:text-white">التصنيفات</p>
                <p class="text-sm text-muted-500">إدارة تصنيفات الأرشيف</p>
              </div>
            </div>
          </BaseCard>
        </NuxtLink>

        <NuxtLink to="/admins" class="block">
          <BaseCard class="p-5 hover:shadow-lg hover:shadow-success-500/10 hover:border-success-500/50 transition-all duration-300 cursor-pointer group">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl bg-success-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Icon name="ph:user-gear-duotone" class="w-6 h-6 text-success-500" />
              </div>
              <div>
                <p class="font-semibold text-muted-800 dark:text-white">المشرفين</p>
                <p class="text-sm text-muted-500">إدارة حسابات المشرفين</p>
              </div>
            </div>
          </BaseCard>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
