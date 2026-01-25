<script setup lang="ts">
import axios from '~/services/app-client/axios';
import type { CreateCompanyRequest } from '~/types/users';

const emit = defineEmits<{
  added: [];
}>();

const helpers = useHelpers();
const apiPaths = useApiPaths();
const isOpen = ref(false);
const isLoading = ref(false);

// Tabs for step-by-step creation
const tabs = [
  { label: 'المعلومات الأساسية', icon: 'ph:buildings' },
  { label: 'المدير المفوض', icon: 'ph:user-gear' },
  { label: 'المحامي', icon: 'ph:scales' },
  { label: 'المحاسب', icon: 'ph:calculator' },
];
const activeTab = ref(0);

const formData = reactive<CreateCompanyRequest>({
  companyName: '',
  phoneNumber: '',
  email: '',
  code: '',
  password: '',
  address: '',
  managerName: '',
  managerPhone: '',
  managerPhoneSecondary: '',
  lawyerName: '',
  lawyerPhone: '',
  lawyerPhoneSecondary: '',
  accountantName: '',
  accountantPhone: '',
  accountantPhoneSecondary: '',
});

const resetForm = () => {
  formData.companyName = '';
  formData.phoneNumber = '';
  formData.email = '';
  formData.code = '';
  formData.password = '';
  formData.address = '';
  formData.managerName = '';
  formData.managerPhone = '';
  formData.managerPhoneSecondary = '';
  formData.lawyerName = '';
  formData.lawyerPhone = '';
  formData.lawyerPhoneSecondary = '';
  formData.accountantName = '';
  formData.accountantPhone = '';
  formData.accountantPhoneSecondary = '';
  activeTab.value = 0;
};

const openModal = () => {
  resetForm();
  isOpen.value = true;
};

// Validation for required fields only
const isFormValid = computed(() => {
  return !!(
    formData.code?.trim() &&
    formData.password?.trim() &&
    formData.managerName?.trim() &&
    formData.managerPhone?.trim()
  );
});

const handleSubmit = async () => {
  if (!isFormValid.value) {
    helpers.setErrorMessage(null, 'ar', 'Please fill all required fields', 'يرجى ملء جميع الحقول المطلوبة');
    return;
  }

  isLoading.value = true;
  try {
    const dataToSend: CreateCompanyRequest = {
      companyName: formData.companyName || undefined,
      phoneNumber: formData.phoneNumber || undefined,
      email: formData.email || undefined,
      code: formData.code,
      password: formData.password || undefined,
      address: formData.address || undefined,
      managerName: formData.managerName,
      managerPhone: formData.managerPhone,
      managerPhoneSecondary: formData.managerPhoneSecondary || undefined,
      lawyerName: formData.lawyerName || undefined,
      lawyerPhone: formData.lawyerPhone || undefined,
      lawyerPhoneSecondary: formData.lawyerPhoneSecondary || undefined,
      accountantName: formData.accountantName || undefined,
      accountantPhone: formData.accountantPhone || undefined,
      accountantPhoneSecondary: formData.accountantPhoneSecondary || undefined,
    };

    await axios.post(apiPaths.companies, dataToSend);

    helpers.setSuccessMessage('ar', 'Company created successfully', 'تم إنشاء الشركة بنجاح');
    isOpen.value = false;
    resetForm();
    emit('added');
  } catch (error: any) {
    const errorMessage = error?.response?.data?.error || error?.response?.data?.Error || 'فشل إنشاء الشركة';
    helpers.setErrorMessage(error, 'ar', 'Failed to create company', errorMessage);
  } finally {
    isLoading.value = false;
  }
};

const nextTab = () => {
  if (activeTab.value < tabs.length - 1) {
    activeTab.value++;
  }
};

const prevTab = () => {
  if (activeTab.value > 0) {
    activeTab.value--;
  }
};
</script>

