// ─── PayPro Global IPN Types ────────────────────────────────────────────────
// Strict TypeScript interfaces for PayPro Global Instant Payment Notifications.
// Reference: PayPro Global IPN Documentation (Store Settings → Integration)

/**
 * PayPro Global IPN Event Types
 * These correspond to the IPN_TYPE_NAME field sent by PayPro Global.
 */
export type PayProIPNEventType =
  | "OrderCharged"
  | "OrderRefunded"
  | "OrderChargedBack"
  | "SubscriptionChargeSucceed"
  | "SubscriptionChargeFailed"
  | "SubscriptionSuspended"
  | "SubscriptionResumed"
  | "SubscriptionTerminated"
  | "SubscriptionRenewed"
  | "SubscriptionExpired";

/**
 * PayPro Global Subscription Status values
 * Returned in the SUBSCRIPTION_STATUS_NAME field.
 */
export type PayProSubscriptionStatus =
  | "Active"
  | "Suspended"
  | "Cancelled"
  | "Expired"
  | "Terminated"
  | "PastDue";

/**
 * Flat IPN payload from PayPro Global.
 * PayPro sends data as either x-www-form-urlencoded or flat JSON.
 * All values are strings (even numeric ones like ORDER_ID).
 */
export interface PayProIPNPayload {
  /** Event type identifier — determines which handler to invoke */
  IPN_TYPE_NAME: PayProIPNEventType;

  /** Unique order identifier from PayPro */
  ORDER_ID: string;

  /** Order status string (e.g., "Charged", "Refunded") */
  ORDER_STATUS: string;

  /** Total amount of the order as a string (e.g., "19.00") */
  ORDER_TOTAL_AMOUNT: string;

  /** Currency code of the order (e.g., "USD") */
  ORDER_CURRENCY_CODE?: string;

  /** PayPro internal product identifier */
  PRODUCT_ID: string;

  /** Product name as configured in PayPro dashboard */
  PRODUCT_NAME?: string;

  /** Customer email address */
  CUSTOMER_EMAIL: string;

  /** Customer first name */
  CUSTOMER_FIRST_NAME?: string;

  /** Customer last name */
  CUSTOMER_LAST_NAME?: string;

  /** Subscription ID for recurring billing events */
  SUBSCRIPTION_ID?: string;

  /** Numeric subscription status ID */
  SUBSCRIPTION_STATUS_ID?: string;

  /** Human-readable subscription status */
  SUBSCRIPTION_STATUS_NAME?: PayProSubscriptionStatus;

  /** ISO date string for next charge (e.g., "2026-07-14T00:00:00") */
  SUBSCRIPTION_NEXT_CHARGE_DATE?: string;

  /** Amount of next charge as string */
  SUBSCRIPTION_NEXT_CHARGE_AMOUNT?: string;

  /** Currency code for next charge */
  SUBSCRIPTION_NEXT_CHARGE_CURRENCY_CODE?: string;

  /**
   * Custom fields passed via checkout URL (x-prefixed).
   * Format: "x-userId=abc123" or "x-userId=abc123&x-plan=pro"
   * CRITICAL: This is how we correlate payments to users.
   */
  ORDER_CUSTOM_FIELDS?: string;

  /** Test mode flag: "0" = production, "1" = test */
  TEST_MODE?: string;

  /**
   * Verification hash from PayPro (legacy IPN mode).
   * Formula: sha256(ORDER_ID + ORDER_STATUS + ORDER_TOTAL_AMOUNT + CUSTOMER_EMAIL + VALIDATION_KEY + TEST_MODE + IPN_TYPE_NAME)
   */
  HASH?: string;

  /** Allow unknown string fields for forward-compatibility */
  [key: string]: string | undefined;
}

/**
 * Parsed custom fields from ORDER_CUSTOM_FIELDS.
 * The `x-` prefix is stripped from key names.
 */
export interface PayProCustomFields {
  userId?: string;
  [key: string]: string | undefined;
}

/**
 * Extracts custom fields from PayPro's ORDER_CUSTOM_FIELDS string.
 * Input format: "x-userId=abc123&x-plan=pro"
 * Output: { userId: "abc123", plan: "pro" }
 */
export function parsePayProCustomFields(raw?: string): PayProCustomFields {
  if (!raw) return {};

  const result: PayProCustomFields = {};
  const pairs = raw.split("&");

  for (const pair of pairs) {
    const [rawKey, value] = pair.split("=");
    if (!rawKey || value === undefined) continue;

    // Strip the "x-" prefix that PayPro uses for custom fields
    const key = rawKey.startsWith("x-") ? rawKey.slice(2) : rawKey;
    result[key] = decodeURIComponent(value);
  }

  return result;
}
