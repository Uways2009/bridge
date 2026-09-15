import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Lock, KeyRound, AlertCircle, LogOut } from 'lucide-react';

export const AdminLockScreen: React.FC = () => {
  const { currentAdmin, unlockSession, logout } = useAdmin();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [isUnlocking, setIsUnlocking] = useState(false);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter your administrator password.');
      return;
    }
    setIsUnlocking(true);
    try {
      const ok = await unlockSession(password);
      if (!ok) {
        setError('Password incorrect. Enter your administrator password.');
      }
    } catch {
      setError('Unable to verify session. Please try again.');
    } finally {
      setIsUnlocking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0B1F33]/95 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#12283E] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl text-center">
        <div className="w-16 h-16 rounded-full bg-[#D99A28]/20 border border-[#D99A28]/50 flex items-center justify-center mx-auto text-[#D99A28] mb-4">
          <Lock className="w-8 h-8" />
        </div>

        <h2 className="text-xl font-bold font-display text-white">Session Locked</h2>
        <p className="text-xs text-white/60 mt-1">
          For security, administrative controls are temporarily locked.
        </p>

        {currentAdmin && (
          <div className="my-5 p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3 text-left">
            <img
              src={currentAdmin.avatar}
              alt={currentAdmin.name}
              className="w-10 h-10 rounded-xl object-cover"
            />
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{currentAdmin.name}</p>
              <p className="text-xs text-[#087F5B] font-medium">{currentAdmin.role}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-xs text-red-200">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleUnlock} className="space-y-3 text-left">
          <div>
            <label className="block text-xs font-medium text-white/80 mb-1">
              Enter Password to Resume
            </label>
            <input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="Admin password..."
              className="w-full bg-[#0B1F33] border border-white/20 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#087F5B]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-[#087F5B] hover:bg-[#066548] text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <KeyRound className="w-4 h-4" />
            <span>Unlock Session</span>
          </button>
        </form>

        <button
          type="button"
          onClick={logout}
          className="mt-4 inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Switch account or logout</span>
        </button>
      </div>
    </div>
  );
};
