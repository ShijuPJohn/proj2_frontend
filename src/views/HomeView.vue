<script setup>
import {onMounted, ref} from "vue";
import {useAuthStore} from "@/stores/authStore.js";
import {storeToRefs} from "pinia";
import axios from "axios";
import {mdiAccount, mdiEye, mdiEyeOff, mdiPlus} from '@mdi/js'
import BookCard from "@/components/BookCard.vue";

const authStore = useAuthStore();
const {loading, role, error, isLoggedIn, token} = storeToRefs(authStore);
const listOfBooks = ref([]);
onMounted(async () => {
  const headers = {
    'Content-Type': 'application/json',
    // 'Authorization': `Bearer ${token.value}`
  };
  try {
    const response = await axios.get('http://localhost:5000/api/books');
    if (response.status === 200) {
      listOfBooks.value = response.data.ebooks
    } else {
      throw new Error(response.statusText);
    }
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
})
</script>


<template>
  <div class="flex flex-wrap gap-4 my-4">
    <BookCard v-for="(book, index) in listOfBooks" :key="index" :book="book" />
  </div>
</template>

<style scoped>
.sdafasdf {
  background-color: #0f53cf;
}
</style>