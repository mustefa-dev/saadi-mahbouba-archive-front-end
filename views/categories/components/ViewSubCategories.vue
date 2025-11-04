<script setup lang="ts">
import type { Category } from '~/types/reports';
import EditSubCategory from './EditSubCategory.vue';
import DeleteSubCategory from './DeleteSubCategory.vue';

const props = defineProps<{
  category: Category;
}>();

const emit = defineEmits(['updated']);
const isOpen = ref(false);

const subCategories = computed(() => props.category.subCategories || []);
</script>

<template>
  <div>
    <BaseButtonIcon @click="isOpen = true" size="sm" color="info">
      <Icon name="ph:eye" class="h-4 w-4" />
    </BaseButtonIcon>

    <BaseModal :open="isOpen" @close="isOpen = false" size="lg">
      <template #header>
        <div class="flex items-center gap-2">
          <Icon name="ph:folder-open" class="h-5 w-5" />
          <span>التصنيفات الفرعية لـ: {{ category.nameAr }}</span>
        </div>
      </template>

      <div v-if="subCategories.length === 0" class="p-12 text-center">
        <Icon name="ph:folder-open" class="h-16 w-16 mx-auto text-muted-400 mb-4" />
        <BaseParagraph class="text-muted-400">لا توجد تصنيفات فرعية</BaseParagraph>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-muted-50 dark:bg-muted-900/50">
            <tr>
              <th class="px-4 py-3 text-right text-xs font-medium text-muted-500 uppercase tracking-wider">الاسم</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-muted-500 uppercase tracking-wider">الوصف</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-muted-500 uppercase tracking-wider">التقارير</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-muted-500 uppercase tracking-wider">الحالة</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-muted-500 uppercase tracking-wider">الإجراءات</th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-muted-800 divide-y divide-muted-200 dark:divide-muted-700">
            <tr v-for="subCategory in subCategories" :key="subCategory.id">
              <td class="px-4 py-3">
                <div class="text-sm font-medium text-muted-900 dark:text-white">{{ subCategory.nameAr }}</div>
                <div class="text-xs text-muted-500">{{ subCategory.name }}</div>
              </td>
              <td class="px-4 py-3">
                <div class="text-sm text-muted-600 dark:text-muted-300 max-w-xs truncate">
                  {{ subCategory.description || '-' }}
                </div>
              </td>
              <td class="px-4 py-3 whitespace-nowrap">
                <span class="text-sm font-semibold text-success-500">{{ subCategory.reportsCount }}</span>
              </td>
              <td class="px-4 py-3 whitespace-nowrap">
                <BaseTag v-if="subCategory.isActive" color="success" flavor="pastel" size="sm">نشط</BaseTag>
                <BaseTag v-else color="danger" flavor="pastel" size="sm">غير نشط</BaseTag>
              </td>
              <td class="px-4 py-3 whitespace-nowrap">
                <div class="flex items-center gap-2">
                  <EditSubCategory :sub-category="subCategory" @edited="emit('updated')" />
                  <DeleteSubCategory
                    :sub-category-id="subCategory.id"
                    :sub-category-name="subCategory.nameAr"
                    @deleted="emit('updated')"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <template #footer>
        <div class="flex items-center justify-end">
          <BaseButton @click="isOpen = false" color="default">
            إغلاق
          </BaseButton>
        </div>
      </template>
    </BaseModal>
  </div>
</template>
