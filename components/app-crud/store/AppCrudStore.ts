import type { IModelService } from "~/services/app-model"
export const useAppCrudStore = defineStore('app-crud', () => {

  const isDeleteModalOpen = ref(false)
  const isRestoreModalOpen = ref(false)
  const isFormModalOpen = ref(false)
  const modelService = ref<IModelService<any>|undefined>();
  const isLoading = ref(false)
  const item = ref<string | null>(null)
  const currentPage = ref(1)
  const pagesCount = ref(1)

  const setItem = (i: any) => {
    item.value = i
  }

  const setModelService = (service: IModelService<any>) => {
    modelService.value = service;
  }

  return {
    isDeleteModalOpen,
    isRestoreModalOpen,
    isFormModalOpen,
    modelService,
    isLoading,
    item,
    currentPage,
    pagesCount,
    setItem,
    setModelService,
  }
})
