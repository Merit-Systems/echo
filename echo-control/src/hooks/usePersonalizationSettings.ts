'use client';

import { useState, useEffect, useCallback } from 'react';

interface UsePersonalizationSettingsResult {
  // App name
  currentAppName: string;
  editingAppName: boolean;
  newAppName: string;
  updatingAppName: boolean;
  appNameError: string | null;
  setEditingAppName: (editing: boolean) => void;
  setNewAppName: (name: string) => void;
  updateAppName: () => Promise<void>;
  cancelEditAppName: () => void;

  // Images
  profilePictureUrl: string | null;
  bannerImageUrl: string | null;
  uploadingProfile: boolean;
  uploadingBanner: boolean;
  imageErrors: { profile?: string; banner?: string };
  handleImageUpload: (file: File, type: 'profile' | 'banner') => Promise<void>;
  handleImageRemove: (type: 'profile' | 'banner') => Promise<void>;

  // Homepage URL
  homepageUrl: string;
  editingHomepageUrl: boolean;
  newHomepageUrl: string;
  updatingHomepageUrl: boolean;
  homepageUrlError: string | null;
  setEditingHomepageUrl: (editing: boolean) => void;
  setNewHomepageUrl: (url: string) => void;
  updateHomepageUrl: () => Promise<void>;
  cancelEditHomepageUrl: () => void;
}

