import React, { useState } from 'react';
import { usePortfolio } from '../context/usePortfolio';
import { Lock, Key, CheckCircle2, AlertCircle, X } from 'lucide-react';

interface SecretAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecretAuthModal: React.FC<SecretAuthModalProps> = ({ isOpen, onClose }) => {
  const { setIsEditMode, ghConfig, setGhConfig, syncFromGitHub } = usePortfolio();

  const [token, setToken] = useState(ghConfig?.token || '');
  const [owner, setOwner] = useState(ghConfig?.owner || 'DitRS');
  const [repo, setRepo] = useState(ghConfig?.repo || 'Portfolio');
  const [branch, setBranch] = useState(ghConfig?.branch || 'main');
  const [filePath, setFilePath] = useState(ghConfig?.filePath || 'public/portfolio-data.json');
  const [statusMsg, setStatusMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleUnlockLocal = () => {
    setIsEditMode(true);
    onClose();
  };

  const handleSaveAndSync = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    const config = {
      token: token.trim(),
      owner: owner.trim(),
      repo: repo.trim(),
      branch: branch.trim() || 'main',
      filePath: filePath.trim() || 'public/portfolio-data.json',
    };

    setGhConfig(config);
    setIsEditMode(true);

    try {
      await syncFromGitHub();
      setStatusMsg({ type: 'success', text: 'Connected to GitHub and unlocked Live Edit mode!' });
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unlocked locally, but GitHub sync failed.';
      setStatusMsg({ type: 'error', text: msg });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative max-w-md w-full bg-[#10121a] border border-[#272c40] rounded-2xl p-6 md:p-8 shadow-2xl space-y-6">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8a91a6] hover:text-white p-1 rounded-lg bg-[#181a24] border border-[#282d3f] transition-colors"
        >
          <X size={16} />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <Lock size={20} />
          </div>
          <div>
            <h3 className="font-heading text-xl font-bold text-white tracking-tight">
              Admin Edit Mode
            </h3>
            <p className="text-xs text-[#7d859b]">
              Secret management panel for Dit R S
            </p>
          </div>
        </div>

        {/* Status Message */}
        {statusMsg && (
          <div
            className={`flex items-start gap-2.5 p-3 rounded-xl text-xs ${
              statusMsg.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                : 'bg-amber-500/10 border border-amber-500/30 text-amber-300'
            }`}
          >
            {statusMsg.type === 'success' ? (
              <CheckCircle2 size={15} className="shrink-0 mt-0.5" />
            ) : (
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleSaveAndSync} className="space-y-4">
          <div className="p-3.5 rounded-xl bg-[#0b0c10] border border-[#1e2234] text-xs text-[#8c94aa] leading-relaxed space-y-1">
            <p className="font-semibold text-white flex items-center gap-1.5">
              GitHub Contents API (Option B)
            </p>
            <p>
              Enter a GitHub Personal Access Token (Fine-Grained PAT with Contents: write permission) to commit changes straight to your repository without redeploying.
            </p>
          </div>

          {/* GitHub Token */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold tracking-wider uppercase text-[#71788f]">
              GitHub Personal Access Token (PAT)
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141622] border border-[#24283c] focus:border-[#3b82f6] text-white text-xs outline-none transition-all placeholder-[#404558]"
              />
              <Key size={14} className="absolute right-3.5 top-3 text-[#555c74]" />
            </div>
          </div>

          {/* Repo & Owner */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold tracking-wider uppercase text-[#71788f]">
                Repo Owner / Username
              </label>
              <input
                type="text"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                placeholder="DitRS"
                className="w-full px-3 py-2 rounded-xl bg-[#141622] border border-[#24283c] focus:border-[#3b82f6] text-white text-xs outline-none transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold tracking-wider uppercase text-[#71788f]">
                Repository Name
              </label>
              <input
                type="text"
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
                placeholder="Portfolio"
                className="w-full px-3 py-2 rounded-xl bg-[#141622] border border-[#24283c] focus:border-[#3b82f6] text-white text-xs outline-none transition-all"
              />
            </div>
          </div>

          {/* File Path & Branch */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold tracking-wider uppercase text-[#71788f]">
                Branch
              </label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="main"
                className="w-full px-3 py-2 rounded-xl bg-[#141622] border border-[#24283c] focus:border-[#3b82f6] text-white text-xs outline-none transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold tracking-wider uppercase text-[#71788f]">
                JSON Path
              </label>
              <input
                type="text"
                value={filePath}
                onChange={(e) => setFilePath(e.target.value)}
                placeholder="public/portfolio-data.json"
                className="w-full px-3 py-2 rounded-xl bg-[#141622] border border-[#24283c] focus:border-[#3b82f6] text-white text-xs outline-none transition-all"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2 flex flex-col gap-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98] cursor-pointer"
            >
              {token ? 'Connect GitHub & Unlock Edit Mode' : 'Save Config & Unlock Edit Mode'}
            </button>

            <button
              type="button"
              onClick={handleUnlockLocal}
              className="w-full py-2 rounded-xl bg-[#141622] hover:bg-[#1a1e2f] border border-[#24283c] text-[#8a91a6] hover:text-white font-medium text-xs transition-all"
            >
              Unlock In-Browser Only (Local Preview)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
