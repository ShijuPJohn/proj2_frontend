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
const coverImageUrl = ref(false);
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
    coverImageUrl.value = response.data.filename;
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
    pdfFilePath.value = response.data.filePath;
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
    year: year.value,
    description: description.value,
    sections: selectedSections.value,
    authors: selectedAuthors.value,
    pdfPath: pdfFilePath.value,
    content: isPDF.value ? '' : content.value,
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
  console.log("cover image newval",newVal)
})

const submit = () => {
  if (form.value.validate()) {
    onSubmit();
  }
};

const form = ref(null);
</script>

<template>
  <div class=" w-full md:w-[70%] min-h-[55vh] bg-white shadow-custom1 flex flex-col items-center justify-center p-4">
    <div class="text-2xl font-medium text-gray-600 border-b-[3px] border-secondary-color-light mt-4 mb-6">
      Add a new book
    </div>
    <v-container>
      <v-form ref="form" v-model="valid" class="flex flex-col justify-center items-stretch">
        <v-text-field
            v-model="title"
            variant="outlined"
            label="Title"
            floating-label
            required
        ></v-text-field>
        <v-text-field
            v-model="year"
            variant="outlined"
            label="Year"
            floating-label
            required
        ></v-text-field>
        <v-textarea
            v-model="description"
            variant="outlined"
            label="Description"
            floating-label

            required
        ></v-textarea>

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
        <div class="flex items-center justify-between gap-4 border-slate-200  border-2 my-4 py-2">
          <v-file-input
              accept="image/*"
              label="Cover Image"
              class="max-w-xl"
              v-model="coverImageFile"
              @change="handleCoverImageUpload"
          ></v-file-input>
          <div class="mx-2 h-32 w-32 border-slate-200 border-2">
            <img :src="`http://localhost:5000/static/uploads/${coverImageUrl}`"
                 alt="Cover Image"
                 class="h-full w-full"
                 v-if="coverImageUrl" >
          </div>

        </div>

        <v-switch
            v-model="isPDF"
            color="red"
            label="Edit Content or upload PDF?"
            value="red"
            hide-details
        ></v-switch>
        <p class="text-xl">{{ isPDF ? "Upload PDF file" : "Add the content here" }}</p>
        <v-file-input
            v-if="isPDF"
            accept="application/pdf"
            label="PDF File"
            class="min-h-[4rem]"
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

        <v-btn @click="submit" height="48" variant="tonal" class="form-btn">Submit</v-btn>
      </v-form>
    </v-container>
  </div>
  <v-snackbar v-if="snackbar" v-model="snackbar" :color="snackbarColor" :timeout="3000" class="flex justify-start">
    {{ snackbarMessage }}
    <button @click="snackbar = false" class="ml-auto text-white">X</button>
  </v-snackbar>
</template>

<style scoped>
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
</style>