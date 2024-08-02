<script setup>
import {useAuthStore} from "@/stores/authStore.js";
import {storeToRefs} from "pinia";
import {onMounted, ref, watch} from "vue";
import router from "@/router/index.js";
import axios from "axios";

const snackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');
const localStateLoading = ref(true);
const selectedAuthors = ref([]);
const selectedSections = ref([]);
const authStore = useAuthStore();
const {loading, role, error, isLoggedIn, token} = storeToRefs(authStore);
const sections = ref([]);
const authors = ref([]);
const coverImageFile = ref(null);
const coverImageUrl = ref('');
const isPDF = ref(false);
const pdfFile = ref(null);
const pdfFilePath = ref('');
const valid = ref(false);
const title = ref('');
const year = ref('');
const description = ref('');
const content = ref('');
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token.value}`
};

onMounted(async () => {
  if (!authStore.$state || role.value !== "librarian") {
    router.push('/unauthorized')
  }
  const sectonsRes = await axios.get('http://localhost:5000/api/sections', {headers});
  sections.value = sectonsRes.data.sections;
  const authorsRes = await axios.get('http://localhost:5000/api/authors', {headers});
  authors.value = authorsRes.data.authors;
  localStateLoading.value = false;
});

watch(isLoggedIn, (newVal) => {
  console.log("isLoggedIn", newVal)
  if (!isLoggedIn.value || !isLoggedIn) {
    router.push('/')
  }
});
watch(selectedAuthors, (newVal) => {
  console.log("selectedAuthors", newVal)
})

async function handleCoverImageUpload(event) {
  event.preventDefault();
  const formData = new FormData();
  formData.append('image', coverImageFile.value);
  try {
    const response = await axios.post('http://localhost:5000/api/upload-cover-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token.value}`
      }
    });
    coverImageUrl.value = `http://localhost:5000/static/uploads/${response.data.filename}`;
    snackbarMessage.value = "Cover Image uploaded successfully";
    snackbarColor.value = 'success';
    snackbar.value = true;
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    snackbarMessage.value = "Failed to cover Image. Please try again.";
    snackbarColor.value = 'error';
    snackbar.value = true;
  }
}

async function handlePDFUpload(event) {
  event.preventDefault();
  const formData = new FormData();
  formData.append('pdf', pdfFile.value);
  try {
    const response = await axios.post('http://localhost:5000/api/upload-pdf', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token.value}`
      }
    });
    pdfFilePath.value = response.data.filename;
    snackbarMessage.value = "PDF uploaded successfully";
    snackbarColor.value = 'success';
    snackbar.value = true;
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    snackbarMessage.value = "Failed to upload PDF. Please try again.";
    snackbarColor.value = 'error';
    snackbar.value = true;
  }
}
async function onSubmit() {
  const data = {
    title: title.value,
    publication_year: year.value,
    description: description.value,
    sections: sections.value.filter(section=>selectedSections.value.includes(section.name)).map(section=>section.id),
    authors: authors.value.filter(author=>selectedAuthors.value.includes(author.name)).map(author=>author.id),
    filename: pdfFilePath.value,
    content: isPDF.value ? '' : content.value,
    cover_image: coverImageUrl.value,
  };
  try {
    const response = await axios.post('http://localhost:5000/api/books', data, {headers});
    if (response.status === 201) {
      snackbarMessage.value = "Book added successfully";
      snackbarColor.value = 'success';
      snackbar.value = true;
      // Reset form fields if necessary
    } else {
      throw new Error(response.statusText);
    }
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    snackbarMessage.value = "Failed to add book. Please try again.";
    snackbarColor.value = 'error';
    snackbar.value = true;
  }
}

watch(coverImageUrl, (newVal) => {
  console.log("cover image newval", newVal)
})

const submit = () => {
  if (form.value.validate()) {
    onSubmit();
  }
};

const form = ref(null);
</script>

<template>
  <div class="add-book-container">
    <div class="title">Add a new book</div>
    <v-container>
      <v-form ref="form" v-model="valid" class="form">
        <v-text-field v-model="title" variant="outlined" label="Title" floating-label required></v-text-field>
        <v-text-field v-model="year" variant="outlined" label="Year" floating-label required></v-text-field>
        <v-textarea v-model="description" variant="outlined" label="Description" floating-label required></v-textarea>
        <v-autocomplete
            label="Sections"
            variant="outlined"
            v-model="selectedSections"
            multiple
            chips
            clearable
            :items="sections.map(section => section.name)"
        ></v-autocomplete>
        <v-autocomplete
            label="Authors"
            variant="outlined"
            multiple
            chips
            clearable
            v-model="selectedAuthors"
            :items="authors.map(author => author.name)"
        ></v-autocomplete>
        <h3 class="upload-title">Upload a cover Image</h3>
        <div class="upload-container">
          <v-file-input
              accept="image/*"
              label="Cover Image"
              class="file-input"
              v-model="coverImageFile"
              @change="handleCoverImageUpload"
          ></v-file-input>
          <div class="cover-image">
            <img :src="coverImageUrl" alt="Cover Image" class="image" v-if="coverImageUrl">
          </div>
        </div>
        <v-switch v-model="isPDF" color="red" label="Edit Content or upload PDF?" value="red" hide-details></v-switch>
        <p class="upload-prompt">{{ isPDF ? "Upload PDF file" : "Add the content here" }}</p>
        <div class="content-container">
          <v-file-input
              v-if="isPDF"
              accept="application/pdf"
              label="PDF File"
              class="pdf-input"
              v-model="pdfFile"
              @change="handlePDFUpload"
          ></v-file-input>
          <v-textarea
              v-if="!isPDF"
              v-model="content"
              variant="outlined"
              label="Content"
              floating-label
              required
          ></v-textarea>
        </div>
        <v-btn @click="submit" class="form-btn">Submit</v-btn>
      </v-form>
    </v-container>
  </div>
  <v-snackbar v-if="snackbar" v-model="snackbar" :color="snackbarColor" :timeout="3000" class="custom-snackbar">
    {{ snackbarMessage }}
    <button @click="snackbar = false" class="snackbar-close-btn">X</button>
  </v-snackbar>
</template>

<style scoped>
.add-book-container {
  width: 100%;
  max-width: 70%;
  min-height: 55vh;
  background-color: white;
  box-shadow: 10px 10px 30px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  margin-top: 4rem;
}

.title {
  font-size: 1.5rem;
  font-weight: 500;
  color: #4B5563;
  border-bottom: 3px solid var(--secondary-color-light);
  margin-top: 1rem;
  margin-bottom: 1.5rem;
}

.form {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: stretch;
  width: 100%;
}

.upload-title {
  color: #64748B;
}

.upload-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border: 2px solid #E2E8F0;
  margin: 1rem 0;
  padding: 0.5rem 0;
}

.file-input {
  max-width: 18rem;
}

.cover-image {
  margin-left: 0.5rem;
  height: 8rem;
  width: 8rem;
  border: 2px solid #E2E8F0;
}

.image {
  height: 100%;
  width: 100%;
}

.upload-prompt {
  font-size: 1.25rem;
}

.content-container {
  min-height: 12rem;
  width: 100%;
  padding: 0.5rem;
  display: flex;
  justify-content: center;
}

.pdf-input {
  min-height: 4rem;
}

.form-btn {
  height: 4rem;
  width: 10rem;
  text-transform: uppercase;
  background: var(--primary-color-light);
  outline: none;
  border: none;
  border-radius: 5px;
  color: #ffffff;
  cursor: pointer;
  font-weight: 700;
  font-size: 1.2rem;
  margin: 0 auto;
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
