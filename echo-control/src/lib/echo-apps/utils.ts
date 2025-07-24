import { isValidUrl } from '../stripe/payment-link';
// Validation functions
export const validateAppName = (name: string): string | null => {
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return 'App name is required';
  }
  if (name.length > 100) {
    return 'App name must be 100 characters or less';
  }
  return null;
};

export const validateAppDescription = (description?: string): string | null => {
  if (description && typeof description !== 'string') {
    return 'Description must be a string';
  }
  if (description && description.length > 500) {
    return 'Description must be 500 characters or less';
  }
  return null;
};

export const validateGithubId = (githubId?: string): string | null => {
  if (githubId && typeof githubId !== 'string') {
    return 'GitHub ID must be a string';
  }
  if (githubId && githubId.trim().length === 0) {
    return 'GitHub ID cannot be empty if provided';
  }
  if (githubId && githubId.length > 200) {
    return 'GitHub ID must be 200 characters or less';
  }
  return null;
};

export const validateGithubType = (githubType?: string): string | null => {
  if (githubType && !['user', 'repo'].includes(githubType)) {
    return 'GitHub Type must be either "user" or "repo"';
  }
  return null;
};

export const validateHomepageUrl = (homepageUrl?: string): string | null => {
  if (homepageUrl && typeof homepageUrl !== 'string') {
    return 'Homepage URL must be a string';
  }
  if (homepageUrl && homepageUrl.trim().length === 0) {
    return 'Homepage URL cannot be empty if provided';
  }
  if (homepageUrl && homepageUrl.length > 500) {
    return 'Homepage URL must be 500 characters or less';
  }
  if (homepageUrl) {
    try {
      const url = new URL(homepageUrl);
      if (!['http:', 'https:'].includes(url.protocol)) {
        return 'Homepage URL must start with http:// or https://';
      }
    } catch {
      return 'Homepage URL must be a valid URL';
    }
  }
  return null;
};

export const verifyArgs = (data: {
  name?: string;
  description?: string;
  githubType?: string;
  githubId?: string;
  authorizedCallbackUrls?: string[];
  profilePictureUrl?: string;
  bannerImageUrl?: string;
  homepageUrl?: string;
  isPublic?: boolean;
}): string | null => {
  // Validate name
  if (data.name !== undefined) {
    const nameError = validateAppName(data.name);
    if (nameError) return nameError;
  }

  // Validate description
  if (data.description !== undefined) {
    const descriptionError = validateAppDescription(data.description);
    if (descriptionError) return descriptionError;
  }

  // Validate githubType
  if (data.githubType !== undefined) {
    const githubTypeError = validateGithubType(data.githubType);
    if (githubTypeError) return githubTypeError;
  }

  // Validate githubId
  if (data.githubId !== undefined) {
    const githubIdError = validateGithubId(data.githubId);
    if (githubIdError) return githubIdError;
  }

  // Validate authorizedCallbackUrls
  if (data.authorizedCallbackUrls !== undefined) {
    if (!Array.isArray(data.authorizedCallbackUrls)) {
      return 'Authorized callback URLs must be an array';
    }

    for (const url of data.authorizedCallbackUrls) {
      if (typeof url !== 'string') {
        return 'All callback URLs must be strings';
      }

      if (url.trim().length === 0) {
        return 'Callback URLs cannot be empty';
      }

      // Allow localhost URLs for development
      const isLocalhostUrl = url.startsWith('http://localhost:');
      if (!isLocalhostUrl && !isValidUrl(url)) {
        return `Invalid callback URL: ${url}`;
      }
    }
  }

  // Validate profilePictureUrl
  if (data.profilePictureUrl !== undefined && data.profilePictureUrl !== null) {
    if (typeof data.profilePictureUrl !== 'string') {
      return 'Profile picture URL must be a string';
    }

    if (data.profilePictureUrl.trim().length === 0) {
      return 'Profile picture URL cannot be empty if provided';
    }

    if (!isValidUrl(data.profilePictureUrl)) {
      return 'Profile picture URL must be a valid URL';
    }
  }

  // Validate bannerImageUrl
  if (data.bannerImageUrl !== undefined && data.bannerImageUrl !== null) {
    if (typeof data.bannerImageUrl !== 'string') {
      return 'Banner image URL must be a string';
    }

    if (data.bannerImageUrl.trim().length === 0) {
      return 'Banner image URL cannot be empty if provided';
    }

    if (!isValidUrl(data.bannerImageUrl)) {
      return 'Banner image URL must be a valid URL';
    }
  }

  // Validate homepageUrl
  if (data.homepageUrl !== undefined) {
    const homepageUrlError = validateHomepageUrl(data.homepageUrl);
    if (homepageUrlError) return homepageUrlError;
  }

  // Validate isPublic
  if (data.isPublic !== undefined) {
    if (typeof data.isPublic !== 'boolean') {
      return 'isPublic must be a boolean';
    }
  }

  return null; // No validation errors
};
