import { createWebHashHistory, createRouter } from 'vue-router'
import { authGuard } from './routeGuard'

const routes = [
  {
    path: '/',
    name: 'home',
    redirect: { name: 'dashboard' }
  },
  {
    meta: {
      title: 'Login'
    },
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue')
  },
  {
    meta: {
      title: 'OTP Verification'
    },
    path: '/otp',
    name: 'otp',
    component: () => import('../views/OtpView.vue')
  },
  {
    meta: {
      title: 'Two-Factor Authentication'
    },
    path: '/security',
    name: 'security',
    component: () => import('../views/SecuritySettings.vue')
  },
  {
    meta: {
      title: 'Dashboard'
    },
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('../views/HomeViewX.vue')
  },
  {
    meta: {
      title: 'Tables'
    },
    path: '/tables',
    name: 'tables',
    component: () => import('../views/TablesView.vue')
  },
  {
    meta: {
      title: 'Shifts'
    },
    path: '/shifts',
    name: 'shifts',
    component: () => import('../views/ShiftsView.vue')
  },
  {
    meta: {
      title: 'Sales Inventory'
    },
    path: '/sales-inventory',
    name: 'sales-inventory',
    component: () => import('../views/SalesInventoryView.vue')
  },
  {
    meta: {
      title: 'POS'
    },
    path: '/pos',
    name: 'pos',
    component: () => import('../views/POSView.vue')
  },
  {
    meta: {
      title: 'Breakdown Payment Reports'
    },
    path: '/breakdown-payment-reports',
    name: 'breakdown-payment-reports',
    component: () => import('../views/BreakdownPaymentReportsView.vue')
  },
  {
    meta: {
      title: 'Order Option Fee Reports'
    },
    path: '/order-option-fee-reports',
    name: 'order-option-fee-reports',
    component: () => import('../views/OrderOptionFeeReportsView.vue')
  },
  {
    meta: {
      title: 'Reference Number Report'
    },
    path: '/reference-number-report',
    name: 'reference-number-report',
    component: () => import('../views/ReferenceNumberReportView.vue')
  },
  {
    meta: {
      title: 'Expiration Date Reports'
    },
    path: '/expiration-date-reports',
    name: 'expiration-date-reports',
    component: () => import('../views/ExpirationDateReportsView.vue')
  },
  {
    meta: {
      title: 'Discount Report'
    },
    path: '/discount-report',
    name: 'discount-report',
    component: () => import('../views/DiscountReportView.vue')
  },
  {
    meta: {
      title: 'Pull Out Report'
    },
    path: '/pull-out-report',
    name: 'pull-out-report',
    component: () => import('../views/PullOutReportView.vue')
  },
  {
    meta: {
      title: 'Refund'
    },
    path: '/refund',
    name: 'refund',
    component: () => import('../views/RefundView.vue')
  },
  {
    meta: {
      title: 'User'
    },
    path: '/user',
    name: 'user',
    component: () => import('../views/UserView.vue')
  },
  {
    meta: {
      title: 'Items'
    },
    path: '/items',
    name: 'items',
    component: () => import('../views/ItemsView.vue')
  },
  {
    meta: {
      title: 'Item Ledger'
    },
    path: '/item-ledger',
    name: 'item-ledger',
    component: () => import('../views/ItemsLedger.vue')
  },
  {
    meta: {
      title: 'Warehouses'
    },
    path: '/warehouses',
    name: 'warehouses',
    component: () => import('../views/WarehousesView.vue')
  },
  {
    meta: {
      title: 'Suppliers'
    },
    path: '/suppliers',
    name: 'suppliers',
    component: () => import('../views/SuppliersView.vue')
  },
  {
    meta: {
      title: 'Procurement'
    },
    path: '/procurement',
    name: 'procurement',
    component: () => import('../views/ProcurementView.vue')
  },
  {
    meta: {
      title: 'Subcategory'
    },
    path: '/subcategory',
    name: 'subcategory',
    component: () => import('../views/SubCategoryView.vue')
  },
  {
    meta: {
      title: 'Items Modifier'
    },
    path: '/items_modifier',
    name: 'items_modifier',
    component: () => import('../views/ItemsModifierView.vue')
  },
  {
    meta: {
      title: 'Category'
    },
    path: '/category',
    name: 'category',
    component: () => import('../views/CategoryMainView.vue')
  },
  {
    meta: {
      title: 'Discounts'
    },
    path: '/discounts',
    name: 'discounts',
    component: () => import('../views/DiscountsView.vue')
  },
  {
    meta: {
      title: 'Customers'
    },
    path: '/customers',
    name: 'customers',
    component: () => import('../views/CustomersView.vue')
  },
  {
    meta: {
      title: 'Inventory'
    },
    path: '/inventory',
    name: 'inventory',
    component: () => import('../views/InventoryView.vue')
  },
  {
    meta: {
      title: 'Devices'
    },
    path: '/devices',
    name: 'devices',
    component: () => import('../views/DevicesView.vue')
  },
  {
    meta: {
      title: 'Franchises'
    },
    path: '/franchises',
    name: 'franchises',
    component: () => import('../views/FranchisesView.vue')
  },
  {
    meta: {
      title: 'Franchises PO'
    },
    path: '/franchises_po',
    name: 'franchises_po',
    component: () => import('../views/FranchisesPOView.vue')
  },
  {
    meta: {
      title: 'Franchises Request'
    },
    path: '/franchises_request',
    name: 'franchises_request',
    component: () => import('../views/FranchisesRequestView.vue')
  },
  {
    meta: {
      title: 'Receipts'
    },
    path: '/receipts',
    name: 'receipts',
    component: () => import('../views/ReceiptsView.vue')
  },
  {
    meta: {
      title: 'User Management'
    },
    path: '/user-management',
    name: 'user management',
    component: () => import('../views/UserManagementView.vue')
  },
  {
    meta: {
      title: 'Forms'
    },
    path: '/forms',
    name: 'forms',
    component: () => import('../views/FormsView.vue')
  },
  {
    meta: {
      title: 'Profile'
    },
    path: '/profile',
    name: 'profile',
    component: () => import('../views/ProfileView.vue')
  },
  {
    meta: {
      title: 'Ui'
    },
    path: '/ui',
    name: 'ui',
    component: () => import('../views/UiView.vue')
  },
  {
    meta: {
      title: 'Responsive layout'
    },
    path: '/responsive',
    name: 'responsive',
    component: () => import('../views/ResponsiveView.vue')
  },
  {
    meta: {
      title: 'Error'
    },
    path: '/error',
    name: 'error',
    component: () => import('../views/ErrorView.vue')
  },
  {
    meta: {
      title: 'Food Safety Summary'
    },
    path: '/food_safety_summary',
    name: 'food_safety_summary',
    component: () => import('../views/FoodSafetySummaryView.vue')
  },
  {
    meta: {
      title: 'Templates'
    },
    path: '/templates',
    name: 'templates',
    component: () => import('../views/TemplatesView.vue')
  },
  {
    meta: {
      title: 'Inspections'
    },
    path: '/inspections',
    name: 'inspections',
    component: () => import('../views/InspectionsView.vue')
  },
  {
    meta: {
      title: 'Schedule'
    },
    path: '/schedule',
    name: 'schedule',
    component: () => import('../views/ScheduleView.vue')
  },
  {
    meta: {
      title: 'Account List'
    },
    path: '/account-list',
    name: 'account-list',
    component: () => import('../views/AccountListView.vue')
  },
  {
    meta: {
      title: 'Money Transfer'
    },
    path: '/money-transfer',
    name: 'money-transfer',
    component: () => import('../views/MoneyTransferView.vue')
  },
  {
    meta: {
      title: 'Balance Sheet'
    },
    path: '/balance-sheet',
    name: 'balance-sheet',
    component: () => import('../views/BalanceSheetView.vue')
  },
  {
    meta: {
      title: 'Account Statement'
    },
    path: '/account-statement',
    name: 'account-statement',
    component: () => import('../views/AccountStatementView.vue')
  },
  {
    meta: {
      title: 'Daily Time Record'
    },
    path: '/dtr',
    name: 'dtr',
    component: () => import('../views/DailyTimeRecordView.vue')
  },
  {
    meta: {
      title: 'Employees'
    },
    path: '/employees',
    name: 'employees',
    component: () => import('../views/EmployeesView.vue')
  },
  {
    meta: {
      title: 'Departments'
    },
    path: '/departments',
    name: 'departments',
    component: () => import('../views/DepartmentsView.vue')
  },
  {
    meta: {
      title: 'Job Titles'
    },
    path: '/jobtitles',
    name: 'jobtitles',
    component: () => import('../views/JobTitlesView.vue')
  },
  {
    meta: {
      title: 'Leave Types'
    },
    path: '/leavetypes',
    name: 'leavetypes',
    component: () => import('../views/LeaveTypesView.vue')
  },
  {
    meta: {
      title: 'Leave Balances'
    },
    path: '/leavebalances',
    name: 'leavebalances',
    component: () => import('../views/LeaveBalancesView.vue')
  },
  {
    meta: {
      title: 'Leave Requests'
    },
    path: '/leaverequests',
    name: 'leaverequests',
    component: () => import('../views/LeaveRequestView.vue')
  },
  {
    meta: {
      title: 'Employee List'
    },
    path: '/employee-list',
    name: 'employee-list',
    component: () => import('../views/EmployeeListView.vue')
  },
  {
    meta: {
      title: 'Total Hours Work List'
    },
    path: '/total-hours-work',
    name: 'total-hours-work',
    component: () => import('../views/TotalHoursWorkView.vue')
  },
  {
    meta: {
      title: 'Time Cards'
    },
    path: '/time-cards',
    name: 'time-cards',
    component: () => import('../views/TimeCardsView.vue')
  },
  {
    meta: {
      title: 'Branches'
    },
    path: '/branches',
    name: 'branches',
    component: () => import('../views/BranchesView.vue')
  },
  {
    meta: {
      title: 'Attendance'
    },
    path: '/attendance',
    name: 'attendance',
    component: () => import('../views/AttendanceView.vue')
  },
  {
    meta: {
      title: 'Holidays'
    },
    path: '/holidays',
    name: 'holidays',
    component: () => import('../views/HolidaysView.vue')
  },
  {
    meta: {
      title: 'Receipts'
    },
    path: '/receipts',
    name: 'receipts',
    component: () => import('../views/SalesView.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0 }
  }
})

router.beforeEach(authGuard)

export default router
