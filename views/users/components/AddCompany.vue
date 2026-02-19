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

const phoneRegex = /^(077|078|079)\d{8}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateForm = (): string | null => {
  // Tab 0: Basic Info - Required fields
  if (!formData.companyName.trim()) return 'اسم الشركة مطلوب';
  if (!formData.phoneNumber.trim()) return 'رقم هاتف الشركة مطلوب';
  if (!phoneRegex.test(formData.phoneNumber.trim())) return 'رقم الهاتف غير صالح (مثال: 07712345678)';
  if (!formData.code.trim()) return 'الكود (م.ش) مطلوب';
  if (!formData.password.trim()) return 'كلمة المرور مطلوبة';
  if (formData.password.length < 6) return 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
  // Optional field validation (only if filled)
  if (formData.email?.trim() && !emailRegex.test(formData.email.trim())) return 'البريد الإلكتروني غير صالح';
  // Tab 1: Manager - Required fields
  if (!formData.managerName.trim()) return 'اسم المدير المفوض مطلوب';
  if (!formData.managerPhone.trim()) return 'رقم هاتف المدير مطلوب';
  if (!phoneRegex.test(formData.managerPhone.trim())) return 'رقم هاتف المدير غير صالح';
  if (formData.managerPhoneSecondary?.trim() && !phoneRegex.test(formData.managerPhoneSecondary.trim())) return 'رقم الهاتف الثاني للمدير غير صالح';
  // Tab 2: Lawyer - Optional (validate only if filled)
  if (formData.lawyerPhone?.trim() && !phoneRegex.test(formData.lawyerPhone.trim())) return 'رقم هاتف المحامي غير صالح';
  if (formData.lawyerPhoneSecondary?.trim() && !phoneRegex.test(formData.lawyerPhoneSecondary.trim())) return 'رقم الهاتف الثاني للمحامي غير صالح';
  // Tab 3: Accountant - Optional (validate only if filled)
  if (formData.accountantPhone?.trim() && !phoneRegex.test(formData.accountantPhone.trim())) return 'رقم هاتف المحاسب غير صالح';
  if (formData.accountantPhoneSecondary?.trim() && !phoneRegex.test(formData.accountantPhoneSecondary.trim())) return 'رقم الهاتف الثاني للمحاسب غير صالح';
  return null;
};

const isFormValid = computed(() => {
  return validateForm() === null;
});

const handleSubmit = async () => {
  const error = validateForm();
  if (error) {
    helpers.setErrorMessage(null, 'ar', error, error);
    return;
  }

  isLoading.value = true;
  try {
    const dataToSend: CreateCompanyRequest = {
      companyName: formData.companyName,
      phoneNumber: formData.phoneNumber,
      email: formData.email,
      code: formData.code,
      password: formData.password,
      address: formData.address,
      managerName: formData.managerName,
      managerPhone: formData.managerPhone,
      managerPhoneSecondary: formData.managerPhoneSecondary || undefined,
      lawyerName: formData.lawyerName,
      lawyerPhone: formData.lawyerPhone,
      lawyerPhoneSecondary: formData.lawyerPhoneSecondary || undefined,
      accountantName: formData.accountantName,
      accountantPhone: formData.accountantPhone,
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
                label="اسم الشركة *"
                placeholder="أدخل اسم الشركة"
                :disabled="isLoading"
                required
              />
              <BaseInput
                v-model="formData.phoneNumber"
                type="tel"
                label="رقم هاتف الشركة *"
                placeholder="077xxxxxxxx"
                :disabled="isLoading"
                required
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
                placeholder="أدخل كلمة المرور (6 أحرف على الأقل)"
                :disabled="isLoading"
                required
              />
            </div>
            <BaseInput
              v-model="formData.email"
              type="email"
              label="البريد الإلكتروني (اختياري)"
              placeholder="أدخل البريد الإلكتروني"
              :disabled="isLoading"
            />
            <BaseInput
              v-model="formData.address"
              label="العنوان الكامل (اختياري)"
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

          <!-- Tab 2: Lawyer (Optional) -->
          <div v-show="activeTab === 2" class="space-y-4">
            <div class="text-center mb-4">
              <Icon name="ph:scales" class="size-10 text-primary-500 mx-auto mb-2" />
              <h4 class="font-medium text-muted-700 dark:text-muted-300">بيانات المحامي (اختياري)</h4>
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
                label="رقم ثانٍ"
                placeholder="077xxxxxxxx"
                :disabled="isLoading"
              />
            </div>
          </div>

          <!-- Tab 3: Accountant (Optional) -->
          <div v-show="activeTab === 3" class="space-y-4">
            <div class="text-center mb-4">
              <Icon name="ph:calculator" class="size-10 text-primary-500 mx-auto mb-2" />
              <h4 class="font-medium text-muted-700 dark:text-muted-300">بيانات المحاسب (اختياري)</h4>
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
                label="رقم ثانٍ"
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
