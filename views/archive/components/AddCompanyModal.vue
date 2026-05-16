<script setup lang="ts">
import axios from '~/services/app-client/axios';
import type { CreateCompanyRequest } from '~/types/users';
import { validatePhoneNumber } from '~/utils/helpers';

const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'success'): void;
}>();

const helpers = useHelpers();
const apiPaths = useApiPaths();
const isLoading = ref(false);
const isPasswordVisible = ref(false);

// Tabs for step-by-step creation
const tabs = ['المعلومات الأساسية', 'المدير المفوض', 'المحامي', 'المحاسب'];
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

const phoneErrors = reactive({
  phoneNumber: '',
  managerPhone: '',
  managerPhoneSecondary: '',
  lawyerPhone: '',
  lawyerPhoneSecondary: '',
  accountantPhone: '',
  accountantPhoneSecondary: '',
});

// Real-time validation watches
watch(() => formData.phoneNumber, (val) => {
  if (!val) phoneErrors.phoneNumber = '';
  else if (!validatePhoneNumber(val)) phoneErrors.phoneNumber = 'رقم الهاتف غير صحيح (10 أرقام، لا يبدأ بـ 0)';
  else phoneErrors.phoneNumber = '';
});

watch(() => formData.managerPhone, (val) => {
  if (!val) phoneErrors.managerPhone = '';
  else if (!validatePhoneNumber(val)) phoneErrors.managerPhone = 'رقم الهاتف غير صحيح';
  else phoneErrors.managerPhone = '';
});

watch(() => formData.managerPhoneSecondary, (val) => {
  if (!val) phoneErrors.managerPhoneSecondary = '';
  else if (!validatePhoneNumber(val)) phoneErrors.managerPhoneSecondary = 'رقم الهاتف غير صحيح';
  else phoneErrors.managerPhoneSecondary = '';
});

watch(() => formData.lawyerPhone, (val) => {
  if (!val) phoneErrors.lawyerPhone = '';
  else if (!validatePhoneNumber(val)) phoneErrors.lawyerPhone = 'رقم الهاتف غير صحيح';
  else phoneErrors.lawyerPhone = '';
});

watch(() => formData.lawyerPhoneSecondary, (val) => {
  if (!val) phoneErrors.lawyerPhoneSecondary = '';
  else if (!validatePhoneNumber(val)) phoneErrors.lawyerPhoneSecondary = 'رقم الهاتف غير صحيح';
  else phoneErrors.lawyerPhoneSecondary = '';
});

watch(() => formData.accountantPhone, (val) => {
  if (!val) phoneErrors.accountantPhone = '';
  else if (!validatePhoneNumber(val)) phoneErrors.accountantPhone = 'رقم الهاتف غير صحيح';
  else phoneErrors.accountantPhone = '';
});

watch(() => formData.accountantPhoneSecondary, (val) => {
  if (!val) phoneErrors.accountantPhoneSecondary = '';
  else if (!validatePhoneNumber(val)) phoneErrors.accountantPhoneSecondary = 'رقم الهاتف غير صحيح';
  else phoneErrors.accountantPhoneSecondary = '';
});

// Reset form when modal opens
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    resetForm();
    activeTab.value = 0;
  }
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
};

const validateForm = (): string | null => {
  if (!formData.companyName.trim()) return 'اسم الشركة مطلوب';
  if (!formData.phoneNumber.trim()) return 'رقم الهاتف مطلوب';
  if (!validatePhoneNumber(formData.phoneNumber)) return 'رقم هاتف الشركة غير صحيح (يجب أن يكون 10 أرقام ولا يبدأ بـ 0)';
  if (!formData.code.trim()) return 'الكود (م.ش) مطلوب';
  if (!formData.password.trim()) return 'كلمة المرور مطلوبة';
  if (formData.password.length < 6) return 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
  if (!formData.managerName.trim()) return 'اسم المدير المفوض مطلوب';
  if (!formData.managerPhone.trim()) return 'رقم هاتف المدير مطلوب';
  if (!validatePhoneNumber(formData.managerPhone)) return 'رقم هاتف المدير غير صحيح (يجب أن يكون 10 أرقام ولا يبدأ بـ 0)';
  return null;
};

