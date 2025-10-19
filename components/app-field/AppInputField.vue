<script setup lang="ts">
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'
const props = defineProps<{
  label?:string
  placeholder?:string
  icon?:string
  required?:boolean
  error?:string
  loading?:boolean
  size?: 'sm'|'md'|'lg'
  rounded?: 'sm'|'md'|'lg'|'full'
  type?: 'text'|'number'|'email'|'password'|'date'
}>()
const model = defineModel<string>()
const showPassword = ref(false)
const color = useColorMode();
const dark = computed<boolean>(() => {
  return color.value=='dark'
});
</script>
<template>
  <BaseInput 
    :size="props.size ?? 'md'"
    :label="props.label?props.label + ((props.label && props.required ) ?'*':''):''"
    :placeholder="props.placeholder"
    :type="showPassword?'text':'password'"
    :icon="props.icon"
    :rounded="props.rounded ?? 'sm'"
    :error="props.error"
    :loading="props.loading"
    class="bg-accent bg-none"
    contrast="default"
    v-model="model"
    v-if="props.type=='password'"
  >
    <template #action>
      <button
        type="button"
        class="m-auto h-full text-muted-400 hover:text-primary-500 absolute end-0 top-0 z-[1] flex size-8 items-center justify-center transition-colors duration-300"
        @click="showPassword = !showPassword"
      >
        <Icon name="ph:eye" class="size-5" />
      </button>
    </template>
  </BaseInput>
  <template v-else-if="type=='date'">
    <div class="flex flex-col justify-between">
      <span v-if="props.label" class="dp__label">
        {{props.label}}
      </span>
      <VueDatePicker
        v-model="model"
        select-text="تأكيد"
        cancel-text="ألغاء"
        text-input
        @cleared="model = ''"
        :label="props.label" 
        :placeholder="props.placeholder?props.placeholder + ' dd/mm/yyyy':'dd/mm/yyyy'" 
        :enable-time-picker="false" 
        :dark 
      />
    </div>
  </template>
  <BaseInput 
    :size="props.size ?? 'md'"
    :label="props.label?props.label + ((props.label && props.required ) ?'*':''):''"
    :placeholder="props.placeholder"
    :type="props.type ?? 'text'"
    :icon="props.icon"
    :rounded="props.rounded ?? 'sm'"
    :error="props.error"
    :loading="props.loading"
    class="bg-accent bg-none"
    contrast="default"
    v-model="model"
    v-else="props.type!='date'"
  />
</template>
