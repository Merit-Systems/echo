import { AppRole, MembershipStatus } from '../shared/enums';

// Re-export shared enums for convenience in permissions context
export { AppRole, MembershipStatus };

export enum Permission {
  // App management
  READ_APP = 'read_app',
  EDIT_APP = 'edit_app',
  DELETE_APP = 'delete_app',

  // Customer management
  MANAGE_CUSTOMERS = 'manage_customers',
  INVITE_CUSTOMERS = 'invite_customers',

  // API key management
  CREATE_API_KEYS = 'create_api_keys',
  MANAGE_ALL_API_KEYS = 'manage_all_api_keys',
  MANAGE_OWN_API_KEYS = 'manage_own_api_keys',

  // Billing and usage
  MANAGE_BILLING = 'manage_billing',
  VIEW_ANALYTICS = 'view_analytics',
  VIEW_OWN_USAGE = 'view_own_usage',

  // LLM operations
  USE_LLM_API = 'use_llm_api',
}

export interface UserAppAccess {
  userId: string;
  appId: string;
  role: AppRole;
  status: MembershipStatus;
  permissions: Permission[];
}
