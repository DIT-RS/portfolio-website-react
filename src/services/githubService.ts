import type { PortfolioContent } from '../data/portfolioData';

export interface GitHubConfig {
  owner: string;
  repo: string;
  branch: string;
  filePath: string;
  token: string;
}

const GITHUB_CONFIG_KEY = 'dit_portfolio_gh_config';
const LOCAL_CONTENT_KEY = 'dit_portfolio_content_cache';

export const getSavedGitHubConfig = (): GitHubConfig | null => {
  try {
    const data = localStorage.getItem(GITHUB_CONFIG_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const saveGitHubConfig = (config: GitHubConfig) => {
  localStorage.setItem(GITHUB_CONFIG_KEY, JSON.stringify(config));
};

export const clearGitHubConfig = () => {
  localStorage.removeItem(GITHUB_CONFIG_KEY);
};

export const getCachedContent = (): PortfolioContent | null => {
  try {
    const data = localStorage.getItem(LOCAL_CONTENT_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const setCachedContent = (content: PortfolioContent) => {
  localStorage.setItem(LOCAL_CONTENT_KEY, JSON.stringify(content));
};

// atob yields one char per byte, so multi-byte UTF-8 must be re-decoded.
const decodeBase64Utf8 = (base64: string): string => {
  const binary = atob(base64.replace(/\s/g, ''));
  const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
  return new TextDecoder('utf-8').decode(bytes);
};

const encodeBase64Utf8 = (text: string): string => {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
};

/**
 * Fetch portfolio-data.json from GitHub repository using the Contents API
 */
export const fetchContentFromGitHub = async (config: GitHubConfig): Promise<{ content: PortfolioContent; sha: string }> => {
  const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.filePath}?ref=${config.branch || 'main'}`;
  
  const res = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github.v3+json',
      ...(config.token ? { Authorization: `Bearer ${config.token}` } : {}),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to fetch from GitHub (Status ${res.status})`);
  }

  const data = await res.json();
  const parsedContent = JSON.parse(decodeBase64Utf8(data.content));

  return {
    content: parsedContent,
    sha: data.sha,
  };
};

/**
 * Upload a binary/PDF file directly to GitHub via Contents API
 */
export const uploadFileToGitHub = async (
  config: GitHubConfig,
  targetPath: string,
  base64Data: string,
  commitMessage = 'Upload file via Live Edit'
): Promise<{ sha: string }> => {
  let currentSha = '';
  try {
    const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${targetPath}?ref=${config.branch || 'main'}`;
    const res = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        ...(config.token ? { Authorization: `Bearer ${config.token}` } : {}),
      },
    });
    if (res.ok) {
      const data = await res.json();
      currentSha = data.sha;
    }
  } catch {
    // File may not exist yet
  }

  const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${targetPath}`;
  const body: Record<string, unknown> = {
    message: commitMessage,
    content: base64Data,
    branch: config.branch || 'main',
  };

  if (currentSha) {
    body.sha = currentSha;
  }

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/vnd.github.v3+json',
      Authorization: `Bearer ${config.token}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to upload file to GitHub (Status ${res.status})`);
  }

  const result = await res.json();
  return { sha: result.content.sha };
};

/**
 * Save updated portfolio-data.json directly to GitHub via Contents API
 */
export const saveContentToGitHub = async (
  config: GitHubConfig,
  newContent: PortfolioContent,
  commitMessage = 'Update portfolio data via Live Edit'
): Promise<{ sha: string }> => {
  // 1. First get current SHA
  let currentSha = '';
  try {
    const current = await fetchContentFromGitHub(config);
    currentSha = current.sha;
  } catch {
    // File might not exist yet, that's okay
  }

  const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.filePath}`;
  const jsonString = JSON.stringify(newContent, null, 2);
  const base64Content = encodeBase64Utf8(jsonString);

  const body: Record<string, unknown> = {
    message: commitMessage,
    content: base64Content,
    branch: config.branch || 'main',
  };

  if (currentSha) {
    body.sha = currentSha;
  }

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/vnd.github.v3+json',
      Authorization: `Bearer ${config.token}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to save to GitHub (Status ${res.status})`);
  }

  const result = await res.json();
  return { sha: result.content.sha };
};
