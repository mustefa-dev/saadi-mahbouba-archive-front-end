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

const isCompanyUser = computed(() => props.user.role === 'User' || props.user.role === '1');

watch(isOpen, (newVal) => {
  if (newVal && props.user) {
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
    };

    if (formData.password) {
      dataToSend.password = formData.password;
    }

    if (isCompanyUser.value) {
      dataToSend.email = formData.email;
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
        <div class="flex w-full items-center justify-between p-4 md:p-6">
          <h3 class="font-heading text-muted-900 text-lg font-medium leading-6 dark:text-white">
            تعديل {{ isCompanyUser ? 'بيانات الشركة' : 'المشرف' }}
          </h3>
          <BaseButtonClose @click="isOpen = false" />
        </div>
      </template>

      <form @submit.prevent="editUser" class="p-4 md:p-6 space-y-6 max-h-[70vh] overflow-y-auto">
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
            v-model="formData.password"
            type="password"
            label="كلمة المرور الجديدة (اختياري)"
            placeholder="اتركها فارغة إذا لم تريد التغيير"
            :disabled="isLoading"
          />
          <BaseInput
            v-if="isCompanyUser"
            v-model="formData.email"
            type="email"
            label="البريد الإلكتروني"
            placeholder="example@email.com"
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

          <div class="border-t pt-4">
            <h4 class="text-sm font-medium text-muted-700 dark:text-muted-300 mb-3">المدير المفوض</h4>
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

          <div class="border-t pt-4">
            <h4 class="text-sm font-medium text-muted-700 dark:text-muted-300 mb-3">المحامي</h4>
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

          <div class="border-t pt-4">
            <h4 class="text-sm font-medium text-muted-700 dark:text-muted-300 mb-3">المحاسب القانوني</h4>
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
        </template>

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
