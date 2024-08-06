<script setup>
import {onMounted, ref, watch} from "vue";
import {useAuthStore} from "@/stores/authStore.js";
import {storeToRefs} from "pinia";
import axios from "axios";
import BookCard from "@/components/BookCard.vue";
import router from "@/router/index.js";

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
    console.log(response)
    if (role.value!=="librarian"){
      const requestedBookArray = response.data.requests.map(reqObject => reqObject.book_id)
      const issuedBookArray = response.data.issues.map(issueObject => issueObject.book_id)
      listOfBooks.value = response.data.ebooks.map(ebook => {
        return {...ebook, requested: requestedBookArray.includes(ebook.id), issued: issuedBookArray.includes(ebook.id)};
      })
    } else{
      listOfBooks.value=response.data.ebooks;
    }
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
})
watch(
    () => authStore.$state,
    (newState) => {
      if (!newState.user || !newState.token) {
        // Redirect to login page if the store is cleared
        router.push('/login');
      }
    },
    {deep: true}
);
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