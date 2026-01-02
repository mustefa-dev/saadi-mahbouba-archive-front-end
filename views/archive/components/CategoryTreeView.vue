<script setup lang="ts">
import type { Category, CategoryBreadcrumb, CategoryForm } from '~/types/archive'

const props = defineProps<{
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'select-category', category: Category | null): void
  (e: 'add-report', category: Category): void
}>()

const apiPaths = useApiPaths()

// State
const categories = ref<Category[]>([])
const currentCategory = ref<Category | null>(null)
const breadcrumbs = ref<CategoryBreadcrumb[]>([])
const loadingTree = ref(false)
const loadingChildren = ref(false)

// Modal state
const showAddCategoryModal = ref(false)
const addCategoryForm = ref<CategoryForm>({
  name: '',
  description: '',
  parentId: undefined
})
const savingCategory = ref(false)

// Fetch root categories (tree view)
const fetchRootCategories = async () => {
  loadingTree.value = true
  try {
    const response = await $fetch<any>(apiPaths.categoryTree, {
      query: { parentId: null, maxDepth: 1 }
    })
    categories.value = response || []
  } catch (error) {
    console.error('Error fetching categories:', error)
  } finally {
    loadingTree.value = false
  }
}

// Fetch children of a category
const fetchChildren = async (parentId: string) => {
  loadingChildren.value = true
  try {
    const response = await $fetch<any>(apiPaths.categoryChildren(parentId))
    return response?.children || []
  } catch (error) {
    console.error('Error fetching children:', error)
    return []
  } finally {
    loadingChildren.value = false
  }
}

// Fetch breadcrumbs
const fetchBreadcrumbs = async (categoryId: string) => {
  try {
    const response = await $fetch<any>(apiPaths.categoryBreadcrumbs(categoryId))
    breadcrumbs.value = response || []
  } catch (error) {
    console.error('Error fetching breadcrumbs:', error)
  }
}

// Navigate to a category
const navigateToCategory = async (category: Category | null) => {
  currentCategory.value = category

  if (category) {
    // Fetch children and breadcrumbs
    const children = await fetchChildren(category.id)
    categories.value = children
    await fetchBreadcrumbs(category.id)
  } else {
    // Go to root
    breadcrumbs.value = []
    await fetchRootCategories()
  }

  emit('select-category', category)
}

// Navigate using breadcrumb
const navigateToBreadcrumb = async (breadcrumb: CategoryBreadcrumb | null) => {
  if (!breadcrumb) {
    await navigateToCategory(null)
    return
  }

  // Find the category from current categories or fetch it
  loadingChildren.value = true
  try {
    const response = await $fetch<any>(apiPaths.categoryById(breadcrumb.id))
    await navigateToCategory(response)
  } catch (error) {
    console.error('Error navigating to breadcrumb:', error)
  } finally {
    loadingChildren.value = false
  }
}

// Open add category modal
const openAddCategoryModal = () => {
  addCategoryForm.value = {
    name: '',
    description: '',
    parentId: currentCategory.value?.id
  }
  showAddCategoryModal.value = true
}

// Save new category
const saveCategory = async () => {
  if (!addCategoryForm.value.name) return

  savingCategory.value = true
  try {
    await $fetch(apiPaths.categories, {
      method: 'POST',
      body: addCategoryForm.value
    })
    showAddCategoryModal.value = false

    // Refresh current view
    if (currentCategory.value) {
      const children = await fetchChildren(currentCategory.value.id)
      categories.value = children
    } else {
      await fetchRootCategories()
    }
  } catch (error) {
    console.error('Error creating category:', error)
  } finally {
    savingCategory.value = false
  }
}

// Handle add report
const handleAddReport = (category: Category) => {
  emit('add-report', category)
}

