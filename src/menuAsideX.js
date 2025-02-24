import {
  mdiAccount,
  mdiAccountCard,
  mdiAccountHardHat,
  mdiAccountMultiple,
  mdiApplicationSettings,
  mdiCalculator,
  mdiClock,
  mdiDevices,
  mdiFileCabinet,
  mdiFood,
  mdiGroup,
  mdiListBox,
  mdiMonitorDashboard,
  mdiOfficeBuilding,
  mdiReceipt,
  mdiStore,
  mdiTable
} from '@mdi/js'

export default [
  {
    to: '/dashboard',
    icon: mdiMonitorDashboard,
    label: 'Dashboard'
  },
  {
    to: '',
    icon: mdiCalculator,
    label: 'POS',
    isPOS: true
  },
  {
    to: '',
    icon: mdiClock,
    label: 'DTR',
    isDTR: true
  },
  // {
  //   label: 'Reports',
  //   icon: mdiTable,
  //   menu: [
  //     {
  //       label: 'Sales',
  //       to: '/sales'
  //     },
  //     {
  //       label: 'Shifts',
  //       to: '/shifts'
  //     },
  //     {
  //       label: 'Sales Inventory',
  //       to: '/sales-inventory'
  //     },
  //     {
  //       label: 'Breakdown Payment Reports',
  //       to: '/breakdown-payment-reports'
  //     },
  //     {
  //       label: 'Order Option Fee Reports',
  //       to: '/order-option-fee-reports'
  //     },
  //     {
  //       label: 'Reference Number Report',
  //       to: '/reference-number-report'
  //     },
  //     {
  //       label: 'Expiration Date Reports',
  //       to: '/expiration-date-reports'
  //     },
  //     {
  //       label: 'Discount Report',
  //       to: '/discount-report'
  //     },
  //     {
  //       label: 'Pull Out Report',
  //       to: '/pull-out-report'
  //     },
  //     {
  //       label: 'Refund',
  //       to: '/refund'
  //     }
  //   ]
  // },
  {
    to: '/user-management',
    label: 'User Management',
    icon: mdiAccount
  },
  {
    to: '/user',
    label: 'Cashiers',
    icon: mdiAccountCard
  },
  {
    label: 'Listing',
    icon: mdiListBox,
    menu: [
      {
        label: 'Item',
        to: '/items'
      },
      {
        label: 'Category',
        to: '/category'
      },
      {
        label: 'Discounts',
        to: '/discounts'
      },
      {
        label: 'Taxes',
        to: ''
      },
      {
        label: 'Payment Types',
        to: ''
      }
    ]
  },
  {
    to: '/customers',
    label: 'Customers',
    icon: mdiAccountMultiple
  },
  {
    to: '/branches',
    label: 'Branches',
    icon: mdiStore
  },
  // {
  //   to: '/franchises',
  //   label: 'Franchise',
  //   icon: mdiOfficeBuilding
  // },
  {
    to: '/receipts',
    label: 'Receipts',
    icon: mdiReceipt
  },
  {
    label: 'Inventory',
    icon: mdiFileCabinet,
    menu: [
      {
        label: 'Summary Report by Period',
        to: '/inventoryreport'
      },
      {
        label: 'Movement Report',
        to: '/movement-report'
      },
      {
        label: 'Warehouses',
        to: '/warehouses'
      },
      {
        label: 'Item Stocks',
        to: '/inventory'
      },
      {
        label: 'Item Transfer',
        to: '/item-transfer'
      },
      {
        label: 'Item Ledger',
        to: '/item-ledger'
      },
      {
        label: 'Suppliers',
        to: '/suppliers'
      },
      {
        label: 'Procurement',
        to: '/procurement'
      },
      {
        label: 'Purchase Order',
        to: '/purchase-order'
      }
    ]
  },
  {
    label: 'HRM & Payroll',
    icon: mdiGroup,
    menu: [
      {
        label: 'Employees',
        to: '/employees'
      },
      {
        label: 'Departments',
        to: '/departments'
      },
      {
        label: 'Job Titles',
        to: '/jobtitles'
      },
      {
        label: 'Leave Types',
        to: '/leavetypes'
      },
      {
        label: 'Leave Balances',
        to: '/leavebalances'
      },
      {
        label: 'Leave Requests',
        to: '/leaverequests'
      },
      {
        label: 'Total hours worked',
        to: '/total-hours-work'
      },
      {
        label: 'Time Cards',
        to: '/time-cards'
      },
      // {
      //   label: 'Branches',
      //   to: '/branches'
      // },
      {
        label: 'Attendance',
        to: '/attendance'
      },
      {
        label: 'Holidays',
        to: '/holidays'
      },
      {
        label: 'Salaries',
        to: '/salary'
      },
      {
        label: 'Allowances',
        to: '/allowances'
      },
      {
        label: 'Deductions',
        to: '/deductions'
      },
      {
        label: 'Payrolls',
        to: '/payroll'
      }
    ]
  },
  {
    label: 'Settings',
    icon: mdiApplicationSettings,
    menu: [
      {
        label: 'Features',
        to: '/features'
      },
      {
        label: 'Order Option Fees',
        to: '/order-option-fees'
      },
      {
        label: 'Order Option',
        to: '/order-option'
      },
      {
        label: 'Open Tickets',
        to: '/open-tickets'
      },
      {
        label: 'Open Tickets Archived',
        to: '/open-tickets-archived'
      },
      {
        label: 'Online Store Settings',
        to: '/online-store-settings'
      },
      {
        label: 'Loyalty Settings',
        to: '/loyalty-settings'
      },
      {
        label: 'Money Manager',
        to: '/money-manager'
      },
      {
        label: 'Analytics Settings',
        to: '/analytics-settings'
      },
      {
        label: 'Register Settings',
        to: '/register-settings'
      },
      {
        label: 'Audit Trail',
        to: '/audit-trail'
      }
    ]
  },
  {
    label: 'Food Safety',
    icon: mdiFood,
    menu: [
      {
        label: 'Summary',
        to: '/food_safety_summary'
      },
      {
        label: 'Templates',
        to: '/templates'
      },
      {
        label: 'Inspections',
        to: '/inspections'
      },
      {
        label: 'Schedule',
        to: '/schedule'
      },
      {
        label: 'Actions',
        to: '/actions'
      },
      {
        label: 'Training',
        to: '/training'
      },
      {
        label: 'Assets',
        to: '/assets'
      },
      {
        label: 'Issues',
        to: '/issues'
      },
      {
        label: 'Heads Up',
        to: '/heads-up'
      },
      {
        label: 'Analytics',
        to: '/analytics'
      }
    ]
  },
  {
    label: 'Accounting',
    icon: mdiFood,
    menu: [
      {
        label: 'Account List',
        to: '/account-list'
      },
      {
        label: 'Money Transfer',
        to: '/money-transfer'
      },
      {
        label: 'Balance Sheet',
        to: '/balance-sheet'
      },
      {
        label: 'Account Statement',
        to: '/account-statement'
      }
    ]
  }
]
