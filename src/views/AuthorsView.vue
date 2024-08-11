<script setup>
import {onMounted, reactive, ref, watch} from "vue";
import router from "@/router/index.js";
import {useAuthStore} from "@/stores/authStore.js";
import {storeToRefs} from "pinia";
import axios from "axios";
import BookStrips from "@/components/BookStrips.vue";

const snackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');
const authors = ref([]);
const currentAuthorId = ref(0);
const deleteConfirmDialog = ref(false);
const editAuthorDialog = ref(false);
const deleteAuthorDialogMessage = ref("");
const valid = ref(false);
const authorName = ref('');
const mode = ref("edit");

const authStore = useAuthStore();
const {loading, role, error, isLoggedIn, token} = storeToRefs(authStore)
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token.value}`
};
const authorNameRules = [
  value => !!value || 'Required.',
  value => value.length > 3 || "Name should be more than 3 characters",
];

onMounted(async () => {
  if (!authStore.$state || role.value !== 'librarian') {
    router.push('/unauthorized')
  }
  try {
    const response = await axios.get('http://localhost:5000/api/authors', {headers});
    if (response.status === 200) {
      authors.value = response.data.authors;
    }
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
})
watch(isLoggedIn, (newVal) => {
  if (!isLoggedIn.value || !isLoggedIn) {
    router.push('/')
  }
})

function openDeleteDialog(aid) {
  currentAuthorId.value = aid
  deleteAuthorDialogMessage.value = "Do you really want to delete this author?";
  deleteConfirmDialog.value = true;
}

function openEditDialog(author) {
  currentAuthorId.value = author.id;
  editAuthorDialog.value = true;
  authorName.value = author.name;
  mode.value = "edit";
}

function openCreateDialog() {
  currentAuthorId.value = -1;
  editAuthorDialog.value = true;
  authorName.value = '';
  mode.value = "create";
}

async function deleteAuthor() {
  try {
    const response = await axios.delete(`http://localhost:5000/api/authors/${currentAuthorId.value}`, {headers});
    authors.value = authors.value.filter(author => author.id !== currentAuthorId.value);
    snackbarMessage.value = "Author Deleted";
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

async function editAuthor() {
  const data = {
    name: authorName.value,
  };
  try {
    const response = await axios.put(`http://localhost:5000/api/authors/${currentAuthorId.value}`, data, {headers})
    const targetAuthorIndex = authors.value.findIndex(author => author.id === currentAuthorId.value);
    if (targetAuthorIndex !== -1) {
      authors.value[targetAuthorIndex].name = response.data.author.name;
    }
    snackbarMessage.value = "Author Edited"
    snackbarColor.value = 'success'
    snackbar.value = true
    authorName.value = ""

  } catch (error) {
    snackbarMessage.value = "Failed. Please try again.";
    snackbarColor.value = 'error'
    snackbar.value = true
  }
  editAuthorDialog.value = false;
}

async function createAuthor() {
  console.log("create author called")
  const data = {
    name: authorName.value,
  };
  try {
    const response = await axios.post('http://localhost:5000/api/authors', data, {headers})
    console.log(response)
    authors.value = [...authors.value, response.data.author]
    snackbarMessage.value = "Author added"
    snackbarColor.value = 'success'
    snackbar.value = true
    authorName.value = ""

  } catch (error) {
    snackbarMessage.value = "Failed. Please try again.";
    snackbarColor.value = 'error'
    snackbar.value = true
  }
  editAuthorDialog.value=false;
}
</script>

<template>
  <div class="author-card-container">
    <div
        class="author-card"
        v-for="author in authors" :key="author.id">
      <h3>{{ author.id }}. {{ author.name }}</h3>
      <div class="author-card-action-btns-container">
        <v-btn class="btn" color="orange" flat @click="openEditDialog(author)">
          <v-icon icon="mdi-pencil"/>
        </v-btn>
        <v-btn class="btn" color="red" flat @click="openDeleteDialog(author.id)">
          <v-icon icon="mdi-delete"/>
        </v-btn>
      </div>
    </div>
  </div>

  <v-dialog v-model="deleteConfirmDialog" class="dialog" max-width="400">
    <v-card>
      <v-card-title class="headline">Confirm Delete</v-card-title>
      <v-card-subtitle>{{ deleteAuthorDialogMessage }}</v-card-subtitle>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn class="btn" color="green" @click="deleteAuthor">Yes</v-btn>
        <v-btn class="btn" color="red" @click="deleteConfirmDialog = false">No</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="editAuthorDialog" class="dialog" max-width="700">
    <v-card>
      <v-card-title class="headline">{{ mode === "edit" ? "Edit Author" : "Create a new Author" }}</v-card-title>
      <v-container>
        <v-form ref="form" v-model="valid" class="form">
          <v-text-field
              v-model="authorName"
              variant="outlined"
              label="Author's Name"
              :rules="authorNameRules"
              floating-label
              required>
          </v-text-field>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn type="submit" class="btn" color="green" @click="()=>{
          if(mode==='create'){
            createAuthor()
          } else {
            editAuthor()
          }
        }">Submit
            </v-btn>
            <v-btn class="btn" color="red" @click="editAuthorDialog = false">Dismiss
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-container>
    </v-card>
  </v-dialog>

  <button class="floating-action-button" @click="openCreateDialog">
    <v-icon color="white" icon="mdi-plus"/>
  </button>

  <v-snackbar v-if="snackbar" v-model="snackbar" :color="snackbarColor" :timeout="3000" class="custom-snackbar">
    {{ snackbarMessage }}
    <button @click="snackbar = false" class="snackbar-close-btn">X</button>
  </v-snackbar>
</template>

<style scoped>
.author-card-container {
  width: 95%;
  max-width: 50%;
}

.author-card {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #4b5563;
  margin: 0.5rem;
  padding: 0.75rem;
  background-color: rgba(107, 114, 128, 0.4);
}

.author-card h3 {
  font-size: 0.875rem;
}

.author-card-action-btns-container {
  display: flex;
  gap: 1rem;
}

.btn {
  border: none;
  cursor: pointer;
}


.dialog {
  max-width: 400px;
}

.floating-action-button {
  position: fixed; /* Changed from sticky to fixed */
  bottom: 2rem;    /* Distance from the bottom of the viewport */
  right: 2rem;     /* Distance from the right of the viewport */
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  border: 2px solid #4b5563;
  background-color: #1d4ed8;
  box-shadow: rgba(0, 0, 0, 0.24) 0 3px 8px;
  z-index: 1000;   /* Ensure it's on top of other elements */
}

.custom-snackbar {
  display: flex;
  justify-content: flex-start;
}

.snackbar-close-btn {
  margin-left: auto;
  color: white;
}
</style>
