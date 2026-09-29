import React, { useState } from 'react';
import { useAuth } from '../features/auth/useAuth';
import { authService } from '../services/authService';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Toast, ToastType } from '../components/ui/Toast';
import { User, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();

  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPassword2, setNewPassword2] = useState('');
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showNewPass2, setShowNewPass2] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);

    try {
      const updated = await authService.updateProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
      });
      updateUser(updated);
      setToast({ type: 'success', message: 'Profile details updated successfully!' });
    } catch (err: any) {
      setToast({
        type: 'error',
        message: err.response?.data?.detail || 'Failed to update personal information.',
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      setToast({ type: 'error', message: 'New password must be at least 8 characters.' });
      return;
    }

    if (newPassword !== newPassword2) {
      setToast({ type: 'error', message: 'New passwords do not match.' });
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await authService.changePassword({
        old_password: oldPassword,
        new_password: newPassword,
        new_password2: newPassword2,
      });
      setToast({ type: 'success', message: res.detail || 'Password changed successfully!' });
      setOldPassword('');
      setNewPassword('');
      setNewPassword2('');
    } catch (err: any) {
      const errMsg =
        err.response?.data?.old_password?.[0] ||
        err.response?.data?.new_password?.[0] ||
        err.response?.data?.detail ||
        'Failed to change password.';
      setToast({ type: 'error', message: errMsg });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl animate-fadeIn relative">
      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-8 z-50 max-w-sm">
          <Toast
            type={toast.type}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Profile & Security</h1>
        <p className="text-sm text-slate-400">Manage your personal information and account security</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Details Card */}
        <Card>
          <form onSubmit={handleUpdateProfile}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-400" />
                <span>Personal Information</span>
              </CardTitle>
              <CardDescription>Update your profile name and view registered email</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <Input
                label="Email Address"
                value={user?.email || ''}
                disabled
                helperText="Email address cannot be changed (primary account anchor)"
              />
              <Input
                label="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First Name"
              />
              <Input
                label="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last Name"
              />
            </CardContent>

            <CardFooter>
              <Button type="submit" isLoading={isUpdatingProfile} size="sm">
                Save Changes
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Change Password Card */}
        <Card>
          <form onSubmit={handleChangePassword}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-indigo-400" />
                <span>Security & Password</span>
              </CardTitle>
              <CardDescription>Update your password with cryptographic PBKDF2 hashing</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <Input
                label="Current Password"
                type={showOldPass ? 'text' : 'password'}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="••••••••"
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowOldPass(!showOldPass)}
                    className="text-slate-400 hover:text-slate-200 focus:outline-none transition-colors"
                  >
                    {showOldPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                required
              />

              <Input
                label="New Password"
                type={showNewPass ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="text-slate-400 hover:text-slate-200 focus:outline-none transition-colors"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                required
              />

              <Input
                label="Confirm New Password"
                type={showNewPass2 ? 'text' : 'password'}
                value={newPassword2}
                onChange={(e) => setNewPassword2(e.target.value)}
                placeholder="Re-enter new password"
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowNewPass2(!showNewPass2)}
                    className="text-slate-400 hover:text-slate-200 focus:outline-none transition-colors"
                  >
                    {showNewPass2 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                required
              />
            </CardContent>

            <CardFooter>
              <Button type="submit" isLoading={isUpdatingPassword} size="sm">
                Update Password
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>

      {/* Account metadata card */}
      <Card className="p-6 bg-slate-900/30 border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-200">Account Security Status</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Stateless JWT session with automatic token rotation and server-side blacklisting enabled.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