const handleSubmit = async () => {
  const validationError = validateForm();
  if (validationError) {
    helpers.setErrorMessage(null, 'ar', validationError, validationError);
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
    emit('success');
    emit('close');
  } catch (error: any) {
    helpers.setErrorMessage(error, 'ar', 'Failed to create company', 'فشل إنشاء الشركة');
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
  <TairoModal :open="open" size="2xl" @close="emit('close')">
    <template #header>
      <div class="flex w-full items-center justify-between p-4 md:p-6" dir="rtl">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <Icon name="ph:buildings-duotone" class="w-6 h-6 text-primary-500" />
          </div>
          <div>
            <h3 class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white">
              إضافة شركة جديدة
            </h3>
            <p class="text-sm text-muted-400">
              أدخل بيانات الشركة الجديدة
            </p>
          </div>
        </div>
        <BaseButtonClose @click="emit('close')" />
      </div>
    </template>

    <!-- Step Indicator -->
    <div class="flex items-center justify-center gap-2 py-4 px-6 border-b border-muted-200 dark:border-muted-700"
      dir="rtl">
      <button v-for="(tab, index) in tabs" :key="index"
        class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        :class="activeTab === index
          ? 'bg-primary-500 text-white'
          : 'bg-muted-100 dark:bg-muted-800 text-muted-600 dark:text-muted-300 hover:bg-muted-200 dark:hover:bg-muted-700'" @click="activeTab = index">
        <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs"
          :class="activeTab === index ? 'bg-white/20' : 'bg-muted-200 dark:bg-muted-700'">
          {{ index + 1 }}
        </span>
        {{ tab }}
      </button>
    </div>

    <form @submit.prevent="handleSubmit" class="p-4 md:p-6 space-y-6 max-h-[50vh] overflow-y-auto" dir="rtl">
      <!-- Tab 0: Basic Info -->
      <div v-show="activeTab === 0" class="space-y-4">
        <div class="grid grid-cols-2 md:grid-cols-2 gap-4">
          <BaseInput v-model="formData.companyName" label="اسم الشركة *" placeholder="أدخل اسم الشركة"
            :disabled="isLoading" />
          <div>
            <BaseInput v-model="formData.phoneNumber" type="tel" label="رقم الهاتف (10 أرقام) *" placeholder="77XXXXXXXX"
              :disabled="isLoading" :classes="{ input: phoneErrors.phoneNumber ? 'border-danger-500' : '' }" />
            <p v-if="phoneErrors.phoneNumber" class="text-danger-500 text-[10px] mt-1">{{ phoneErrors.phoneNumber }}</p>
          </div>
        </div>

        <BaseInput v-model="formData.email" type="email" label="البريد الإلكتروني" placeholder="example@email.com"
          :disabled="isLoading" />

        <div class="grid grid-cols-2 md:grid-cols-2 gap-4">

          <BaseInput v-model="formData.code" label="كود (م.ش) *" placeholder="أدخل الكود" :disabled="isLoading" />
          <BaseInput v-model="formData.password" :type="isPasswordVisible ? 'text' : 'password'" label="كلمة المرور *"
            placeholder="أدخل كلمة المرور" :disabled="isLoading">
            <template #action>
              <button type="button"
                class="m-auto h-full text-muted-400 hover:text-primary-500 absolute end-0 top-0 z-[1] flex size-10 items-center justify-center transition-colors duration-300"
                @click="isPasswordVisible = !isPasswordVisible">
                <Icon :name="isPasswordVisible ? 'ph:eye-slash' : 'ph:eye'" class="size-5" />
              </button>
            </template>
          </BaseInput>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

          <BaseInput v-model="formData.address" label="العنوان الكامل" placeholder="أدخل العنوان الكامل"
            :disabled="isLoading" />
        </div>
      </div>

      <!-- Tab 1: Manager -->
      <div v-show="activeTab === 1" class="space-y-4">
        <div class="p-4 bg-violet-50 dark:bg-violet-900/20 rounded-xl border border-violet-200 dark:border-violet-800">
          <div class="flex items-center gap-2 mb-4 text-violet-600 dark:text-violet-400">
            <Icon name="ph:user-circle-duotone" class="w-5 h-5" />
            <span class="font-medium">معلومات المدير المفوض</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <BaseInput v-model="formData.managerName" label="الاسم *" placeholder="اسم المدير المفوض"
              :disabled="isLoading" />
            <div class="grid grid-cols-2 md:grid-cols-1 gap-4">
              <div>
                <BaseInput v-model="formData.managerPhone" type="tel" label="رقم الهاتف (10 أرقام) *"
                  placeholder="77XXXXXXXX" :disabled="isLoading"
                  :classes="{ input: phoneErrors.managerPhone ? 'border-danger-500' : '' }" />
                <p v-if="phoneErrors.managerPhone" class="text-danger-500 text-[10px] mt-1">{{ phoneErrors.managerPhone }}</p>
              </div>
              <div>
                <BaseInput v-model="formData.managerPhoneSecondary" type="tel" label="رقم ثانٍ (10 أرقام)"
                  placeholder="77XXXXXXXX" :disabled="isLoading"
                  :classes="{ input: phoneErrors.managerPhoneSecondary ? 'border-danger-500' : '' }" />
                <p v-if="phoneErrors.managerPhoneSecondary" class="text-danger-500 text-[10px] mt-1">{{ phoneErrors.managerPhoneSecondary }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab 2: Lawyer -->
      <div v-show="activeTab === 2" class="space-y-4">
        <div class="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
          <div class="flex items-center gap-2 mb-4 text-purple-600 dark:text-purple-400">
            <Icon name="ph:scales-duotone" class="w-5 h-5" />
            <span class="font-medium">معلومات المحامي</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <BaseInput v-model="formData.lawyerName" label="الاسم" placeholder="اسم المحامي" :disabled="isLoading" />
            <div class="grid grid-cols-2 md:grid-cols-1 gap-4">
              <div>
                <BaseInput v-model="formData.lawyerPhone" type="tel" label="رقم الهاتف (10 أرقام)" placeholder="77XXXXXXXX"
                  :disabled="isLoading" :classes="{ input: phoneErrors.lawyerPhone ? 'border-danger-500' : '' }" />
                <p v-if="phoneErrors.lawyerPhone" class="text-danger-500 text-[10px] mt-1">{{ phoneErrors.lawyerPhone }}</p>
              </div>
              <div>
                <BaseInput v-model="formData.lawyerPhoneSecondary" type="tel" label="رقم ثانٍ (10 أرقام)"
                  placeholder="77XXXXXXXX" :disabled="isLoading"
                  :classes="{ input: phoneErrors.lawyerPhoneSecondary ? 'border-danger-500' : '' }" />
                <p v-if="phoneErrors.lawyerPhoneSecondary" class="text-danger-500 text-[10px] mt-1">{{ phoneErrors.lawyerPhoneSecondary }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab 3: Accountant -->
      <div v-show="activeTab === 3" class="space-y-4">
        <div class="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-xl border border-teal-200 dark:border-teal-800">
          <div class="flex items-center gap-2 mb-4 text-teal-600 dark:text-teal-400">
            <Icon name="ph:bank-duotone" class="w-5 h-5" />
            <span class="font-medium">معلومات المحاسب</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <BaseInput v-model="formData.accountantName" label="الاسم" placeholder="اسم المحاسب"
              :disabled="isLoading" />

              <div class="grid grid-cols-2 md:grid-cols-1 gap-4">
              <div>
                <BaseInput v-model="formData.accountantPhone" type="tel" label="رقم الهاتف (10 أرقام)"
                  placeholder="77XXXXXXXX" :disabled="isLoading"
                  :classes="{ input: phoneErrors.accountantPhone ? 'border-danger-500' : '' }" />
                <p v-if="phoneErrors.accountantPhone" class="text-danger-500 text-[10px] mt-1">{{ phoneErrors.accountantPhone }}</p>
              </div>
              <div>
                <BaseInput v-model="formData.accountantPhoneSecondary" type="tel" label="رقم ثانٍ (10 أرقام)"
                  placeholder="77XXXXXXXX" :disabled="isLoading"
                  :classes="{ input: phoneErrors.accountantPhoneSecondary ? 'border-danger-500' : '' }" />
                <p v-if="phoneErrors.accountantPhoneSecondary" class="text-danger-500 text-[10px] mt-1">{{ phoneErrors.accountantPhoneSecondary }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>

    <template #footer>
      <div class="flex items-center justify-end gap-2 p-4 border-t border-muted-200 dark:border-muted-700" dir="rtl">
        <BaseButton v-if="activeTab > 0" type="button" color="muted" @click="prevTab" class="me-auto">
          <Icon name="ph:arrow-right" class="w-4 h-4 ml-1" />
          السابق
        </BaseButton>

        <div class="flex gap-2">

          <BaseButton v-if="activeTab < tabs.length - 1" type="button" color="primary" @click="nextTab">
            التالي
            <Icon name="ph:arrow-left" class="w-4 h-4 mr-1" />
          </BaseButton>

          <BaseButton v-else type="button" color="primary" :loading="isLoading" :disabled="isLoading"
            @click="handleSubmit">
            <Icon name="ph:plus" class="w-4 h-4 ml-1" />
            إنشاء الشركة
          </BaseButton>
        </div>
      </div>
    </template>
  </TairoModal>
</template>
