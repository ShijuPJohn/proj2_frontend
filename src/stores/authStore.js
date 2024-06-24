import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export const useAuthStore = defineStore('auth', () => {
    const user = ref(null)
    const isLoggedIn = ref(false)
    const loading = ref(false)
    const error = ref(null)

    async function login(email, password) {
        loading.value = true
        error.value = null
        try {
            const response = await axios.post('http://localhost:5000/api/user/login', JSON.stringify({
                email,
                password,
            }), {
                headers: {'Content-Type': 'application/json'}
            })
            user.value = response.data.user
            isLoggedIn.value = true
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
            user.value = response.data.user
            isLoggedIn.value = true
        } catch (err) {
            error.value = err.response?.data?.message || err.message
            isLoggedIn.value = false
        } finally {
            loading.value = false
        }
    }

    function logout() {
        user.value = null
        isLoggedIn.value = false
    }

    return { user, isLoggedIn, loading, error, login, logout , signup}
}, {
    persist: true
})