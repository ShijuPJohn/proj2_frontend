<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  book: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <div class="flex p-2 flex-column gap-1
          items-center border-[1px] border-slate-500 bg-slate-700 h-[22rem] w-[13rem] bg-opacity-5">
    <div class="w-[90%] h-[70%]">
      <img :src="book.cover_image" alt="book cover image" class="h-full w-full object-contain">
    </div>
    <h3 class="text-center ">{{ book.title }}</h3>
    <h4 v-for="author in book.authors" class="text-[.7rem] text-slate-600">{{ author.name }}</h4>
    <v-btn variant="flat" color="blue"><v-icon icon="mdi-plus"></v-icon></v-btn>
  </div>
</template>

<style scoped>

</style>