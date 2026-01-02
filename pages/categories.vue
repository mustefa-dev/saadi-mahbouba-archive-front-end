<script setup lang="ts">
import CategoryTree from '~/views/categories/components/CategoryTree.vue';

useHead({
  title: "إدارة التصنيفات"
});

definePageMeta({
  title: "التصنيفات"
});
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <BaseHeading size="2xl" weight="bold">إدارة التصنيفات</BaseHeading>
        <BaseParagraph size="sm" class="text-muted-400">
          إدارة تصنيفات الأرشيف بشكل شجري متعدد المستويات
        </BaseParagraph>
      </div>
    </div>

    <BaseCard class="p-6">
      <CategoryTree />
    </BaseCard>
  </div>
</template>
