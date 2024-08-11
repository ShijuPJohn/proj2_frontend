<script setup>
import {useAuthStore} from "@/stores/authStore.js";
import {storeToRefs} from "pinia";
import {defineProps, onMounted, ref, watch} from "vue";
import router from "@/router/index.js";
import axios from "axios";
import {tr} from "vuetify/locale";
import {PDFDocument} from "pdf-lib";

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
const price = ref(0.0);
const book = ref({});
const addAuthorDialog = ref(false);
const addSectionDialog = ref(false);
const numberOfPages = ref(0);
const authorName = ref('');
const sectionName = ref('');
const sectionDescription = ref('');
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
});
``
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token.value}`
};

const authorNameRules = [
  value => !!value || 'Required.',
  value => value.length > 3 || "Name should be more than 3 characters",
];
const sectionNameRules = [
  value => !!value || 'Required.',
  value => value.length > 3 || "Name should be more than 3 characters",
];
onMounted(async () => {
  if (!authStore.$state || role.value !== "librarian") {
    router.push('/unauthorized')
  }
  fetchAuthors();
  fetchSections();
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
    price.value = response.data.book.price;
  }
});

async function fetchAuthors() {
  const authorsRes = await axios.get('http://localhost:5000/api/authors', {headers});
  authors.value = authorsRes.data.authors;
}

async function fetchSections() {
  const sectionsRes = await axios.get('http://localhost:5000/api/sections', {headers});
  sections.value = sectionsRes.data.sections;
}

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
    const arrayBuffer = await pdfFile.value.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    numberOfPages.value = pdfDoc.getPageCount();
    console.log(pdfDoc.getPageCount())
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
  const filename = pdfFilePath.value;
  const nContent = isPDF.value ? '' : content.value;
  const cover_image = coverImageUrl.value;
  const nPrice = price.value;
  const number_of_pages = numberOfPages.value;
  props.submitCallback(title.value, year.value, description.value, nSections, nAuthors, filename, nContent, cover_image, nPrice, number_of_pages)
}

function onEdit() {
  const nSections = sections.value.filter(section => selectedSections.value.includes(section.name)).map(section => section.id)
  const nAuthors = authors.value.filter(author => selectedAuthors.value.includes(author.name)).map(author => author.id)
  const filename = pdfFilePath.value
  const nContent = isPDF.value ? '' : content.value
  const cover_image = coverImageUrl.value
  const nPrice = price.value;
  props.editCallback(props.bookId, title.value, year.value, description.value, nSections, nAuthors, filename, nContent, cover_image, nPrice)
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

async function createAuthor() {
  console.log("create author called")
  const data = {
    name: authorName.value,
  };
  try {
    const response = await axios.post('http://localhost:5000/api/authors', data, {headers})
    authorName.value = '';
    snackbarMessage.value = "Author added"
    snackbarColor.value = 'success'
    snackbar.value = true

  } catch (error) {
    snackbarMessage.value = "Failed. Please try again.";
    snackbarColor.value = 'error'
    snackbar.value = true
  } finally {
    fetchAuthors();
  }
  addAuthorDialog.value = false;
}

async function createSection() {
  const data = {
    name: sectionName.value,
    description: sectionDescription.value,
  };
  try {
    const response = await axios.post('http://localhost:5000/api/sections', data, {headers})
    sectionName.value = '';
    sectionDescription.value = '';
    snackbarMessage.value = "Section added"
    snackbarColor.value = 'success'
    snackbar.value = true

  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    snackbarMessage.value = "Failed. Please try again.";
    snackbarColor.value = 'error'
    snackbar.value = true
  } finally {
    fetchSections();
  }
  addSectionDialog.value = false;
}

const form = ref(null);
</script>

<template>
  <div class="add-book-container">
    <v-container>
      <v-form ref="form" v-model="valid" class="form">
        <v-text-field
            v-model="title"
            :rules="[v => !!v || 'Title is required', v => v.length > 3 || 'Title should be at least 3 characters']"
            variant="outlined"
            label="Title"
            floating-label
            required>
        </v-text-field>

        <v-text-field
            v-model="year"
            :rules="[v => !!v || 'Published year is required', v => /^\d{4}$/.test(v) || 'Enter in the format YYYY']"
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

        <v-text-field
            v-model="price"
            :rules="[v => !!v || 'Price is required', v => /^\d+$/.test(v) || 'Only numbers are allowed']"
            variant="outlined"
            label="Price"
            floating-label
            required>
        </v-text-field>

        <v-autocomplete
            label="Sections"
            variant="outlined"
            v-model="selectedSections"
            :rules="[v => v.length >= 1 || 'Select at least one section']"
            multiple
            chips
            clearable
            :items="sections.map(section => section.name)">
        </v-autocomplete>

        <button @click="addSectionDialog=true" class="add-section-author-button">
          Add New Section
        </button>

        <v-autocomplete
            label="Authors"
            variant="outlined"
            :rules="[v => v.length >= 1 || 'Select at least one author']"
            multiple
            chips
            clearable
            v-model="selectedAuthors"
            :items="authors.map(author => author.name)">
        </v-autocomplete>

        <button @click="addAuthorDialog=true" class="add-section-author-button">
          Add New Author
        </button>

        <h3 class="upload-title">Upload a cover Image</h3>

        <div class="upload-container">
          <v-file-input
              accept="image/*"
              label="Cover Image"
              class="file-input"
              v-model="coverImageFile"
              @change="handleCoverImageUpload">
          </v-file-input>
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
              @change="handlePDFUpload">
          </v-file-input>
          <v-textarea
              v-if="!isPDF"
              v-model="content"
              variant="outlined"
              label="Content"
              floating-label
              required>
          </v-textarea>
        </div>

        <div class="form-action-btn-container">
          <v-btn @click="submit" class="form-btn">Submit</v-btn>
          <v-btn @click="closeCallback" color="red" class="form-btn">Cancel</v-btn>
        </div>
      </v-form>
    </v-container>

    <v-snackbar v-if="snackbar" v-model="snackbar" :color="snackbarColor" :timeout="3000" class="custom-snackbar">
      {{ snackbarMessage }}
      <button @click="snackbar = false" class="snackbar-close-btn">X</button>
    </v-snackbar>

    <v-dialog v-model="addAuthorDialog" max-width="700">
      <v-card>
        <v-card-title class="headline">Create a new Author</v-card-title>
        <v-container>
          <v-form ref="form" class="form" @submit.prevent="createAuthor">
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
              <v-btn type="submit" color="green">Submit</v-btn>
              <v-btn color="red" @click.stop="addAuthorDialog = false">Dismiss</v-btn>
            </v-card-actions>
          </v-form>
        </v-container>
      </v-card>
    </v-dialog>

    <v-dialog v-model="addSectionDialog" max-width="700">
      <v-card>
        <v-card-title class="headline">Create a new section:</v-card-title>
        <v-container>
          <v-form ref="form" class="form" @submit.prevent="createSection">
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
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn type="submit" color="green">Submit</v-btn>
              <v-btn color="red" @click.stop="addSectionDialog = false">Dismiss</v-btn>
            </v-card-actions>
          </v-form>
        </v-container>
      </v-card>
    </v-dialog>
  </div>
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

.add-section-author-button {
  border-style: solid;
  border-width: 1px;
  border-radius: 5px;
  border-color: slateblue;
  background-color: #b5b2e8;
  padding: .8rem 1rem;
  margin: 0 0 1rem 0;
  width: 10rem;
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

.form-action-btn-container {
  display: flex;
  gap: 2rem;
  justify-content: center;
  width: 100%;
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

