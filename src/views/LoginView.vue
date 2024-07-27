<script setup>
import {reactive, ref, watch} from 'vue';
import {useAuthStore} from '../stores/authStore.js'
import {storeToRefs} from "pinia";
import router from "@/router/index.js";

const authStore = useAuthStore()
const {login} = authStore
const {loading, role, error, isLoggedIn} = storeToRefs(authStore)
const email = ref('');
const password = ref('');
const snackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');
const valid = ref(false);
const showPassword = ref(false);

watch(error, (newError) => {
  console.log("error status changed")
  if (error.value) {
    snackbarMessage.value = "Login failed. Please try again.";
    snackbarColor.value = 'error'
    snackbar.value = true
  }
});

watch(isLoggedIn, (newVal) => {
  if (isLoggedIn.value) {
    snackbarMessage.value = "Login success. Redirecting"
    snackbarColor.value = 'success'
    snackbar.value = true
    setTimeout(() => {
      router.push("/dashboard")
    }, 1000)
  }
})

async function submit() {
  await login(email.value, password.value)
}

const rules = reactive({
  required: value => !!value || 'Required.',
});

const emailRules = [
  rules.required,
  v => /.+@.+\..+/.test(v) || 'Email must be valid',
];

const passwordRules = [
  rules.required,
];


</script>

<template>
  <div class="flex w-[50%] mt-8 card-root">
    <div class="card-action-area">
      <div class="title-text-box">Login</div>


      <v-container>
        <v-form ref="form" v-model="valid">
          <v-text-field
              class="input-text"
              v-model="email"
              variant="outlined"
              :rules="emailRules"
              label="Email"
              floating-label
              required
          ></v-text-field>
          <v-text-field
              class="input-text"
              v-model="password"
              :rules="passwordRules"
              :type="showPassword ? 'text' : 'password'"
              :append-inner-icon-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
              variant="outlined"
              label="Password"
              floating-label
              required
          ></v-text-field>
          <v-btn @click="submit" class="form-btn">Submit</v-btn>
        </v-form>
      </v-container>

      <div class="or-box">
      </div>
      <div class="create-account-box">
        <router-link to="/signup">Create an account</router-link>
      </div>
    </div>

    <div class="overflow-hidden flex items-center justify-center w-50 bg-white p-4">
      <img src="../assets/images/library.png" alt="library photo"
           class="h-[100%] object-contain filter sepia-[30%] hover:sepia-[50%] transition-all duration-100">
    </div>
  </div>
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
  border-radius: 5px;
  padding: .4rem;
  width: 2rem;
  border: 1px solid white;
}

.card-root {
  box-shadow: 10px 10px 30px rgba(0, 0, 0, .5);
}

.card-action-area {
  width: 28rem;
  background-color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem 1.5rem;
}

.title-text-box {
  font-size: 1.5rem;
  font-weight: 500;
  color: #545454;
  padding: 0 .3rem;
  border-bottom: solid;
  border-color: var(--secondary-color-light);
  margin-top: 1rem;
}

.form {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin: 1.5rem 0;
}

.input-text {
  width: 100%;
  min-height: 4rem;
  padding: 0;
  font-size: 1.1rem;
}

.input-text:focus {
  border-color: var(--primary-color);
  outline: none;
}

.form-btn {
  height: 4rem;
  width: 100%;
  text-transform: uppercase;
  background: var(--primary-color-light);
  outline: none;
  border: none;
  border-radius: 5px;
  color: #ffffff;
  cursor: pointer;
  font-weight: 700;
  font-size: 1.2rem;
}

.or-box {
  font-size: 1.3rem;
  width: 70%;
  height: .1rem;
  background-color: var(--secondary-color-light);
  margin: 2rem 0 1rem 0;
}

.create-account-box {
  font-size: 1.2rem;

}

.create-account-box a,
.create-account-box a:link,
.create-account-box a:visited {
  text-decoration: none;
  color: deeppink;
  padding: .3rem .7rem;
}
</style>