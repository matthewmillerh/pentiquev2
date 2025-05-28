import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

//imports for image viewer
import 'viewerjs/dist/viewer.css'
import VueViewer from 'v-viewer'

// FontAwesome Imports
import { library } from '@fortawesome/fontawesome-svg-core' // Import Font Awesome core
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome' // Import the Vue component

// Import specific icons for use
import {
  faUser,
  faBars,
  faXmark,
  faLocationDot,
  faArrowUpRightFromSquare,
  faDiagramProject,
  faTrash,
  faEdit,
  faSquarePlus,
} from '@fortawesome/free-solid-svg-icons'
import {
  faGithub,
  faGithubSquare,
  faLinkedin,
  faVuejs,
  faBootstrap,
  faPhp,
  faJs,
  faCss,
  faHtml5,
  faGitAlt,
} from '@fortawesome/free-brands-svg-icons'

// Add icons to the library
library.add(
  faUser,
  faGithub,
  faGithubSquare,
  faBars,
  faXmark,
  faLinkedin,
  faLocationDot,
  faVuejs,
  faBootstrap,
  faPhp,
  faJs,
  faCss,
  faHtml5,
  faGitAlt,
  faArrowUpRightFromSquare,
  faDiagramProject,
  faTrash,
  faEdit,
  faSquarePlus,
)

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(VueViewer)

// Register the fontawesome component globally
app.component('font-awesome-icon', FontAwesomeIcon)

app.mount('#app')

