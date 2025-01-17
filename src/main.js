import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useMainStore } from '@/stores/main.js'

import './css/main.css'

// Init Pinia
const pinia = createPinia()

// Create Vue app
createApp(App).use(router).use(pinia).mount('#app')

// Init main store
const mainStore = useMainStore(pinia)

// Fetch sample data
mainStore.fetchSampleClients()
mainStore.fetchSampleHistory()
mainStore.fetchUser()
mainStore.fetchItemsList()
mainStore.fetchCategory()
mainStore.fetchCategoryGroup()
mainStore.fetchDiscounts()
mainStore.fetchCustomers()
mainStore.fetchDevices()
mainStore.fetchFranchises()
mainStore.fetchFranchisesPO()
mainStore.fetchFranchisesRequest()
mainStore.fetchReceipts()
mainStore.fetchShiftsReport()
mainStore.fetchSalesInventoryReport()
mainStore.fetchBreakdownPaymentReports()
mainStore.fetchOrderOptionFeeReports()
mainStore.fetchReferenceNumberReport()
mainStore.fetchExpirationDateReports()
mainStore.fetchDiscountReport()
mainStore.fetchPullOutReport()
mainStore.fetchRefundReport()
mainStore.fetchCategorySalesSummary()
mainStore.fetchCashBalancingSummary()
mainStore.fetchProgress()
mainStore.fetchBookmarked()
mainStore.fetchAccountList()
mainStore.fetchMoneyTransfer()
mainStore.fetchBalanceSheet()
mainStore.fetchEmployeeList()
mainStore.fetchTotalHoursWork()


// Dark mode
// Uncomment, if you'd like to restore persisted darkMode setting, or use `prefers-color-scheme: dark`. Make sure to uncomment localStorage block in src/stores/darkMode.js
// import { useDarkModeStore } from './stores/darkMode'

// const darkModeStore = useDarkModeStore(pinia)

// if (
//   (!localStorage['darkMode'] && window.matchMedia('(prefers-color-scheme: dark)').matches) ||
//   localStorage['darkMode'] === '1'
// ) {
//   darkModeStore.set(true)
// }

// Default title tag
const defaultDocumentTitle = 'Panadero - Portal'

// Set document title from route meta
router.afterEach((to) => {
  document.title = to.meta?.title
    ? `${to.meta.title} — ${defaultDocumentTitle}`
    : defaultDocumentTitle
})
