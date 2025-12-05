<script setup lang="ts">
import axios from '~/services/app-client/axios';
import type { ApproveUserRequest } from '~/types/users';

const props = defineProps<{
  userId: string;
}>();

const emit = defineEmits<{
  activated: [];
}>();

const helpers = useHelpers();
const isOpen = ref(false);
const isLoading = ref(false);

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
};

const activateUser = async () => {
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
      @click="isOpen = true"
    >
      تفعيل الحساب
    </BaseButton>

    <TairoModal :open="isOpen" size="2xl" @close="isOpen = false">
      <template #header>
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3 class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white">
            تفعيل حساب الشركة
          </h3>
          <BaseButtonClose @click="isOpen = false" />
        </div>
      </template>

      <form @submit.prevent="activateUser" class="p-4 md:p-6 space-y-6 max-h-[70vh] overflow-y-auto">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <BaseInput
            v-model="formData.code"
            label="الكود (م.ش)"
            placeholder="أدخل الكود"
            :disabled="isLoading"
            required
          />
          <BaseInput
            v-model="formData.password"
            type="password"
            label="كلمة المرور"
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
          required
        />

        <BaseInput
          v-model="formData.address"
          label="العنوان الكامل"
          placeholder="أدخل العنوان الكامل"
          :disabled="isLoading"
          required
        />

        <div class="border-t pt-4">
          <h4 class="text-sm font-medium text-muted-700 dark:text-muted-300 mb-3">المدير المفوض</h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <BaseInput
              v-model="formData.managerName"
              label="الاسم"
              placeholder="اسم المدير المفوض"
              :disabled="isLoading"
              required
            />
            <BaseInput
              v-model="formData.managerPhone"
              type="tel"
              label="رقم الهاتف"
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

        <div class="border-t pt-4">
          <h4 class="text-sm font-medium text-muted-700 dark:text-muted-300 mb-3">المحامي</h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <BaseInput
              v-model="formData.lawyerName"
              label="الاسم"
              placeholder="اسم المحامي"
              :disabled="isLoading"
              required
            />
            <BaseInput
              v-model="formData.lawyerPhone"
              type="tel"
              label="رقم الهاتف"
              placeholder="077xxxxxxxx"
              :disabled="isLoading"
              required
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

        <div class="border-t pt-4">
          <h4 class="text-sm font-medium text-muted-700 dark:text-muted-300 mb-3">المحاسب القانوني</h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <BaseInput
              v-model="formData.accountantName"
              label="الاسم"
              placeholder="اسم المحاسب القانوني"
              :disabled="isLoading"
              required
            />
            <BaseInput
              v-model="formData.accountantPhone"
              type="tel"
              label="رقم الهاتف"
              placeholder="077xxxxxxxx"
              :disabled="isLoading"
              required
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

        <div class="flex gap-x-2 justify-end pt-4 border-t">
          <BaseButton
            type="button"
            color="default"
            @click="isOpen = false"
          >
            إلغاء
          </BaseButton>
          <BaseButton
            type="submit"
            color="success"
            :loading="isLoading"
            :disabled="isLoading"
          >
            موافقة وتفعيل
          </BaseButton>
        </div>
      </form>
    </TairoModal>
  </div>
</template>
