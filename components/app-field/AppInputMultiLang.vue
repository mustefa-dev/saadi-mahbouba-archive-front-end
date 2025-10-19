<script setup lang="ts">
import AppInputField from './AppInputField.vue';
import AppTextAreaField from './AppTextAreaField.vue';
const tabs = shallowRef(
  [
    { label: 'عربي', value: 'ar' },
    { label: 'انجليزي', value: 'en' },
    { label: 'كوردى', value: 'kr' },
  ]
)
const props = defineProps<{
  label?:string
  placeholder?:string
  required?:boolean
  size?: 'sm'|'md'|'lg'
  rounded?: 'sm'|'md'|'lg'|'full'
  textArea?:boolean
}>()
const arModel = defineModel('ar',{default:""})
const enModel = defineModel('en',{default:""})
const krModel = defineModel('kr',{default:""})
</script>
<template>
  <BaseTabs :tabs model-value="ar" >
    <template #tab="{activeValue}">
      <template v-if="props.textArea">
        <AppTextAreaField v-model="arModel" v-if="activeValue=='ar'" :placeholder="props.placeholder" :label="`${props.label} (عربي)`" :size="props.size" :rounded="props.rounded"/>
        <AppTextAreaField v-model="enModel" v-else-if="activeValue=='en'" :placeholder="props.placeholder" :label="`${props.label} (انجليزي)`" :size="props.size" :rounded="props.rounded"/>
        <AppTextAreaField v-model="krModel" v-else-if="activeValue=='kr'" :placeholder="props.placeholder" :label="`${props.label} (كوردى)`" :size="props.size" :rounded="props.rounded"/>
      </template>
      <template v-else>
        <AppInputField v-model="arModel" v-if="activeValue=='ar'" :placeholder="props.placeholder" :label="`${props.label} (عربي)`" :size="props.size" :rounded="props.rounded" type="text"/>
        <AppInputField v-model="enModel" v-else-if="activeValue=='en'" :placeholder="props.placeholder" :label="`${props.label} (انجليزي)`" :size="props.size" :rounded="props.rounded" type="text"/>
        <AppInputField v-model="krModel" v-else-if="activeValue=='kr'" :placeholder="props.placeholder" :label="`${props.label} (كوردى)`" :size="props.size" :rounded="props.rounded" type="text"/>
      </template>
    </template>
  </BaseTabs>
</template>
