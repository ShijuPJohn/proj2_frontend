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
  <div class="section-card-container w-[95%] md:w-[50%]">
    <div
        class="section-card flex flex-row justify-space-between items-center border-slate-500 border-[1px] m-2 px-2 py-3 bg-slate-400 bg-opacity-40"
        v-for="section in sections" :key="section.id">
      <div class="section-title-box  w-[45%] "><h3 class="text-sm font-weight-medium">{{ section.id }}. {{ section.name }}</h3></div>
      <div class="section-description-box w-[30%]">
        <p class="section-description text-[.6rem] text-slate-500">{{ section.description }}</p>
      </div>
      <div class="section-card-action-btns-container flex gap-4">
        <v-btn flat color="#f59342" @click="openEditDialog(section)">
          <v-icon icon="mdi-pencil"/>
        </v-btn>
        <v-btn flat color="#bd3228" @click="openDeleteDialog(section.id)">
          <v-icon icon="mdi-delete"/>
        </v-btn>
      </div>
    </div>
  </div>

  <v-dialog v-model="deleteConfirmDialog" max-width="400">
    <v-card>
      <v-card-title class="headline">Confirm Delete</v-card-title>
      <v-card-subtitle>{{ deleteSectionDialogMessage }}</v-card-subtitle>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="green" @click="deleteSection">Yes</v-btn>
        <v-btn color="red" @click="deleteConfirmDialog = false">No</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>


  <v-dialog v-model="editSectionDialog" max-width="700">
    <v-card>
      <v-card-title class="headline">{{ mode === 'edit' ? 'Edit the Section' : 'Create a new Section' }}</v-card-title>
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
        </v-form>
      </v-container>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="green" @click="mode==='create'?createSection():editSection()">Submit</v-btn>
        <v-btn color="red" @click="editSectionDialog = false">Dismiss</v-btn>
      </v-card-actions>
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