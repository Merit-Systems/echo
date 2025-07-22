'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseMarkupSettingsResult {
  markupPercentage: number;
  inputValue: string;
  loading: boolean;
  saving: boolean;
  success: boolean;
  error: string | null;
  handleSave: () => Promise<void>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setInputValue: (value: string) => void;
  isChanged: boolean;
}

export const useMarkupSettings = (appId: string): UseMarkupSettingsResult => {
  const [markupPercentage, setMarkupPercentage] = useState<number>(0);
  const [inputValue, setInputValue] = useState<string>('0');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Convert multiplier to percentage
  const multiplierToPercentage = (multiplier: number): number => {
    return Math.max(0, (multiplier - 1) * 100);
  };

  // Convert percentage to multiplier
  const percentageToMultiplier = (percentage: number): number => {
    return percentage / 100 + 1;
  };

  // Fetch current markup value
  const fetchMarkup = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/apps/${appId}/owner-details`);
      const data = await response.json();

      if (response.ok && data.markup !== undefined) {
        const multiplier = Number(data.markup);
        const percentage = multiplierToPercentage(multiplier);

        setMarkupPercentage(percentage);
        setInputValue(percentage.toString());
      }
    } catch (error) {
      console.error('Error fetching markup:', error);
      setError('Failed to load current markup');
    } finally {
      setLoading(false);
    }
  }, [appId]);

  useEffect(() => {
    fetchMarkup();
  }, [fetchMarkup]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const newPercentage = parseFloat(inputValue);

      if (isNaN(newPercentage) || newPercentage < 0) {
        setError('Markup must be 0% or higher');
        return;
      }

      if (newPercentage > 1000) {
        setError('Markup cannot exceed 1000%');
        return;
      }

      const newMultiplier = percentageToMultiplier(newPercentage);

      const response = await fetch(`/api/apps/${appId}/owner-details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ markup: newMultiplier }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update markup');
      }

      setMarkupPercentage(newPercentage);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (error) {
      console.error('Error updating markup:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to update markup'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setError(null);
    setSuccess(false);
  };

  const currentPercentage = parseFloat(inputValue) || 0;
  const isChanged = currentPercentage !== markupPercentage;

  return {
    markupPercentage,
    inputValue,
    loading,
    saving,
    success,
    error,
    handleSave,
    handleInputChange,
    setInputValue,
    isChanged,
  };
};
