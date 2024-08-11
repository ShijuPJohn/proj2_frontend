<script setup>
import {onMounted, ref} from "vue";
import axios from "axios";
import {useAuthStore} from "@/stores/authStore.js";
import {storeToRefs} from "pinia";
import {useRoute} from "vue-router";

const snackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');
const authStore = useAuthStore();
const {loading, role, error, isLoggedIn, token} = storeToRefs(authStore);
const book = ref({});
const cardNumber = ref('');
const expiryDate = ref('');
const cvv = ref('');
const nameOnCard = ref('');
const route = useRoute();
const bookId = route.params.id;
onMounted(async () => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token.value}`
  };
  try {
    const response = await axios.get(`http://localhost:5000/api/books/${bookId}`, {headers});
    book.value = response.data.book;

  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
})

async function submitHandler() {
  const data = {
    book_id: book.value.id,
    card_number: cardNumber.value,
    card_name: nameOnCard.value,
    card_expiry: expiryDate.value,
    card_cvv: cvv.value,
  };
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token.value}`
  };
  console.log(data)
  try {
    const response = await axios.post(`http://localhost:5000/api/purchases`, data, {headers});
    snackbarMessage.value = "Book Purchased. Now you can download the book."
    snackbarColor.value = 'success'
    snackbar.value = true
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    snackbarMessage.value = `Failed. ${error.response ? error.response.data.message : error.message}`;
    snackbarColor.value = 'error'
    snackbar.value = true
  }
}
</script>

<template>
  <div class="payment-container">
    <h2 class="">Payment Information</h2>
    <div class="book-info-container">
      <div class="book-strip-image-container">
        <img :src="book.cover_image" alt="cover image" class="book-image">
      </div>
      <div class="section-title-box">
        <h3 class="book-title">{{ book.id }}. {{ book.title }}</h3>
        <div class="author-names">
          <span v-for="author in book.authors" class="book-author">{{ author.name }}   &nbsp&nbsp&nbsp</span>
        </div>
        <p class="book-price">Price: {{ book.price }} INR</p>
      </div>
    </div>

    <form class="payment-form" @submit.prevent="submitHandler">
      <div class="form-group">
        <label for="card-number">Card Number</label>
        <input type="text" id="card-number" placeholder="1234 5678 9012 3456" maxlength="19" required v-model="cardNumber">
      </div>

      <div class="form-group">
        <label for="card-name">Name on Card</label>
        <input type="text" id="card-name" placeholder="John Doe" required v-model="nameOnCard">
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="expiry-date">Expiry Date</label>
          <input type="text" id="expiry-date" placeholder="MM/YY" maxlength="5" required v-model="expiryDate">
        </div>

        <div class="form-group">
          <label for="cvv">CVV</label>
          <input type="text" id="cvv" placeholder="123" maxlength="3" required v-model="cvv">
        </div>
      </div>
      <button type="submit" class="submit-btn">Pay Now</button>
    </form>
  </div>
  <v-snackbar v-if="snackbar" v-model="snackbar" :color="snackbarColor" :timeout="3000" class="custom-snackbar">
    {{ snackbarMessage }}
    <button @click="snackbar = false" class="snackbar-close-btn">X</button>
  </v-snackbar>
</template>

<style scoped>
.payment-container {
  background-color: #ffffff;
  margin-top: 2rem;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  width: 400px;
}

.payment-container h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
  font-size: 24px;
}

.book-info-container {
  padding: 0.5rem;
  display: flex;
  flex-direction: row;
  gap: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 5px;
  margin: 1rem 0;
}

.book-strip-image-container {
  height: 4.5rem;
}

.book-image {
  width: 100%;
  height: 100%;
}

.section-title-box {
  display: flex;
  flex-direction: column;
}

.book-title {
  font-size: 0.875rem;
}

.author-names {
  font-size: 0.6rem;
  color: #64748b;
}

.book-author {
  margin-right: 0.5rem;
}

.book-price {
  color: #64748b;
  margin-top: 0.5rem;
}

.payment-form .form-group {
  margin-bottom: 1rem;
}

.payment-form label {
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
  font-weight: bold;
}

.payment-form input {
  width: 100%;
  padding: 0.625rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.payment-form input:focus {
  border-color: #007bff;
  outline: none;
}

.payment-form .form-row {
  display: flex;
  justify-content: space-between;
}

.payment-form .form-row .form-group {
  flex: 1;
  margin-right: 0.625rem;
}

.payment-form .form-row .form-group:last-child {
  margin-right: 0;
}

.submit-btn {
  width: 100%;
  padding: 0.75rem;
  background-color: var(--primary-color-light);
  color: #ffffff;
  border: none;
  border-radius: 5px;
  font-size: 1.125rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.submit-btn:hover {
  background-color: #0056b3;
}

@media (max-width: 480px) {
  .payment-container {
    width: 100%;
    padding: 15px;
  }

  .payment-form .form-row {
    flex-direction: column;
  }

  .payment-form .form-row .form-group {
    margin-right: 0;
    margin-bottom: 0.625rem; /* 10px */
  }

  .payment-form .form-row .form-group:last-child {
    margin-bottom: 0;
  }
}

.custom-snackbar {
}

.snackbar-close-btn {
}
</style>
