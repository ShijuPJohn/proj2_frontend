import {createRouter, createWebHistory} from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView
        },
        {
            path: '/about',
            name: 'about',
            component: () => import('../views/AboutView.vue')
        },
        {
            path: '/login',
            name: 'login',
            component: () => import('../views/LoginView.vue')
        },
        {
            path: '/signup',
            name: 'signup',
            component: () => import('../views/SignupView.vue')
        },
        {
            path: '/contact',
            name: 'contact',
            component: () => import('../views/ContactView.vue')
        },
        {
            path: '/dashboard',
            name: 'dashboard',
            component: () => import('../views/DashboardView.vue')
        },
        {
            path: '/requests',
            name: 'requests',
            component: () => import('../views/RequestsView.vue')
        },
        {
            path: '/unauthorized',
            name: 'unauthorized',
            component: () => import('../views/UnauthorizedView.vue')
        },
        {
            path: '/authors',
            name: 'authors',
            component: () => import('../views/AuthorsView.vue')
        },
        {
            path: '/sections',
            name: 'sections',
            component: () => import('../views/SectionsView.vue')
        },
        {
            path: '/books',
            name: 'books',
            component: () => import('../views/CreatedBooksView.vue')
        },
        {
            path: '/users',
            name: 'users',
            component: () => import('../views/UsersView.vue')
        },
        {
            path: '/profile',
            name: 'profile',
            component: () => import('../views/ProfileView.vue')
        },
        {
            path: '/stats',
            name: 'stats',
            component: () => import('../views/StatsView.vue')
        },
        {
            path: '/read-book/:id/:title',
            name: 'read_book',
            component: () => import('../views/ReadBookView.vue')
        },
        {
            path: '/book-details/:id/:title',
            name: 'book_details',
            component: () => import('../views/BookDetails.vue')
        },
        {
            path: '/buy-book/:id',
            name: 'buy_book',
            component: () => import('../views/BuyBookView.vue')
        },
        {
            path: '/purchases',
            name: 'purchases',
            component: () => import('../views/PurchasesView.vue')
        },

    ]
})

export default router
