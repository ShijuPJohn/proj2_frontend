<script setup>
import {ref, watch} from 'vue';
import {useAuthStore} from '../stores/authStore.js'
import {storeToRefs} from "pinia";
import router from "@/router/index.js";

const authStore = useAuthStore()
const {login} = authStore
const {loading, error, isLoggedIn} = storeToRefs(authStore)
const email = ref('');
const password = ref('');
const snackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');


const onsubmit = async function () {
  await login(email.value, password.value)
  // if (!error.value) {
  //   snackbarMessage.value = 'Sign In successful!';
  //   snackbarColor.value = 'success';
  //   snackbar.value = true; // Show snackbar
  //   console.log("login success")
  //
  //
  // } else {
  //   snackbarMessage.value = 'Sign In failed. Please try again.';
  //   snackbarColor.value = 'error';
  //   snackbar.value = true;
  //   console.log("login failed")
  // }


}
watch(error, (newError) => {
  console.log("error status changed")
  if (error.value) {
    snackbarMessage.value = "Login failed. Please try again.";
    snackbarColor.value = 'error'
    snackbar.value = true
  } else {
    snackbarMessage.value = "Login success. Redirecting"
    snackbarColor.value = 'success'
    snackbar.value = true
  }
});
watch(isLoggedIn, (newVal) => {
  if (isLoggedIn.value) {
    setTimeout(() => {
      router.push("/dashboard")
    }, 1000)
  }
})

</script>

<template>
  <div class="root-container">
    <div class="title-text-box">Login</div>
    <form class="form" method="post" action="/login" @submit.prevent="onsubmit">
      <input type="text" class="input-text" placeholder="Email" v-model="email">
      <input type="text" class="input-text" placeholder="Password" v-model="password">
      <input type="submit" class="btn submit" @submit="onsubmit">
    </form>
    <div class="or-box">
    </div>
    <div class="create-account-box">
      <a href="/signup">Create an account</a>
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

.root-container {
  margin-top: 5rem;
  width: 28rem;
  min-height: 55vh;
  background-color: white;
  border-radius: 12px;
  box-shadow: 10px 10px 30px rgba(0, 0, 0, .5);
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
  margin: 1rem .5rem;
  padding: 1rem;
  font-size: 1.1rem;
  border-radius: 5px;
  border-width: 1px;
  border-color: #a97d96;
  border-style: solid;
  outline: none;
}

.input-text:focus {
  border-color: var(--primary-color);
  outline: none;
}

.form .btn,
.form .btn:hover {
  height: 4rem;
  width: 100%;
  text-transform: uppercase;
  //border-radius: 5px;
  //border-width: 1px;
  ////border-color: var(--primary-color);
  //border-style: solid;
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

.use-same-image-box {
  font-size: 1.4rem;
  margin-bottom: 2rem;
}
</style>