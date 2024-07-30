<script setup>
import {onMounted, ref} from "vue";
import {useAuthStore} from "@/stores/authStore.js";
import {storeToRefs} from "pinia";
import axios from "axios";
import BookCard from "@/components/BookCard.vue";

const authStore = useAuthStore();
const {loading, role, error, isLoggedIn, token} = storeToRefs(authStore);
const listOfBooks = ref([]);
const listOfRequests = ref([]);
onMounted(async () => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token.value}`
  };
  try {
    const response = await axios.get('http://localhost:5000/api/books', {headers});
    if (response.status === 200) {
      const requestedBookArray = response.data.requests.map(reqObject => reqObject.book_id)
      listOfBooks.value = response.data.ebooks.map(ebook => {
        return {...ebook, requested:requestedBookArray.includes(ebook.id)};
      })
      console.log(listOfBooks.value)
    }
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
})
</script>


<template>
  <div class="book-container">
    <BookCard v-for="(book, index) in listOfBooks" :key="index" :book="book"/>
  </div>
</template>

<style scoped>
.book-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin: 1rem 0;
}
</style>