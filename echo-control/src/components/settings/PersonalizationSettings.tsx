'use client';

import React, { useState, useEffect } from 'react';
import {
  EditIcon,
  SaveIcon,
  XIcon,
  Upload,
  Trash2,
  ImageIcon,
} from 'lucide-react';
import { GlassButton } from '../glass-button';
import Image from 'next/image';
import { isValidUrl } from '@/lib/stripe/payment-link';

interface PersonalizationSettingsProps {
  appId: string;
  initialAppName: string;
}

export default function PersonalizationSettings({
  appId,
  initialAppName,
}: PersonalizationSettingsProps) {
  const [currentAppName, setCurrentAppName] = useState(initialAppName);
  const [editingAppName, setEditingAppName] = useState(false);
  const [newAppName, setNewAppName] = useState(initialAppName);
  const [updatingAppName, setUpdatingAppName] = useState(false);
  const [appNameError, setAppNameError] = useState<string | null>(null);

  // Image upload state
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

  const updateAppName = async () => {
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
  };

  const cancelEditAppName = () => {
    setNewAppName(currentAppName);
    setEditingAppName(false);
    setAppNameError(null);
  };

  const updateHomepageUrl = async () => {
    // Allow empty homepage URL
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
  };

  const cancelEditHomepageUrl = () => {
    setNewHomepageUrl(homepageUrl);
    setEditingHomepageUrl(false);
    setHomepageUrlError(null);
  };

  // Fetch current app details including images
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

  const handleImageUpload = async (file: File, type: 'profile' | 'banner') => {
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
  };

  const handleImageRemove = async (type: 'profile' | 'banner') => {
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
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Personalization</h3>
        <p className="text-sm text-muted-foreground">
          Customize your app&apos;s appearance and branding
        </p>
      </div>

      {/* App Name Section */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-3">
              App Name
            </label>
            {editingAppName ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={newAppName}
                  onChange={e => setNewAppName(e.target.value)}
                  className="w-full px-3 py-2.5 border border-input bg-input/50 text-input-foreground rounded-lg text-sm focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all duration-200"
                  placeholder="Enter app name"
                  disabled={updatingAppName}
                />
                {appNameError && (
                  <p className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                    {appNameError}
                  </p>
                )}
                <div className="flex gap-2">
                  <GlassButton
                    onClick={updateAppName}
                    disabled={updatingAppName || !newAppName.trim()}
                    variant="primary"
                  >
                    {updatingAppName ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                    ) : (
                      <SaveIcon className="h-3 w-3 mr-1" />
                    )}
                    Save
                  </GlassButton>
                  <GlassButton
                    onClick={cancelEditAppName}
                    disabled={updatingAppName}
                    variant="secondary"
                  >
                    <XIcon className="h-3 w-3 mr-1" />
                    Cancel
                  </GlassButton>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-muted/30 rounded-lg p-3 w-full">
                <span className="text-foreground font-medium">
                  {currentAppName}
                </span>
                <GlassButton
                  onClick={() => setEditingAppName(true)}
                  variant="secondary"
                >
                  <EditIcon className="h-3 w-3 mr-1" />
                  Edit
                </GlassButton>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Homepage URL Settings */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-3">
              App Homepage URL
            </label>
            {editingHomepageUrl ? (
              <div className="space-y-3">
                <input
                  type="url"
                  value={newHomepageUrl}
                  onChange={e => setNewHomepageUrl(e.target.value)}
                  className="w-full px-3 py-2.5 border border-input bg-input/50 text-input-foreground rounded-lg text-sm focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all duration-200"
                  placeholder="https://example.com"
                  disabled={updatingHomepageUrl}
                />
                {homepageUrlError && (
                  <p className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                    {homepageUrlError}
                  </p>
                )}
                <div className="flex gap-2">
                  <GlassButton
                    onClick={updateHomepageUrl}
                    disabled={updatingHomepageUrl}
                    variant="primary"
                  >
                    {updatingHomepageUrl ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                    ) : (
                      <SaveIcon className="h-3 w-3 mr-1" />
                    )}
                    Save
                  </GlassButton>
                  <GlassButton
                    onClick={cancelEditHomepageUrl}
                    disabled={updatingHomepageUrl}
                    variant="secondary"
                  >
                    <XIcon className="h-3 w-3 mr-1" />
                    Cancel
                  </GlassButton>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-muted/30 rounded-lg p-3 w-full">
                <span className="text-foreground font-medium">
                  {homepageUrl || 'No homepage URL set'}
                </span>
                <GlassButton
                  onClick={() => setEditingHomepageUrl(true)}
                  variant="secondary"
                >
                  <EditIcon className="h-3 w-3 mr-1" />
                  Edit
                </GlassButton>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              The URL where users can access your application. This will be
              displayed in the public app directory.
            </p>
          </div>
        </div>
      </div>

      {/* Profile Picture Settings */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-3">
              Profile Picture
            </label>
            <div className="flex items-start gap-6">
              {/* Current Image Preview */}
              <div className="flex-shrink-0">
                {profilePictureUrl ? (
                  <div className="w-20 h-20 rounded-xl overflow-hidden shadow-md">
                    <Image
                      src={profilePictureUrl}
                      alt="Profile picture"
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-md">
                    {currentAppName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Upload Controls */}
              <div className="flex-1 space-y-3">
                <div className="flex gap-2">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImageUpload(file, 'profile');
                        }
                      }}
                      className="hidden"
                      disabled={uploadingProfile}
                    />
                    <GlassButton
                      variant="secondary"
                      disabled={uploadingProfile}
                    >
                      {uploadingProfile ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-foreground mr-2"></div>
                      ) : (
                        <Upload className="h-3 w-3 mr-1" />
                      )}
                      {uploadingProfile ? 'Uploading...' : 'Upload Image'}
                    </GlassButton>
                  </label>

                  {profilePictureUrl && (
                    <GlassButton
                      onClick={() => handleImageRemove('profile')}
                      variant="secondary"
                      disabled={uploadingProfile}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Remove
                    </GlassButton>
                  )}
                </div>

                <p className="text-xs text-muted-foreground">
                  Recommended: Square image, max 5MB. Supports JPEG, PNG, and
                  WebP.
                </p>

                {imageErrors.profile && (
                  <p className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                    {imageErrors.profile}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Banner Image Settings */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-3">
              Banner Image
            </label>
            <div className="space-y-4">
              {/* Current Banner Preview */}
              {bannerImageUrl ? (
                <div className="w-full h-32 rounded-lg overflow-hidden shadow-md">
                  <Image
                    src={bannerImageUrl}
                    alt="Banner image"
                    width={600}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-full h-32 rounded-lg bg-gradient-to-r from-blue-500 via-purple-600 to-blue-700 flex items-center justify-center text-white shadow-md">
                  <div className="text-center">
                    <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-70" />
                    <p className="text-sm opacity-70">No banner image</p>
                  </div>
                </div>
              )}

              {/* Upload Controls */}
              <div className="space-y-3">
                <div className="flex gap-2">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImageUpload(file, 'banner');
                        }
                      }}
                      className="hidden"
                      disabled={uploadingBanner}
                    />
                    <GlassButton variant="secondary" disabled={uploadingBanner}>
                      {uploadingBanner ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-foreground mr-2"></div>
                      ) : (
                        <Upload className="h-3 w-3 mr-1" />
                      )}
                      {uploadingBanner ? 'Uploading...' : 'Upload Banner'}
                    </GlassButton>
                  </label>

                  {bannerImageUrl && (
                    <GlassButton
                      onClick={() => handleImageRemove('banner')}
                      variant="secondary"
                      disabled={uploadingBanner}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Remove
                    </GlassButton>
                  )}
                </div>

                <p className="text-xs text-muted-foreground">
                  Recommended: 16:9 aspect ratio (e.g., 1920x1080), max 5MB.
                  Supports JPEG, PNG, and WebP.
                </p>

                {imageErrors.banner && (
                  <p className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                    {imageErrors.banner}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
