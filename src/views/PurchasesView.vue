<script setup>
import {onMounted, ref} from "vue";
import axios from "axios";
import {useAuthStore} from "@/stores/authStore.js";
import {storeToRefs} from "pinia";

const snackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');
const authStore = useAuthStore();
const {loading, role, error, isLoggedIn, token} = storeToRefs(authStore);
const purchases = ref([]);
onMounted(async () => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token.value}`
  };
  try {
    const response = await axios.get(`http://localhost:5000/api/purchases`, {headers});
    console.log(response)
    purchases.value = response.data.purchases;

  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
})

function formatDate(dateString) {
  const date = new Date(dateString);

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based, so add 1
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
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
  <div class="request-card-container">
    <div v-for="purchase in purchases"
         class="issue-card">
      <div class="book-image-container">
        <img :src="purchase.book.cover_image" alt="" class="book-image">
      </div>
      <router-link :to="`/book-details/${purchase.book.id}/${purchase.book.title}`" tag="div"
                   class="book-details">
        <p class="book-title">{{ purchase.book.title }}</p>
        <p class="book-authors">
          <span class="author-name" v-for="author in purchase.book.authors">
            {{ author.name }}
          </span>
        </p>
      </router-link>
      <div class="purchased-by" v-if="role!=='librarian'">
        <span class="label">Purchased by: </span>{{ purchase.user.username }}
      </div>
      <div class="purchase-date">
        <span class="label">on: </span>{{ formatDate(purchase.date_time) }}
      </div>
      <div class="request-card-btn-container">
        <v-btn flat color="green" @click="fetchBook(purchase.book.id)" v-if="role!=='librarian'">
          <v-icon icon="mdi-download"/>
        </v-btn>
      </div>
    </div>
  </div>
</template>

<style scoped>
.request-card-container {
  width: 95%;
  max-width: 70%;
}

.issue-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 5rem;
  padding: 0.3rem;
  margin: 0.5rem;
  background-color: rgba(31, 41, 55, 0.15);
  border: 1px solid #64748b;
}

.book-image-container {
  height: 100%;
}

.book-image {
  height: 100%;
  width: 100%;
  object-fit: contain;
}

.book-details {
  width: 35%;
  display: flex;
  flex-direction: column;
}

.book-title {
  font-weight: 500;
  font-size: 1.2rem;
}

.book-authors {
  font-size: 1.2rem;
}

.author-name {
  font-size: 0.7rem;
  margin-right: 0.5rem;
  color: #64748b;
}

.purchased-by {
  display: flex;
  align-items: center;
}

.label {
  font-size: 0.6rem;
  color: #64748b;
}

.purchase-date {
  display: flex;
  align-items: center;
}

.purchase-date .label {
  font-size: 0.9rem;
  color: #64748b;
}

.request-card-btn-container {
  display: flex;
  gap: 0.25rem;
}
</style>
