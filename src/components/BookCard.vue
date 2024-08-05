<script setup>
import {defineProps, onMounted, ref} from 'vue'
import axios from "axios";
import {useAuthStore} from "@/stores/authStore.js";
import {storeToRefs} from "pinia";
import router from "@/router/index.js";

const snackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');
const authStore = useAuthStore();
const {loading, role, error, isLoggedIn, token} = storeToRefs(authStore);
const dialog = ref(false);
const props = defineProps({
  book: {
    type: Object,
    required: true
  },
  removeBookCallback: {
    type: Function,
  }
})
// onMounted(() => {
//   console.log("book card onmounted", props.book)
// })

async function raiseRequest(bookId) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token.value}`
  };
  try {
    const response = await axios.post(`http://localhost:5000/api/book-request/${bookId}`, {}, {headers});
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

function openReturnDialog() {
  dialog.value = true;
}

async function returnBook() {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token.value}`,
  };
  try {
    const response = await axios.put(`http://localhost:5000/api/return-book/${props.book.id}`, {}, {headers});
    if (response.status === 200) {
      if (props.removeBookCallback) {
        props.removeBookCallback(props.book.id)
      }
      snackbarMessage.value = 'Book Returned';
      props.book.issued = false;
      dialog.value = false;
      snackbarColor.value = 'success';
      snackbar.value = true;
    }
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    snackbarMessage.value = `Failed. ${error.response ? error.response.data.message : error.message}`;
    snackbarColor.value = 'error';
    snackbar.value = true;
  }
}
</script>

<template>
  <div class="book-card">
    <router-link :to="'/book-details/' + book.id + '/' + book.title" class="book-image">
<!--    <div class="book-image">-->
      <img :src="book.cover_image" alt="book cover image" class="image">
<!--    </div>-->
    </router-link>
    <router-link :to="'/book-details/' + book.id + '/' + book.title"><h3 class="book-title">{{ book.title }}</h3>
    </router-link>
    <div class="author-names">
      <h4 v-for="author in book.authors" class="book-author">{{ author.name }}</h4>
    </div>
    <v-btn v-if="role==='librarian'" variant="flat" color="green"
           @click="()=>{router.push(`/read-book/${book.id}/${book.title}`)}">
      Read
    </v-btn>
    <div v-else-if="book.issued" class="issued-book-actions flex gap-2 align-center ">
      <v-btn variant="flat" color="green"
             @click="()=>{router.push(`/read-book/${book.id}/${book.title}`)}">
        Read
      </v-btn>
      <v-btn variant="flat" color="red"
             @click="openReturnDialog">
        Return
      </v-btn>
    </div>
    <v-btn v-else-if="!book.requested" variant="flat" color="blue" @click="()=>{raiseRequest(book.id)}">
      <v-icon icon="mdi-plus"></v-icon>
    </v-btn>
    <v-btn v-else variant="flat" color="red" @click="()=>{deleteRequest(book.id)}">
      <v-icon icon="mdi-delete"></v-icon>
    </v-btn>

  </div>

  <v-dialog v-model="dialog" max-width="400">
    <v-card>
      <v-card-title class="headline">Confirm Return</v-card-title>
      <v-card-subtitle>Are you sure you want to return this book?</v-card-subtitle>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="green" @click="returnBook">Yes</v-btn>
        <v-btn color="red" @click="dialog = false">No</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>


  <v-snackbar v-if="snackbar" v-model="snackbar" :color="snackbarColor" :timeout="3000" class="custom-snackbar">
    {{ snackbarMessage }}
    <button @click="snackbar = false" class="snackbar-close-btn">X</button>
  </v-snackbar>
</template>

<style scoped>
.book-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #64748b;
  background-color: rgba(30, 41, 59, 0.05);
  height: 22rem;
  width: 13rem;
  padding: 0.5rem;
}

.book-image {

  height: 55%;
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
