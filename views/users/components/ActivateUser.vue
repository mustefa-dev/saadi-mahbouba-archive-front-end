<script setup lang="ts">
import axios from '~/services/app-client/axios';
import type { ApproveUserRequest, User } from '~/types/users';

const props = defineProps<{
  userId: string;
  user?: User;
}>();

const emit = defineEmits<{
  activated: [];
}>();

const helpers = useHelpers();
const apiPaths = useApiPaths();
const isOpen = ref(false);
const isLoading = ref(false);
const isFetchingUser = ref(false);
const activeTab = ref(0);

const tabs = [
  { label: 'البيانات الأساسية', icon: 'ph:user-circle' },
  { label: 'المدير المفوض', icon: 'ph:user-gear' },
  { label: 'المحامي', icon: 'ph:scales' },
  { label: 'المحاسب', icon: 'ph:calculator' },
];

const formData = reactive<ApproveUserRequest>({
  managerName: '',
  managerPhone: '',
  managerPhoneSecondary: '',
  lawyerName: '',
  lawyerPhone: '',
  lawyerPhoneSecondary: '',
  address: '',
  accountantName: '',
  accountantPhone: '',
  accountantPhoneSecondary: '',
  email: '',
  password: '',
  code: '',
});

// Populate form with existing user data
const populateForm = (userData: User) => {
  formData.code = userData.code || '';
  formData.email = userData.email || '';
  formData.address = userData.address || '';
  formData.managerName = userData.managerName || '';
  formData.managerPhone = userData.managerPhone || '';
  formData.managerPhoneSecondary = userData.managerPhoneSecondary || '';
  formData.lawyerName = userData.lawyerName || '';
  formData.lawyerPhone = userData.lawyerPhone || '';
  formData.lawyerPhoneSecondary = userData.lawyerPhoneSecondary || '';
  formData.accountantName = userData.accountantName || '';
  formData.accountantPhone = userData.accountantPhone || '';
  formData.accountantPhoneSecondary = userData.accountantPhoneSecondary || '';
  // Pre-fill password from existing data to preserve it on reactivation
  formData.password = userData.passwordPlain || '';
};

// Fetch user data when modal opens
const fetchUserData = async () => {
  // If user prop is provided and has data, use it
  if (props.user && (props.user.code || props.user.email || props.user.managerName)) {
    populateForm(props.user);
    return;
  }

  // Otherwise fetch from API
  isFetchingUser.value = true;
  try {
    const response = await axios.get(apiPaths.userById(props.userId));
    const userData = response.data;
    populateForm(userData);
  } catch (error) {
    console.error('Failed to fetch user data:', error);
  } finally {
    isFetchingUser.value = false;
  }
};

// Open modal and fetch user data
const openModal = async () => {
  isOpen.value = true;
  await fetchUserData();
};

const resetForm = () => {
  formData.managerName = '';
  formData.managerPhone = '';
  formData.managerPhoneSecondary = '';
  formData.lawyerName = '';
  formData.lawyerPhone = '';
  formData.lawyerPhoneSecondary = '';
  formData.address = '';
  formData.accountantName = '';
  formData.accountantPhone = '';
  formData.accountantPhoneSecondary = '';
  formData.email = '';
  formData.password = '';
  formData.code = '';
  activeTab.value = 0;
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

// Validation for required fields (password optional if already set)
const isFormValid = computed(() => {
  return !!(
    formData.code?.trim() &&
    formData.managerName?.trim() &&
    formData.managerPhone?.trim()
  );
});

const activateUser = async () => {
  // Validate required fields before submission
  if (!isFormValid.value) {
    helpers.setErrorMessage(null, 'ar', 'Please fill all required fields', 'يرجى ملء جميع الحقول المطلوبة');
    return;
  }
  isLoading.value = true;
  try {
    const apiPaths = useApiPaths();
    await axios.put(apiPaths.approveUser(props.userId), formData);

    helpers.setSuccessMessage('ar', 'User activated successfully', 'تم تفعيل المستخدم بنجاح');
    isOpen.value = false;
    resetForm();
    emit('activated');
  } catch (error: any) {
    helpers.setErrorMessage(error, 'ar', 'Failed to activate user', 'فشل تفعيل المستخدم');
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div>
    <BaseButton
      size="sm"
      color="success"
      variant="pastel"
      @click="openModal"
    >
      تفعيل الحساب
    </BaseButton>

    <TairoModal :open="isOpen" size="lg" @close="isOpen = false">
      <template #header>
        <div dir="rtl" class="flex w-full items-center justify-between p-4 md:p-6">
          <h3 class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white">
            تفعيل حساب الشركة
          </h3>
          <BaseButtonClose @click="isOpen = false" />
        </div>
      </template>

      <div dir="rtl" class="p-4 md:p-6">
        <!-- Loading State -->
        <div v-if="isFetchingUser" class="flex flex-col items-center justify-center py-12">
          <Icon name="svg-spinners:ring-resize" class="size-10 text-primary-500 mb-4" />
          <p class="text-muted-500">جاري تحميل بيانات الشركة...</p>
        </div>

        <template v-else>
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

        <form @submit.prevent="activateUser">
          <!-- Tab 0: Basic Info -->
          <div v-show="activeTab === 0" class="space-y-4">
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
                label="كلمة المرور"
                placeholder="اتركها فارغة للاحتفاظ بالقديمة"
                :disabled="isLoading"
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
                color="success"
                :loading="isLoading"
                :disabled="isLoading || !isFormValid"
              >
                <Icon name="ph:check" class="size-4 me-1" />
                موافقة وتفعيل
              </BaseButton>
            </div>
          </div>
        </form>
        </template>
      </div>
    </TairoModal>
  </div>
</template>
