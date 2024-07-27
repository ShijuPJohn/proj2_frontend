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
const {loading, error, isLoggedIn, token} = storeToRefs(authStore);
const sections = ref([]);
const authors = ref([]);
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token.value}`
};

onMounted(async () => {
  if (!authStore.$state) {
    router.push('/')
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
async function onSubmit() {
  //
  // const data = {
  //   name: categoryName.value,
  //   description: categoryDesc.value,
  // };
  // try {
  //   const response = await axios.post('http://localhost:5000/api/sections', data, {headers})
  //   if (response.status === 201) {
  //     snackbarMessage.value = "Category added"
  //     snackbarColor.value = 'success'
  //     snackbar.value = true
  //     categoryName.value = ""
  //     categoryDesc.value = ""
  //   } else {
  //     throw new Error(response.statusText);
  //   }
  // } catch (error) {
  //   console.error('Error:', error.response ? error.response.data : error.message);
  //   snackbarMessage.value = "Failed. Please try again.";
  //   snackbarColor.value = 'error'
  //   snackbar.value = true
  // }

}

const valid = ref(false);
const name = ref('');
const email = ref('');

const submit = () => {
  if (form.value.validate()) {
    console.log('Form validated successfully!');
    console.log(form.value)
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
      <v-form ref="form" v-model="valid">
        <v-text-field
            v-model="name"
            variant="outlined"
            label="Name"
            floating-label
            required
        ></v-text-field>

        <v-text-field
            v-model="email"
            variant="outlined"
            label="Email"
            floating-label
            required
        ></v-text-field>

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
        <v-btn @click="submit">Submit</v-btn>
      </v-form>
    </v-container>
  </div>
  <h1 v-for="section in sections">{{section.name}}</h1>
  <h1 v-for="author in authors">{{author.name}}</h1>
  <v-snackbar v-if="snackbar" v-model="snackbar" :color="snackbarColor" :timeout="3000" class="flex justify-start">
    {{ snackbarMessage }}
    <button @click="snackbar = false" class="ml-auto text-white">X</button>
  </v-snackbar>
</template>

<style scoped>

</style>