<script setup lang="ts">
const props = defineProps({
  cols:Number
});
</script>
<template>
    <TairoTableRow :hoverable="false">
    <TairoTableCell :colspan="props.cols">
            <BasePlaceholderPage title="لا توجد نتائج"
                subtitle="لا توجد بيانات تم اضافتها او حدث خطأ ما اثناء الوصول للبيانات">
            </BasePlaceholderPage>
        </TairoTableCell>
    </TairoTableRow>
</template>
