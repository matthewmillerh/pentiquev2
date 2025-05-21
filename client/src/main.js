import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

//imports for image viewer
import 'viewerjs/dist/viewer.css'
import VueViewer from 'v-viewer'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(VueViewer)

app.mount('#app')
