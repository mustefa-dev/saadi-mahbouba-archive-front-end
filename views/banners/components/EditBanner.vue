<script setup lang="ts">
import axios from '~/services/app-client/axios';
import type { Banner } from '~/types/banners';

const props = defineProps<{
  banner: Banner;
}>();

const emit = defineEmits<{
  edited: [];
}>();

const helpers = useHelpers();
const apiPaths = useApiPaths();
const isOpen = ref(false);
const isLoading = ref(false);
const imagePreview = ref<string | null>(null);

const formData = reactive({
  title: '',
  description: '',
  linkUrl: '',
  type: 0,
  order: 1,
  isActive: true,
  startDate: '',
  endDate: '',
});

const imageFile = ref<File | null>(null);

watch(isOpen, (newVal) => {
  if (newVal && props.banner) {
    formData.title = props.banner.title || '';
    formData.description = props.banner.description || '';
    formData.linkUrl = props.banner.linkUrl || '';
    formData.type = props.banner.type;
    formData.order = props.banner.order;
    formData.isActive = props.banner.isActive;
    formData.startDate = props.banner.startDate?.split('T')[0] || '';
    formData.endDate = props.banner.endDate?.split('T')[0] || '';
    imagePreview.value = props.banner.imageUrl ? apiPaths.getAsset(props.banner.imageUrl) : null;
    imageFile.value = null;
  }
});

const handleImageChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    imageFile.value = file;
    imagePreview.value = URL.createObjectURL(file);
  }
};

const editBanner = async () => {
  if (!formData.title) {
    helpers.setErrorMessage(null, 'ar', 'Title is required', 'العنوان مطلوب');
    return;
  }

  isLoading.value = true;
  try {
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('linkUrl', formData.linkUrl);
    data.append('type', formData.type.toString());
    data.append('order', formData.order.toString());
    data.append('isActive', formData.isActive.toString());

    if (formData.startDate) {
      data.append('startDate', formData.startDate);
    }
    if (formData.endDate) {
      data.append('endDate', formData.endDate);
    }
    if (imageFile.value) {
      data.append('image', imageFile.value);
    }

    await axios.put(apiPaths.bannerById(props.banner.id), data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    helpers.setSuccessMessage('ar', 'Banner updated successfully', 'تم تحديث البانر بنجاح');
    isOpen.value = false;
    emit('edited');
  } catch (error: any) {
    helpers.setErrorMessage(error, 'ar', 'Failed to update banner', 'فشل تحديث البانر');
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div>
    <BaseButton size="sm" color="primary" variant="pastel" @click="isOpen = true">
      <Icon name="ph:pencil" class="size-4" />
    </BaseButton>

    <TairoModal :open="isOpen" size="lg" @close="isOpen = false">
      <template #header>
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3 class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white">
            تعديل البانر
          </h3>
          <BaseButtonClose @click="isOpen = false" />
        </div>
      </template>

      <form @submit.prevent="editBanner" class="p-4 md:p-6 space-y-4">
        <BaseInput
          v-model="formData.title"
          label="العنوان"
          placeholder="أدخل عنوان البانر"
          :disabled="isLoading"
          required
        />

        <BaseTextarea
          v-model="formData.description"
          label="الوصف (اختياري)"
          placeholder="أدخل وصف البانر"
          :disabled="isLoading"
          rows="2"
        />

        <BaseInput
          v-model="formData.linkUrl"
          label="رابط الإجراء (اختياري)"
          placeholder="https://example.com"
          :disabled="isLoading"
        />

        <div class="grid grid-cols-2 gap-4">
          <BaseSelect v-model="formData.type" label="النوع">
            <option :value="0">ترويجي</option>
            <option :value="1">معلوماتي</option>
            <option :value="2">إعلان</option>
            <option :value="3">إعلاني</option>
          </BaseSelect>

          <BaseInput
            v-model.number="formData.order"
            type="number"
            label="الترتيب"
            min="1"
            :disabled="isLoading"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <BaseInput
            v-model="formData.startDate"
            type="date"
            label="تاريخ البداية (اختياري)"
            :disabled="isLoading"
          />
          <BaseInput
            v-model="formData.endDate"
            type="date"
            label="تاريخ النهاية (اختياري)"
            :disabled="isLoading"
          />
        </div>

        <div>
          <label class="nui-label pb-1 text-[0.825rem]">صورة البانر</label>
          <div class="relative">
            <input
              type="file"
              accept="image/*"
              @change="handleImageChange"
              class="absolute inset-0 opacity-0 cursor-pointer z-10"
              :disabled="isLoading"
            />
            <div class="border-2 border-dashed border-muted-300 dark:border-muted-600 rounded-lg p-4 text-center hover:border-primary-500 transition-colors">
              <div v-if="imagePreview" class="relative">
                <img :src="imagePreview" alt="Preview" class="max-h-32 mx-auto rounded-lg" />
                <button
                  type="button"
                  class="absolute top-0 right-0 bg-danger-500 text-white rounded-full p-1"
                  @click.stop="imageFile = null; imagePreview = null"
                >
                  <Icon name="ph:x" class="size-4" />
                </button>
              </div>
              <div v-else class="py-4">
                <Icon name="ph:upload-simple" class="size-8 text-muted-400 mx-auto mb-2" />
                <p class="text-sm text-muted-500">اضغط أو اسحب صورة هنا</p>
              </div>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <BaseCheckbox v-model="formData.isActive" :disabled="isLoading" />
          <span class="text-sm text-muted-600 dark:text-muted-300">نشط</span>
        </div>

        <div class="flex gap-x-2 justify-end pt-4 border-t">
          <BaseButton type="button" color="default" @click="isOpen = false">
            إلغاء
          </BaseButton>
          <BaseButton
            type="submit"
            color="primary"
            :loading="isLoading"
            :disabled="isLoading"
          >
            حفظ
          </BaseButton>
        </div>
      </form>
    </TairoModal>
  </div>
</template>
