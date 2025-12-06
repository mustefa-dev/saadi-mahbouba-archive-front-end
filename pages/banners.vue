<script setup lang="ts">
import type { Banner, BannersResponse } from '~/types/banners';
import { BannerType, BannerTypeLabels } from '~/types/banners';
import { formatDate } from '~/utils/helpers';
import AddBanner from '~/views/banners/components/AddBanner.vue';
import EditBanner from '~/views/banners/components/EditBanner.vue';
import DeleteBanner from '~/views/banners/components/DeleteBanner.vue';

useHead({
  title: "إدارة البانرات"
})

definePageMeta({
  title: "البانرات"
})

const apiPaths = useApiPaths();

const pageNumber = ref(1);
const pageSize = ref(10);
const searchQuery = ref('');
const filterType = ref<number | null>(null);
const filterActive = ref<boolean | null>(null);

const { data: bannersData, refresh: refreshBanners, pending: isLoading } = await useFetch<BannersResponse>(
  apiPaths.banners,
  {
    key: 'banners-list',
    lazy: true,
    query: computed(() => ({
      title: searchQuery.value || undefined,
      type: filterType.value ?? undefined,
      isActive: filterActive.value ?? undefined,
      pageNumber: pageNumber.value,
      pageSize: pageSize.value,
    })),
  }
);

const banners = computed<Banner[]>(() => bannersData.value?.data || []);
const totalCount = computed(() => bannersData.value?.totalCount || 0);
const pageCount = computed(() => bannersData.value?.pageCount || 0);

watch([searchQuery, filterType, filterActive], () => {
  pageNumber.value = 1;
});

const getTypeLabel = (type: number) => {
  return BannerTypeLabels[type as BannerType] || 'غير محدد';
};

const getTypeColor = (type: number) => {
  switch (type) {
    case BannerType.PROMOTIONAL: return 'primary';
    case BannerType.INFORMATIONAL: return 'info';
    case BannerType.ANNOUNCEMENT: return 'warning';
    case BannerType.ADVERTISEMENT: return 'success';
    default: return 'default';
  }
};
</script>

<template>
  <div dir="rtl" class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <BaseHeading size="2xl" weight="bold">إدارة البانرات</BaseHeading>
        <BaseParagraph size="sm" class="text-muted-400">إدارة البانرات الإعلانية</BaseParagraph>
      </div>
    </div>

    <BaseCard class="p-6">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex flex-wrap items-center gap-3">
          <BaseInput
            v-model="searchQuery"
            placeholder="البحث بالعنوان..."
            icon="ph:magnifying-glass-duotone"
            class="w-full max-w-xs"
          />

          <BaseSelect v-model="filterType" class="w-40">
            <option :value="null">كل الأنواع</option>
            <option :value="0">ترويجي</option>
            <option :value="1">معلوماتي</option>
            <option :value="2">إعلان</option>
            <option :value="3">إعلاني</option>
          </BaseSelect>

          <BaseSelect v-model="filterActive" class="w-32">
            <option :value="null">الكل</option>
            <option :value="true">نشط</option>
            <option :value="false">غير نشط</option>
          </BaseSelect>
        </div>

        <AddBanner @added="refreshBanners" />
      </div>
    </BaseCard>

    <BaseCard>
      <div v-if="isLoading" class="p-6">
        <BasePlaceload class="h-12 w-full rounded" />
        <BasePlaceload class="h-12 w-full rounded mt-2" />
        <BasePlaceload class="h-12 w-full rounded mt-2" />
      </div>

      <div v-else-if="banners.length === 0" class="p-12 text-center">
        <Icon name="ph:image-duotone" class="size-16 text-muted-300 mx-auto mb-4" />
        <BaseParagraph class="text-muted-400">لا توجد بانرات</BaseParagraph>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-muted-50 dark:bg-muted-900/50">
            <tr>
              <th class="px-4 py-3 text-right text-xs font-medium text-muted-500 uppercase tracking-wider">الصورة</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-muted-500 uppercase tracking-wider">العنوان</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-muted-500 uppercase tracking-wider">النوع</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-muted-500 uppercase tracking-wider">الحالة</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-muted-500 uppercase tracking-wider">المشاهدات</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-muted-500 uppercase tracking-wider">النقرات</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-muted-500 uppercase tracking-wider">الترتيب</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-muted-500 uppercase tracking-wider">الإجراءات</th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-muted-800 divide-y divide-muted-200 dark:divide-muted-700">
            <tr v-for="banner in banners" :key="banner.id">
              <td class="px-4 py-4">
                <img
                  v-if="banner.imageUrl"
                  :src="apiPaths.getAsset(banner.imageUrl)"
                  :alt="banner.title"
                  class="w-20 h-12 object-cover rounded-lg"
                />
                <div v-else class="w-20 h-12 bg-muted-200 dark:bg-muted-700 rounded-lg flex items-center justify-center">
                  <Icon name="ph:image" class="size-6 text-muted-400" />
                </div>
              </td>
              <td class="px-4 py-4">
                <div class="text-sm font-medium text-muted-900 dark:text-white">{{ banner.title }}</div>
                <div v-if="banner.description" class="text-xs text-muted-500 truncate max-w-xs">{{ banner.description }}</div>
              </td>
              <td class="px-4 py-4">
                <BaseTag :color="getTypeColor(banner.type)" size="sm">
                  {{ getTypeLabel(banner.type) }}
                </BaseTag>
              </td>
              <td class="px-4 py-4">
                <BaseTag :color="banner.isActive ? 'success' : 'danger'" size="sm">
                  {{ banner.isActive ? 'نشط' : 'غير نشط' }}
                </BaseTag>
              </td>
              <td class="px-4 py-4 text-sm text-muted-600 dark:text-muted-300">
                {{ banner.viewCount.toLocaleString() }}
              </td>
              <td class="px-4 py-4 text-sm text-muted-600 dark:text-muted-300">
                {{ banner.clickCount.toLocaleString() }}
              </td>
              <td class="px-4 py-4 text-sm text-muted-600 dark:text-muted-300">
                {{ banner.order }}
              </td>
              <td class="px-4 py-4">
                <div class="flex items-center gap-2">
                  <EditBanner :banner="banner" @edited="refreshBanners" />
                  <DeleteBanner :banner-id="banner.id" :banner-title="banner.title" @deleted="refreshBanners" />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="pageCount > 1" class="p-6 border-t border-muted-200 dark:border-muted-700">
        <BasePagination
          :current-page="pageNumber"
          :item-per-page="pageSize"
          :total-items="totalCount"
          @update:current-page="pageNumber = $event"
        />
      </div>
    </BaseCard>
  </div>
</template>
