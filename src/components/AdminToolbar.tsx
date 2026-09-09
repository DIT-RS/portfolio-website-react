import React, { useState } from 'react';
import { usePortfolio } from '../context/usePortfolio';
import { Save, X, Loader2, Edit3, Settings } from 'lucide-react';
import { SecretAuthModal } from './SecretAuthModal';

export const AdminToolbar: React.FC = () => {
  const { isEditMode, setIsEditMode, saveChanges, isSaving, hasUnsavedChanges, discardChanges, ghConfig } =
    usePortfolio();

  const [showConfigModal, setShowConfigModal] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  if (!isEditMode) return null;

  const handleSave = async () => {
    setSaveStatus('Saving changes...');
    const res = await saveChanges();
    if (res.success) {
      setSaveStatus('Saved successfully to repository & local state!');
      setTimeout(() => setSaveStatus(null), 3000);
    } else {
      setSaveStatus(`Error: ${res.error || 'Failed to push to GitHub'}`);
      setTimeout(() => setSaveStatus(null), 5000);
    }
  };

  return (
    <>
      {/* Floating bottom toolbar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] w-full max-w-xl px-4 animate-in slide-in-from-bottom-5">
        <div className="rounded-2xl bg-[#12141e]/95 border border-[#2c3248] shadow-2xl backdrop-blur-xl p-3 md:p-4 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          {/* Left status */}
          <div className="flex items-center gap-2 text-white">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <div className="flex flex-col">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Edit3 size={13} className="text-blue-400" />
                Live Edit Mode Active
              </span>
              <span className="text-[11px] text-[#788098]">
                {ghConfig?.token
                  ? `Pushes to ${ghConfig.owner}/${ghConfig.repo}`
                  : 'In-Browser Draft (GitHub not connected)'}
              </span>
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowConfigModal(true)}
              className="p-2 rounded-xl bg-[#191c2b] hover:bg-[#23273c] text-[#8e96af] hover:text-white border border-[#272d42] transition-colors"
              title="GitHub Connection Settings"
            >
              <Settings size={15} />
            </button>

            {hasUnsavedChanges && (
              <button
                onClick={discardChanges}
                className="px-3 py-1.5 rounded-xl bg-[#191c2b] hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
              >
                Discard
              </button>
            )}

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-md shadow-blue-500/20 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Pushing to GitHub...</span>
                </>
              ) : (
                <>
                  <Save size={14} />
                  <span>{hasUnsavedChanges ? 'Save & Push' : 'Save'}</span>
                </>
              )}
            </button>

            <button
              onClick={() => setIsEditMode(false)}
              className="p-2 rounded-xl bg-[#191c2b] hover:bg-[#23273c] text-[#8e96af] hover:text-white border border-[#272d42] transition-colors"
              title="Exit Edit Mode"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Save feedback banner */}
        {saveStatus && (
          <div className="mt-2 text-center text-xs py-1.5 px-3 rounded-lg bg-[#0e1017] border border-[#262b3e] text-blue-300 animate-in fade-in">
            {saveStatus}
          </div>
        )}
      </div>

      <SecretAuthModal isOpen={showConfigModal} onClose={() => setShowConfigModal(false)} />
    </>
  );
};
