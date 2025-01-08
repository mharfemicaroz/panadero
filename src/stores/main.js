import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useMainStore = defineStore('main', () => {
  const userName = ref('John Doe')
  const userEmail = ref('doe.doe.doe@example.com')

  const userAvatar = computed(
    () =>
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${userEmail.value.replace(
        /[^a-z0-9]+/gi,
        '-'
      )}`
  )

  const isFieldFocusRegistered = ref(false)

  const clients = ref([])
  const history = ref([])
  const users = ref([])
  const itemslist = ref([])
  const category = ref([])
  const categoryGroup = ref([])
  const discounts = ref([])
  const customers = ref([])
  const devices = ref([])
  const franchises = ref([])
  const franchises_po = ref([])
  const franchises_request = ref([])

  const receipts = ref([])
  const shifts_report = ref([])
  const category_sales_summary = ref([])
  const cash_balancing_summary = ref([])
  const progress = ref([])
  const bookmarked = ref([])


  function setUser(payload) {
    if (payload.name) {
      userName.value = payload.name
    }
    if (payload.email) {
      userEmail.value = payload.email
    }
  }

  function fetchSampleClients() {
    axios
      .get(`data-sources/clients.json?v=3`)
      .then((result) => {
        clients.value = result?.data?.data
      })
      .catch((error) => {
        alert(error.message)
      })
  }

  function fetchSampleHistory() {
    axios
      .get(`data-sources/history.json`)
      .then((result) => {
        history.value = result?.data?.data
      })
      .catch((error) => {
        alert(error.message)
      })
  }

  function fetchUser() {
    axios
      .get(`data-sources/user.json`)
      .then((result) => {
        users.value = result?.data?.data
      })
      .catch((error) => {
        alert(error.message)
      })
  }

  function fetchItemsList() {
    axios
      .get(`data-sources/itemslist.json`)
      .then((result) => {
        itemslist.value = result?.data?.data
      })
      .catch((error) => {
        alert(error.message)
      })
  }

  function fetchCategory() {
    axios
      .get(`data-sources/category.json`)
      .then((result) => {
        category.value = result?.data?.data
      })
      .catch((error) => {
        alert(error.message)
      })
  }

  function fetchCategoryGroup() {
    axios
      .get(`data-sources/category_group.json`)
      .then((result) => {
        categoryGroup.value = result?.data?.data
      })
      .catch((error) => {
        alert(error.message)
      })
  }
  function fetchDiscounts() {
    axios
      .get(`data-sources/discounts.json`)
      .then((result) => {
        discounts.value = result?.data?.data
      })
      .catch((error) => {
        alert(error.message)
      })
  }
   function fetchCustomers() {
    axios
      .get(`data-sources/customers.json`)
      .then((result) => {
        customers.value = result?.data?.data
      })
      .catch((error) => {
        alert(error.message)
      })
  }

  function fetchDevices() {
    axios
      .get(`data-sources/devices.json`)
      .then((result) => {
        devices.value = result?.data?.data
      })
      .catch((error) => {
        alert(error.message)
      })
  }

  
  function fetchFranchises() {
    axios
      .get(`data-sources/franchises.json`)
      .then((result) => {
        franchises.value = result?.data?.data
      })
      .catch((error) => {
        alert(error.message)
      })
  }

  
  function fetchFranchisesPO() {
    axios
      .get(`data-sources/franchises_po.json`)
      .then((result) => {
        franchises_po.value = result?.data?.data
      })
      .catch((error) => {
        alert(error.message)
      })
  } 
  function fetchFranchisesRequest() {
    axios
      .get(`data-sources/franchises_request.json`)
      .then((result) => {
        franchises_request.value = result?.data?.data
      })
      .catch((error) => {
        alert(error.message)
      })
  }
  function fetchReceipts() {
    axios
      .get(`data-sources/receipts.json`)
      .then((result) => {
        receipts.value = result?.data?.data
      })
      .catch((error) => {
        alert(error.message)
      })
  }
  function fetchShiftsReport() {
    axios
      .get(`data-sources/shifts_report.json`)
      .then((result) => {
        shifts_report.value = result?.data?.data
      })
      .catch((error) => {
        alert(error.message)
      })
  }

  function fetchCategorySalesSummary() {
    axios
      .get(`data-sources/category_sales_summary.json`)
      .then((result) => {
        category_sales_summary.value = result?.data?.data
      })
      .catch((error) => {
        alert(error.message)
      })
  }

  function fetchCashBalancingSummary() {
    axios
      .get(`data-sources/cash_balancing_summary.json`)
      .then((result) => {
        cash_balancing_summary.value = result?.data?.data
      })
      .catch((error) => {
        alert(error.message)
      })
  }
  function fetchProgress() {
    axios
      .get(`data-sources/progress.json`)
      .then((result) => {
        progress.value = result?.data?.data
      })
      .catch((error) => {
        alert(error.message)
      })
  }
  function fetchBookmarked() {
    axios
      .get(`data-sources/bookmarked.json`)
      .then((result) => {
        bookmarked.value = result?.data?.data
      })
      .catch((error) => {
        alert(error.message)
      })
  }
  return {
    userName,
    userEmail,
    userAvatar,
    isFieldFocusRegistered,
    clients,
    history,
    users,
    itemslist,
    category,
    categoryGroup,
    discounts,
    customers,
    devices,
    franchises,
    franchises_po,
    franchises_request,
    receipts,
    shifts_report,
    category_sales_summary,
    cash_balancing_summary,
    progress,
    bookmarked,
    setUser,
    fetchUser,
    fetchSampleClients,
    fetchSampleHistory,
    fetchItemsList,
    fetchCategory,
    fetchCategoryGroup,
    fetchDiscounts,
    fetchCustomers,
    fetchDevices,
    fetchFranchises,
    fetchFranchisesPO,
    fetchFranchisesRequest,
    fetchReceipts,
    fetchShiftsReport,
    fetchCategorySalesSummary,
    fetchCashBalancingSummary,
    fetchProgress,
    fetchBookmarked
  }
})
