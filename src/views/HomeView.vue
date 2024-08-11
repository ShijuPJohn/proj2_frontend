<script setup>
import {onMounted, ref, watch} from "vue";
import {useAuthStore} from "@/stores/authStore.js";
import {storeToRefs} from "pinia";
import axios from "axios";
import BookCard from "@/components/BookCard.vue";
import router from "@/router/index.js";

const authStore = useAuthStore();
const {loading, role, error, isLoggedIn, token} = storeToRefs(authStore);
const listOfBooks = ref([]);
const listOfRequests = ref([]);
const sections = ref([]);
const authors = ref([]);
const selectedAuthor = ref(null);
const selectedSection = ref(null);
const searchText = ref('');
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token.value}`
};
onMounted(async () => {

  try {
    const response = await axios.get('http://localhost:5000/api/books', {headers});
    console.log(response)
    if (role.value !== "librarian") {
      const requestedBookArray = response.data.requests.map(reqObject => reqObject.book_id)
      const issuedBookArray = response.data.issues.map(issueObject => issueObject.book_id)
      const purchasedBookArray = response.data.purchases.map(purchaseObject => purchaseObject.book_id)
      listOfBooks.value = response.data.ebooks.map(ebook => {
        return {
          ...ebook,
          purchased: purchasedBookArray.includes(ebook.id),
          requested: requestedBookArray.includes(ebook.id),
          issued: issuedBookArray.includes(ebook.id)
        };
      })
    } else {
      listOfBooks.value = response.data.ebooks;
    }
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  } finally {
    fetchAuthors();
    fetchSections();
  }
})

async function fetchAuthors() {
  const authorsRes = await axios.get('http://localhost:5000/api/authors', {headers});
  authors.value = authorsRes.data.authors.map(author => author.name);
}

async function fetchSections() {
  const sectionsRes = await axios.get('http://localhost:5000/api/sections', {headers});
  sections.value = sectionsRes.data.sections.map(section => section.name);
}

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

async function fetchBook(bookId) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token.value}`
  };
  try {
    const response = await axios.get(`http://localhost:5000/api/book-file/${bookId}`, {headers, responseType: "blob"});
    const fileName = response.headers['content-disposition']
        ? response.headers['content-disposition'].split('filename=')[1]
        : 'downloaded-file';

    const blob = new Blob([response.data], {type: response.data.type});
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);


  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

watch(selectedSection, (newValue, oldValue) => {
  console.log('Selected section changed from', oldValue, 'to', newValue);
  // Perform any actions based on the new selected value
  if (newValue) {
    // Example: Fetch books related to the selected section
    fetchBooksBySection(newValue);
  }
});
watch(selectedAuthor, (newValue, oldValue) => {
  console.log('Selected section changed from', oldValue, 'to', newValue);
  // Perform any actions based on the new selected value
  if (newValue) {
    // Example: Fetch books related to the selected section
    fetchBooksByAuthor(newValue);
  }
});

