<script setup lang="ts">
import type { Category } from '~/types/reports';
import AddSubCategory from './AddSubCategory.vue';
import EditSubCategory from './EditSubCategory.vue';
import DeleteSubCategory from './DeleteSubCategory.vue';

const props = defineProps<{
  category: Category;
}>();

const emit = defineEmits(['updated']);
const isOpen = ref(false);

const children = computed(() => props.category.children || []);
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
          <span>التصنيفات الفرعية لـ: {{ category.name }}</span>
        </div>
      </template>

      <div v-if="children.length === 0" class="p-12 text-center">
        <Icon name="ph:folder-open" class="h-16 w-16 mx-auto text-muted-400 mb-4" />
        <BaseParagraph class="text-muted-400">لا توجد تصنيفات فرعية</BaseParagraph>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-muted-50 dark:bg-muted-900/50">
            <tr>
              <th class="px-4 py-3 text-right text-xs font-medium text-muted-500 uppercase tracking-wider">الاسم</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-muted-500 uppercase tracking-wider">الوصف</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-muted-500 uppercase tracking-wider">الفرعية</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-muted-500 uppercase tracking-wider">التقارير</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-muted-500 uppercase tracking-wider">الحالة</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-muted-500 uppercase tracking-wider">الإجراءات</th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-muted-800 divide-y divide-muted-200 dark:divide-muted-700">
            <tr v-for="child in children" :key="child.id">
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <Icon name="ph:folder" class="h-4 w-4 text-primary-500" />
                  <span class="text-sm font-medium text-muted-900 dark:text-white">{{ child.name }}</span>
                </div>
              </td>
              <td class="px-4 py-3">
                <div class="text-sm text-muted-600 dark:text-muted-300 max-w-xs truncate">
                  {{ child.description || '-' }}
                </div>
              </td>
              <td class="px-4 py-3 whitespace-nowrap">
                <span class="text-sm font-semibold text-primary-500">{{ child.childrenCount || 0 }}</span>
              </td>
              <td class="px-4 py-3 whitespace-nowrap">
                <span class="text-sm font-semibold text-success-500">{{ child.reportsCount }}</span>
              </td>
              <td class="px-4 py-3 whitespace-nowrap">
                <BaseTag v-if="child.isActive" color="success" flavor="pastel" size="sm">نشط</BaseTag>
                <BaseTag v-else color="danger" flavor="pastel" size="sm">غير نشط</BaseTag>
              </td>
              <td class="px-4 py-3 whitespace-nowrap">
                <div class="flex items-center gap-2">
                  <AddSubCategory
                    :category-id="child.id"
                    :category-name="child.name"
                    @added="emit('updated')"
                  />
                  <ViewSubCategories
                    v-if="child.childrenCount > 0"
                    :category="child"
                    @updated="emit('updated')"
                  />
                  <EditSubCategory :sub-category="child" @edited="emit('updated')" />
                  <DeleteSubCategory
                    :sub-category-id="child.id"
                    :sub-category-name="child.name"
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
