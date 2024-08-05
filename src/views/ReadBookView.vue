<script setup>
import {useRoute} from 'vue-router';
import {onMounted, ref, watch} from "vue";
import {useAuthStore} from "@/stores/authStore.js";
import {storeToRefs} from "pinia";
import axios from "axios";
import router from "@/router/index.js";

const snackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');
const authStore = useAuthStore();
const {loading, role, error, isLoggedIn, token} = storeToRefs(authStore);
const listOfBooks = ref([]);
const listOfRequests = ref([]);
const bookFile = ref(null);
const bookFileUrl = ref('');
const route = useRoute();
const bookId = route.params.id;
const bookTitle = route.params.title;

watch(bookFile, (newBookFile) => {
  if (newBookFile) {
    bookFileUrl.value = URL.createObjectURL(newBookFile);
  } else {
    bookFileUrl.value = '';
  }
});
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
async function fetchBook(bookId) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token.value}`
  };
  try {
    const response = await axios.get(`http://localhost:5000/api/book-file/${bookId}`, {headers, responseType: "blob"});
    if (response.status === 200) {
      console.log(response)
      bookFile.value = response.data;
    }
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

onMounted(async () => {
  fetchBook(bookId)
})
</script>

<template>
  <embed :src="bookFileUrl" type="application/pdf" width="90%" height="700px"/>
  <v-snackbar v-if="snackbar" v-model="snackbar" :color="snackbarColor" :timeout="3000" class="custom-snackbar">
    {{ snackbarMessage }}
    <button @click="snackbar = false" class="snackbar-close-btn">X</button>
  </v-snackbar>
</template>

<style scoped>

</style>