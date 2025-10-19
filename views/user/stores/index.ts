import type { User } from "../types"
export const useUserStore = defineStore('user-page', () => {
  const users = ref<User[]>([])
  const editUser = ref<User>({})
  const isCreateDialogOpen = ref(false);
  const isEditDialogOpen = ref(false);
  const isPasswordChangeDialogOpen = ref(false);
  const editId = ref();
  const error = ref(null)
  return {
    users,
    editUser,
    editId,
    error,
    isCreateDialogOpen,
    isPasswordChangeDialogOpen,
    isEditDialogOpen,
  }
})
