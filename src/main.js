import './assets/main.css'

import {createApp} from 'vue'
import App from './App.vue'
import router from './router'
import {createVuetify} from 'vuetify';
import 'vuetify/styles';
import {aliases, mdi} from 'vuetify/iconsets/mdi';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import {createPinia} from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import './assets/tailwind.css'
import 'vuetify/dist/vuetify.min.css';
import '@mdi/font/css/materialdesignicons.css';

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)


app.use(router)
const vuetify = createVuetify({
    components,
    directives,
    icons: {
        defaultSet: 'mdi',
        aliases,
        sets: {
            mdi,
        },
    },
});

app.use(vuetify).mount('#app')