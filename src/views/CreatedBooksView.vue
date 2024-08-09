<script setup>
import {onMounted, ref, watch} from "vue";
import router from "@/router/index.js";
import {useAuthStore} from "@/stores/authStore.js";
import {storeToRefs} from "pinia";
import axios from "axios";
import AddBook from "@/components/AddBook.vue";

const snackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');
const books = ref([]);
const currentBookId = ref(0);
const deleteConfirmDialog = ref(false);
const editBookDialog = ref(false);
const deleteBookDialogMessage = ref("");
const valid = ref(false);
const sectionName = ref('');
const sectionDescription = ref('');
const mode = ref("edit");


const authStore = useAuthStore();
const {loading, role, error, isLoggedIn, token} = storeToRefs(authStore)
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token.value}`
};
const sectionNameRules = [
  value => !!value || 'Required.',
  value => value.length > 3 || "Name should be more than 3 characters",
];

onMounted(async () => {
  if (!authStore.$state || role.value !== 'librarian') {
    router.push('/unauthorized')
  }
  try {
    const response = await axios.get('http://localhost:5000/api/books', {headers});
    console.log(response)
    books.value = response.data.ebooks;

  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
})
watch(isLoggedIn, (newVal) => {
  console.log("isLoggedIn", newVal)
  if (!isLoggedIn.value || !isLoggedIn) {
    router.push('/')
  }
})

function openDeleteDialog(bId) {
  currentBookId.value = bId
  deleteConfirmDialog.value = true;
}

function closeCreateDialog() {
  editBookDialog.value = false;
}


function openEditDialog(bid) {
  mode.value = "edit"
  currentBookId.value = bid;
  editBookDialog.value = true;
}

function openCreateDialog() {
  mode.value = "create"
  editBookDialog.value = true;
}

//
async function deleteBook() {
  try {
    const response = await axios.delete(`http://localhost:5000/api/books/${currentBookId.value}`, {headers});
    books.value = books.value.filter(book => book.id !== currentBookId.value);
    snackbarMessage.value = "Book Deleted";
    snackbarColor.value = 'success';
    snackbar.value = true;

  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    snackbarMessage.value = `Failed. ${error.response ? error.response.data.message : error.message}`;
    snackbarColor.value = 'error'
    snackbar.value = true
  }
  deleteConfirmDialog.value = false;
}


async function editBook(bid, title, publication_year, description, sections, authors, filename, content, cover_image) {
  const data = {title, publication_year, description, sections, authors, filename, content, cover_image}
  try {
    const response = await axios.put(`http://localhost:5000/api/books/${bid}`, data, {headers});
    console.log(response.data)
    const rIndex = books.value.findIndex(book => book.id === bid)
    books.value[rIndex] = response.data.ebook;
    snackbarMessage.value = "Book added successfully";
    snackbarColor.value = 'success';
    snackbar.value = true;
    editBookDialog.value = false;
    // Reset form fields if necessary

  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    snackbarMessage.value = "Failed to add book. Please try again.";
    snackbarColor.value = 'error';
    snackbar.value = true;
  }
}


async function createBook(title, publication_year, description, sections, authors, filename, content, cover_image) {
  const data = {title, publication_year, description, sections, authors, filename, content, cover_image}
  try {
    const response = await axios.post('http://localhost:5000/api/books', data, {headers});
    console.log(response)
    editBookDialog.value = false;
    books.value = [...books.value, response.data.ebook]
    snackbarMessage.value = "Book added successfully";
    snackbarColor.value = 'success';
    snackbar.value = true;
    // Reset form fields if necessary

  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    snackbarMessage.value = "Failed to add book. Please try again.";
    snackbarColor.value = 'error';
    snackbar.value = true;
  }
}

</script>

<template>
  <div class="section-card-container w-[95%] md:w-[65%]">
    <div
        class="section-card flex flex-row justify-space-between items-center border-slate-500 border-[1px] m-2 px-2 py-3 bg-slate-400 bg-opacity-40"
        v-for="book in books" :key="book.id">
      <div class="book-strip-image-container h-[4.5rem]">
        <img :src="book.cover_image" alt="cover image" class="w-full h-full">
      </div>
      <div class="section-title-box  w-[40%] flex flex-col">
        <h3 class="text-sm">{{ book.id }}. {{ book.title }}</h3>
        <div class="author-names text-[.6rem] text-slate-500">
          <span v-for="author in book.authors" class="book-author">{{ author.name }}   &nbsp&nbsp&nbsp</span>
        </div>
      </div>
      <div class="section-description-box w-[30%]">
        <!--        <p class="section-description text-[.6rem] text-slate-500">{{ book.description }}</p>-->
      </div>
      <div class="section-card-action-btns-container flex gap-4">
        <v-btn flat color="#f59342" @click="openEditDialog(book.id)">
          <v-icon icon="mdi-pencil"/>
        </v-btn>
        <v-btn flat color="#bd3228" @click="openDeleteDialog(book.id)">
          <v-icon icon="mdi-delete"/>
        </v-btn>
      </div>
    </div>
  </div>

  <v-dialog v-model="deleteConfirmDialog" max-width="400">
    <v-card>
      <v-card-title class="headline">Confirm Delete</v-card-title>
      <v-card-subtitle>Do you really want to delete this book?</v-card-subtitle>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="green" @click="deleteBook">Yes</v-btn>
        <v-btn color="red" @click="deleteConfirmDialog = false">No</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>


  <v-dialog v-model="editBookDialog" persistent max-width="700">
    <v-card>
      <v-card-title class="headline">{{ mode === 'edit' ? 'Edit the Book' : 'Create a new Book' }}</v-card-title>
      <v-container>
        <AddBook :close-callback="closeCreateDialog" :submit-callback="createBook" :edit-callback="editBook" :book-id="currentBookId"
                 :mode="mode"/>
      </v-container>
    </v-card>
  </v-dialog>

  <button class="floating-action-button sticky
  left-[calc(100vw-6rem)]
  top-[calc(100vh-5rem)]
   w-[4rem] h-[4rem]
    rounded-[10rem]
     border-slate-500
      border-[2px]
      bg-blue-700" @click="openCreateDialog">
    <v-icon color="white" icon="mdi-plus"/>
  </button>


  <v-snackbar v-if="snackbar" v-model="snackbar" :color="snackbarColor" :timeout="3000" class="custom-snackbar">
    {{ snackbarMessage }}
    <button @click="snackbar = false" class="snackbar-close-btn">X</button>
  </v-snackbar>
</template>

<style scoped>
.custom-snackbar {
  display: flex;
  justify-content: flex-start;
}

.snackbar-close-btn {
  margin-left: auto;
  color: white;
}
</style>