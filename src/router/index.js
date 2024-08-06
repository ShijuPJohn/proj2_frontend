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
            path: '/add-book',
            name: 'add_book',
            component: () => import('../components/AddBook.vue')
        },
        {
            path: '/add-category',
            name: 'add_category',
            component: () => import('../views/AddCategory.vue')
        },
        {
            path: '/add-author',
            name: 'add_author',
            component: () => import('../views/AddAuthor.vue')
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
            path: '/issued-books',
            name: 'issued_books',
            component: () => import('../views/IssuedBooksView.vue')
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
            path: '/read-book/:id/:title',
            name: 'read_book',
            component: () => import('../views/ReadBookView.vue')
        },
        {
            path: '/book-details/:id/:title',
            name: 'book_details',
            component: () => import('../views/BookDetails.vue')
        },

    ]
})

export default router
