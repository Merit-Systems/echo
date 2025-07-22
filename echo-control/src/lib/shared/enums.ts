/**
 * SHARED ENUMS
 *
 * This file contains all shared enums and string literal types used across the Echo platform.
 * These enums ensure type safety and consistency across the codebase.
 */

// ============================================================================
// DATABASE MODEL ENUMS
// ============================================================================

/**
 * App membership roles - defines user permissions within an Echo app
 */
export enum AppRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  CUSTOMER = 'customer',
  PUBLIC = 'public',
}

/**
 * App membership status - defines the state of a user's membership
 */
export enum MembershipStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  REVOKED = 'revoked',
}

/**
 * API key scopes - defines the permission level of an API key
 * Note: These align with AppRole values for consistency
 */
export enum ApiKeyScope {
  OWNER = 'owner',
  ADMIN = 'admin',
  CUSTOMER = 'customer',
}

/**
 * Credit grant types - defines whether a grant adds or subtracts from balance
 */
export enum CreditGrantType {
  CREDIT = 'credit', // Adds to user balance
  DEBIT = 'debit', // Subtracts from user balance
}

/**
 * Credit grant sources - defines where a credit grant originated
 */
export enum CreditGrantSource {
  PAYMENT = 'payment',
  PROMOTION = 'promotion',
  REFUND = 'refund',
  ADJUSTMENT = 'adjustment',
  TRANSACTION = 'transaction',
  ADMIN_GRANT = 'admin_grant',
}

/**
 * Revenue types - categorizes different revenue streams
 */
export enum RevenueType {
  SUBSCRIPTION_PAYMENT = 'subscription_payment',
  CREDIT_DEBIT = 'credit_debit',
  TRANSACTION_FEE = 'transaction_fee',
}

/**
 * Payment status - tracks the state of payment transactions
 */
export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELED = 'canceled',
  REFUNDED = 'refunded',
}

/**
 * Transaction status - tracks the state of LLM API transactions
 */
export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELED = 'canceled',
}

/**
 * Subscription status - tracks the state of user subscriptions
 */
export enum SubscriptionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  CANCELED = 'canceled',
  PAST_DUE = 'past_due',
  UNPAID = 'unpaid',
  TRIALING = 'trialing',
}

/**
 * GitHub repository types - used for app linking
 */
export enum GitHubType {
  USER = 'user',
  REPO = 'repo',
}

/**
 * Usage product categories - categorizes different types of AI services
 */
export enum UsageProductCategory {
  LLM = 'llm',
  IMAGE = 'image',
  AUDIO = 'audio',
  VIDEO = 'video',
  EMBEDDING = 'embedding',
}

// ============================================================================
// UI COMPONENT ENUMS
// ============================================================================

/**
 * Theme options for the application
 */
export enum Theme {
  DARK = 'dark',
  LIGHT = 'light',
  SYSTEM = 'system',
}

/**
 * Badge variants for UI consistency
 */
export enum BadgeVariant {
  DEFAULT = 'default',
  SECONDARY = 'secondary',
  DESTRUCTIVE = 'destructive',
  OUTLINE = 'outline',
  SECONDARY_GLASS = 'secondaryGlass',
  ACTION_NEEDED = 'actionNeeded',
  SUCCESS = 'success',
  MUTED = 'muted',
}

/**
 * Button variants for UI consistency
 */
export enum ButtonVariant {
  DEFAULT = 'default',
  DEFAULT_OUTLINE = 'defaultOutline',
  DESTRUCTIVE = 'destructive',
  DESTRUCTIVE_GHOST = 'destructiveGhost',
  OUTLINE = 'outline',
  SECONDARY = 'secondary',
  SECONDARY_OUTLINE = 'secondaryOutline',
  SECONDARY_GHOST = 'secondaryGhost',
  GHOST = 'ghost',
  LINK = 'link',
  SUCCESS = 'success',
}

/**
 * Button sizes for UI consistency
 */
export enum ButtonSize {
  DEFAULT = 'default',
  SM = 'sm',
  LG = 'lg',
  ICON = 'icon',
  XS = 'xs',
}

// ============================================================================
// CREATION FLOW ENUMS
// ============================================================================

/**
 * Step types for the app creation flow
 */
export enum StepType {
  TEXT = 'text',
  GITHUB_SEARCH = 'github-search',
  CODE = 'code',
  VERIFICATION = 'verification',
}

// ============================================================================
// ARRAY CONSTANTS FOR VALIDATION
// ============================================================================

/**
 * Array versions of enums for runtime validation
 * These are useful for includes() checks and validation functions
 */
export const APP_ROLES = Object.values(AppRole);
export const MEMBERSHIP_STATUSES = Object.values(MembershipStatus);
export const API_KEY_SCOPES = Object.values(ApiKeyScope);
export const CREDIT_GRANT_TYPES = Object.values(CreditGrantType);
export const CREDIT_GRANT_SOURCES = Object.values(CreditGrantSource);
export const REVENUE_TYPES = Object.values(RevenueType);
export const PAYMENT_STATUSES = Object.values(PaymentStatus);
export const TRANSACTION_STATUSES = Object.values(TransactionStatus);
export const SUBSCRIPTION_STATUSES = Object.values(SubscriptionStatus);
export const GITHUB_TYPES = Object.values(GitHubType);
export const USAGE_PRODUCT_CATEGORIES = Object.values(UsageProductCategory);
export const THEMES = Object.values(Theme);
export const BADGE_VARIANTS = Object.values(BadgeVariant);
export const BUTTON_VARIANTS = Object.values(ButtonVariant);
export const BUTTON_SIZES = Object.values(ButtonSize);
export const STEP_TYPES = Object.values(StepType);

// ============================================================================
// TYPE UNIONS FOR EXTERNAL USE
// ============================================================================

/**
 * Type unions for components that need string literal types
 * These provide the same type safety as enums but for external APIs
 */
export type AppRoleType = `${AppRole}`;
export type MembershipStatusType = `${MembershipStatus}`;
export type ApiKeyScopeType = `${ApiKeyScope}`;
export type CreditGrantTypeType = `${CreditGrantType}`;
export type CreditGrantSourceType = `${CreditGrantSource}`;
export type RevenueTypeType = `${RevenueType}`;
export type PaymentStatusType = `${PaymentStatus}`;
export type TransactionStatusType = `${TransactionStatus}`;
export type SubscriptionStatusType = `${SubscriptionStatus}`;
export type GitHubTypeType = `${GitHubType}`;
export type UsageProductCategoryType = `${UsageProductCategory}`;
export type ThemeType = `${Theme}`;
export type BadgeVariantType = `${BadgeVariant}`;
export type ButtonVariantType = `${ButtonVariant}`;
export type ButtonSizeType = `${ButtonSize}`;
export type StepTypeType = `${StepType}`;
