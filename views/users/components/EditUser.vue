<script setup lang="ts">
import axios from '~/services/app-client/axios';
import type { User } from '~/types/users';
import { UserStatus } from '~/types/users';

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

const isCompanyUser = computed(() => props.user.role === 'User' || props.user.role === 1 || props.user.role === '1');

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
    formData.password = '';
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
  }
});

const editUser = async () => {
  isLoading.value = true;
  try {
    const apiPaths = useApiPaths();
    const dataToSend: Record<string, any> = {
      fullName: formData.fullName,
      phoneNumber: formData.phoneNumber,
      email: formData.email,
    };

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
              label="الاسم الكامل"
              placeholder="أدخل الاسم الكامل"
              :disabled="isLoading"
              required
            />
            <BaseInput
              v-model="formData.phoneNumber"
              type="tel"
              label="رقم الهاتف"
              placeholder="077xxxxxxxx"
              :disabled="isLoading"
              required
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BaseInput
              v-model="formData.email"
              type="email"
              label="البريد الإلكتروني"
              placeholder="example@email.com"
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

          <template v-if="isCompanyUser">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <BaseInput
                v-model="formData.companyName"
                label="اسم الشركة"
                placeholder="أدخل اسم الشركة"
                :disabled="isLoading"
              />
              <BaseInput
                v-model="formData.code"
                label="الكود (م.ش)"
                placeholder="أدخل الكود"
                :disabled="isLoading"
              />
            </div>

            <BaseInput
              v-model="formData.address"
              label="العنوان الكامل"
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
                label="الاسم"
                placeholder="اسم المدير المفوض"
                :disabled="isLoading"
              />
              <BaseInput
                v-model="formData.managerPhone"
                type="tel"
                label="رقم الهاتف"
                placeholder="077xxxxxxxx"
                :disabled="isLoading"
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
        </div>

        <!-- Tab 2: Lawyer (company users only) -->
        <div v-if="isCompanyUser" v-show="activeTab === 2" class="space-y-4">
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
        </div>

        <!-- Tab 3: Accountant (company users only) -->
        <div v-if="isCompanyUser" v-show="activeTab === 3" class="space-y-4">
          <div class="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-xl border border-teal-200 dark:border-teal-800">
            <div class="flex items-center gap-2 mb-4 text-teal-600 dark:text-teal-400">
              <Icon name="ph:bank-duotone" class="w-5 h-5" />
              <span class="font-medium">معلومات المحاسب</span>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <BaseInput
                v-model="formData.accountantName"
                label="الاسم"
                placeholder="اسم المحاسب"
                :disabled="isLoading"
              />
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
