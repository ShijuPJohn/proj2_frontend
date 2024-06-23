<script>
import {ref} from 'vue';
import axios from 'axios';

export default {
  setup() {
    const username = ref('');
    const email = ref('');
    const password = ref('');
    const snackbar = ref(false);
    const snackbarMessage = ref('');
    const snackbarColor = ref('success');

    const onSubmit = function () {
      axios.post('http://localhost:5000/api/user', {
        username: username.value,
        email: email.value,
        password: password.value
      }, {
        headers: {'Content-Type': 'application/json'}
      }).then(res => {
        console.log(res);
        snackbarMessage.value = 'Signup successful!';
        snackbarColor.value = 'success';
        snackbar.value = true; // Show snackbar

      }).catch(error => {
        console.error(error);
        snackbarMessage.value = 'Signup failed. Please try again.';
        snackbarColor.value = 'error';
        snackbar.value = true; // Show snackbar
      });
    };

    return {
      username, email, password, onSubmit,
      snackbar, snackbarMessage, snackbarColor
    };
  }
}
</script>

<template>
  <div class="root-container">
    <div class="title-text-box">Sign Up</div>
    <form class="form" method="post" action="/login" @submit.prevent="onSubmit">
      <input type="text" class="input-text" placeholder="Full Name" v-model="username">
      <input type="text" class="input-text" placeholder="Email" v-model="email">
      <input type="password" class="input-text" placeholder="Password" v-model="password">
      <input type="submit" class="btn submit" value="Submit">
    </form>
    <div class="or-box"></div>
    <div class="create-account-box">
      <a href="/login">Sign in with an account</a>
    </div>
  </div>

  <v-snackbar v-if="snackbar" v-model="snackbar" :color="snackbarColor" :timeout="200000" class="custom-snackbar">
    {{ snackbarMessage }}
    <v-btn color="white" text @click="snackbar = false" class="v-btn">Close</v-btn>
  </v-snackbar>
</template>


<style scoped>
.custom-snackbar{
  display: flex;
  justify-content: flex-start;
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


</style>