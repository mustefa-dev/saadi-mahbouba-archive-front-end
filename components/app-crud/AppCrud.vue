<script setup lang="ts" generic="T">
import type { FilterField, ParamsType } from '~/utils/types/filters';
import DeleteModal from './components/DeleteModal.vue';
import AppInputField from '../app-field/AppInputField.vue';
import AppAutoCompleteField from '../app-field/AppAutoCompleteField.vue';
import { useAppCrudStore } from './store/AppCrudStore';
import type { IModelService } from '~/services/app-model';
import RestoreModal from './components/RestoreModal.vue';
interface Props {
  addButtonText?: string
  pagination?: boolean
  hideCreate?: boolean
  viewDeleted?: boolean
  filters?: FilterField[]
  modelService?:IModelService<T>
  addBtnAction?: () => void
  addBtnText?: () => void
}
const props = defineProps<Props>()

const emits = defineEmits(['update:currentPage'])
const pagination = computed(() => props.pagination)

const slots = useSlots();
const hasSlot = (name: string) => !!slots[name]
const {filters,pageNumber,getData,isDeleted} = useFilters(props.filters);
const appCrudStore = useAppCrudStore();

defineSlots<{
  'default':()=>void
  'filters':(fliter:ParamsType)=>void
  'viewDeleted':(fliter:ParamsType)=>void
  'headerActions':()=>void
}>();


const currentPage = computed<number>({
  get:()=>{
    return Math.max(parseInt((useRoute().query.pageNumber as string)??'1'),1);
  },
  set:(i :number)=>{
    pageNumber.value = i;
  }
})

const createAction = ()=>{
  if(props.addBtnAction)
    props.addBtnAction();
  if(props.modelService)
    props.modelService.createBtnAction();
}

  if(props.modelService)
  {
    appCrudStore.setModelService(props.modelService);
    //getData();
  }

</script>
<template>
  <TairoContentWrapper>
    <div class="w-full flex justify-between bg-white  p-3 rounded-lg mb-3">
      <div class="flex-grow">
        <slot name="filters" v-if="hasSlot('filters') || !props.filters"/>
        <template v-else>
          <div class="grid gap-2 rounded-full" :style="`grid-template-columns: repeat(5,1fr);`">
            <template
              v-for="filter in props.filters.filter(f=>f.hide?!f.hide():true)" 
            >
              <AppInputField 
                v-if="filter.type!=='select'"
                :type="filter.type??'text'" 
                :placeholder="filter.label"
                :icon="filter.icon"
                v-model="filters[filter.key]"
              />
              <AppAutoCompleteField
                v-else
                :items="filter.options?.items"
                :placeholder="filter.label"
                :get-url="filter.options?.getUrl"
                :item-label="filter.options?.itemLabel"
                :item-value="filter.options?.itemValue"
                :fetch-on-search="filter.options?.items?false:true"
                :default-params="filter.options?.defaultParams"
                :search-key="filter.options?.searchKey"
                v-model="filters[filter.key]"
              />
            </template>
          </div>
        </template>
      </div>
      <BaseButton class="gap-1" color="primary" @click="createAction()" v-if="!hideCreate">
        <Icon name="ph:plus-circle" size="20"></Icon>
        {{ addButtonText || 'إضافة' }}
      </BaseButton>
      <slot name="headerActions" />
    </div>
      <div class="w-full flex my-3" v-if="viewDeleted">
      <slot name="viewDeleted">
        <BaseTag 
          size="lg"
          color="primary"
          style="cursor: pointer;"
          :variant="isDeleted?'solid':'outline'" 
          @click="isDeleted = !isDeleted">
          عرض المحذوف
        </BaseTag>
      </slot>
      </div>
    <slot/>
    <BasePagination v-if="pagination" :item-per-page="10" :total-items="appCrudStore.pagesCount * 10"
      router-query-key=""
      :current-page="currentPage"
      @update:current-page="(i)=>currentPage = i"
      :max-links-displayed="5" 
      rounded="lg" />
  </TairoContentWrapper>
  <DeleteModal />
  <RestoreModal/>
</template>
