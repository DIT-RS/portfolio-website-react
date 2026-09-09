import React, { useState, useEffect } from 'react';
import type { PortfolioContent } from '../data/portfolioData';
import { defaultPortfolioContent } from '../data/portfolioData';
import type { GitHubConfig } from '../services/githubService';
import {
  getSavedGitHubConfig,
  saveGitHubConfig,
  clearGitHubConfig,
  getCachedContent,
  setCachedContent,
  fetchContentFromGitHub,
  saveContentToGitHub,
  uploadFileToGitHub,
} from '../services/githubService';
import { PortfolioContext } from './usePortfolio';

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<PortfolioContent>(() => {
    const cached = getCachedContent();
    return cached || defaultPortfolioContent;
  });
  const [originalContent, setOriginalContent] = useState<PortfolioContent>(content);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [ghConfig, setGhConfigState] = useState<GitHubConfig | null>(getSavedGitHubConfig);

  // Load public/portfolio-data.json on first mount if available
  useEffect(() => {
    fetch('/portfolio-data.json')
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Not found');
      })
      .then((data: PortfolioContent) => {
        setContent(() => {
          const cached = getCachedContent();
          if (cached) return cached;
          setOriginalContent(data);
          return data;
        });
      })
      .catch(() => {
        // Fallback to embedded default data
      });
  }, []);

  const setGhConfig = (config: GitHubConfig | null) => {
    if (config) {
      saveGitHubConfig(config);
    } else {
      clearGitHubConfig();
    }
    setGhConfigState(config);
  };

  const updateContent = (newContent: PortfolioContent) => {
    setContent(newContent);
    setHasUnsavedChanges(true);
  };

  const updateField = <K extends keyof PortfolioContent>(key: K, value: PortfolioContent[K]) => {
    setContent((prev) => {
      const updated = { ...prev, [key]: value };
      setHasUnsavedChanges(true);
      return updated;
    });
  };

  const discardChanges = () => {
    setContent(originalContent);
    setHasUnsavedChanges(false);
  };

  const saveChanges = async (
    commitMessage = 'Update portfolio data via Live Edit'
  ): Promise<{ success: boolean; error?: string }> => {
    setIsSaving(true);
    try {
      // 1. Always update local storage cache immediately
      setCachedContent(content);
      setOriginalContent(content);
      setHasUnsavedChanges(false);

      // 2. If GitHub token and repo config is provided, commit to repository
      if (ghConfig && ghConfig.token && ghConfig.owner && ghConfig.repo) {
        await saveContentToGitHub(ghConfig, content, commitMessage);
      }

      setIsSaving(false);
      return { success: true };
    } catch (err: unknown) {
      setIsSaving(false);
      const msg = err instanceof Error ? err.message : 'Failed to save to GitHub';
      return { success: false, error: msg };
    }
  };

  const uploadResumeFile = async (file: File): Promise<{ success: boolean; url?: string; error?: string }> => {
    try {
      // Convert file to base64
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const res = reader.result as string;
          // Extract base64 portion from data URL
          const base64 = res.split(',')[1] || res;
          resolve(base64);
        };
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(file);
      });

      // Target path inside public repo folder
      const sanitizedName = file.name.replace(/\s+/g, '_');
      const targetPath = `public/${sanitizedName}`;
      const publicUrl = `/${sanitizedName}`;

      // If GitHub config is connected, commit file directly
      if (ghConfig && ghConfig.token && ghConfig.owner && ghConfig.repo) {
        await uploadFileToGitHub(
          ghConfig,
          targetPath,
          base64Data,
          `Upload new resume: ${file.name}`
        );
      }

      // Also create an in-browser Object URL for immediate local preview
      const localBlobUrl = URL.createObjectURL(file);
      updateField('resumeUrl', localBlobUrl);

      return { success: true, url: publicUrl };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to upload resume file';
      return { success: false, error: msg };
    }
  };

  const syncFromGitHub = async () => {
    if (!ghConfig || !ghConfig.owner || !ghConfig.repo) return;
    try {
      const { content: remoteContent } = await fetchContentFromGitHub(ghConfig);
      setContent(remoteContent);
      setOriginalContent(remoteContent);
      setCachedContent(remoteContent);
      setHasUnsavedChanges(false);
    } catch (e) {
      console.error('Failed to sync from GitHub:', e);
    }
  };

  return (
    <PortfolioContext.Provider
      value={{
        content,
        isEditMode,
        setIsEditMode,
        updateContent,
        updateField,
        saveChanges,
        uploadResumeFile,
        isSaving,
        hasUnsavedChanges,
        discardChanges,
        ghConfig,
        setGhConfig,
        syncFromGitHub,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};
