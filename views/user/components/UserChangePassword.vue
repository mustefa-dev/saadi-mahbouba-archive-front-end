<script setup lang="ts">
import { useUserStore } from '../stores';
import AppInputField from '~/components/app-field/AppInputField.vue';
import { UserService } from '../service';
const userStore = useUserStore();
const userService = new UserService();
const newPassword = ref("");
const createUser = async ()=>{
  await userService.changePassword(useUserStore().editUser,newPassword.value);
  newPassword.value = '';
}
</script>
<template>
  <AppDialog size="sm" v-model="userStore.isPasswordChangeDialogOpen" title="تغيير الرمز">
    <div class="space-y-3">
        <AppInputField v-model="newPassword" size="md" label="الرمز الجديد"/>
    </div>
    <template #actions>
      <BaseButton color="primary" @click="createUser">
        تأكيد
      </BaseButton>
    </template>
  </AppDialog>
</template>
