<script setup>
import {useAuthStore} from "@/stores/authStore.js";
import {storeToRefs} from "pinia";
import {defineProps, onMounted, ref, watch} from "vue";
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
const book = ref(null);
const props = defineProps({
  closeCallback: {
    type: Function,
  },
  submitCallback: {
    type: Function,
  },
  editCallback: {
    type: Function,
  },
  mode: {
    type: String,
  },
  bookId: {
    type: Number,
  }
})
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token.value}`
};

onMounted(async () => {
  if (!authStore.$state || role.value !== "librarian") {
    router.push('/unauthorized')
  }
  const sectionsRes = await axios.get('http://localhost:5000/api/sections', {headers});
  sections.value = sectionsRes.data.sections;
  const authorsRes = await axios.get('http://localhost:5000/api/authors', {headers});
  authors.value = authorsRes.data.authors;
  localStateLoading.value = false;
  if (props.mode === "edit") {
    const response = await axios.get(`http://localhost:5000/api/books/${props.bookId}`, {headers});
    title.value = response.data.book.title;
    year.value = response.data.book.publication_year;
    description.value = response.data.book.description;
    selectedSections.value = response.data.book.sections.map(section => section.name);
    selectedAuthors.value = response.data.book.authors.map(author => author.name);
    coverImageUrl.value = response.data.book.cover_image;
    pdfFilePath.value = response.data.book.filename;
    coverImageUrl.value = response.data.book.cover_image;
  }
});


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

function onSubmit() {
  const nSections = sections.value.filter(section => selectedSections.value.includes(section.name)).map(section => section.id)
  const nAuthors = authors.value.filter(author => selectedAuthors.value.includes(author.name)).map(author => author.id)
  const filename = pdfFilePath.value
  const nContent = isPDF.value ? '' : content.value
  const cover_image = coverImageUrl.value
  props.submitCallback(title.value, year.value, description.value, nSections, nAuthors, filename, nContent, cover_image)
}

function onEdit() {
  const nSections = sections.value.filter(section => selectedSections.value.includes(section.name)).map(section => section.id)
  const nAuthors = authors.value.filter(author => selectedAuthors.value.includes(author.name)).map(author => author.id)
  const filename = pdfFilePath.value
  const nContent = isPDF.value ? '' : content.value
  const cover_image = coverImageUrl.value
  props.editCallback(props.bookId, title.value, year.value, description.value, nSections, nAuthors, filename, nContent, cover_image)
}

const submit = () => {
  if (form.value.validate()) {
    if (props.mode === 'edit') {
      onEdit();
    } else {
      onSubmit();
    }

  }
};

const form = ref(null);
</script>

<template>
  <div class="add-book-container">
    <v-container>
      <v-form ref="form" v-model="valid" class="form">
        <v-text-field
            v-model="title"
            :rules="[v => !!v || 'Title is required', v=>v.length>3 || 'Title should be at least 3 characters']"
            variant="outlined"
            label="Title"
            floating-label
            required>

        </v-text-field>
        <v-text-field
            v-model="year"
            :rules="[v => !!v || 'Published year is required', v=>/^\d{4}$/.test(v) || 'Enter in the format YYYY']"
            variant="outlined"
            label="Year"
            floating-label
            required>
        </v-text-field>
        <v-textarea
            v-model="description"
            variant="outlined"
            label="Description"
            floating-label
            required>
        </v-textarea>
        <v-autocomplete
            label="Sections"
            variant="outlined"
            v-model="selectedSections"
            :rules="[v=>v.length>=1 || 'Select at least one section']"
            multiple
            chips
            clearable
            :items="sections.map(section => section.name)"
        ></v-autocomplete>
        <v-autocomplete
            label="Authors"
            variant="outlined"
            :rules="[v=>v.length>=1 || 'Select at least one author']"
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
        <div class="form-action-btn-container w-full flex gap-2 justify-center">
          <v-btn @click="submit" class="form-btn">Submit</v-btn>
          <v-btn @click="closeCallback" color="red" class="form-btn">Cancel</v-btn>
        </div>
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
  min-height: 55vh;
  background-color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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
  height: 3rem;
  width: 10rem;
  text-transform: uppercase;
  background: var(--primary-color-light);
  outline: none;
  border: none;
  border-radius: 5px;
  color: #ffffff;
  cursor: pointer;
  font-weight: 700;
  font-size: 1rem;
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
