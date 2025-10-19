<script lang="ts" setup generic="T">
import axiosInstance from '~/services/app-client/axios.js'
interface Props {
  items?: T[]
  size?:string
  placeholder?:string
  itemLabel?: string
  itemValue?: string
  label?: string
  appendIcon?: string
  getUrl?: string
  fetchOnSearch?: boolean
  searchKey?: string
  defaultParams?:Record<string,any>
  exclude?:any[]
}
const props = defineProps<Props>()

const model = defineModel({default:{}});
const selectedItem = ref<string>(model.value[props.itemLabel as keyof typeof model.value]);

defineSlots<
  {
    item: { item: T }
  }
>()
const menu = ref(null)
const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number | null): void
  (e: 'update:objectValue', value: T | null): void
}>()
const items = ref<T[]>(props.items || [])
const searchKey = computed(() => props.searchKey || 'text')
const filteredItems = computed({
  get:()=>{
    if(selectedItem.value)
    return items.value.filter(d=>(d[props.itemLabel as keyof typeof d] as string).includes(selectedItem.value??''))
    else return items.value;
  },
  set:(_)=>{

  }
})
async function fetchData() {
  if (props.getUrl) {
    let params = {...props.defaultParams}
    if (props.fetchOnSearch)
      params = {...params,[searchKey.value]: selectedItem.value }

    const res = await axiosInstance.get(props.getUrl, { params})
    nextTick(()=>{
      items.value = res.data.data.filter((d : T)=>{
        return !props.exclude?.includes(d[props.itemValue as keyof typeof d]);
      });
    })
  }
}

onMounted(() => {
  if (props.getUrl)
    fetchData()
})

const isMenuOpen = ref(false);
watch(
  selectedItem,
  () => {
    if (props.fetchOnSearch)
      fetchData()
  },
)
onMounted(()=>{
  onClickOutside(menu.value, _ => isMenuOpen.value = false)
})
</script>

<template>
  <div ref="menu" class="relative bg-white">
    <BaseInput
      v-model="selectedItem"
      type="text"
      clearable
      :size="props.size ?? 'md'"
      :label="props.label"
      :placeholder="props.label??props.placeholder"
      @click="()=>isMenuOpen = true"
    >
      <template #action>
        <button
          type="button"
          class="m-auto h-full text-muted-400 hover:text-primary-500 absolute end-0 top-0 z-[1] flex size-8 items-center justify-center transition-colors duration-300"
          @click="()=>{
            isMenuOpen = false;
            selectedItem = '';
            model = '';
          }"
        >
          <Icon name="ph:x" class="size-5" />
        </button>
      </template>
    </BaseInput>
    <template v-if="isMenuOpen">
      <div class="absolute my-1 w-full  border-0 outline-0 rounded-md bg-white z-[100]">
        <div v-for="item in filteredItems" class="w-full border p-2 first:rounded-t-md last:rounded-b-md bg-white hover:bg-primary-500" @click="()=>{
          model = item[props.itemValue as keyof typeof item]??''
          selectedItem = item[props.itemLabel as keyof typeof item] as string;
          isMenuOpen = false;
        }
        ">
          {{item[props.itemLabel as keyof typeof item]}}
        </div>
      </div>
    </template>
  </div>
</template>
