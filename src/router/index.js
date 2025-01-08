import { createRouter, createWebHashHistory } from 'vue-router'
import Style from '@/views/StyleView.vue'
import Home from '@/views/HomeView.vue'
import HomeX from '@/views/HomeViewX.vue'

const routes = [
  // {
  //   meta: {
  //     title: 'Select style'
  //   },
  //   path: '/',
  //   name: 'style',
  //   component: Style
  // },
  {
    // Document title tag
    // We combine it with defaultDocumentTitle set in `src/main.js` on router.afterEach hook
    meta: {
      title: 'Dashboard'
    },
    path: '/',
    name: 'dashboard',
    component: Home
  },
  {
    meta: {
      title: 'Dashboard'
    },
    path: '/dashboard',
    name: 'dashboard-alias',
    component: Home
  },
  {
    meta: {
      title: 'DashboardX'
    },
    path: '/dashboard-x',
    name: 'dashboardX',
    component: HomeX
  },
  {
    meta: {
      title: 'Tables'
    },
    path: '/tables',
    name: 'tables',
    component: () => import('@/views/TablesView.vue')
  },
  {
    meta: {
      title: 'Shifts'
    },
    path: '/shifts',
    name: 'shifts',
    component: () => import('@/views/ShiftsView.vue')
  },
  {
    meta: {
      title: 'User'
    },
    path: '/user',
    name: 'user',
    component: () => import('@/views/UserView.vue')
  },
  {
    meta: {
      title: 'Items'
    },
    path: '/items',
    name: 'items',
    component: () => import('@/views/ItemsView.vue')
  }, {
    meta: {
      title: 'Items Modifier'
    },
    path: '/items_modifier',
    name: 'items_modifier',
    component: () => import('@/views/ItemsModifierView.vue')
  },
  {
    meta: {
      title: 'Category'
    },
    path: '/category',
    name: 'category',
    component: () => import('@/views/CategoryView.vue')
  },
  {
    meta: {
      title: 'Category Group'
    },
    path: '/category_group',
    name: 'category_group',
    component: () => import('@/views/CategoryGroupView.vue')
  },
  {
    meta: {
      title: 'Discounts'
    },
    path: '/discounts',
    name: 'discounts',
    component: () => import('@/views/DiscountsView.vue')
  },

  {
    meta: {
      title: 'Customers'
    },
    path: '/customers',
    name: 'customers',
    component: () => import('@/views/CustomersView.vue')
  },
  {
    meta: {
      title: 'Devices'
    },
    path: '/devices',
    name: 'devices',
    component: () => import('@/views/DevicesView.vue')
  },
  {
    meta: {
      title: 'Franchises'
    },
    path: '/franchises',
    name: 'franchises',
    component: () => import('@/views/FranchisesView.vue')
  },
  {
    meta: {
      title: 'Franchises PO'
    },
    path: '/franchises_po',
    name: 'franchises_po',
    component: () => import('@/views/FranchisesPOView.vue')
  },
  {
    meta: {
      title: 'Franchises Request'
    },
    path: '/franchises_request',
    name: 'franchises_request',
    component: () => import('@/views/FranchisesRequestView.vue')
  },
  {
    meta: {
      title: 'Receipts'
    },
    path: '/receipts',
    name: 'receipts',
    component: () => import('@/views/ReceiptsView.vue')
  },
  {
    meta: {
      title: 'User Management'
    },
    path: '/user-management',
    name: 'user management',
    component: () => import('@/views/UserManagementView.vue')
  },
  
  {
    meta: {
      title: 'Forms'
    },
    path: '/forms',
    name: 'forms',
    component: () => import('@/views/FormsView.vue')
  },
  {
    meta: {
      title: 'Profile'
    },
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/ProfileView.vue')
  },
  {
    meta: {
      title: 'Ui'
    },
    path: '/ui',
    name: 'ui',
    component: () => import('@/views/UiView.vue')
  },
  {
    meta: {
      title: 'Responsive layout'
    },
    path: '/responsive',
    name: 'responsive',
    component: () => import('@/views/ResponsiveView.vue')
  },
  {
    meta: {
      title: 'Login'
    },
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue')
  },
  {
    meta: {
      title: 'Error'
    },
    path: '/error',
    name: 'error',
    component: () => import('@/views/ErrorView.vue')
  },
  // Food Safety
  {
    meta: {
      title: 'Food Safety Summary'
    },
    path: '/food_safety_summary',
    name: 'food_safety_summary',
    component: () => import('@/views/FoodSafetySummaryView.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0 }
  }
})

export default router
