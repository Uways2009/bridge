import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowLeft,
  AlertCircle,
  Loader2,
  KeyRound,
  CheckCircle2,
  LogIn,
} from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onCancel: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onCancel }) => {
  const { login, loginWithGoogle, resetPassword, siteSettings, versionedLogoUrl } = useAdmin();
  const [activeTab, setActiveTab] = useState<'login' | 'reset'>('login');

  // Sign In state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  // Direct Password reset state (works on all domains)
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetStatus, setResetStatus] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setIsGoogleSubmitting(true);
    try {
      const res = await loginWithGoogle();
      if (res.success) {
        onLoginSuccess();
      } else {
        setErrorMsg(res.error || 'Google Sign-In failed.');
      }
    } catch {
      setErrorMsg('Google Sign-In service unavailable.');
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim()) {
      setErrorMsg('Please enter your administrator email address.');
      return;
    }

    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await login(email.trim(), password);
      if (result.success) {
        onLoginSuccess();
      } else {
        setErrorMsg(result.error || 'Invalid administrator email or password. Please verify your credentials or use Password Reset.');
      }
    } catch {
      setErrorMsg('Authentication server unavailable. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetStatus(null);
    setErrorMsg('');

    if (!resetEmail.trim()) {
      setErrorMsg('Please enter your administrator email.');
      return;
    }

    if (!newPassword || newPassword.length < 4) {
      setErrorMsg('New password must be at least 4 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify.');
      return;
    }

    setIsResetting(true);
    try {
      const res = await resetPassword(resetEmail.trim(), newPassword);
      if (res.success) {
        setResetStatus('Password updated successfully! Logging into administrator portal...');
        setTimeout(() => {
          onLoginSuccess();
        }, 700);
      } else {
        setErrorMsg(res.error || 'Unable to update password. Please verify your email.');
      }
    } catch {
      setErrorMsg('Authentication server unavailable. Please try again.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1F33] flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans">
      {/* Background architectural glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-[#087F5B]/10 blur-3xl pointer-events-none rounded-full" />

      {/* Top back navigation */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between z-10">
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-2 text-xs font-semibold text-white/70 hover:text-white transition-colors cursor-pointer bg-white/5 hover:bg-white/10 px-3.5 py-2 rounded-xl border border-white/10"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Public Portal</span>
        </button>

        <span className="text-[11px] font-mono text-emerald-400 bg-[#087F5B]/20 px-3 py-1 rounded-full border border-[#087F5B]/40 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#087F5B] animate-pulse" />
          <span>Firebase Auth Protected</span>
        </span>
      </div>

      {/* Central Login Card */}
      <div className="max-w-md mx-auto w-full my-8 z-10">
        <div className="bg-[#12283E] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm">
          {/* Brand Logo & Header */}
          <div className="text-center mb-6">
            {(() => {
              const brandLogo = [versionedLogoUrl, siteSettings?.logoUrl].find(
                (u) => typeof u === 'string' && u.trim().length > 0
              );
              return brandLogo ? (
                <div className="mb-4 flex justify-center">
                  <img
                    src={brandLogo}
                    alt={siteSettings?.logoAlt || 'NaijaBridge'}
                    className="h-12 w-auto object-contain max-w-[200px]"
                  />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-[#087F5B]/20 border border-[#087F5B]/50 flex items-center justify-center mx-auto text-[#087F5B] mb-3.5 shadow-inner">
                  <ShieldCheck className="w-8 h-8" />
                </div>
              );
            })()}
            <h1 className="text-2xl font-bold font-display text-white tracking-tight">
              NaijaBridge Admin Console
            </h1>
            <p className="text-xs text-white/70 mt-1.5 leading-relaxed">
              Protected portal for verified administrators and platform managers.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-white/10 mb-5">
            <button
              type="button"
              id="tab-sign-in"
              onClick={() => {
                setActiveTab('login');
                setErrorMsg('');
              }}
              className={`flex-1 pb-2.5 text-xs font-semibold text-center border-b-2 transition-colors cursor-pointer ${
                activeTab === 'login'
                  ? 'border-[#087F5B] text-white'
                  : 'border-transparent text-white/50 hover:text-white/80'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              id="tab-reset-password"
              onClick={() => {
                setActiveTab('reset');
                setErrorMsg('');
              }}
              className={`flex-1 pb-2.5 text-xs font-semibold text-center border-b-2 transition-colors cursor-pointer ${
                activeTab === 'reset'
                  ? 'border-[#087F5B] text-white'
                  : 'border-transparent text-white/50 hover:text-white/80'
              }`}
            >
              Reset Password
            </button>
          </div>

          {/* Tab 1: Standard Sign In Form */}
          {activeTab === 'login' && (
            <div className="space-y-4">
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{errorMsg}</span>
                </div>
              )}

              {/* One-Click Google Authentication */}
              <button
                type="button"
                id="btn-admin-google-login"
                disabled={isGoogleSubmitting || isSubmitting}
                onClick={handleGoogleSignIn}
                className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
              >
                {isGoogleSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#087F5B]" />
                    <span>Signing in with Google...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 text-[#087F5B] shrink-0" />
                    <span>Sign In with Google</span>
                  </>
                )}
              </button>

              <div className="relative flex items-center justify-center my-3">
                <div className="border-t border-white/10 w-full" />
                <span className="bg-[#12283E] px-3 text-[10px] text-white/40 uppercase tracking-wider font-mono shrink-0">
                  Or sign in with administrator credentials
                </span>
                <div className="border-t border-white/10 w-full" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  Administrator Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="input-admin-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                    required
                    autoComplete="email"
                    placeholder="name@organization.ng"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-xs sm:text-sm focus:outline-none focus:border-[#087F5B] transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-white/80">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setActiveTab('reset')}
                    className="text-[11px] text-[#087F5B] hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="input-admin-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-11 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-xs sm:text-sm focus:outline-none focus:border-[#087F5B] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors p-1 cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                id="btn-admin-submit-login"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl bg-[#087F5B] hover:bg-[#066548] disabled:opacity-50 text-white font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md mt-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Secure Sign In</span>
                  </>
                )}
              </button>
            </form>
            </div>
          )}

          {/* Tab 2: Direct Password Reset Form (Works on all connected domains) */}
          {activeTab === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <p className="text-xs text-white/70 leading-relaxed">
                Set a new password for your administrator account. Changes take effect immediately and log you in across any connected domain.
              </p>

              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{errorMsg}</span>
                </div>
              )}

              {resetStatus && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{resetStatus}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  Administrator Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="input-reset-email"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    placeholder="admin@domain.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-xs sm:text-sm focus:outline-none focus:border-[#087F5B] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="input-reset-new-password"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="Enter new password (min 4 characters)"
                    className="w-full pl-10 pr-11 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-xs sm:text-sm focus:outline-none focus:border-[#087F5B] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors p-1 cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="input-reset-confirm-password"
                    type={showNewPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Re-enter new password"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-xs sm:text-sm focus:outline-none focus:border-[#087F5B] transition-colors"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setErrorMsg('');
                    setResetStatus(null);
                  }}
                  className="w-1/3 py-3 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-medium text-xs transition-colors cursor-pointer text-center"
                >
                  Back to Sign In
                </button>
                <button
                  type="submit"
                  id="btn-submit-reset-password"
                  disabled={isResetting}
                  className="w-2/3 py-3 px-4 rounded-xl bg-[#087F5B] hover:bg-[#066548] disabled:opacity-50 text-white font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  {isResetting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Update & Sign In</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Security Note */}
          <div className="mt-6 pt-5 border-t border-white/10 text-center">
            <p className="text-[11px] text-white/40 leading-relaxed">
              Protected by Firebase Authentication with Cloud Firestore RBAC enforcement. All operations audited.
            </p>
          </div>
        </div>
      </div>

      {/* Footer copyright */}
      <div className="max-w-4xl mx-auto w-full text-center text-[11px] text-white/40 z-10">
        NaijaBridge Administration System • Authorized Access Only
      </div>
    </div>
  );
};
