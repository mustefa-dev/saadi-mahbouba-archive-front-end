<script setup lang="ts">
import type { Category, CategoriesResponse } from '~/types/reports';
import { formatDate } from '~/utils/helpers';
import AddCategory from '~/views/categories/components/AddCategory.vue';
import EditCategory from '~/views/categories/components/EditCategory.vue';
import DeleteCategory from '~/views/categories/components/DeleteCategory.vue';
import AddSubCategory from '~/views/categories/components/AddSubCategory.vue';
import ToggleCategoryStatus from '~/views/categories/components/ToggleCategoryStatus.vue';

useHead({
  title: "إدارة التصنيفات"
})

definePageMeta({
  title: "التصنيفات"
})

const apiPaths = useApiPaths();

const pageNumber = ref(1);
const pageSize = ref(10);
const searchQuery = ref('');

const { data: categoriesData, refresh: refreshCategories, pending: isLoading } = await useFetch<CategoriesResponse>(
  apiPaths.categories,
  {
    key: 'categories-list',
    lazy: true,
    query: computed(() => ({
      search: searchQuery.value,
      pageNumber: pageNumber.value,
      pageSize: pageSize.value,
    })),
  }
);

const categories = computed<Category[]>(() => categoriesData.value?.data || []);
const totalCount = computed(() => categoriesData.value?.totalCount || 0);
const pageCount = computed(() => categoriesData.value?.pageCount || 0);

watch(searchQuery, () => {
  pageNumber.value = 1;
});
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <BaseHeading size="2xl" weight="bold">إدارة التصنيفات</BaseHeading>
        <BaseParagraph size="sm" class="text-muted-400">إدارة تصنيفات التقارير</BaseParagraph>
      </div>
    </div>

    <BaseCard class="p-6">
      <div class="flex items-center justify-between gap-4">
        <BaseInput v-model="searchQuery" placeholder="البحث بالاسم..." icon="ph:magnifying-glass-duotone" class="w-full max-w-xs" />
        <AddCategory @added="refreshCategories" />
      </div>
    </BaseCard>

    <BaseCard>
      <div v-if="isLoading" class="p-6">
        <BasePlaceload class="h-12 w-full rounded" />
        <BasePlaceload class="h-12 w-full rounded mt-2" />
        <BasePlaceload class="h-12 w-full rounded mt-2" />
      </div>

      <div v-else-if="categories.length === 0" class="p-12 text-center">
        <BaseParagraph class="text-muted-400">لا توجد تصنيفات</BaseParagraph>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-muted-50 dark:bg-muted-900/50">
            <tr>
              <th class="px-6 py-3 text-right text-xs font-medium text-muted-500 uppercase tracking-wider">الاسم</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-muted-500 uppercase tracking-wider">الوصف</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-muted-500 uppercase tracking-wider">التصنيفات الفرعية</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-muted-500 uppercase tracking-wider">تاريخ الإنشاء</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-muted-500 uppercase tracking-wider">الحالة</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-muted-500 uppercase tracking-wider">الإجراءات</th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-muted-800 divide-y divide-muted-200 dark:divide-muted-700">
            <tr v-for="category in categories" :key="category.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-muted-900 dark:text-white">{{ category.nameAr }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-muted-600 dark:text-muted-300">{{ category.description || '-' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-semibold text-primary-500">{{ category.subCategoriesCount }}</span>
                  <AddSubCategory
                    :category-id="category.id"
                    :category-name="category.nameAr"
                    @added="refreshCategories"
                  />
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-muted-600 dark:text-muted-300">{{ formatDate(category.creationDate) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <BaseTag v-if="category.isActive" color="success" flavor="pastel" size="sm">نشط</BaseTag>
                <ToggleCategoryStatus v-else :category-id="category.id" :category-name="category.nameAr" :is-active="category.isActive" @toggled="refreshCategories" />
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-2">
                  <EditCategory :category="category" @edited="refreshCategories" />
                  <DeleteCategory :category-id="category.id" :category-name="category.nameAr" @deleted="refreshCategories" />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="pageCount > 1" class="p-6 border-t border-muted-200 dark:border-muted-700">
        <BasePagination :current-page="pageNumber" :item-per-page="pageSize" :total-items="totalCount" @update:current-page="pageNumber = $event" />
      </div>
    </BaseCard>
  </div>
</template>
