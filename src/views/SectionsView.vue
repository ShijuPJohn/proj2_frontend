<script setup>
import {onMounted, ref, watch} from "vue";
import router from "@/router/index.js";
import {useAuthStore} from "@/stores/authStore.js";
import {storeToRefs} from "pinia";
import axios from "axios";

const snackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');
const sections = ref([]);
const currentSectionId = ref(0);
const deleteConfirmDialog = ref(false);
const editSectionDialog = ref(false);
const deleteSectionDialogMessage = ref("");
const valid = ref(false);
const sectionName = ref('');
const sectionDescription = ref('');
let mode = "edit";


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
    const response = await axios.get('http://localhost:5000/api/sections', {headers});
    console.log(response)
    if (response.status === 200) {
      sections.value = response.data.sections;
    }
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

function openDeleteDialog(sid) {
  currentSectionId.value = sid
  deleteSectionDialogMessage.value = "Do you really want to delete this section?";
  deleteConfirmDialog.value = true;
}

function openEditDialog(section) {
  currentSectionId.value = section.id;
  sectionName.value = section.name;
  sectionDescription.value = section.description;
  mode = "edit"
  editSectionDialog.value = true;
}

function openCreateDialog() {
  currentSectionId.value = -1;
  sectionName.value = '';
  sectionDescription.value = '';
  mode = "create"
  editSectionDialog.value = true;
}

async function deleteSection() {
  try {
    const response = await axios.delete(`http://localhost:5000/api/sections/${currentSectionId.value}`, {headers});
    console.log("response from backend", response.data)
    sections.value = sections.value.filter(section => section.id !== currentSectionId.value);
    snackbarMessage.value = "Section Deleted";
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

async function editSection() {
  const data = {
    name: sectionName.value,
    description: sectionDescription.value
  };
  try {
    const response = await axios.put(`http://localhost:5000/api/sections/${currentSectionId.value}`, data, {headers})
    console.log("response", response)
    const targetSectionId = sections.value.findIndex(section => section.id === currentSectionId.value);
    if (targetSectionId !== -1) {
      sections.value[targetSectionId].name = response.data.section.name;
      sections.value[targetSectionId].description = response.data.section.description;
    }
    snackbarMessage.value = "Section Edited";
    snackbarColor.value = 'success';
    snackbar.value = true;
    sectionName.value = "";
    sectionDescription.value = "";

  } catch (error) {
    snackbarMessage.value = "Failed. Please try again.";
    snackbarColor.value = 'error';
    snackbar.value = true;
  }
  editSectionDialog.value = false;
}

async function createSection() {
  const data = {
    name: sectionName.value,
    description: sectionDescription.value,
  };
  try {
    const response = await axios.post('http://localhost:5000/api/sections', data, {headers})
    console.log(response)
    sections.value = [...sections.value, response.data.section];
    snackbarMessage.value = "Section added"
    snackbarColor.value = 'success'
    snackbar.value = true

  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    snackbarMessage.value = "Failed. Please try again.";
    snackbarColor.value = 'error'
    snackbar.value = true
  }
  editSectionDialog.value = false;
}
</script>

<template>
  <div class="section-card-container">
    <div class="section-card" v-for="section in sections" :key="section.id">
      <div class="section-title-box"><h3 class="section-title">{{ section.id }}. {{ section.name }}</h3></div>
      <div class="section-description-box">
        <p class="section-description">{{ section.description }}</p>
      </div>
      <div class="section-card-action-btns-container">
        <v-btn flat color="#f59342" @click="openEditDialog(section)">
          <v-icon icon="mdi-pencil"/>
        </v-btn>
        <v-btn flat color="#bd3228" @click="openDeleteDialog(section.id)">
          <v-icon icon="mdi-delete"/>
        </v-btn>
      </div>
    </div>
  </div>

  <v-dialog v-model="deleteConfirmDialog" class="dialog" max-width="400">
    <v-card>
      <v-card-title class="dialog-title">Confirm Delete</v-card-title>
      <v-card-subtitle class="dialog-subtitle">{{ deleteSectionDialogMessage }}</v-card-subtitle>
      <v-card-actions class="dialog-actions">
        <v-spacer></v-spacer>
        <v-btn color="green" @click="deleteSection">Yes</v-btn>
        <v-btn color="red" @click="deleteConfirmDialog = false">No</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog v-model="editSectionDialog" class="dialog" max-width="700">
    <v-card>
      <v-card-title class="dialog-title">{{ mode === 'edit' ? 'Edit the Section' : 'Create a new Section' }}</v-card-title>
      <v-container>
        <v-form ref="form" v-model="valid" class="form">
          <v-text-field
              v-model="sectionName"
              variant="outlined"
              label="Section Name"
              :rules="sectionNameRules"
              floating-label
              required>
          </v-text-field>
          <v-textarea
              v-model="sectionDescription"
              variant="outlined"
              label="Section Description"
              floating-label
              required>
          </v-textarea>
          <v-card-actions class="form-actions">
            <v-spacer></v-spacer>
            <v-btn type="submit" color="green" @click="mode==='create'?createSection():editSection()">Submit</v-btn>
            <v-btn color="red" @click="editSectionDialog = false">Dismiss</v-btn>
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
.section-card-container {
  width: 95%;
  max-width: 50%;
}

.section-card {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #64748b;
  margin: 0.5rem;
  padding: 0.75rem;
  background-color: rgba(156, 163, 175, 0.4);
}

.section-title-box {
  width: 45%;
}

.section-title {
  font-size: 0.875rem;
  font-weight: 500;
}

.section-description-box {
  width: 30%;
}

.section-description {
  font-size: 0.6rem;
  color: #64748b;
}

.section-card-action-btns-container {
  display: flex;
  gap: 1rem;
}

.dialog {
  max-width: 400px;
}

.dialog-title {
  font-size: 1.5rem;
}

.dialog-subtitle {
  font-size: 1rem;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.floating-action-button {
  position: sticky;
  left: calc(100vw - 6rem);
  top: calc(100vh - 5rem);
  width: 4rem;
  height: 4rem;
  border-radius: 2rem;
  border: 2px solid #64748b;
  background-color: #1e3a8a;
}

.custom-snackbar {
  display: flex;
  justify-content: flex-start;
}

.snackbar-close-btn {
  margin-left: 0.5rem;
  color: white;
}
</style>
