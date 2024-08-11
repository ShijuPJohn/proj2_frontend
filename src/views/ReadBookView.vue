<script setup>
import {useRoute} from 'vue-router';
import {onMounted, ref, watch} from "vue";
import {useAuthStore} from "@/stores/authStore.js";
import {storeToRefs} from "pinia";
import axios from "axios";
import router from "@/router/index.js";
import VuePdfEmbed from 'vue-pdf-embed'
import {PDFDocument} from 'pdf-lib';
import 'vue-pdf-embed/dist/styles/annotationLayer.css'
import 'vue-pdf-embed/dist/styles/textLayer.css'

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
const currentPage = ref(1);
let totalPages = 0;
const pageNumberFieldValue = ref(0);


watch(bookFile, async (newBookFile) => {
  if (newBookFile) {
    bookFileUrl.value = URL.createObjectURL(newBookFile);
    const arrayBuffer = await newBookFile.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    totalPages = pdfDoc.getPageCount();
  } else {
    bookFileUrl.value = '';
  }
});
watch(currentPage, newVal => {
  pageNumberFieldValue.value = newVal;
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

function nextPage() {
  if (currentPage.value !== totalPages) {
    currentPage.value++;
  }
}

function previousPage() {
  if (currentPage.value !== 1) {
    currentPage.value--;
  }
}


async function fetchBook(bookId) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token.value}`
  };
  try {
    const response = await axios.get(`http://localhost:5000/api/book-file/${bookId}`, {headers, responseType: "blob"});
    console.log(response)
    bookFile.value = response.data;


  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

onMounted(async () => {
  fetchBook(bookId)
})
</script>

<template>
  <div class="book-container">
    <div class="page-controls-strip"
         @keydown.left="previousPage" @keydown.right="nextPage">
      <button @click="previousPage" class="control-button">
        <v-icon icon="mdi-arrow-left"/>
      </button>
      <button @click="nextPage" class="control-button">
        <v-icon icon="mdi-arrow-right"/>
      </button>
      <input type="number" class="page-number-input" v-model="pageNumberFieldValue"
             @keydown.enter="currentPage=pageNumberFieldValue"/>
    </div>

    <div class="scroll-container">
      <VuePdfEmbed :page="currentPage" width="1000" annotation-layer text-layer :source="bookFileUrl"  />
    </div>
  </div>

  <v-snackbar v-if="snackbar" v-model="snackbar" :color="snackbarColor" :timeout="3000" class="custom-snackbar">
    {{ snackbarMessage }}
    <button @click="snackbar = false" class="snackbar-close-btn">X</button>
  </v-snackbar>
</template>

<style scoped>
.page-controls-strip {
  height: 2.5rem;
  width: 1000px;
  background-color: #374151;
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  justify-content: center;
  gap: 1rem;
  align-items: center;
}

.control-button {
  color: white;
}

.page-number-input {
  color: white;
  width: 4rem;
  border: 2px solid #64748b;
  border-radius: 0.25rem;
  margin: 0.5rem;
  padding: 0.5rem;
}

.scroll-container {
  height: calc(100vh - 4rem);
  overflow: hidden;
  overflow-y: scroll;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scroll-container::-webkit-scrollbar {
  display: none;
}

.hiddenCanvasElement {
  position: absolute;
}

input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  margin: 0;
}

.custom-snackbar {
  position: fixed;
  bottom: 1rem;
  left: 1rem;
  z-index: 1000;
}

.snackbar-close-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
}
</style>
