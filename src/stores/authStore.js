import {defineStore} from 'pinia'
import {ref} from 'vue'
import axios from 'axios'
import {jwtDecode} from "jwt-decode";

export const useAuthStore = defineStore('auth', () => {
    const isLoggedIn = ref(false);
    const loading = ref(false);
    const error = ref(null);
    const token = ref('');
    const role = ref('');

    async function login(email, password) {
        loading.value = true;
        error.value = null;
        try {
            const response = await axios.post('http://localhost:5000/api/user/login', JSON.stringify({
                email,
                password,
            }), {
                headers: {'Content-Type': 'application/json'}
            })
            isLoggedIn.value = true
            token.value = response.data.token
            const decoded = jwtDecode(response.data.token);
            role.value = decoded.user_role
        } catch (err) {
            error.value = err.response?.data?.message || err.message
            isLoggedIn.value = false
        } finally {
            loading.value = false
        }
    }

    async function signup(username, email, password) {
        loading.value = true
        error.value = null
        try {
            const response = await axios.post('http://localhost:5000/api/user', JSON.stringify({
                username,
                email,
                password,
            }), {
                headers: {'Content-Type': 'application/json'}
            })
            isLoggedIn.value = true
            token.value = response.data.token
            const decoded = jwtDecode(response.data.token);
        } catch (err) {
            error.value = err.response?.data?.message || err.message
            isLoggedIn.value = false
        } finally {
            loading.value = false
        }
    }

    function logout() {
        isLoggedIn.value = false
        token.value = ''
        role.value = ''
    }

    return {isLoggedIn, loading, token, error, role, login, logout, signup}
}, {
    persist: {
        paths: ['isLoggedIn', 'loading', 'error', 'token', "role"]
    }
});