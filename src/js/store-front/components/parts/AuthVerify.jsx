import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Mail,
  MessageSquare,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  Shield,
  ArrowLeft
} from 'lucide-react';
import { useLocale } from '../../hooks/useLocale';
import api from '../../services/api';

const AuthVerify = () => {
  const { __ } = useLocale();
  const { user_id, verifyMethod = '', token = '' } = useParams();
  const [loading, setLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null); // 'success', 'failed', null
  const [verificationMethod, setVerificationMethod] = useState(
    () => ['email', 'sms'].includes(verifyMethod) ? verifyMethod : 'email'
  );
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [showManualEntry, setShowManualEntry] = useState(!token || token === '0');

  // Handle automatic verification if token is provided
  useEffect(() => {
    if (token && token !== '0') {
      setLoading(true);
      api.post(`user/auth/${user_id}/verify`, { token })
        .then(() => {
          setVerificationStatus('success');
        })
        .catch(() => {
          setVerificationStatus('failed');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [user_id, token]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return; // Only allow single digit

    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.querySelector(`input[name="otp-${index + 1}"]`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace to go to previous input
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      const prevInput = document.querySelector(`input[name="otp-${index - 1}"]`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    const code = otpCode.join('');
    if (code.length !== 6) return;

    setLoading(true);
    api.post(`user/auth/${user_id}/verify`, {
      token: code,
      method: verificationMethod
    })
      .then(() => {
        setVerificationStatus('success');
      })
      .catch(() => {
        setVerificationStatus('failed');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleResendCode = () => {
    setResendLoading(true);
    api.post(`user/auth/${user_id}/resend`, { method: verificationMethod })
      .then(() => {
        setResendCountdown(30);
        setOtpCode(['', '', '', '', '', '']);
      })
      .catch(() => {
        // Handle error silently or show toast
      })
      .finally(() => {
        setResendLoading(false);
      });
  };

  const switchVerificationMethod = (method) => {
    setVerificationMethod(method);
    setOtpCode(['', '', '', '', '', '']);
    setVerificationStatus(null);
  };

  // Success Screen
  if (verificationStatus === 'success') {
    return (
      <div className="bg-scwhite/70 rounded-3xl shadow-2xl p-8 text-center">
        <div className="mb-6">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {__('Verification Successful!', 'site-core')}
          </h2>
          <p className="text-gray-600">
            {__('Your account has been verified successfully. You can now access all features.', 'site-core')}
          </p>
        </div>
        <button
          onClick={() => window.location.href = '/'}
          className="bg-gradient-to-r from-green-600 to-green-700 text-scwhite py-3 px-6 rounded-xl font-medium hover:from-green-700 hover:to-green-800 transition-all"
        >
          {__('Continue to Dashboard', 'site-core')}
        </button>
      </div>
    );
  }

  // Failed Screen
  if (verificationStatus === 'failed') {
    return (
      <div className="bg-scwhite/70 rounded-3xl shadow-2xl p-8 text-center">
        <div className="mb-6">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {__('Verification Failed', 'site-core')}
          </h2>
          <p className="text-gray-600 mb-6">
            {__('The verification link has expired or is invalid. Please try again.', 'site-core')}
          </p>
        </div>
        <div className="space-y-4">
          <button
            onClick={() => {
              setVerificationStatus(null);
              setShowManualEntry(true);
            }}
            className="w-full bg-gradient-to-r from-scprimary-600 to-scwhite-600 text-scwhite py-3 px-6 rounded-xl font-medium hover:from-scprimary-700 hover:to-scwhite-700 transition-all"
          >
            {__('Try Manual Verification', 'site-core')}
          </button>
          <button
            onClick={() => window.location.href = '/auth/signin'}
            className="w-full border border-gray-300 py-3 px-6 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {__('Back to Sign In', 'site-core')}
          </button>
        </div>
      </div>
    );
  }

  // Loading Screen
  if (loading && !showManualEntry) {
    return (
      <div className="bg-scwhite/70 rounded-3xl shadow-2xl p-8 text-center">
        <div className="mb-6">
          <Loader2 className="w-16 h-16 text-scprimary-600 mx-auto mb-4 animate-spin" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {__('Verifying Account', 'site-core')}
          </h2>
          <p className="text-gray-600">
            {__('Please wait while we verify your account...', 'site-core')}
          </p>
        </div>
      </div>
    );
  }

  // Manual Verification Screen
  return (
    <div className="bg-scwhite/70 rounded-3xl shadow-2xl p-8">
      <div className="text-center mb-8">
        <Shield className="w-16 h-16 text-scprimary-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {__('Verify Your Account', 'site-core')}
        </h2>
        <p className="text-gray-600">
          {verificationMethod === 'email' ? __('Enter the verification code sent to your email address', 'site-core') : __('Enter the verification code sent to your phone number', 'site-core')}
        </p>
      </div>

      {/* Verification Method Toggle */}
      <div className="flex bg-gray-100 rounded-xl p-1 mb-8">
        <button
          onClick={() => switchVerificationMethod('email')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${verificationMethod === 'email'
              ? 'bg-scwhite text-scprimary-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
            }`}
        >
          <Mail className="w-4 h-4" />
          {__('Email', 'site-core')}
        </button>
        <button
          onClick={() => switchVerificationMethod('sms')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${verificationMethod === 'sms'
              ? 'bg-scwhite text-scprimary-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
            }`}
        >
          <MessageSquare className="w-4 h-4" />
          {__('SMS', 'site-core')}
        </button>
      </div>

      {/* OTP Input Form */}
      <form onSubmit={handleOtpSubmit} className="space-y-6">
        <div className="flex justify-center gap-3">
          {otpCode.map((digit, index) => (
            <input
              key={index}
              type="text"
              name={`otp-${index}`}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              maxLength={1}
              className="w-12 h-12 text-center text-xl font-bold border border-gray-300 rounded-xl focus:ring-2 focus:ring-scaccent-500 focus:border-transparent transition-all"
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={loading || otpCode.join('').length !== 6}
          className="w-full bg-gradient-to-r from-scprimary-600 to-scwhite-600 text-scwhite py-3 px-6 rounded-xl font-medium hover:from-scprimary-700 hover:to-scwhite-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {__('Verifying...', 'site-core')}
            </>
          ) : (
            __('Verify Code', 'site-core')
          )}
        </button>
      </form>

      {/* Resend Code */}
      <div className="text-center mt-6">
        <p className="text-gray-600 mb-4">
          {__("Didn't receive the code?", 'site-core')}
        </p>
        <button
          onClick={handleResendCode}
          disabled={resendCountdown > 0 || resendLoading}
          className="text-scaccent-600 hover:text-scaccent-800 font-medium underline disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline flex items-center justify-center gap-2 mx-auto"
        >
          {resendLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {__('Sending...', 'site-core')}
            </>
          ) : resendCountdown > 0 ? (
            `${__('Resend Code in', 'site-core')} ${resendCountdown}s`
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              {__('Resend Code', 'site-core')}
            </>
          )}
        </button>
      </div>

      {/* Back to Sign In */}
      <div className="text-center mt-8 pt-6 border-t border-gray-200">
        <button
          onClick={() => window.location.href = '/auth/signin'}
          className="text-gray-600 hover:text-gray-800 flex items-center justify-center gap-2 mx-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          {__('Back to Sign In', 'site-core')}
        </button>
      </div>
    </div>
  );
};

export default AuthVerify;