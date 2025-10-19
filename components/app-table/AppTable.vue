<script setup generic="T" lang="ts">
import TableDataGenerator from './components/TableDataGenerator.vue';
import TableHeadersGenerator from './components/TableHeadersGenerator.vue';
import TableNoData from './components/TableNoData.vue';
import TableLoading from './components/TableLoading.vue';
import { useAppTableStore } from './stores/AppTableStore';
import type { TableHeader, GenerateSlots } from './types';


const appTableStore = useAppTableStore()
interface Props {
  headers: TableHeader[]
  items: T[]
  isLoading?: boolean
}
const props = defineProps<Props>()
appTableStore.setData(props.items)
const isLoading = computed(() => appTableStore.isLoading || props.isLoading)
const headers = computed(() => props.headers)


const slots = useSlots()
const hasSlot = (name: string) => !!slots[name]
const headerSlots = computed(() => {
  return Object.keys(slots).filter(name => name.startsWith('header-'))
})

const dataSlotsKeys = computed(() => {
  return Object.keys(slots).filter(name => name.startsWith('data-'))
})

const slotName = (slot: string): keyof GenerateSlots<T> => {
  return slot as keyof GenerateSlots<T>
}

defineSlots<GenerateSlots<T>>()

</script>
<template>
  <div class="w-full h-full">
    <table>
      <TableHeadersGenerator  class="w-full" :headers="headers">
        <template v-for="headerSlot in headerSlots" #[headerSlot]>
          <slot :name="slotName(headerSlot)"></slot>
        </template>
      </TableHeadersGenerator>
      <TairoTableRow v-if="hasSlot('before-data')">
        <TairoTableCell>
          <slot name="before-data"></slot>
        </TairoTableCell>
      </TairoTableRow>
      <TableDataGenerator v-if="!isLoading" :headers="headers" :items="items">
        <template v-for="dataSlot in dataSlotsKeys" #[slotName(dataSlot)]="slotProps">
          <slot :name="slotName(dataSlot)" v-bind="slotProps"></slot>
        </template>
      </TableDataGenerator>
      <TableLoading v-else :columns="props.headers.length" :rows="3"/>
      <TableNoData v-if="items?.length == 0 && !isLoading" :cols="props.headers.length" />
    </table>
    <slot name="default"/>
  </div>
</template>
<style>
table {
width:100%;
  th{
    background: #2f2f2f;;
    color:white;
    font-size: 1rem;
    text-align: center !important;
    font-weight: 500;
    padding: 10px;
  }
  th:first-child{
    border-top-right-radius: 16px;
  }
  th:last-child{
    border-top-left-radius: 16px;
  }

  td{
    background:#FFFFFF;
    text-align: center;
    padding: 1rem;
    font-size: 1rem;
  }
  tr:last-child{
    td:first-child{
      border-bottom-right-radius: 16px;
    }
    td:last-child{
      border-bottom-left-radius: 16px;
    }
  }
}
</style>
