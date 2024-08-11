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
      console.log("response data", response.data)
      book.value = response.data.book;
      book.value.requested = response.data.requested
      book.value.issued = response.data.issued;
      book.value.purchased = response.data.purchased;
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
      book.value.issued = false
      book.value.requested = false
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
async function fetchBook(bookId) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token.value}`
  };
  try {
    const response = await axios.get(`http://localhost:5000/api/book-file/${bookId}`, {headers, responseType: "blob"});
    const fileName = response.headers['content-disposition']
        ? response.headers['content-disposition'].split('filename=')[1]
        : 'downloaded-file';

    const blob = new Blob([response.data], { type: response.data.type });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);


  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}
</script>

<template>
  <div class="book-details-main-container">
    <div class="book-details-title-image-container" v-if="Object.keys(book).length > 0">
      <div class="book-details-image-container">
        <img :src="book.cover_image" alt="book cover image" class="book-image">
      </div>
      <div class="book-details-title-text">
        <div>
          <h1 class="book-title">{{ book.title }}</h1>
          <p class="status-purchased" v-if="book.purchased">Purchased</p>
        </div>

        <h3>
          <span v-if="book.authors.length>1">Authors: </span>
          <span v-if="book.authors.length===1">Author: </span>
          <span v-for="author in book.authors" class="book-author">
            {{ author.name }}, </span></h3>

        <p>Published in : {{ book.publication_year }}</p>
        <p>Number of pages : {{book.number_of_pages}}</p>
        <v-btn v-if="role==='librarian'" class="btn-green" variant="flat"
               @click="()=>{router.push(`/read-book/${book.id}/${book.title}`)}">
          Read
        </v-btn>
        <div v-else-if="book.issued" class="issued-book-actions">
          <v-btn color="green" variant="flat"
                 @click="()=>{router.push(`/read-book/${book.id}/${book.title}`)}">
            <v-icon icon="mdi-book-open"/>
            Read
          </v-btn>
          <v-btn color="red" variant="flat"
                 @click="openReturnDialog">
            <v-icon icon="mdi-keyboard-return"/>
            Return
          </v-btn>
          <v-btn color="orange" variant="flat"
                 @click="router.push(`/buy-book/${book.id}`);">
            <v-icon icon="mdi-cart"/>
            Buy
          </v-btn>
        </div>
        <div class="book-actions" v-else-if="!book.requested">
          <v-btn color="blue" variant="flat" @click="()=>{raiseRequest(book.id)}">
            Request this book
          </v-btn>
          <v-btn color="orange" variant="flat"
                 @click="router.push(`/buy-book/${book.id}`);" v-if="!book.purchased">
            <v-icon icon="mdi-cart"/>
            Buy
          </v-btn>
          <v-btn color="orange" variant="flat"
                 @click="fetchBook(book.id)" v-else>
            <v-icon icon="mdi-download"/>
            Download
          </v-btn>
        </div>
        <div class="book-actions" v-else>
          <v-btn class="btn-red" variant="flat" @click="()=>{deleteRequest(book.id)}">
            Cancel Request
          </v-btn>
          <v-btn color="orange" variant="flat"
                 @click="router.push(`/buy-book/${book.id}`);">
            <v-icon icon="mdi-cart"/>
            Buy
          </v-btn>
        </div>
      </div>
    </div>
    <div class="description-box">
      <h2 class="description-title">Description:</h2>
      <p>{{ book.description }}</p>
    </div>
  </div>
  <v-snackbar v-if="snackbar" v-model="snackbar" :color="snackbarColor" :timeout="3000" class="custom-snackbar">
    {{ snackbarMessage }}
    <button @click="snackbar = false" class="snackbar-close-btn">X</button>
  </v-snackbar>
  <v-dialog v-model="dialog" class="dialog" max-width="400">
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
.book-details-main-container {
  display: flex;
  flex-direction: column;
  border: 1px solid #677c99;
  width: 100%;
  max-width: 60%;
  margin-top: 1rem;
}

.book-details-title-image-container {
  display: flex;
  gap: 0.5rem;
}

.book-details-image-container {
  height: 20rem;
  padding: 0.5rem;
  border: 1px solid #506782;
  margin: 0.5rem;
}

.book-image {
  height: 100%;
  width: 100%;
}

.book-details-title-text {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1rem 0;
}

.book-title {
  font-size: 2rem;
  font-weight: 500;
}

.status-purchased {
  font-size: 0.875rem;
  background-color: #f59e0b;
  color: #ffffff;
  padding: 0.25rem 0.5rem;
  border-radius: 1.25rem;
  display: inline-block;
}

.book-author {
  display: inline;
}

.issued-book-actions,
.book-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.description-box {
  margin: 0 0.5rem;
}

.description-title {
  margin: 1rem 0;
  font-size: 1.5rem;
  text-transform: uppercase;
  font-weight: 500;
}


.custom-snackbar {
  display: flex;
  justify-content: flex-start;
}

.snackbar-close-btn {
  margin-left: auto;
  color: white;
}

.dialog {
  max-width: 400px;
}
</style>
