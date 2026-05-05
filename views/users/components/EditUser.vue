<script setup lang="ts">
import axios from '~/services/app-client/axios';
import type { User } from '~/types/users';
import { UserStatus } from '~/types/users';
import { validatePhoneNumber } from '~/utils/helpers';

const props = defineProps<{
  user: User;
}>();

const emit = defineEmits<{
  edited: [];
}>();

const helpers = useHelpers();
const isOpen = ref(false);
const isLoading = ref(false);
const activeTab = ref(0);
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
const formData = reactive({
  fullName: '',
  phoneNumber: '',
  email: '',
  companyName: '',
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

watch(() => formData.phoneNumber, (val) => {
  if (!val) phoneErrors.phoneNumber = '';
  else if (!validatePhoneNumber(val)) phoneErrors.phoneNumber = 'رقم الهاتف يجب أن يتكون من 10 أرقام ولا يبدأ بـ 0';
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



const isCompanyUser = computed(() => props.user.role === 'User' || props.user.role === '1');

const tabs = computed(() => {
  if (isCompanyUser.value) {
    return ['المعلومات الأساسية', 'المدير المفوض', 'المحامي', 'المحاسب'];
  }
  return ['المعلومات الأساسية'];
});

watch(isOpen, (newVal) => {
  if (newVal && props.user) {
    activeTab.value = 0;
    formData.fullName = props.user.fullName || '';
    formData.phoneNumber = props.user.phoneNumber || '';
    formData.email = props.user.email || '';
    formData.companyName = props.user.companyName || '';
    formData.code = props.user.code || '';
    formData.password = props.user.passwordPlain || '';
    formData.address = props.user.address || '';
    formData.managerName = props.user.managerName || '';
    formData.managerPhone = props.user.managerPhone || '';
    formData.managerPhoneSecondary = props.user.managerPhoneSecondary || '';
    formData.lawyerName = props.user.lawyerName || '';
    formData.lawyerPhone = props.user.lawyerPhone || '';
    formData.lawyerPhoneSecondary = props.user.lawyerPhoneSecondary || '';
    formData.accountantName = props.user.accountantName || '';
    formData.accountantPhone = props.user.accountantPhone || '';
    formData.accountantPhoneSecondary = props.user.accountantPhoneSecondary || '';
    
    // Reset errors
    Object.keys(phoneErrors).forEach(key => {
      phoneErrors[key as keyof typeof phoneErrors] = '';
    });
  }
});

const validateForm = (): string | null => {
  if (isCompanyUser.value) {
    if (!formData.phoneNumber.trim()) return 'رقم هاتف الشركة مطلوب';
    if (!validatePhoneNumber(formData.phoneNumber)) return 'رقم الهاتف غير صحيح (يجب أن يكون 10 أرقام ولا يبدأ بـ 0)';
    
    if (formData.managerPhone && !validatePhoneNumber(formData.managerPhone)) return 'رقم هاتف المدير غير صحيح';
    if (formData.managerPhoneSecondary && !validatePhoneNumber(formData.managerPhoneSecondary)) return 'رقم هاتف المدير الثاني غير صحيح';
    
    if (formData.lawyerPhone && !validatePhoneNumber(formData.lawyerPhone)) return 'رقم هاتف المحامي غير صحيح';
    if (formData.lawyerPhoneSecondary && !validatePhoneNumber(formData.lawyerPhoneSecondary)) return 'رقم هاتف المحامي الثاني غير صحيح';
    
    if (formData.accountantPhone && !validatePhoneNumber(formData.accountantPhone)) return 'رقم هاتف المحاسب غير صحيح';
    if (formData.accountantPhoneSecondary && !validatePhoneNumber(formData.accountantPhoneSecondary)) return 'رقم هاتف المحاسب الثاني غير صحيح';
  } else {
    if (!formData.phoneNumber.trim()) return 'رقم الهاتف مطلوب';
    if (!validatePhoneNumber(formData.phoneNumber)) return 'رقم الهاتف غير صحيح (يجب أن يكون 10 أرقام ولا يبدأ بـ 0)';
  }
  return null;
};

const editUser = async () => {
  const validationError = validateForm();
  if (validationError) {
    helpers.setErrorMessage(null, 'ar', validationError, validationError);
    return;
  }

  isLoading.value = true;
  try {
    const apiPaths = useApiPaths();
    const dataToSend: Record<string, any> = {
      fullName: formData.fullName,
      phoneNumber: formData.phoneNumber,
    };

    if (isCompanyUser.value) {
      dataToSend.email = formData.email;
    }

    if (formData.password) {
      dataToSend.password = formData.password;
    }

    if (isCompanyUser.value) {
      dataToSend.companyName = formData.companyName;
      dataToSend.code = formData.code;
      dataToSend.address = formData.address;
      dataToSend.managerName = formData.managerName;
      dataToSend.managerPhone = formData.managerPhone;
      dataToSend.managerPhoneSecondary = formData.managerPhoneSecondary;
      dataToSend.lawyerName = formData.lawyerName;
      dataToSend.lawyerPhone = formData.lawyerPhone;
      dataToSend.lawyerPhoneSecondary = formData.lawyerPhoneSecondary;
      dataToSend.accountantName = formData.accountantName;
      dataToSend.accountantPhone = formData.accountantPhone;
      dataToSend.accountantPhoneSecondary = formData.accountantPhoneSecondary;
    }

    await axios.put(apiPaths.userById(props.user.id), dataToSend);

    helpers.setSuccessMessage('ar', 'User updated successfully', 'تم تحديث المستخدم بنجاح');
    isOpen.value = false;
    emit('edited');
  } catch (error: any) {
    const data = error?.response?.data;
    const errorMessage = data?.message || data?.Message || '';
    if (errorMessage.includes('الهاتف') || errorMessage.includes('phone')) {
      phoneErrors.phoneNumber = errorMessage;
      activeTab.value = 0;
    }
    helpers.setErrorMessage(error, 'ar', 'Failed to update user', 'فشل تحديث المستخدم');
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div>
    <BaseButton
      size="sm"
      color="primary"
      variant="pastel"
      @click="isOpen = true"
    >
      <Icon name="ph:pencil" class="size-4" />
    </BaseButton>

    <TairoModal :open="isOpen" size="2xl" @close="isOpen = false">
      <template #header>
        <div class="flex w-full items-center justify-between p-4" dir="rtl">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <Icon name="ph:pencil-simple-duotone" class="w-5 h-5 text-primary-500" />
            </div>
            <div>
              <h3 class="font-heading text-muted-900 text-base font-medium leading-6 dark:text-white">
                تعديل {{ isCompanyUser ? 'بيانات الشركة' : 'المشرف' }}
              </h3>
              <p class="text-xs text-muted-400">{{ user.fullName }}</p>
            </div>
          </div>
          <BaseButtonClose @click="isOpen = false" />
        </div>
      </template>

      <!-- Tab Navigation (only for company users) -->
      <div v-if="isCompanyUser" class="flex items-center justify-center gap-2 py-3 px-4 border-b border-muted-200 dark:border-muted-700" dir="rtl">
        <button
          v-for="(tab, index) in tabs"
          :key="index"
          type="button"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
          :class="activeTab === index
            ? 'bg-primary-500 text-white'
            : 'bg-muted-100 dark:bg-muted-800 text-muted-600 dark:text-muted-300 hover:bg-muted-200 dark:hover:bg-muted-700'"
          @click="activeTab = index"
        >
          <span class="w-5 h-5 rounded-full flex items-center justify-center text-[10px]"
            :class="activeTab === index ? 'bg-white/20' : 'bg-muted-200 dark:bg-muted-700'"
          >
            {{ index + 1 }}
          </span>
          {{ tab }}
        </button>
      </div>

      <form @submit.prevent="editUser" class="p-4 space-y-4" dir="rtl">
        <!-- Tab 0: Basic Info -->
        <div v-show="activeTab === 0" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BaseInput
              v-model="formData.fullName"
              label="الاسم الكامل (اختياري)"
              placeholder="أدخل الاسم الكامل"
              :disabled="isLoading"
            />
            <div>
              <BaseInput
                v-model="formData.phoneNumber"
                type="tel"
                label="رقم هاتف الشركة *"
                placeholder="77XXXXXXXX"
                :disabled="isLoading"
                :classes="{ input: phoneErrors.phoneNumber ? 'border-danger-500' : '' }"
                required
              />
              <p v-if="phoneErrors.phoneNumber" class="text-danger-500 text-[10px] mt-1">{{ phoneErrors.phoneNumber }}</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <template v-if="isCompanyUser">
              <BaseInput
                v-model="formData.email"
                type="email"
                label="البريد الإلكتروني (اختياري)"
                placeholder="example@email.com"
                :disabled="isLoading"
              />
            </template>
            <BaseInput
              v-model="formData.password"
              label="كلمة المرور"
              placeholder="كلمة المرور"
              :disabled="isLoading"
            />
          </div>

          <template v-if="isCompanyUser">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <BaseInput
                v-model="formData.companyName"
                label="اسم الشركة *"
                placeholder="أدخل اسم الشركة"
                :disabled="isLoading"
                required
              />
              <BaseInput
                v-model="formData.code"
                label="الكود (م.ش) *"
                placeholder="أدخل الكود"
                :disabled="isLoading"
                required
              />
            </div>

            <BaseInput
              v-model="formData.address"
              label="العنوان الكامل (اختياري)"
              placeholder="أدخل العنوان الكامل"
              :disabled="isLoading"
            />
          </template>
        </div>

        <!-- Tab 1: Manager (company users only) -->
        <div v-if="isCompanyUser" v-show="activeTab === 1" class="space-y-4">
          <div class="p-4 bg-violet-50 dark:bg-violet-900/20 rounded-xl border border-violet-200 dark:border-violet-800">
            <div class="flex items-center gap-2 mb-4 text-violet-600 dark:text-violet-400">
              <Icon name="ph:user-circle-duotone" class="w-5 h-5" />
              <span class="font-medium">معلومات المدير المفوض</span>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <BaseInput
                v-model="formData.managerName"
                label="الاسم *"
                placeholder="اسم المدير المفوض"
                :disabled="isLoading"
                required
              />
              <div>
                <BaseInput
                  v-model="formData.managerPhone"
                  type="tel"
                  label="رقم الهاتف (10 أرقام)"
                  placeholder="77XXXXXXXX"
                  :disabled="isLoading"
                  :classes="{ input: phoneErrors.managerPhone ? 'border-danger-500' : '' }"
                  required
                />
                <p v-if="phoneErrors.managerPhone" class="text-danger-500 text-[10px] mt-1">{{ phoneErrors.managerPhone }}</p>
              </div>
              <div>
                <BaseInput
                  v-model="formData.managerPhoneSecondary"
                  type="tel"
                  label="رقم ثانٍ (اختياري)"
                  placeholder="77XXXXXXXX"
                  :disabled="isLoading"
                  :classes="{ input: phoneErrors.managerPhoneSecondary ? 'border-danger-500' : '' }"
                />
                <p v-if="phoneErrors.managerPhoneSecondary" class="text-danger-500 text-[10px] mt-1">{{ phoneErrors.managerPhoneSecondary }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab 2: Lawyer (company users only - Optional) -->
        <div v-if="isCompanyUser" v-show="activeTab === 2" class="space-y-4">
          <div class="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
            <div class="flex items-center gap-2 mb-4 text-purple-600 dark:text-purple-400">
              <Icon name="ph:scales-duotone" class="w-5 h-5" />
              <span class="font-medium">معلومات المحامي (اختياري)</span>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <BaseInput
                v-model="formData.lawyerName"
                label="الاسم"
                placeholder="اسم المحامي"
                :disabled="isLoading"
              />
              <div>
                <BaseInput
                  v-model="formData.lawyerPhone"
                  type="tel"
                  label="رقم الهاتف (10 أرقام)"
                  placeholder="77XXXXXXXX"
                  :disabled="isLoading"
                  :classes="{ input: phoneErrors.lawyerPhone ? 'border-danger-500' : '' }"
                />
                <p v-if="phoneErrors.lawyerPhone" class="text-danger-500 text-[10px] mt-1">{{ phoneErrors.lawyerPhone }}</p>
              </div>
              <div>
                <BaseInput
                  v-model="formData.lawyerPhoneSecondary"
                  type="tel"
                  label="رقم ثانٍ (10 أرقام)"
                  placeholder="77XXXXXXXX"
                  :disabled="isLoading"
                  :classes="{ input: phoneErrors.lawyerPhoneSecondary ? 'border-danger-500' : '' }"
                />
                <p v-if="phoneErrors.lawyerPhoneSecondary" class="text-danger-500 text-[10px] mt-1">{{ phoneErrors.lawyerPhoneSecondary }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab 3: Accountant (company users only - Optional) -->
        <div v-if="isCompanyUser" v-show="activeTab === 3" class="space-y-4">
          <div class="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-xl border border-teal-200 dark:border-teal-800">
            <div class="flex items-center gap-2 mb-4 text-teal-600 dark:text-teal-400">
              <Icon name="ph:bank-duotone" class="w-5 h-5" />
              <span class="font-medium">معلومات المحاسب (اختياري)</span>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <BaseInput
                v-model="formData.accountantName"
                label="الاسم"
                placeholder="اسم المحاسب"
                :disabled="isLoading"
              />
              <div>
                <BaseInput
                  v-model="formData.accountantPhone"
                  type="tel"
                  label="رقم الهاتف (10 أرقام)"
                  placeholder="77XXXXXXXX"
                  :disabled="isLoading"
                  :classes="{ input: phoneErrors.accountantPhone ? 'border-danger-500' : '' }"
                />
                <p v-if="phoneErrors.accountantPhone" class="text-danger-500 text-[10px] mt-1">{{ phoneErrors.accountantPhone }}</p>
              </div>
              <div>
                <BaseInput
                  v-model="formData.accountantPhoneSecondary"
                  type="tel"
                  label="رقم ثانٍ (10 أرقام)"
                  placeholder="77XXXXXXXX"
                  :disabled="isLoading"
                  :classes="{ input: phoneErrors.accountantPhoneSecondary ? 'border-danger-500' : '' }"
                />
                <p v-if="phoneErrors.accountantPhoneSecondary" class="text-danger-500 text-[10px] mt-1">{{ phoneErrors.accountantPhoneSecondary }}</p>
              </div>
            </div>
          </div>
        </div>
      </form>

      <template #footer>
        <div class="flex items-center justify-between p-4 border-t border-muted-200 dark:border-muted-700" dir="rtl">
          <div class="flex gap-2">
            <BaseButton
              v-if="isCompanyUser && activeTab > 0"
              type="button"
              color="muted"
              size="sm"
              @click="activeTab--"
            >
              <Icon name="ph:arrow-right" class="w-4 h-4 ml-1" />
              السابق
            </BaseButton>
          </div>

          <div class="flex gap-2">
            <BaseButton
              type="button"
              color="default"
              size="sm"
              @click="isOpen = false"
            >
              إلغاء
            </BaseButton>

            <BaseButton
              v-if="isCompanyUser && activeTab < tabs.length - 1"
              type="button"
              color="primary"
              size="sm"
              @click="activeTab++"
            >
              التالي
              <Icon name="ph:arrow-left" class="w-4 h-4 mr-1" />
            </BaseButton>

            <BaseButton
              v-else
              type="button"
              color="primary"
              size="sm"
              :loading="isLoading"
              :disabled="isLoading"
              @click="editUser"
            >
              <Icon name="ph:check" class="w-4 h-4 ml-1" />
              حفظ
            </BaseButton>
          </div>
        </div>
      </template>
    </TairoModal>
  </div>
</template>
