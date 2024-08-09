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
    <div class="page-controls-strip h-10 w-[1000px] bg-slate-700 sticky top-0 z-10 flex justify-center gap-4">
      <button @click="previousPage" class="text-white">
        <v-icon icon="mdi-arrow-left"/>
      </button>
      <button @click="nextPage" class="text-white">
        <v-icon icon="mdi-arrow-right"/>
      </button>
      <form class="form" >
        <input type="number" class="text-white">
        <input type="submit">
      </form>
    </div>

    <div class=" scroll-container h-[calc(100vh-4rem)]">
      <VuePdfEmbed :page="currentPage" width="1000" annotation-layer text-layer :source="bookFileUrl"/>
    </div>
  </div>

  <v-snackbar v-if="snackbar" v-model="snackbar" :color="snackbarColor" :timeout="3000" class="custom-snackbar">
    {{ snackbarMessage }}
    <button @click="snackbar = false" class="snackbar-close-btn">X</button>
  </v-snackbar>
</template>

<style scoped>


.scroll-container {
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
</style>