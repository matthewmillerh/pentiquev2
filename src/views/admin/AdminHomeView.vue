<script setup>
import { ref } from 'vue'
import HomeActions from '@/components/admin/images/HomeActions.vue'
import { axios_api } from '@/scripts/global'

const exporting = ref(false)

// Download the whole product catalogue as an Excel file. It is fetched with the login token (a plain link could
// not send it), then handed to the browser as a file.
async function exportCatalogue() {
  if (exporting.value) return
  exporting.value = true
  try {
    const response = await axios_api.get('/admin/export/catalogue', { responseType: 'blob' })
    const disposition = response.headers['content-disposition'] || ''
    const fileName = /filename="([^"]+)"/.exec(disposition)?.[1] || 'pentique-catalogue.xlsx'

    const url = URL.createObjectURL(response.data)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    link.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  } catch (error) {
    console.error('Error exporting the catalogue:', error)
    // the error comes back as a blob too, it holds the server's explanation
    let message = 'The catalogue could not be exported. Please try again.'
    try {
      message = JSON.parse(await error.response.data.text()).message || message
    } catch {
      // keep the general message
    }
    alert(message)
  } finally {
    exporting.value = false
  }
}
</script>

<template>
  <div class="mt-28">
    <div class="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 pt-12">
      <HomeActions
        image-src="/images/add_product.png"
        text="Add Product"
        link="/admin/add-product"
      />
      <HomeActions
        image-src="/images/products.png"
        text="Edit Products"
        link="/admin/edit-products"
      />
      <HomeActions
        image-src="/images/categories.png"
        text="Edit Categories"
        link="/admin/edit-categories"
      />
      <HomeActions
        image-src="/images/export_catalogue.svg"
        text="Export Product Catalogue"
        busy-text="Preparing the catalogue…"
        :busy="exporting"
        @activate="exportCatalogue"
      />
      <HomeActions image-src="/images/stats.svg" text="Stats" link="/admin/stats" />
    </div>
  </div>
</template>
