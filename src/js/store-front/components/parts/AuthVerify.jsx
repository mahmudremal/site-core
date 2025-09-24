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
      <div className="xpo_bg-scwhite/70 xpo_rounded-3xl xpo_shadow-2xl xpo_p-8 xpo_text-center">
        <div className="xpo_mb-6">
          <CheckCircle className="xpo_w-16 xpo_h-16 xpo_text-green-500 xpo_mx-auto xpo_mb-4" />
          <h2 className="xpo_text-2xl xpo_font-bold xpo_text-gray-900 xpo_mb-2">
            {__('Verification Successful!', 'site-core')}
          </h2>
          <p className="xpo_text-gray-600">
            {__('Your account has been verified successfully. You can now access all features.', 'site-core')}
          </p>
        </div>
        <button
          onClick={() => window.location.href = '/'}
          className="xpo_bg-gradient-to-r xpo_from-green-600 xpo_to-green-700 xpo_text-scwhite xpo_py-3 xpo_px-6 xpo_rounded-xl xpo_font-medium hover:xpo_from-green-700 hover:xpo_to-green-800 xpo_transition-all"
        >
          {__('Continue to Dashboard', 'site-core')}
        </button>
      </div>
    );
  }

  // Failed Screen
  if (verificationStatus === 'failed') {
    return (
      <div className="xpo_bg-scwhite/70 xpo_rounded-3xl xpo_shadow-2xl xpo_p-8 xpo_text-center">
        <div className="xpo_mb-6">
          <XCircle className="xpo_w-16 xpo_h-16 xpo_text-red-500 xpo_mx-auto xpo_mb-4" />
          <h2 className="xpo_text-2xl xpo_font-bold xpo_text-gray-900 xpo_mb-2">
            {__('Verification Failed', 'site-core')}
          </h2>
          <p className="xpo_text-gray-600 xpo_mb-6">
            {__('The verification link has expired or is invalid. Please try again.', 'site-core')}
          </p>
        </div>
        <div className="xpo_space-y-4">
          <button
            onClick={() => {
              setVerificationStatus(null);
              setShowManualEntry(true);
            }}
            className="xpo_w-full xpo_bg-gradient-to-r xpo_from-scprimary-600 xpo_to-scwhite-600 xpo_text-scwhite xpo_py-3 xpo_px-6 xpo_rounded-xl xpo_font-medium hover:xpo_from-scprimary-700 hover:xpo_to-scwhite-700 xpo_transition-all"
          >
            {__('Try Manual Verification', 'site-core')}
          </button>
          <button
            onClick={() => window.location.href = '/auth/signin'}
            className="xpo_w-full xpo_border xpo_border-gray-300 xpo_py-3 xpo_px-6 xpo_rounded-xl xpo_font-medium hover:xpo_bg-gray-50 xpo_transition-colors xpo_flex xpo_items-center xpo_justify-center xpo_gap-2"
          >
            <ArrowLeft className="xpo_w-4 xpo_h-4" />
            {__('Back to Sign In', 'site-core')}
          </button>
        </div>
      </div>
    );
  }

  // Loading Screen
  if (loading && !showManualEntry) {
    return (
      <div className="xpo_bg-scwhite/70 xpo_rounded-3xl xpo_shadow-2xl xpo_p-8 xpo_text-center">
        <div className="xpo_mb-6">
          <Loader2 className="xpo_w-16 xpo_h-16 xpo_text-scprimary-600 xpo_mx-auto xpo_mb-4 xpo_animate-spin" />
          <h2 className="xpo_text-2xl xpo_font-bold xpo_text-gray-900 xpo_mb-2">
            {__('Verifying Account', 'site-core')}
          </h2>
          <p className="xpo_text-gray-600">
            {__('Please wait while we verify your account...', 'site-core')}
          </p>
        </div>
      </div>
    );
  }

  // Manual Verification Screen
  return (
    <div className="xpo_bg-scwhite/70 xpo_rounded-3xl xpo_shadow-2xl xpo_p-8">
      <div className="xpo_text-center xpo_mb-8">
        <Shield className="xpo_w-16 xpo_h-16 xpo_text-scprimary-600 xpo_mx-auto xpo_mb-4" />
        <h2 className="xpo_text-2xl xpo_font-bold xpo_text-gray-900 xpo_mb-2">
          {__('Verify Your Account', 'site-core')}
        </h2>
        <p className="xpo_text-gray-600">
          {verificationMethod === 'email' ? __('Enter the verification code sent to your email address', 'site-core') : __('Enter the verification code sent to your phone number', 'site-core')}
        </p>
      </div>

      {/* Verification Method Toggle */}
      <div className="xpo_flex xpo_bg-gray-100 xpo_rounded-xl xpo_p-1 xpo_mb-8">
        <button
          onClick={() => switchVerificationMethod('email')}
          className={`xpo_flex-1 xpo_flex xpo_items-center xpo_justify-center xpo_gap-2 xpo_py-3 xpo_px-4 xpo_rounded-lg xpo_font-medium xpo_transition-all ${
            verificationMethod === 'email'
              ? 'xpo_bg-scwhite xpo_text-scprimary-600 xpo_shadow-sm'
              : 'xpo_text-gray-600 hover:xpo_text-gray-800'
          }`}
        >
          <Mail className="xpo_w-4 xpo_h-4" />
          {__('Email', 'site-core')}
        </button>
        <button
          onClick={() => switchVerificationMethod('sms')}
          className={`xpo_flex-1 xpo_flex xpo_items-center xpo_justify-center xpo_gap-2 xpo_py-3 xpo_px-4 xpo_rounded-lg xpo_font-medium xpo_transition-all ${
            verificationMethod === 'sms'
              ? 'xpo_bg-scwhite xpo_text-scprimary-600 xpo_shadow-sm'
              : 'xpo_text-gray-600 hover:xpo_text-gray-800'
          }`}
        >
          <MessageSquare className="xpo_w-4 xpo_h-4" />
          {__('SMS', 'site-core')}
        </button>
      </div>

      {/* OTP Input Form */}
      <form onSubmit={handleOtpSubmit} className="xpo_space-y-6">
        <div className="xpo_flex xpo_justify-center xpo_gap-3">
          {otpCode.map((digit, index) => (
            <input
              key={index}
              type="text"
              name={`otp-${index}`}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              maxLength={1}
              className="xpo_w-12 xpo_h-12 xpo_text-center xpo_text-xl xpo_font-bold xpo_border xpo_border-gray-300 xpo_rounded-xl focus:xpo_ring-2 focus:xpo_ring-scaccent-500 focus:xpo_border-transparent xpo_transition-all"
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={loading || otpCode.join('').length !== 6}
          className="xpo_w-full xpo_bg-gradient-to-r xpo_from-scprimary-600 xpo_to-scwhite-600 xpo_text-scwhite xpo_py-3 xpo_px-6 xpo_rounded-xl xpo_font-medium hover:xpo_from-scprimary-700 hover:xpo_to-scwhite-700 xpo_transition-all disabled:xpo_opacity-50 disabled:xpo_cursor-not-allowed xpo_flex xpo_items-center xpo_justify-center xpo_gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="xpo_w-4 xpo_h-4 xpo_animate-spin" />
              {__('Verifying...', 'site-core')}
            </>
          ) : (
            __('Verify Code', 'site-core')
          )}
        </button>
      </form>

      {/* Resend Code */}
      <div className="xpo_text-center xpo_mt-6">
        <p className="xpo_text-gray-600 xpo_mb-4">
          {__("Didn't receive the code?", 'site-core')}
        </p>
        <button
          onClick={handleResendCode}
          disabled={resendCountdown > 0 || resendLoading}
          className="xpo_text-scaccent-600 hover:xpo_text-scaccent-800 xpo_font-medium xpo_underline disabled:xpo_opacity-50 disabled:xpo_cursor-not-allowed disabled:xpo_no-underline xpo_flex xpo_items-center xpo_justify-center xpo_gap-2 xpo_mx-auto"
        >
          {resendLoading ? (
            <>
              <Loader2 className="xpo_w-4 xpo_h-4 xpo_animate-spin" />
              {__('Sending...', 'site-core')}
            </>
          ) : resendCountdown > 0 ? (
            `${__('Resend Code in', 'site-core')} ${resendCountdown}s`
          ) : (
            <>
              <RefreshCw className="xpo_w-4 xpo_h-4" />
              {__('Resend Code', 'site-core')}
            </>
          )}
        </button>
      </div>

      {/* Back to Sign In */}
      <div className="xpo_text-center xpo_mt-8 xpo_pt-6 xpo_border-t xpo_border-gray-200">
        <button
          onClick={() => window.location.href = '/auth/signin'}
          className="xpo_text-gray-600 hover:xpo_text-gray-800 xpo_flex xpo_items-center xpo_justify-center xpo_gap-2 xpo_mx-auto"
        >
          <ArrowLeft className="xpo_w-4 xpo_h-4" />
          {__('Back to Sign In', 'site-core')}
        </button>
      </div>
    </div>
  );
};

export default AuthVerify;