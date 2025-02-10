import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useAuthStore } from './auth'
import axios from 'axios'

export const useMainStore = defineStore('main', () => {
  const userName = ref('')
  const userEmail = ref('')

  const authStore = useAuthStore()

  const userAvatar = computed(() => `https://api.dicebear.com/7.x/avataaars/svg?seed=user`)

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
  const sales_inventory_report = ref([])
  const breakdwon_payment_report = ref([])
  const order_option_fee_report = ref([])
  const reference_number_report = ref([])
  const expiration_date_reports = ref([])
  const discount_report = ref([])
  const pull_out_report = ref([])
  const refund = ref([])
  const category_sales_summary = ref([])
  const cash_balancing_summary = ref([])
  const progress = ref([])
  const bookmarked = ref([])
  const account_list = ref([])
  const money_transfer = ref([])
  const balance_sheet = ref([])
  const employee_list = ref([])
  const total_hours_work = ref([])
  const time_cards = ref([])
  const branch = ref([])
  const attendance = ref([])
  const holidays = ref([])
  const bookmarked_templates = ref([])
  const templates = ref([])
  const inspections = ref([])


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
  function fetchSalesInventoryReport() {
    axios
      .get(`data-sources/sales_inventory_report.json`)
      .then((result) => {
        sales_inventory_report.value = result?.data?.data
      })
      .catch((error) => {
        alert(error.message)
      })
  }
  function fetchBreakdownPaymentReports() {
    axios
      .get(`data-sources/breakdwon_payment_report.json`)
      .then((result) => {
        breakdwon_payment_report.value = result?.data?.data
      })
      .catch((error) => {
        alert(error.message)
      })
  }
  function fetchOrderOptionFeeReports() {
    axios
      .get(`data-sources/order_option_fee_report.json`)
      .then((result) => {
        order_option_fee_report.value = result?.data?.data
      })
      .catch((error) => {
        alert(error.message)
      })
  }
  function fetchReferenceNumberReport() {
    axios
      .get(`data-sources/reference_number_report.json`)
      .then((result) => {
        reference_number_report.value = result?.data?.data
      })
      .catch((error) => {
        alert(error.message)
      })
  }
  function fetchExpirationDateReports() {
    axios
      .get(`data-sources/expiration_date_reports.json`)
      .then((result) => {
        expiration_date_reports.value = result?.data?.data
      })
      .catch((error) => {
        alert(error.message)
      })
  }

  function fetchDiscountReport() {
    axios
      .get(`data-sources/discount_report.json`)
      .then((result) => {
        discount_report.value = result?.data?.data
      })
      .catch((error) => {
        alert(error.message)
      })
  }
  function fetchPullOutReport() {
    axios
      .get(`data-sources/pull_out_report.json`)
      .then((result) => {
        pull_out_report.value = result?.data?.data
      })
      .catch((error) => {
        alert(error.message)
      })
  }
  function fetchRefundReport() {
    axios
      .get(`data-sources/refund.json`)
      .then((result) => {
        refund.value = result?.data?.data
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



  function fetchAccountList() {
    axios
      .get(`data-sources/account_list.json`)
      .then((result) => {
        account_list.value = result?.data?.data
      })
      .catch((error) => {
        alert(error.message)
      })
  }

  function fetchMoneyTransfer() {
    axios
      .get(`data-sources/money_transfer.json`)
      .then((result) => {
        money_transfer.value = result?.data?.data
      })
      .catch((error) => {
        alert(error.message)
      })
  }

  function fetchBalanceSheet() {
    axios
      .get(`data-sources/balance_sheet.json`)
      .then((result) => {
        balance_sheet.value = result?.data?.data
      })
      .catch((error) => {
        alert(error.message)
      })
  } function fetchEmployeeList() {
    axios
      .get(`data-sources/employee_list.json`)
      .then((result) => {
        employee_list.value = result?.data?.data
      })
      .catch((error) => {
        alert(error.message)
      })
  }

  function fetchTotalHoursWork() {
    axios
      .get(`data-sources/total_hours_work.json`)
      .then((result) => {
        total_hours_work.value = result?.data?.data
      })
      .catch((error) => {
        alert(error.message)
      })
  }
  function fetchTimeCards() {
    axios
      .get(`data-sources/time_cards.json`)
      .then((result) => {
        time_cards.value = result?.data?.data
      })
      .catch((error) => {
        alert(error.message)
      })
  }
  function fetchBranch() {
    axios
      .get(`data-sources/branch.json`)
      .then((result) => {
        branch.value = result?.data?.data
      })
      .catch((error) => {
        alert(error.message)
      })
  }
  function fetchAttendance() {
    axios
      .get(`data-sources/attendance.json`)
      .then((result) => {
        attendance.value = result?.data?.data
      })
      .catch((error) => {
        alert(error.message)
      })
  } function fetchHolidays() {
    axios
      .get(`data-sources/holidays.json`)
      .then((result) => {
        holidays.value = result?.data?.data
      })
      .catch((error) => {
        alert(error.message)
      })
  }

  function fetchBookmarkedTemplates() {
    axios
      .get(`data-sources/bookmarked_templates.json`)
      .then((result) => {
        bookmarked_templates.value = result?.data?.data
      })
      .catch((error) => {
        alert(error.message)
      })
  }


  function fetchTemplates() {
    axios
      .get(`data-sources/templates.json`)
      .then((result) => {
        templates.value = result?.data?.data
      })
      .catch((error) => {
        alert(error.message)
      })
  }
  
  function fetchInspections() {
    axios
      .get(`data-sources/inspections.json`)
      .then((result) => {
        inspections.value = result?.data?.data
      })
      .catch((error) => {
        alert(error.message)
      })
  }
  watch(authStore, (authStore) => {
    if (authStore.user) {
      userName.value = authStore.user.name
      userEmail.value = authStore.user.email
    } else {
      userName.value = ''
      userEmail.value = ''
    }
  })

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
    sales_inventory_report,
    breakdwon_payment_report,
    order_option_fee_report,
    reference_number_report,
    expiration_date_reports,
    discount_report,
    pull_out_report,
    refund,
    category_sales_summary,
    cash_balancing_summary,
    progress,
    bookmarked,
    account_list,
    money_transfer,
    balance_sheet,
    employee_list,
    total_hours_work,
    time_cards,
    branch,
    attendance,
    holidays,
    bookmarked_templates,
    templates,
    inspections,
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
    fetchSalesInventoryReport,
    fetchBreakdownPaymentReports,
    fetchOrderOptionFeeReports,
    fetchReferenceNumberReport,
    fetchExpirationDateReports,
    fetchDiscountReport,
    fetchPullOutReport,
    fetchRefundReport,
    fetchCategorySalesSummary,
    fetchCashBalancingSummary,
    fetchProgress,
    fetchBookmarked,
    fetchAccountList,
    fetchMoneyTransfer,
    fetchBalanceSheet,
    fetchEmployeeList,
    fetchTotalHoursWork,
    fetchTimeCards,
    fetchBranch,
    fetchAttendance,
    fetchHolidays,
    fetchBookmarkedTemplates,
    fetchTemplates,
    fetchInspections
  }
})
