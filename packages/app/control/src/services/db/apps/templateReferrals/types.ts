/**
 * Represents the essential information about a template used for app creation.
 * This can be used to track the origin of an app when it's built from a template.
 */
export interface TemplateReference {
  /**
   * The unique identifier of the template from which an app was created.
   * This links the app back to its template origin, which is crucial for
   * associating the app with a template creator for referral purposes.
   */
  templateId: string;
}

/**
 * Defines the data structure for capturing template referral information
 * when an app is created from an external template. This allows `echo-start`
 * to identify the template creator as a referrer for the new app.
 */
export interface AppTemplateReferralInfo {
  /**
   * The unique identifier of the template used to create the app.
   * This field is mandatory as it identifies the specific template.
   */
  templateId: string;
  /**
   * The unique identifier of the user who created the `templateId`.
   * This user will be automatically registered as a referrer for the new app
   * in the external referral system (e.g., echo.merit.systems referral service).
   * This field is mandatory to identify the referrer.
   */
  referrerUserId: string;
  /**
   * Optional: A timestamp indicating when the app was created using this template,
   * or when the referral process was initiated/completed. This can be used for auditing.
   */
  referredAt?: Date;
  /**
   * Optional: The current status of the referral registration with the external referral system.
   * Possible values could include 'pending' (referral initiated but not confirmed),
   * 'registered' (referral successfully recorded), or 'failed' (referral attempt failed).
   */
  referralStatus?: 'pending' | 'registered' | 'failed';
  /**
   * Optional: Any additional metadata from the template or creation process
   * that might be relevant to the referral or its tracking.
   */
  templateMetadata?: Record<string, any>;
}

/**
 * An interface to extend standard app creation options when an app is specifically
 * being created from a template and requires template creator referral tracking.
 * `echo-start` would consume this type to include and process the referral information
 * when creating a new application instance.
 */
export interface AppCreationWithTemplateReferralOptions {
  // Assuming a base AppCreationOptions type exists elsewhere,
  // this interface extends it with template and referral specific fields.
  // The 'appId' field is assumed to be part of the app creation context
  // or generated during the process, and is necessary to link the referral.
  appId: string; 

  /**
   * Comprehensive information about the template used and the template creator
   * who should be registered as a referrer. This field would be populated by
   * `echo-start` when an external template is used for app instantiation.
   */
  templateReferral: AppTemplateReferralInfo;

  // Other standard app creation fields (e.g., appName, ownerId, initial configuration)
  // would typically be included in a base interface that this type implicitly extends or combines with.
}
