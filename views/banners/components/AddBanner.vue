<script setup lang="ts">
import axios from '~/services/app-client/axios';
import { BannerType, BannerTypeLabels } from '~/types/banners';

const emit = defineEmits<{
  added: [];
}>();

const helpers = useHelpers();
const apiPaths = useApiPaths();
const isOpen = ref(false);
const isLoading = ref(false);
const imagePreview = ref<string | null>(null);
const imageInputRef = ref<HTMLInputElement | null>(null);

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

const resetForm = () => {
  formData.title = '';
  formData.description = '';
  formData.linkUrl = '';
  formData.type = 0;
  formData.order = 1;
  formData.isActive = true;
  formData.startDate = '';
  formData.endDate = '';
  imageFile.value = null;
  imagePreview.value = null;
};

const handleImageChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    imageFile.value = file;
    imagePreview.value = URL.createObjectURL(file);
  }
};

const removeImage = () => {
  imageFile.value = null;
  imagePreview.value = null;
};

const addBanner = async () => {
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

    await axios.post(apiPaths.banners, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    helpers.setSuccessMessage('ar', 'Banner created successfully', 'تم إنشاء البانر بنجاح');
    isOpen.value = false;
    resetForm();
    emit('added');
  } catch (error: any) {
    helpers.setErrorMessage(error, 'ar', 'Failed to create banner', 'فشل إنشاء البانر');
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div>
    <BaseButton color="primary" @click="isOpen = true">
      <Icon name="ph:plus" class="size-4 me-1" />
      إضافة بانر
    </BaseButton>

    <TairoModal :open="isOpen" size="lg" @close="isOpen = false">
      <template #header>
        <div dir="rtl" class="flex w-full items-center justify-between p-4 border-b border-muted-200 dark:border-muted-700">
          <div class="flex items-center gap-3">
            <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-500/20">
              <Icon name="ph:image-square-duotone" class="size-5 text-primary-500" />
            </div>
            <div>
              <h3 class="font-heading text-muted-900 text-base font-semibold dark:text-white">
                إضافة بانر جديد
              </h3>
              <p class="text-xs text-muted-400">أضف بانر ترويجي أو إعلاني للتطبيق</p>
            </div>
          </div>
          <BaseButtonClose @click="isOpen = false" />
        </div>
      </template>

      <form dir="rtl" @submit.prevent="addBanner" class="p-4 space-y-4">
        <!-- Image Upload - Compact horizontal -->
        <div class="flex items-start gap-4">
          <div
            class="relative shrink-0 w-32 h-20 border-2 border-dashed border-muted-300 dark:border-muted-600 rounded-lg overflow-hidden cursor-pointer hover:border-primary-500 transition-colors group"
            @click="imageInputRef?.click()"
          >
            <input
              ref="imageInputRef"
              type="file"
              accept="image/*"
              @change="handleImageChange"
              class="hidden"
              :disabled="isLoading"
            />
            <div v-if="imagePreview" class="w-full h-full">
              <img :src="imagePreview" alt="Preview" class="w-full h-full object-cover" />
              <button
                type="button"
                class="absolute top-1 left-1 bg-danger-500/90 text-white rounded-full p-1 hover:bg-danger-600 transition-colors opacity-0 group-hover:opacity-100"
                @click.stop="removeImage"
              >
                <Icon name="ph:x" class="size-3" />
              </button>
            </div>
            <div v-else class="w-full h-full flex flex-col items-center justify-center">
              <Icon name="ph:image-duotone" class="size-6 text-muted-300" />
              <span class="text-[10px] text-muted-400 mt-1">اختر صورة</span>
            </div>
          </div>
          <div class="flex-1 space-y-2">
            <BaseInput
              v-model="formData.title"
              label="العنوان"
              placeholder="عنوان البانر"
              :disabled="isLoading"
              size="sm"
              required
            />
            <BaseInput
              v-model="formData.linkUrl"
              label="الرابط (اختياري)"
              placeholder="https://..."
              :disabled="isLoading"
              size="sm"
            />
          </div>
        </div>

        <!-- Description -->
        <BaseTextarea
          v-model="formData.description"
          label="الوصف (اختياري)"
          placeholder="وصف مختصر للبانر"
          :disabled="isLoading"
          rows="2"
        />

        <!-- Settings Row -->
        <div class="grid grid-cols-4 gap-3">
          <BaseSelect v-model="formData.type" label="النوع" size="sm">
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
            size="sm"
          />

          <BaseInput
            v-model="formData.startDate"
            type="date"
            label="من"
            :disabled="isLoading"
            size="sm"
          />

          <BaseInput
            v-model="formData.endDate"
            type="date"
            label="إلى"
            :disabled="isLoading"
            size="sm"
          />
        </div>

        <!-- Active Toggle -->
        <div class="flex items-center justify-between py-2 px-3 bg-muted-50 dark:bg-muted-800/50 rounded-lg">
          <div class="flex items-center gap-2">
            <Icon name="ph:toggle-left" class="size-4 text-muted-400" />
            <span class="text-sm text-muted-600 dark:text-muted-300">تفعيل البانر</span>
          </div>
          <BaseCheckbox v-model="formData.isActive" :disabled="isLoading" />
        </div>

        <!-- Footer Buttons -->
        <div class="flex gap-2 justify-end pt-2 border-t border-muted-200 dark:border-muted-700">
          <BaseButton type="button" color="default" size="sm" @click="isOpen = false">
            إلغاء
          </BaseButton>
          <BaseButton
            type="submit"
            color="primary"
            size="sm"
            :loading="isLoading"
            :disabled="isLoading"
          >
            <Icon name="ph:plus" class="size-4 me-1" />
            إضافة
          </BaseButton>
        </div>
      </form>
    </TairoModal>
  </div>
</template>
