<script setup lang="ts">
import type { Category } from '~/types/reports';

// Define component name for recursion
defineOptions({
  name: 'CategoryTreeNode'
});

const props = defineProps<{
  category: Category;
  level: number;
  expandedIds: Set<string>;
}>();

const emit = defineEmits<{
  toggle: [id: string];
  add: [parent: Category];
  edit: [category: Category];
  delete: [category: Category];
}>();

const hasChildren = computed(() => (props.category.childrenCount || 0) > 0);
const isExpanded = computed(() => props.expandedIds.has(props.category.id));
const children = computed(() => props.category.children || []);

const paddingLeft = computed(() => `${props.level * 24 + 12}px`);

const toggle = () => {
  if (hasChildren.value) {
    emit('toggle', props.category.id);
  }
};
</script>

<template>
  <div>
    <!-- Node -->
    <div
      class="flex items-center gap-2 py-3 px-3 border-b border-muted-100 dark:border-muted-800 hover:bg-muted-50 dark:hover:bg-muted-900/50 transition-colors group"
      :style="{ paddingRight: paddingLeft }"
      dir="rtl"
    >
      <!-- Expand/Collapse button -->
      <button
        v-if="hasChildren"
        class="w-6 h-6 flex items-center justify-center rounded hover:bg-muted-200 dark:hover:bg-muted-700 transition-colors"
        @click="toggle"
      >
        <Icon
          :name="isExpanded ? 'ph:caret-down' : 'ph:caret-left'"
          class="w-4 h-4 text-muted-500"
        />
      </button>
      <div v-else class="w-6" />

      <!-- Folder icon -->
      <Icon
        :name="hasChildren ? (isExpanded ? 'ph:folder-open-duotone' : 'ph:folder-duotone') : 'ph:folder-duotone'"
        class="w-5 h-5 text-amber-500 flex-shrink-0"
      />

      <!-- Name & Info -->
      <div class="flex-1 min-w-0 cursor-pointer" @click="toggle">
        <div class="flex items-center gap-2">
          <span class="font-medium text-muted-800 dark:text-muted-100">{{ category.name }}</span>
          <BaseTag v-if="!category.isActive" color="danger" size="sm" flavor="pastel">
            غير نشط
          </BaseTag>
        </div>
        <div class="text-xs text-muted-400 mt-0.5">
          <span v-if="category.childrenCount">{{ category.childrenCount }} فرعي</span>
          <span v-if="category.childrenCount && category.reportsCount"> | </span>
          <span v-if="category.reportsCount">{{ category.reportsCount }} ملف</span>
          <span v-if="!category.childrenCount && !category.reportsCount">فارغ</span>
        </div>
      </div>

      <!-- Level badge -->
      <span class="text-xs text-muted-400 bg-muted-100 dark:bg-muted-800 px-2 py-0.5 rounded">
        L{{ level }}
      </span>

      <!-- Actions -->
      <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <BaseButtonIcon
          size="sm"
          color="success"
          data-nui-tooltip="إضافة فرعي"
          @click.stop="emit('add', category)"
        >
          <Icon name="ph:plus" class="h-4 w-4" />
        </BaseButtonIcon>
        <BaseButtonIcon
          size="sm"
          color="warning"
          data-nui-tooltip="تعديل"
          @click.stop="emit('edit', category)"
        >
          <Icon name="ph:pencil-simple" class="h-4 w-4" />
        </BaseButtonIcon>
        <BaseButtonIcon
          size="sm"
          color="danger"
          data-nui-tooltip="حذف"
          @click.stop="emit('delete', category)"
        >
          <Icon name="ph:trash" class="h-4 w-4" />
        </BaseButtonIcon>
      </div>
    </div>

    <!-- Children (recursive) -->
    <div v-if="isExpanded && children.length > 0">
      <CategoryTreeNode
        v-for="child in children"
        :key="child.id"
        :category="child"
        :level="level + 1"
        :expanded-ids="expandedIds"
        @toggle="emit('toggle', $event)"
        @add="emit('add', $event)"
        @edit="emit('edit', $event)"
        @delete="emit('delete', $event)"
      />
    </div>
  </div>
</template>
