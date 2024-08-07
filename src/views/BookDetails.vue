<script setup>
import {onMounted, ref, watch} from "vue";
import axios from "axios";
import {storeToRefs} from "pinia";
import {useAuthStore} from "@/stores/authStore.js";
import {useRoute} from "vue-router";
import router from "@/router/index.js";

const dialog = ref(false);
const snackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');
const route = useRoute();
const bookId = route.params.id;
// const title = route.params.title;
const authStore = useAuthStore();
const {loading, role, error, isLoggedIn, token} = storeToRefs(authStore);
const book = ref({})
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
onMounted(async () => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token.value}`
  };
  try {
    const response = await axios.get(`http://localhost:5000/api/books/${bookId}`, {headers});
    if (response.status === 200) {
      console.log("response data",response.data)
      book.value = response.data.book;
      book.value.requested = response.data.requested
      book.value.issued = response.data.issued;
    }
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
})

async function raiseRequest(bookId) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token.value}`
  };
  try {
    const response = await axios.post(`http://localhost:5000/api/book-request/${bookId}`, {}, {headers});
    if (response.status === 201) {
      snackbarMessage.value = "Book Requested"
      book.value.requested = true;
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
      book.value.requested = false;
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
    const response = await axios.put(`http://localhost:5000/api/return-book/${book.value.id}`, {}, {headers});
    if (response.status === 200) {
      book.value.issued=false
      book.value.requested=false
      snackbarMessage.value = 'Book Returned';
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
  <div class="book-details-main-container flex flex-col border-slate-500 w-[100%] md:w-[60%] mt-4">
    <div class="book-details-title-image-container flex gap-2" v-if="Object.keys(book).length > 0">
      <div class="book-details-image-container h-[20rem] p-2 border-slate-500 border-[1px] m-2">
        <img :src="book.cover_image" alt="book cover image" class="h-full w-full">
      </div>
      <div class="book-details-title-text flex flex-col justify-space-between py-4">
        <h1 class="text-[2rem] font-semibold">{{ book.title }}</h1>
        <h3>
          <span v-if="book.authors.length>1">Authors: </span>
          <span v-if="book.authors.length===1">Author: </span>
          <span v-for="author in book.authors" class="book-author">
            {{ author.name }}, </span></h3>

        <p>Published in : {{ book.publication_year }}</p>
        <p>Number of pages : </p>
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
          Request this book
        </v-btn>
        <v-btn v-else variant="flat" color="red" @click="()=>{deleteRequest(book.id)}">
          Cancel Request
        </v-btn>

      </div>

    </div>
    <div class="description-box mx-2">
      <h2 class="my-4 text-2xl uppercase font-weight-medium">Description:</h2>
      <p>{{ book.description }}</p>
    </div>
  </div>
  <v-snackbar v-if="snackbar" v-model="snackbar" :color="snackbarColor" :timeout="3000" class="custom-snackbar">
    {{ snackbarMessage }}
    <button @click="snackbar = false" class="snackbar-close-btn">X</button>
  </v-snackbar>
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
</template>

<style scoped>

</style>