<template>
  <div>
    <BaseButton
      color="primary"
      @click="openModal"
    >
      <Icon name="ph:plus" class="size-4" />
      <span>إضافة شركة</span>
    </BaseButton>

    <TairoModal :open="isOpen" size="lg" @close="isOpen = false">
      <template #header>
        <div dir="rtl" class="flex w-full items-center justify-between p-4 md:p-6">
          <h3 class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white">
            إضافة شركة جديدة
          </h3>
          <BaseButtonClose @click="isOpen = false" />
        </div>
      </template>

      <div dir="rtl" class="p-4 md:p-6">
        <!-- Step Indicator -->
        <div class="flex items-center justify-center gap-2 mb-6">
          <button
            v-for="(tab, index) in tabs"
            :key="index"
            type="button"
            class="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm"
            :class="activeTab === index
              ? 'bg-primary-500 text-white'
              : 'bg-muted-100 dark:bg-muted-700 text-muted-500 hover:bg-muted-200 dark:hover:bg-muted-600'"
            @click="activeTab = index"
          >
            <Icon :name="tab.icon" class="size-4" />
            <span class="hidden sm:inline">{{ tab.label }}</span>
            <span class="sm:hidden">{{ index + 1 }}</span>
          </button>
        </div>

        <form @submit.prevent="handleSubmit">
          <!-- Tab 0: Basic Info -->
          <div v-show="activeTab === 0" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <BaseInput
                v-model="formData.companyName"
                label="اسم الشركة"
                placeholder="أدخل اسم الشركة"
                :disabled="isLoading"
              />
              <BaseInput
                v-model="formData.phoneNumber"
                type="tel"
                label="رقم الهاتف"
                placeholder="077xxxxxxxx"
                :disabled="isLoading"
              />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <BaseInput
                v-model="formData.code"
                label="الكود (م.ش) *"
                placeholder="أدخل الكود"
                :disabled="isLoading"
                required
              />
              <BaseInput
                v-model="formData.password"
                type="password"
                label="كلمة المرور *"
                placeholder="أدخل كلمة المرور"
                :disabled="isLoading"
                required
              />
            </div>
            <BaseInput
              v-model="formData.email"
              type="email"
              label="البريد الإلكتروني"
              placeholder="أدخل البريد الإلكتروني"
              :disabled="isLoading"
            />
            <BaseInput
              v-model="formData.address"
              label="العنوان الكامل"
              placeholder="أدخل العنوان الكامل"
              :disabled="isLoading"
            />
          </div>

          <!-- Tab 1: Manager -->
          <div v-show="activeTab === 1" class="space-y-4">
            <div class="text-center mb-4">
              <Icon name="ph:user-gear" class="size-10 text-primary-500 mx-auto mb-2" />
              <h4 class="font-medium text-muted-700 dark:text-muted-300">بيانات المدير المفوض</h4>
            </div>
            <BaseInput
              v-model="formData.managerName"
              label="الاسم *"
              placeholder="اسم المدير المفوض"
              :disabled="isLoading"
              required
            />
            <div class="grid grid-cols-2 gap-4">
              <BaseInput
                v-model="formData.managerPhone"
                type="tel"
                label="رقم الهاتف *"
                placeholder="077xxxxxxxx"
                :disabled="isLoading"
                required
              />
              <BaseInput
                v-model="formData.managerPhoneSecondary"
                type="tel"
                label="رقم ثانٍ (اختياري)"
                placeholder="077xxxxxxxx"
                :disabled="isLoading"
              />
            </div>
          </div>

          <!-- Tab 2: Lawyer -->
          <div v-show="activeTab === 2" class="space-y-4">
            <div class="text-center mb-4">
              <Icon name="ph:scales" class="size-10 text-primary-500 mx-auto mb-2" />
              <h4 class="font-medium text-muted-700 dark:text-muted-300">بيانات المحامي</h4>
            </div>
            <BaseInput
              v-model="formData.lawyerName"
              label="الاسم"
              placeholder="اسم المحامي"
              :disabled="isLoading"
            />
            <div class="grid grid-cols-2 gap-4">
              <BaseInput
                v-model="formData.lawyerPhone"
                type="tel"
                label="رقم الهاتف"
                placeholder="077xxxxxxxx"
                :disabled="isLoading"
              />
              <BaseInput
                v-model="formData.lawyerPhoneSecondary"
                type="tel"
                label="رقم ثانٍ (اختياري)"
                placeholder="077xxxxxxxx"
                :disabled="isLoading"
              />
            </div>
          </div>

          <!-- Tab 3: Accountant -->
          <div v-show="activeTab === 3" class="space-y-4">
            <div class="text-center mb-4">
              <Icon name="ph:calculator" class="size-10 text-primary-500 mx-auto mb-2" />
              <h4 class="font-medium text-muted-700 dark:text-muted-300">بيانات المحاسب</h4>
            </div>
            <BaseInput
              v-model="formData.accountantName"
              label="الاسم"
              placeholder="اسم المحاسب"
              :disabled="isLoading"
            />
            <div class="grid grid-cols-2 gap-4">
              <BaseInput
                v-model="formData.accountantPhone"
                type="tel"
                label="رقم الهاتف"
                placeholder="077xxxxxxxx"
                :disabled="isLoading"
              />
              <BaseInput
                v-model="formData.accountantPhoneSecondary"
                type="tel"
                label="رقم ثانٍ (اختياري)"
                placeholder="077xxxxxxxx"
                :disabled="isLoading"
              />
            </div>
          </div>

          <!-- Navigation Buttons -->
          <div class="flex items-center justify-between pt-6 mt-6 border-t border-muted-200 dark:border-muted-700">
            <BaseButton
              v-if="activeTab > 0"
              type="button"
              color="default"
              @click="prevTab"
            >
              <Icon name="ph:arrow-right" class="size-4 me-1" />
              السابق
            </BaseButton>
            <div v-else></div>

            <div class="flex gap-2">
              <BaseButton
                type="button"
                color="default"
                @click="isOpen = false"
              >
                إلغاء
              </BaseButton>

              <BaseButton
                v-if="activeTab < tabs.length - 1"
                type="button"
                color="primary"
                @click="nextTab"
              >
                التالي
                <Icon name="ph:arrow-left" class="size-4 ms-1" />
              </BaseButton>

              <BaseButton
                v-else
                type="submit"
                color="primary"
                :loading="isLoading"
                :disabled="isLoading || !isFormValid"
              >
                <Icon name="ph:plus" class="size-4 me-1" />
                إنشاء الشركة
              </BaseButton>
            </div>
          </div>
        </form>
      </div>
    </TairoModal>
  </div>
</template>
