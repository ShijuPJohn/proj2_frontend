<script setup>
import {defineProps, onMounted, ref} from 'vue'
import axios from "axios";
import {useAuthStore} from "@/stores/authStore.js";
import {storeToRefs} from "pinia";

const snackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');
const authStore = useAuthStore();
const {loading, role, error, isLoggedIn, token} = storeToRefs(authStore);
const props = defineProps({
  book: {
    type: Object,
    required: true
  }
})
onMounted(() => {
  console.log(props.book.requested)
})

async function raiseRequest(bookId) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token.value}`
  };
  try {
    const response = await axios.post(`http://localhost:5000/api/book-request/${bookId}`, {}, {headers});
    console.log(response)
    if (response.status === 201) {
      snackbarMessage.value = "Book Requested"
      props.book.requested = true;
      snackbarColor.value = 'success'
      snackbar.value = true
    }
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    snackbarMessage.value = `Failed. ${error.response ? error.response.data.message : error.message}`;
    snackbarColor.value = 'error'
    snackbar.value = true
  }
}

async function deleteRequest(bookId) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token.value}`
  };
  try {
    const response = await axios.delete(`http://localhost:5000/api/book-request/${bookId}`, {headers});
    console.log(response)
    if (response.status === 200) {
      snackbarMessage.value = "Book Request deleted"
      props.book.requested = false;
      snackbarColor.value = 'success'
      snackbar.value = true
    }
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    snackbarMessage.value = `Failed. ${error.response ? error.response.data.message : error.message}`;
    snackbarColor.value = 'error'
    snackbar.value = true
  }
}
</script>

<template>
  <div class="book-card">
    <div class="book-image">
      <img :src="book.cover_image" alt="book cover image" class="image">
    </div>
    <h3 class="book-title">{{ book.title }}</h3>
    <h4 v-for="author in book.authors" class="book-author">{{ author.name }}</h4>
    <v-btn v-if="!book.requested" variant="flat" color="blue" @click="()=>{raiseRequest(book.id)}">
      <v-icon icon="mdi-plus"></v-icon>
    </v-btn>
    <v-btn v-else variant="flat" color="red" @click="()=>{deleteRequest(book.id)}">
      <v-icon icon="mdi-delete"></v-icon>
    </v-btn>
  </div>
  <v-snackbar v-if="snackbar" v-model="snackbar" :color="snackbarColor" :timeout="3000" class="custom-snackbar">
    {{ snackbarMessage }}
    <button @click="snackbar = false" class="snackbar-close-btn">X</button>
  </v-snackbar>
</template>

<style scoped>
.book-card {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  align-items: center;
  border: 1px solid #64748b;
  background-color: rgba(30, 41, 59, 0.05);
  height: 22rem;
  width: 13rem;
  padding: 0.5rem;
}

.book-image {
  width: 90%;
  height: 70%;
}

.image {
  height: 100%;
  width: 100%;
  object-fit: contain;
}

.book-title {
  text-align: center;
}

.book-author {
  font-size: 0.7rem;
  color: #64748b;
}

.custom-snackbar {
  display: flex;
  justify-content: flex-start;
}

.snackbar-close-btn {
  color: #ffffff;
  margin-left: 0.5rem;
}
</style>