// Initial load
onMounted(() => {
  fetchRootCategories()
})
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- Header with breadcrumbs -->
    <div class="px-4 py-3 border-b border-muted-200 dark:border-muted-700 bg-white dark:bg-muted-900">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-sm font-semibold text-muted-800 dark:text-muted-100">تصنيفات الأرشيف</h3>
        <BaseButton
          size="xs"
          color="primary"
          rounded="lg"
          @click="openAddCategoryModal"
        >
          <Icon name="ph:plus" class="w-3 h-3 ml-1" />
          إضافة
        </BaseButton>
      </div>

      <!-- Breadcrumbs -->
      <div class="flex items-center gap-1 text-xs overflow-x-auto pb-1">
        <button
          class="hover:text-primary-500 transition-colors whitespace-nowrap px-1 py-0.5 rounded"
          :class="!currentCategory ? 'font-semibold text-primary-600 bg-primary-50 dark:bg-primary-900/20' : 'text-muted-500'"
          @click="navigateToBreadcrumb(null)"
        >
          الرئيسية
        </button>
        <template v-for="(crumb, index) in breadcrumbs" :key="crumb.id">
          <Icon name="ph:caret-left" class="w-3 h-3 text-muted-400 flex-shrink-0" />
          <button
            class="hover:text-primary-500 transition-colors whitespace-nowrap px-1 py-0.5 rounded"
            :class="index === breadcrumbs.length - 1 ? 'font-semibold text-primary-600 bg-primary-50 dark:bg-primary-900/20' : 'text-muted-500'"
            @click="navigateToBreadcrumb(crumb)"
          >
            {{ crumb.name }}
          </button>
        </template>
      </div>
    </div>

    <!-- Category list -->
    <div class="flex-1 overflow-y-auto p-2">
      <!-- Loading -->
      <div v-if="loadingTree || loadingChildren" class="flex items-center justify-center py-8">
        <BasePlaceload class="w-8 h-8 rounded-full" />
      </div>

      <!-- Empty state -->
      <div v-else-if="categories.length === 0" class="text-center py-8">
        <Icon name="ph:folder-dashed-duotone" class="w-12 h-12 text-muted-300 mx-auto mb-2" />
        <p class="text-sm text-muted-400">لا توجد تصنيفات</p>
        <BaseButton
          size="sm"
          color="primary"
          class="mt-3"
          @click="openAddCategoryModal"
        >
          <Icon name="ph:plus" class="w-4 h-4 ml-1" />
          إضافة تصنيف
        </BaseButton>
      </div>

      <!-- Categories -->
      <div v-else class="space-y-1">
        <div
          v-for="category in categories"
          :key="category.id"
          class="group"
        >
          <div
            class="flex items-center gap-2 p-2 rounded-lg hover:bg-muted-100 dark:hover:bg-muted-800 cursor-pointer transition-colors"
          >
            <!-- Folder icon -->
            <div class="flex-shrink-0">
              <Icon
                :name="category.childrenCount > 0 ? 'ph:folder-notch-duotone' : 'ph:folder-duotone'"
                class="w-5 h-5 text-amber-500"
              />
            </div>

            <!-- Name and info -->
            <div class="flex-1 min-w-0" @click="navigateToCategory(category)">
              <p class="text-sm font-medium text-muted-800 dark:text-muted-100 truncate">
                {{ category.name }}
              </p>
              <p class="text-xs text-muted-400">
                {{ category.childrenCount }} تصنيفات فرعية
                <span v-if="category.reportsCount > 0">
                  - {{ category.reportsCount }} ملفات
                </span>
              </p>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <BaseButtonIcon
                size="xs"
                rounded="lg"
                data-nui-tooltip="إضافة ملف"
                @click.stop="handleAddReport(category)"
              >
                <Icon name="ph:file-plus" class="w-3 h-3" />
              </BaseButtonIcon>
              <BaseButtonIcon
                size="xs"
                rounded="lg"
                data-nui-tooltip="فتح"
                @click.stop="navigateToCategory(category)"
              >
                <Icon name="ph:arrow-left" class="w-3 h-3" />
              </BaseButtonIcon>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Category Modal -->
    <TairoModal :open="showAddCategoryModal" size="sm" @close="showAddCategoryModal = false">
      <template #header>
        <div class="flex items-center gap-2">
          <Icon name="ph:folder-plus-duotone" class="w-5 h-5 text-primary-500" />
          <span>إضافة تصنيف جديد</span>
        </div>
      </template>

      <div class="p-4 space-y-4">
        <p v-if="currentCategory" class="text-sm text-muted-500">
          سيتم إضافة التصنيف داخل: <span class="font-semibold">{{ currentCategory.name }}</span>
        </p>
        <p v-else class="text-sm text-muted-500">
          سيتم إضافة التصنيف في المستوى الرئيسي
        </p>

        <BaseInput
          v-model="addCategoryForm.name"
          label="اسم التصنيف"
          placeholder="أدخل اسم التصنيف"
        />

        <BaseTextarea
          v-model="addCategoryForm.description"
          label="الوصف (اختياري)"
          placeholder="أدخل وصف التصنيف"
          rows="2"
        />
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <BaseButton color="muted" @click="showAddCategoryModal = false">إلغاء</BaseButton>
          <BaseButton
            color="primary"
            :loading="savingCategory"
            :disabled="!addCategoryForm.name"
            @click="saveCategory"
          >
            حفظ
          </BaseButton>
        </div>
      </template>
    </TairoModal>
  </div>
</template>