async function fetchBooksBySection(section) {
  try {
    const response = await axios.get(`http://localhost:5000/api/books?section=${section}`, {headers});
    console.log(response)
    if (role.value !== "librarian") {
      const requestedBookArray = response.data.requests.map(reqObject => reqObject.book_id)
      const issuedBookArray = response.data.issues.map(issueObject => issueObject.book_id)
      const purchasedBookArray = response.data.purchases.map(purchaseObject => purchaseObject.book_id)
      listOfBooks.value = response.data.ebooks.map(ebook => {
        return {
          ...ebook,
          purchased: purchasedBookArray.includes(ebook.id),
          requested: requestedBookArray.includes(ebook.id),
          issued: issuedBookArray.includes(ebook.id)
        };
      })
    } else {
      listOfBooks.value = response.data.ebooks;
    }
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

async function fetchBooksByAuthor(author) {
  try {
    const response = await axios.get(`http://localhost:5000/api/books?author=${author}`, {headers});
    console.log(response)
    if (role.value !== "librarian") {
      const requestedBookArray = response.data.requests.map(reqObject => reqObject.book_id)
      const issuedBookArray = response.data.issues.map(issueObject => issueObject.book_id)
      const purchasedBookArray = response.data.purchases.map(purchaseObject => purchaseObject.book_id)
      listOfBooks.value = response.data.ebooks.map(ebook => {
        return {
          ...ebook,
          purchased: purchasedBookArray.includes(ebook.id),
          requested: requestedBookArray.includes(ebook.id),
          issued: issuedBookArray.includes(ebook.id)
        };
      })
    } else {
      listOfBooks.value = response.data.ebooks;
    }
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }

}

async function clearFilter() {
  selectedAuthor.value = null
  selectedSection.value = null
  try {
    const response = await axios.get('http://localhost:5000/api/books', {headers});
    console.log(response)
    if (role.value !== "librarian") {
      const requestedBookArray = response.data.requests.map(reqObject => reqObject.book_id)
      const issuedBookArray = response.data.issues.map(issueObject => issueObject.book_id)
      const purchasedBookArray = response.data.purchases.map(purchaseObject => purchaseObject.book_id)
      listOfBooks.value = response.data.ebooks.map(ebook => {
        return {
          ...ebook,
          purchased: purchasedBookArray.includes(ebook.id),
          requested: requestedBookArray.includes(ebook.id),
          issued: issuedBookArray.includes(ebook.id)
        };
      })
    } else {
      listOfBooks.value = response.data.ebooks;
    }
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

async function searchBook() {
  try {
    const response = await axios.get(`http://localhost:5000/api/books?search=${searchText.value}`, {headers});
    console.log(response)
    if (role.value !== "librarian") {
      const requestedBookArray = response.data.requests.map(reqObject => reqObject.book_id)
      const issuedBookArray = response.data.issues.map(issueObject => issueObject.book_id)
      const purchasedBookArray = response.data.purchases.map(purchaseObject => purchaseObject.book_id)
      listOfBooks.value = response.data.ebooks.map(ebook => {
        return {
          ...ebook,
          purchased: purchasedBookArray.includes(ebook.id),
          requested: requestedBookArray.includes(ebook.id),
          issued: issuedBookArray.includes(ebook.id)
        };
      })
    } else {
      listOfBooks.value = response.data.ebooks;
    }
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}
</script>


<template>
  <div class="book-container">
    <div class="search-filter-strip">
      <div class="search-box">
        <input type="text" placeholder="Search books" v-model="searchText" class="search-input"/>
        <button class="search-button" @click="searchBook">
          <v-icon color="white" icon="mdi-search-web"/>
        </button>
      </div>

      <div class="section-select-container">
        <v-select
            label="Section"
            v-model="selectedSection"
            hide-details="auto"
            density="compact"
            variant="outlined"
            :items="sections"
            class="v-select"
        ></v-select>
      </div>

      <div class="author-select-container">
        <v-select
            label="Author"
            v-model="selectedAuthor"
            density="compact"
            hide-details="auto"
            variant="outlined"
            :items="authors"
            class="v-select"
        ></v-select>
      </div>

      <button class="clear-button" @click="clearFilter">
        Clear
      </button>
    </div>

    <div class="book-card-container">
      <BookCard v-for="(book, index) in listOfBooks" :key="index" :book="book" :fetch-book-function="fetchBook"/>
    </div>
  </div>
</template>

<style scoped>
.book-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin: 0.1rem 0;
}

.search-filter-strip {
  height: 4rem;
  padding: 0.5rem 1rem;
  display: flex;
  flex-direction: row;
  gap: 1rem;
  justify-content: center;
  align-items: center;
  background-color: #1e293b;
}

.search-box {
  display: flex;
  align-items: center;
  border: 2px solid #4b5563;
  border-radius: 3px;
  overflow: hidden;
}

.search-input {
  outline: none;
  color: white;
  background-color: #1e293b;
  padding: 0.25rem 0.5rem;
  flex-grow: 1;
}

.search-button {
  padding: 0.25rem 0.5rem;
  background-color: #374151;
  color: white;
  border: none;
  cursor: pointer;
}

.search-button:hover {
  background-color: #4b5563;
}

.section-select-container,
.author-select-container {
  width: 10rem;
  display: flex;
  align-items: center;
  color: white;
}

.v-select {
  background-color: #1e293b;
  color: white;
}

.clear-button {
  padding: 0.25rem 1rem;
  background-color: #dc2626;
  color: white;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
}

.clear-button:hover {
  background-color: #ef4444;
}

.book-card-container {
  width: 100%;
  display: flex;
  gap: 1rem;
}

@media (min-width: 768px) {
  .book-card-container {
    width: 90%;
  }
}
</style>
