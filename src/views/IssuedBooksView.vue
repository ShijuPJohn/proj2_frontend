<script setup>
import {onMounted, ref, watch} from "vue";
import {useAuthStore} from "@/stores/authStore.js";
import {storeToRefs} from "pinia";
import axios from "axios";
import router from "@/router/index.js";
import BookCard from "@/components/BookCard.vue";

const snackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');
const issued_books = ref([]);
const authStore = useAuthStore();
const {loading, role, error, isLoggedIn, token} = storeToRefs(authStore)
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token.value}`
};
onMounted(async () => {
  try {
    const response = await axios.get('http://localhost:5000/api/user-issues', {headers});

    if (response.status === 200) {
      console.log(response.data)
      issued_books.value = response.data.issues.map(issue => ({...issue.book, issued: true}));
    }
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    snackbarMessage.value = `Failed. ${error.response ? error.response.data.message : error.message}`;
    snackbarColor.value = 'error'
    snackbar.value = true
  }
})
watch(isLoggedIn, (newVal) => {
  console.log("isLoggedIn", newVal)
  if (!isLoggedIn.value || !isLoggedIn) {
    router.push('/')
  }
})
</script>

<template>
  <h1 class="text-[2rem] border-secondary-color-light border-b-[3px]">Issued Books</h1>
  <div class="book-container">
    <BookCard v-for="(book, index) in issued_books" :key="index" :book="book"/>
  </div>
  <v-snackbar v-if="snackbar" v-model="snackbar" :color="snackbarColor" :timeout="3000" class="custom-snackbar">
    {{ snackbarMessage }}
    <button @click="snackbar = false" class="snackbar-close-btn">X</button>
  </v-snackbar>
</template>

<style scoped>
.book-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin: 1rem 0;
}
</style>