export const usePersonalizationSettings = (
  appId: string,
  initialAppName: string
): UsePersonalizationSettingsResult => {
  // App name state
  const [currentAppName, setCurrentAppName] = useState(initialAppName);
  const [editingAppName, setEditingAppName] = useState(false);
  const [newAppName, setNewAppName] = useState(initialAppName);
  const [updatingAppName, setUpdatingAppName] = useState(false);
  const [appNameError, setAppNameError] = useState<string | null>(null);

  // Image state
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(
    null
  );
  const [bannerImageUrl, setBannerImageUrl] = useState<string | null>(null);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [imageErrors, setImageErrors] = useState<{
    profile?: string;
    banner?: string;
  }>({});

  // Homepage URL state
  const [homepageUrl, setHomepageUrl] = useState<string>('');
  const [editingHomepageUrl, setEditingHomepageUrl] = useState(false);
  const [newHomepageUrl, setNewHomepageUrl] = useState<string>('');
  const [updatingHomepageUrl, setUpdatingHomepageUrl] = useState(false);
  const [homepageUrlError, setHomepageUrlError] = useState<string | null>(null);

  // Utility function for URL validation
  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  };

  // Fetch app details on mount
  useEffect(() => {
    const fetchAppDetails = async () => {
      try {
        const response = await fetch(`/api/apps/${appId}`);
        if (response.ok) {
          const data = await response.json();
          setProfilePictureUrl(data.profilePictureUrl || null);
          setBannerImageUrl(data.bannerImageUrl || null);
          setHomepageUrl(data.homepageUrl || '');
          setNewHomepageUrl(data.homepageUrl || '');
        }
      } catch (error) {
        console.error('Error fetching app details:', error);
      }
    };

    fetchAppDetails();
  }, [appId]);

  // App name functions
  const updateAppName = useCallback(async () => {
    if (!newAppName.trim()) {
      setAppNameError('App name cannot be empty');
      return;
    }

    if (newAppName.trim() === currentAppName) {
      setEditingAppName(false);
      setAppNameError(null);
      return;
    }

    try {
      setUpdatingAppName(true);
      setAppNameError(null);

      const response = await fetch(`/api/apps/${appId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newAppName.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update app name');
      }

      setCurrentAppName(newAppName.trim());
      setEditingAppName(false);
    } catch (error) {
      console.error('Error updating app name:', error);
      setAppNameError(
        error instanceof Error ? error.message : 'Failed to update app name'
      );
    } finally {
      setUpdatingAppName(false);
    }
  }, [newAppName, currentAppName, appId]);

  const cancelEditAppName = useCallback(() => {
    setNewAppName(currentAppName);
    setEditingAppName(false);
    setAppNameError(null);
  }, [currentAppName]);

  // Homepage URL functions
  const updateHomepageUrl = useCallback(async () => {
    const trimmedUrl = newHomepageUrl.trim();

    if (trimmedUrl === homepageUrl) {
      setEditingHomepageUrl(false);
      setHomepageUrlError(null);
      return;
    }

    // Validate URL format if not empty
    if (trimmedUrl && !isValidUrl(trimmedUrl)) {
      setHomepageUrlError(
        'Please enter a valid URL (including http:// or https://)'
      );
      return;
    }

    try {
      setUpdatingHomepageUrl(true);
      setHomepageUrlError(null);

      const response = await fetch(`/api/apps/${appId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          homepageUrl: trimmedUrl || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update homepage URL');
      }

      setHomepageUrl(trimmedUrl);
      setEditingHomepageUrl(false);
    } catch (error) {
      console.error('Error updating homepage URL:', error);
      setHomepageUrlError(
        error instanceof Error ? error.message : 'Failed to update homepage URL'
      );
    } finally {
      setUpdatingHomepageUrl(false);
    }
  }, [newHomepageUrl, homepageUrl, appId]);

  const cancelEditHomepageUrl = useCallback(() => {
    setNewHomepageUrl(homepageUrl);
    setEditingHomepageUrl(false);
    setHomepageUrlError(null);
  }, [homepageUrl]);

  // Image functions
  const handleImageUpload = useCallback(
    async (file: File, type: 'profile' | 'banner') => {
      const setUploading =
        type === 'profile' ? setUploadingProfile : setUploadingBanner;
      const setImageUrl =
        type === 'profile' ? setProfilePictureUrl : setBannerImageUrl;

      try {
        setUploading(true);
        setImageErrors(prev => ({ ...prev, [type]: undefined }));

        // Validate file
        const allowedTypes = [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/webp',
        ];
        if (!allowedTypes.includes(file.type)) {
          throw new Error(
            'Invalid file type. Only JPEG, PNG, and WebP are allowed'
          );
        }

        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
          throw new Error('File size too large. Maximum size is 5MB');
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);

        const response = await fetch(`/api/apps/${appId}/images`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to upload image');
        }

        const data = await response.json();
        setImageUrl(data.imageUrl);
      } catch (error) {
        console.error(`Error uploading ${type} image:`, error);
        setImageErrors(prev => ({
          ...prev,
          [type]:
            error instanceof Error
              ? error.message
              : `Failed to upload ${type} image`,
        }));
      } finally {
        setUploading(false);
      }
    },
    [appId]
  );

  const handleImageRemove = useCallback(
    async (type: 'profile' | 'banner') => {
      const setUploading =
        type === 'profile' ? setUploadingProfile : setUploadingBanner;
      const setImageUrl =
        type === 'profile' ? setProfilePictureUrl : setBannerImageUrl;

      try {
        setUploading(true);
        setImageErrors(prev => ({ ...prev, [type]: undefined }));

        const response = await fetch(`/api/apps/${appId}/images?type=${type}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to remove image');
        }

        setImageUrl(null);
      } catch (error) {
        console.error(`Error removing ${type} image:`, error);
        setImageErrors(prev => ({
          ...prev,
          [type]:
            error instanceof Error
              ? error.message
              : `Failed to remove ${type} image`,
        }));
      } finally {
        setUploading(false);
      }
    },
    [appId]
  );

  return {
    // App name
    currentAppName,
    editingAppName,
    newAppName,
    updatingAppName,
    appNameError,
    setEditingAppName,
    setNewAppName,
    updateAppName,
    cancelEditAppName,

    // Images
    profilePictureUrl,
    bannerImageUrl,
    uploadingProfile,
    uploadingBanner,
    imageErrors,
    handleImageUpload,
    handleImageRemove,

    // Homepage URL
    homepageUrl,
    editingHomepageUrl,
    newHomepageUrl,
    updatingHomepageUrl,
    homepageUrlError,
    setEditingHomepageUrl,
    setNewHomepageUrl,
    updateHomepageUrl,
    cancelEditHomepageUrl,
  };
};
