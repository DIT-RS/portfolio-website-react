import { createContext, useContext } from 'react';
import type { PortfolioContent } from '../data/portfolioData';
import type { GitHubConfig } from '../services/githubService';

export interface PortfolioContextType {
  content: PortfolioContent;
  isEditMode: boolean;
  setIsEditMode: (val: boolean) => void;
  updateContent: (newContent: PortfolioContent) => void;
  updateField: <K extends keyof PortfolioContent>(key: K, value: PortfolioContent[K]) => void;
  saveChanges: (commitMessage?: string) => Promise<{ success: boolean; error?: string }>;
  uploadResumeFile: (file: File) => Promise<{ success: boolean; url?: string; error?: string }>;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  discardChanges: () => void;
  ghConfig: GitHubConfig | null;
  setGhConfig: (config: GitHubConfig | null) => void;
  syncFromGitHub: () => Promise<void>;
}

export const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};
