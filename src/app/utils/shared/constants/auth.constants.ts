export const PERMISSIONS = {
  ACCOUNT_READ: 'ACCOUNT_READ',
  ACCOUNT_CREATE: 'ACCOUNT_CREATE',
  ACCOUNT_UPDATE: 'ACCOUNT_UPDATE',
  ACCOUNT_DELETE: 'ACCOUNT_DELETE',
  ACCOUNT_RESET: 'ACCOUNT_RESET_PASSWORD',
  ROLE_READ: 'ROLE_READ',
  ROLE_CREATE: 'ROLE_CREATE',
  ROLE_UPDATE: 'ROLE_UPDATE',
  ROLE_DELETE: 'ROLE_DELETE',
  PARTNER_READ: 'PARTNER_READ',
  PARTNER_CREATE: 'PARTNER_CREATE',
  PARTNER_UPDATE: 'PARTNER_UPDATE',
  PARTNER_DELETE: 'PARTNER_DELETE',
  PERMISSION_READ: 'PERMISSION_READ',
  CONFIG_CREATE: 'CONFIG_CREATE',
  CONFIG_UPDATE: 'CONFIG_UPDATE',
  CONFIG_DELETE: 'CONFIG_DELETE',
  CONFIG_READ: 'CONFIG_READ',
}

export const PATHS = {
  SYSTEM: '/system',
  TRANSACTION: '/transaction',
}

export const PAGES = {
  // User
  USER: '/system/user',

  // Role
  ROLE: '/system/role',

  // Partner
  PARTNER: '/system/partner',
  PARTNER_LIST: '/system/partner/list',
  PARTNER_DETAIL: '/system/partner/detail',

  // Config
  CONFIG: '/system/config',

  // Notification
  NOTIFICATION: '/system/notification',

  // Product
  PRODUCT: '/system/product',
  PRODUCT_LIST: '/system/product/list',
  PRODUCT_DETAIL: '/system/product/detail',

  // Tools
  TOOLS: '/system/tools',

  // Transaction
  PURCHASE_ORDER: '/transaction/order',

  BALANCE: '/transaction/balance',
  RECONCILIATION: '/transaction/reconciliation',
  RECONCILIATION_DETAIL: '/transaction/reconciliation-detail',
}