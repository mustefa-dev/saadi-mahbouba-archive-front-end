<script setup lang="ts">
import type { User } from '../types';
import { UserService } from '../service';

const userService = new UserService();

defineProps<{
  user:User
}>()
</script>
<template>
  <BaseDropdown
    :label="user.isActive?'حاضر':'غائب'"
    :button-color="user.isActive?'success':'danger'"
    size="md"
    class="nowrap"
  >
    <div class="flex flex-col gap-2 pointer-click">
      <BaseButton 
        :color="!user.isActive?'success':'danger'"
        @click="userService.setActive(user,!user.isActive)"
      >
        <span class="nowrap">{{user.isActive?'غائب':'حاضر'}}</span>
      </BaseButton>
    </div>
  </BaseDropdown>
</template>
