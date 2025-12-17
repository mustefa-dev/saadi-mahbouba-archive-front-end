<script setup lang="ts">
import axios from '~/services/app-client/axios';
import type { CompanyArchive } from '~/types/archive';

const props = defineProps<{
  open: boolean;
  company: CompanyArchive | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'success'): void;
}>();

const helpers = useHelpers();
const apiPaths = useApiPaths();
const isLoading = ref(false);

// Tabs for step-by-step editing
const tabs = ['المعلومات الأساسية', 'المدير المفوض', 'المحامي', 'المحاسب القانوني'];
const activeTab = ref(0);

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

// Fetch user data when modal opens
watch(() => props.open, async (isOpen) => {
  if (isOpen && props.company) {
    await fetchUserData();
    activeTab.value = 0;
  }
});

const fetchUserData = async () => {
  if (!props.company) return;

  isLoading.value = true;
  try {
    const response = await axios.get(apiPaths.userById(props.company.userId));
    const user = response.data;

    formData.fullName = user.fullName || '';
    formData.phoneNumber = user.phoneNumber || '';
    formData.email = user.email || '';
    formData.companyName = user.companyName || '';
    formData.code = user.code || '';
    formData.password = '';
    formData.address = user.address || '';
    formData.managerName = user.managerName || '';
    formData.managerPhone = user.managerPhone || '';
    formData.managerPhoneSecondary = user.managerPhoneSecondary || '';
    formData.lawyerName = user.lawyerName || '';
    formData.lawyerPhone = user.lawyerPhone || '';
    formData.lawyerPhoneSecondary = user.lawyerPhoneSecondary || '';
    formData.accountantName = user.accountantName || '';
    formData.accountantPhone = user.accountantPhone || '';
    formData.accountantPhoneSecondary = user.accountantPhoneSecondary || '';
  } catch (error) {
    console.error('Error fetching user data:', error);
  } finally {
    isLoading.value = false;
  }
};

