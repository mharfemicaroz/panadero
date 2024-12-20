import {
  mdiAccount,
  mdiAccountCard,
  mdiAccountHardHat,
  mdiAccountMultiple,
  mdiApplicationSettings,
  mdiDevices,
  mdiFileCabinet,
  mdiFood,
  mdiGroup,
  mdiListBox,
  mdiMonitorDashboard,
  mdiOfficeBuilding,
  mdiReceipt,
  mdiTable
} from '@mdi/js'

export default [
  {
    to: '/dashboard',
    icon: mdiMonitorDashboard,
    label: 'Dashboard'
  },
  {
    label: 'Reports',
    icon: mdiTable,
    menu: [
      {
        label: 'Shifts',
        to: '/shifts'
      },
      {
        label: 'Sales Inventory',
        to: '/sales-inventory'
      },
      {
        label: 'Breakdown Payment Reports',
        to: '/breakdown-payment-reports'
      },
      {
        label: 'Order Option Fee Reports',
        to: '/order-option-fee-reports'
      },
      {
        label: 'Reference Number Report',
        to: '/reference-number-report'
      },
      {
        label: 'Expiration Date Reports',
        to: '/expiration-date-reports'
      },
      {
        label: 'Discount Report',
        to: '/discount-report'
      },
      {
        label: 'Pull Out Report',
        to: '/pull-out-report'
      },
      {
        label: 'Refund',
        to: '/refund'
      },
      {
        label: 'Taxes for Philippines',
        to: '/taxes-for-philippines'
      },
      {
        label: 'Royalty Statement',
        to: '/royalty-statement'
      }
    ]
  },
  {
    to: '/user-management',
    label: 'User Management',
    icon: mdiAccount
  },
  {
    to: '/user',
    label: 'User',
    icon: mdiAccountCard
  },
  {
    label: 'Listing',
    icon: mdiListBox,
    menu: [
      {
        label: 'Item Tags',
        to: '/item-tags'
      },
      {
        label: 'Categories',
        to: '/categories'
      },
      {
        label: 'Discounts',
        to: '/discounts'
      },
      {
        label: 'Taxes',
        to: '/taxes'
      },
      {
        label: 'Payment Types',
        to: '/payment-types'
      }
    ]
  },
  {
    to: '/customers',
    label: 'Customers',
    icon: mdiAccountMultiple
  },
  {
    to: '/devices',
    label: 'Devices',
    icon: mdiDevices
  },
  {
    to: '/franchises',
    label: 'Franchise',
    icon: mdiOfficeBuilding
  },
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
        to: '/summary-report-by-period'
      },
      {
        label: 'Movement Report',
        to: '/movement-report'
      },
      {
        label: 'Movement Report Period',
        to: '/movement-report-period'
      },
      {
        label: 'Item Bundle Report',
        to: '/item-bundle-report'
      },
      {
        label: 'Warehouses',
        to: '/warehouses'
      },
      {
        label: 'Item Stocks',
        to: '/item-stocks'
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
        label: 'Item Bundle',
        to: '/item-bundle'
      },
      {
        label: 'Supplier',
        to: '/supplier'
      },
      {
        label: 'Purchase Order',
        to: '/purchase-order'
      },
      {
        label: 'Disassembly',
        to: '/disassembly'
      }
    ]
  },
  {
    label: 'HRM',
    icon: mdiGroup,
    menu: [
      {
        label: 'Total hours worked',
        to: '/total-hours-worked'
      },
      {
        label: 'Time Cards',
        to: '/time-cards'
      },
      {
        label: 'Branch',
        to: '/branch'
      },
      {
        label: 'Attendance',
        to: '/attendance'
      },
      {
        label: 'Holidays',
        to: '/holidays'
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
        to: '/summary'
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