const handleSubmit = async () => {
  if (!props.company) return;

  isLoading.value = true;
  try {
    const dataToSend: Record<string, any> = {
      fullName: formData.fullName,
      phoneNumber: formData.phoneNumber,
      email: formData.email,
      companyName: formData.companyName,
      code: formData.code,
      address: formData.address,
      managerName: formData.managerName,
      managerPhone: formData.managerPhone,
      managerPhoneSecondary: formData.managerPhoneSecondary,
      lawyerName: formData.lawyerName,
      lawyerPhone: formData.lawyerPhone,
      lawyerPhoneSecondary: formData.lawyerPhoneSecondary,
      accountantName: formData.accountantName,
      accountantPhone: formData.accountantPhone,
      accountantPhoneSecondary: formData.accountantPhoneSecondary,
    };

    if (formData.password) {
      dataToSend.password = formData.password;
    }

    await axios.put(apiPaths.userById(props.company.userId), dataToSend);

    helpers.setSuccessMessage('ar', 'Company updated successfully', 'تم تحديث بيانات الشركة بنجاح');
    emit('success');
    emit('close');
  } catch (error: any) {
    helpers.setErrorMessage(error, 'ar', 'Failed to update company', 'فشل تحديث بيانات الشركة');
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
            <Icon name="ph:pencil-simple-duotone" class="w-6 h-6 text-primary-500" />
          </div>
          <div>
            <h3 class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white">
              تعديل بيانات الشركة
            </h3>
            <p v-if="company" class="text-sm text-muted-400">
              {{ company.companyName || company.fullName }}
            </p>
          </div>
        </div>
        <BaseButtonClose @click="emit('close')" />
      </div>
    </template>

    <!-- Loading State -->
    <div v-if="isLoading && !formData.fullName" class="p-6" dir="rtl">
      <div class="flex flex-col items-center justify-center py-12">
        <div class="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p class="text-muted-400">جاري تحميل البيانات...</p>
      </div>
    </div>

    <template v-else>
      <!-- Step Indicator -->
      <div class="flex items-center justify-center gap-2 py-4 px-6 border-b border-muted-200 dark:border-muted-700" dir="rtl">
        <button
          v-for="(tab, index) in tabs"
          :key="index"
          class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          :class="activeTab === index
            ? 'bg-primary-500 text-white'
            : 'bg-muted-100 dark:bg-muted-800 text-muted-600 dark:text-muted-300 hover:bg-muted-200 dark:hover:bg-muted-700'"
          @click="activeTab = index"
        >
          <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs"
            :class="activeTab === index ? 'bg-white/20' : 'bg-muted-200 dark:bg-muted-700'"
          >
            {{ index + 1 }}
          </span>
          {{ tab }}
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="p-4 md:p-6 space-y-6 max-h-[50vh] overflow-y-auto" dir="rtl">
        <!-- Tab 0: Basic Info -->
        <div v-show="activeTab === 0" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BaseInput
              v-model="formData.fullName"
              label="الاسم الكامل"
              placeholder="أدخل الاسم الكامل"
              :disabled="isLoading"
              required
            />
            <BaseInput
              v-model="formData.companyName"
              label="اسم الشركة"
              placeholder="أدخل اسم الشركة"
              :disabled="isLoading"
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BaseInput
              v-model="formData.phoneNumber"
              type="tel"
              label="رقم الهاتف"
              placeholder="07xxxxxxxxx"
              :disabled="isLoading"
              required
            />
            <BaseInput
              v-model="formData.email"
              type="email"
              label="البريد الإلكتروني"
              placeholder="example@email.com"
              :disabled="isLoading"
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BaseInput
              v-model="formData.code"
              label="الكود (م.ش)"
              placeholder="أدخل الكود"
              :disabled="isLoading"
            />
            <BaseInput
              v-model="formData.password"
              type="password"
              label="كلمة المرور الجديدة (اختياري)"
              placeholder="اتركها فارغة إذا لم تريد التغيير"
              :disabled="isLoading"
            />
          </div>

          <BaseInput
            v-model="formData.address"
            label="العنوان الكامل"
            placeholder="أدخل العنوان الكامل"
            :disabled="isLoading"
          />
        </div>

        <!-- Tab 1: Manager -->
        <div v-show="activeTab === 1" class="space-y-4">
          <div class="p-4 bg-violet-50 dark:bg-violet-900/20 rounded-xl border border-violet-200 dark:border-violet-800">
            <div class="flex items-center gap-2 mb-4 text-violet-600 dark:text-violet-400">
              <Icon name="ph:user-circle-duotone" class="w-5 h-5" />
              <span class="font-medium">معلومات المدير المفوض</span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <BaseInput
                v-model="formData.managerName"
                label="الاسم"
                placeholder="اسم المدير المفوض"
                :disabled="isLoading"
              />
              <BaseInput
                v-model="formData.managerPhone"
                type="tel"
                label="رقم الهاتف"
                placeholder="07xxxxxxxxx"
                :disabled="isLoading"
              />
              <BaseInput
                v-model="formData.managerPhoneSecondary"
                type="tel"
                label="رقم ثانٍ (اختياري)"
                placeholder="07xxxxxxxxx"
                :disabled="isLoading"
              />
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
              <BaseInput
                v-model="formData.lawyerName"
                label="الاسم"
                placeholder="اسم المحامي"
                :disabled="isLoading"
              />
              <BaseInput
                v-model="formData.lawyerPhone"
                type="tel"
                label="رقم الهاتف"
                placeholder="07xxxxxxxxx"
                :disabled="isLoading"
              />
              <BaseInput
                v-model="formData.lawyerPhoneSecondary"
                type="tel"
                label="رقم ثانٍ (اختياري)"
                placeholder="07xxxxxxxxx"
                :disabled="isLoading"
              />
            </div>
          </div>
        </div>

        <!-- Tab 3: Accountant -->
        <div v-show="activeTab === 3" class="space-y-4">
          <div class="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-xl border border-teal-200 dark:border-teal-800">
            <div class="flex items-center gap-2 mb-4 text-teal-600 dark:text-teal-400">
              <Icon name="ph:bank-duotone" class="w-5 h-5" />
              <span class="font-medium">معلومات المحاسب القانوني</span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <BaseInput
                v-model="formData.accountantName"
                label="الاسم"
                placeholder="اسم المحاسب القانوني"
                :disabled="isLoading"
              />
              <BaseInput
                v-model="formData.accountantPhone"
                type="tel"
                label="رقم الهاتف"
                placeholder="07xxxxxxxxx"
                :disabled="isLoading"
              />
              <BaseInput
                v-model="formData.accountantPhoneSecondary"
                type="tel"
                label="رقم ثانٍ (اختياري)"
                placeholder="07xxxxxxxxx"
                :disabled="isLoading"
              />
            </div>
          </div>
        </div>
      </form>
    </template>

    <template #footer>
      <div v-if="!isLoading || formData.fullName" class="flex items-center justify-between p-4 border-t border-muted-200 dark:border-muted-700" dir="rtl">
        <div class="flex gap-2">
          <BaseButton
            v-if="activeTab > 0"
            type="button"
            color="muted"
            @click="prevTab"
          >
            <Icon name="ph:arrow-right" class="w-4 h-4 ml-1" />
            السابق
          </BaseButton>
        </div>

        <div class="flex gap-2">
          <BaseButton
            type="button"
            color="default"
            @click="emit('close')"
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
            <Icon name="ph:arrow-left" class="w-4 h-4 mr-1" />
          </BaseButton>

          <BaseButton
            v-else
            type="button"
            color="primary"
            :loading="isLoading"
            :disabled="isLoading"
            @click="handleSubmit"
          >
            <Icon name="ph:check" class="w-4 h-4 ml-1" />
            حفظ التعديلات
          </BaseButton>
        </div>
      </div>
    </template>
  </TairoModal>
</template>
