import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Loader2, CheckCircle2, XCircle, Sparkles, Shield, Zap } from 'lucide-react';
import axios from 'axios';

// Mock login data for demo
const mockLoginData = {
  ajaxUrl: '/wp-admin/admin-ajax.php',
  nonce: 'demo_nonce',
  siteUrl: 'https://yoursite.com',
  redirectUrl: '/wp-admin',
  logoUrl: 'https://placehold.co/60x60',
  siteName: 'Your Site'
};

const LoginRegistration = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: '',
    remember: false
  });
  
  const [registerForm, setRegisterForm] = useState({
    username: '',
    email: '',
    password: ''
  });

  const mockLoginData = {
    ajaxUrl: '/wp-admin/admin-ajax.php',
    nonce: 'demo_nonce',
    siteUrl: 'https://yoursite.com',
    redirectUrl: '/wp-admin',
    logoUrl: 'https://placehold.co/60x60',
    siteName: 'Your Site',
    ...window?.siteCoreConfig??{}
  };

  const handleLoginChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLoginForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setMessage({ type: '', text: '' });
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterForm(prev => ({
      ...prev,
      [name]: value
    }));
    setMessage({ type: '', text: '' });
  };

  const handleLoginSubmit = async () => {
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    setTimeout(() => {
      if (loginForm.username && loginForm.password) {
        setTimeout(() => {
          const form = new FormData();
          const data = {action: 'custom_login', nonce: mockLoginData?.nonce??'', ...loginForm};
          Object.keys(data).forEach(key => {
            form.append(key, data[key]);
          })
          axios.post(`${mockLoginData.ajaxUrl}`, form)
          // fetch(`${mockLoginData.ajaxUrl}`, {
          //   method: 'POST',
          //   headers: {'Content-Type': 'application/json'},
          //   body: JSON.stringify({action: 'custom_login', ...loginForm})
          // })
          .then(res => res.data)
          .then(({ success, data }) => {
            console.log(data)
            if (!success) {
              throw new Error('Didn\'t successful');
            }
            setMessage({ type: 'success', text: 'Login successful! Redirecting...' });
            if (data?.redirect && window?.location) {
              window.location.href = data.redirect;
            }
          }).catch(err => {
            setMessage({ type: 'error', text: 'Failed to login. Please try again later.' });
          })
          .finally(() => setIsLoading(false))
        }, 500);
      } else {
        setMessage({ type: 'error', text: 'Please fill in all fields' });
        setIsLoading(false);
      }
    }, 500);
  };

  const handleRegisterSubmit = async () => {
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    setTimeout(() => {
      if (registerForm.username && registerForm.email && registerForm.password) {
        setMessage({ type: 'success', text: 'Registration successful! Redirecting...' });
        setTimeout(() => {
          setIsLoading(false);
        }, 1500);
      } else {
        setMessage({ type: 'error', text: 'Please fill in all fields' });
        setIsLoading(false);
      }
    }, 1000);
  };

  const handleKeyPress = (e, submitFunc) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submitFunc();
    }
  };

  return (
    <div className="xpo_min-h-screen xpo_flex xpo_overflow-hidden xpo_bg-white">
      {/* Left Side - Hero Section */}
      <div className="xpo_hidden lg:xpo_flex xpo_w-1/2 xpo_relative xpo_bg-gradient-to-br xpo_from-violet-600 xpo_via-purple-600 xpo_to-indigo-700 xpo_overflow-hidden">
        {/* Animated Background Elements */}
        <div className="xpo_absolute xpo_inset-0 xpo_opacity-20">
          <div className="xpo_absolute xpo_top-20 xpo_left-20 xpo_w-72 xpo_h-72 xpo_bg-white xpo_rounded-full xpo_mix-blend-overlay xpo_filter xpo_blur-xl xpo_animate-pulse"></div>
          <div className="xpo_absolute xpo_bottom-20 xpo_right-20 xpo_w-96 xpo_h-96 xpo_bg-pink-300 xpo_rounded-full xpo_mix-blend-overlay xpo_filter xpo_blur-xl xpo_animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="xpo_absolute xpo_top-1/2 xpo_left-1/2 xpo_transform xpo_-translate-x-1/2 xpo_-translate-y-1/2 xpo_w-64 xpo_h-64 xpo_bg-blue-300 xpo_rounded-full xpo_mix-blend-overlay xpo_filter xpo_blur-xl xpo_animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        {/* Grid Pattern Overlay */}
        <div className="xpo_absolute xpo_inset-0 xpo_opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>

        {/* Content */}
        <div className="xpo_relative xpo_z-10 xpo_flex xpo_flex-col xpo_justify-between xpo_p-12 xpo_text-white">
          {/* Logo & Brand */}
          <div>
            <div className="xpo_flex xpo_items-center xpo_gap-3 xpo_mb-2">
              <div className="xpo_w-12 xpo_h-12 xpo_bg-white xpo_bg-opacity-20 xpo_backdrop-blur-lg xpo_rounded-xl xpo_flex xpo_items-center xpo_justify-center xpo_border xpo_border-white xpo_border-opacity-30">
                <img src={mockLoginData.logoUrl} alt="Logo" className="xpo_w-8 xpo_h-8 xpo_rounded-lg" />
              </div>
              <span className="xpo_text-2xl xpo_font-bold">{mockLoginData.siteName}</span>
            </div>
          </div>

          {/* Hero Content */}
          <div className="xpo_space-y-6">
            <div className="xpo_space-y-4">
              <h1 className="xpo_text-5xl xpo_font-bold xpo_leading-tight">
                Welcome to the
                <br />
                <span className="xpo_bg-clip-text xpo_text-transparent xpo_bg-gradient-to-r xpo_from-pink-200 xpo_to-purple-200">
                  Future of Work
                </span>
              </h1>
              <p className="xpo_text-xl xpo_text-purple-100 xpo_max-w-md">
                Join thousands of professionals who trust our platform for seamless collaboration and productivity.
              </p>
            </div>

            {/* Feature Cards */}
            <div className="xpo_space-y-4 xpo_pt-8">
              <div className="xpo_flex xpo_items-start xpo_gap-4 xpo_group">
                <div className="xpo_w-12 xpo_h-12 xpo_rounded-xl xpo_bg-white xpo_bg-opacity-10 xpo_backdrop-blur-sm xpo_flex xpo_items-center xpo_justify-center xpo_flex-shrink-0 group-hover:xpo_bg-opacity-20 xpo_transition-all">
                  <Shield className="xpo_w-6 xpo_h-6" />
                </div>
                <div>
                  <h3 className="xpo_font-semibold xpo_text-lg xpo_mb-1">Secure & Private</h3>
                  <p className="xpo_text-purple-200 xpo_text-sm">Enterprise-grade security to protect your data</p>
                </div>
              </div>

              <div className="xpo_flex xpo_items-start xpo_gap-4 xpo_group">
                <div className="xpo_w-12 xpo_h-12 xpo_rounded-xl xpo_bg-white xpo_bg-opacity-10 xpo_backdrop-blur-sm xpo_flex xpo_items-center xpo_justify-center xpo_flex-shrink-0 group-hover:xpo_bg-opacity-20 xpo_transition-all">
                  <Zap className="xpo_w-6 xpo_h-6" />
                </div>
                <div>
                  <h3 className="xpo_font-semibold xpo_text-lg xpo_mb-1">Lightning Fast</h3>
                  <p className="xpo_text-purple-200 xpo_text-sm">Optimized performance for the best experience</p>
                </div>
              </div>

              <div className="xpo_flex xpo_items-start xpo_gap-4 xpo_group">
                <div className="xpo_w-12 xpo_h-12 xpo_rounded-xl xpo_bg-white xpo_bg-opacity-10 xpo_backdrop-blur-sm xpo_flex xpo_items-center xpo_justify-center xpo_flex-shrink-0 group-hover:xpo_bg-opacity-20 xpo_transition-all">
                  <Sparkles className="xpo_w-6 xpo_h-6" />
                </div>
                <div>
                  <h3 className="xpo_font-semibold xpo_text-lg xpo_mb-1">AI-Powered</h3>
                  <p className="xpo_text-purple-200 xpo_text-sm">Smart features that adapt to your workflow</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="xpo_text-sm xpo_text-purple-200">
            © {new Date().getFullYear()} {mockLoginData.siteName}. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Side - Form Section */}
      <div className="xpo_w-full lg:xpo_w-1/2 xpo_flex xpo_items-center xpo_justify-center xpo_p-8 xpo_bg-gray-50">
        <div className="xpo_w-full xpo_max-w-md">
          {/* Mobile Logo */}
          <div className="lg:xpo_hidden xpo_flex xpo_items-center xpo_gap-3 xpo_mb-8">
            <div className="xpo_w-12 xpo_h-12 xpo_bg-gradient-to-br xpo_from-violet-600 xpo_to-purple-600 xpo_rounded-xl xpo_flex xpo_items-center xpo_justify-center">
              <img src={mockLoginData.logoUrl} alt="Logo" className="xpo_w-8 xpo_h-8 xpo_rounded-lg" />
            </div>
            <span className="xpo_text-2xl xpo_font-bold xpo_text-gray-900">{mockLoginData.siteName}</span>
          </div>

          {/* Header */}
          <div className="xpo_mb-8">
            <h2 className="xpo_text-3xl xpo_font-bold xpo_text-gray-900 xpo_mb-2">
              {isLogin ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="xpo_text-gray-600">
              {isLogin 
                ? 'Enter your credentials to access your account' 
                : 'Sign up to get started with our platform'}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="xpo_flex xpo_gap-2 xpo_mb-8 xpo_bg-gray-200 xpo_p-1 xpo_rounded-xl">
            <button
              onClick={() => {
                setIsLogin(true);
                setMessage({ type: '', text: '' });
              }}
              className={`xpo_flex-1 xpo_py-3 xpo_px-4 xpo_text-sm xpo_font-medium xpo_rounded-lg xpo_transition-all ${
                isLogin
                  ? 'xpo_bg-white xpo_text-gray-900 xpo_shadow-sm'
                  : 'xpo_text-gray-600 hover:xpo_text-gray-900'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setMessage({ type: '', text: '' });
              }}
              className={`xpo_flex-1 xpo_py-3 xpo_px-4 xpo_text-sm xpo_font-medium xpo_rounded-lg xpo_transition-all ${
                !isLogin
                  ? 'xpo_bg-white xpo_text-gray-900 xpo_shadow-sm'
                  : 'xpo_text-gray-600 hover:xpo_text-gray-900'
              }`}
            >
              Register
            </button>
          </div>

          {/* Message Display */}
          {message.text && (
            <div className={`xpo_mb-6 xpo_p-4 xpo_rounded-xl xpo_flex xpo_items-center xpo_gap-3 xpo_animate-in xpo_fade-in xpo_slide-in-from-top-2 ${
              message.type === 'success' 
                ? 'xpo_bg-green-50 xpo_text-green-800 xpo_border xpo_border-green-200' 
                : 'xpo_bg-red-50 xpo_text-red-800 xpo_border xpo_border-red-200'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle2 className="xpo_w-5 xpo_h-5 xpo_flex-shrink-0" />
              ) : (
                <XCircle className="xpo_w-5 xpo_h-5 xpo_flex-shrink-0" />
              )}
              <span className="xpo_text-sm xpo_font-medium">{message.text}</span>
            </div>
          )}

          {/* Forms */}
          {isLogin ? (
            <div className="xpo_space-y-5">
              <div>
                <label className="xpo_block xpo_text-sm xpo_font-semibold xpo_text-gray-700 xpo_mb-2">
                  Username or Email
                </label>
                <div className="xpo_relative">
                  <User className="xpo_absolute xpo_left-4 xpo_top-1/2 xpo_transform xpo_-translate-y-1/2 xpo_text-gray-400 xpo_w-5 xpo_h-5" />
                  <input
                    type="text"
                    name="username"
                    value={loginForm.username}
                    onChange={handleLoginChange}
                    onKeyPress={(e) => handleKeyPress(e, handleLoginSubmit)}
                    className="xpo_w-full xpo_pl-12 xpo_pr-4 xpo_py-3.5 xpo_bg-white xpo_border xpo_border-gray-300 xpo_rounded-xl focus:xpo_ring-2 focus:xpo_ring-purple-500 focus:xpo_border-transparent xpo_outline-none xpo_transition xpo_text-gray-900 xpo_placeholder-gray-400"
                    placeholder="Enter your username"
                  />
                </div>
              </div>

              <div>
                <label className="xpo_block xpo_text-sm xpo_font-semibold xpo_text-gray-700 xpo_mb-2">
                  Password
                </label>
                <div className="xpo_relative">
                  <Lock className="xpo_absolute xpo_left-4 xpo_top-1/2 xpo_transform xpo_-translate-y-1/2 xpo_text-gray-400 xpo_w-5 xpo_h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={loginForm.password}
                    onChange={handleLoginChange}
                    onKeyPress={(e) => handleKeyPress(e, handleLoginSubmit)}
                    className="xpo_w-full xpo_pl-12 xpo_pr-12 xpo_py-3.5 xpo_bg-white xpo_border xpo_border-gray-300 xpo_rounded-xl focus:xpo_ring-2 focus:xpo_ring-purple-500 focus:xpo_border-transparent xpo_outline-none xpo_transition xpo_text-gray-900 xpo_placeholder-gray-400"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="xpo_absolute xpo_right-4 xpo_top-1/2 xpo_transform xpo_-translate-y-1/2 xpo_text-gray-400 hover:xpo_text-gray-600 xpo_transition"
                  >
                    {showPassword ? <EyeOff className="xpo_w-5 xpo_h-5" /> : <Eye className="xpo_w-5 xpo_h-5" />}
                  </button>
                </div>
              </div>

              <div className="xpo_flex xpo_items-center xpo_justify-between xpo_pt-1">
                <label className="xpo_flex xpo_items-center xpo_cursor-pointer xpo_group">
                  <input
                    type="checkbox"
                    name="remember"
                    checked={loginForm.remember}
                    onChange={handleLoginChange}
                    className="xpo_w-4 xpo_h-4 xpo_text-purple-600 xpo_border-gray-300 xpo_rounded focus:xpo_ring-purple-500 xpo_cursor-pointer"
                  />
                  <span className="xpo_ml-2 xpo_text-sm xpo_text-gray-600 group-hover:xpo_text-gray-900 xpo_transition">Remember me</span>
                </label>
                <a href="#" className="xpo_text-sm xpo_font-medium xpo_text-purple-600 hover:xpo_text-purple-700 xpo_transition">
                  Forgot password?
                </a>
              </div>

              <button
                onClick={handleLoginSubmit}
                disabled={isLoading}
                className="xpo_w-full xpo_bg-gradient-to-r xpo_from-violet-600 xpo_to-purple-600 xpo_text-white xpo_py-3.5 xpo_rounded-xl xpo_font-semibold xpo_flex xpo_items-center xpo_justify-center xpo_gap-2 hover:xpo_from-violet-700 hover:xpo_to-purple-700 xpo_transition-all xpo_shadow-lg xpo_shadow-purple-500/30 hover:xpo_shadow-xl hover:xpo_shadow-purple-500/40 disabled:xpo_opacity-50 disabled:xpo_cursor-not-allowed xpo_transform hover:xpo_scale-[1.02] active:xpo_scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="xpo_w-5 xpo_h-5 xpo_animate-spin" />
                    Logging in...
                  </>
                ) : (
                  <>
                    Login
                    <ArrowRight className="xpo_w-5 xpo_h-5" />
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="xpo_space-y-5">
              <div>
                <label className="xpo_block xpo_text-sm xpo_font-semibold xpo_text-gray-700 xpo_mb-2">
                  Username
                </label>
                <div className="xpo_relative">
                  <User className="xpo_absolute xpo_left-4 xpo_top-1/2 xpo_transform xpo_-translate-y-1/2 xpo_text-gray-400 xpo_w-5 xpo_h-5" />
                  <input
                    type="text"
                    name="username"
                    value={registerForm.username}
                    onChange={handleRegisterChange}
                    onKeyPress={(e) => handleKeyPress(e, handleRegisterSubmit)}
                    className="xpo_w-full xpo_pl-12 xpo_pr-4 xpo_py-3.5 xpo_bg-white xpo_border xpo_border-gray-300 xpo_rounded-xl focus:xpo_ring-2 focus:xpo_ring-purple-500 focus:xpo_border-transparent xpo_outline-none xpo_transition xpo_text-gray-900 xpo_placeholder-gray-400"
                    placeholder="Choose a username"
                  />
                </div>
              </div>

              <div>
                <label className="xpo_block xpo_text-sm xpo_font-semibold xpo_text-gray-700 xpo_mb-2">
                  Email Address
                </label>
                <div className="xpo_relative">
                  <Mail className="xpo_absolute xpo_left-4 xpo_top-1/2 xpo_transform xpo_-translate-y-1/2 xpo_text-gray-400 xpo_w-5 xpo_h-5" />
                  <input
                    type="email"
                    name="email"
                    value={registerForm.email}
                    onChange={handleRegisterChange}
                    onKeyPress={(e) => handleKeyPress(e, handleRegisterSubmit)}
                    className="xpo_w-full xpo_pl-12 xpo_pr-4 xpo_py-3.5 xpo_bg-white xpo_border xpo_border-gray-300 xpo_rounded-xl focus:xpo_ring-2 focus:xpo_ring-purple-500 focus:xpo_border-transparent xpo_outline-none xpo_transition xpo_text-gray-900 xpo_placeholder-gray-400"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label className="xpo_block xpo_text-sm xpo_font-semibold xpo_text-gray-700 xpo_mb-2">
                  Password
                </label>
                <div className="xpo_relative">
                  <Lock className="xpo_absolute xpo_left-4 xpo_top-1/2 xpo_transform xpo_-translate-y-1/2 xpo_text-gray-400 xpo_w-5 xpo_h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={registerForm.password}
                    onChange={handleRegisterChange}
                    onKeyPress={(e) => handleKeyPress(e, handleRegisterSubmit)}
                    className="xpo_w-full xpo_pl-12 xpo_pr-12 xpo_py-3.5 xpo_bg-white xpo_border xpo_border-gray-300 xpo_rounded-xl focus:xpo_ring-2 focus:xpo_ring-purple-500 focus:xpo_border-transparent xpo_outline-none xpo_transition xpo_text-gray-900 xpo_placeholder-gray-400"
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="xpo_absolute xpo_right-4 xpo_top-1/2 xpo_transform xpo_-translate-y-1/2 xpo_text-gray-400 hover:xpo_text-gray-600 xpo_transition"
                  >
                    {showPassword ? <EyeOff className="xpo_w-5 xpo_h-5" /> : <Eye className="xpo_w-5 xpo_h-5" />}
                  </button>
                </div>
              </div>

              <button
                onClick={handleRegisterSubmit}
                disabled={isLoading}
                className="xpo_w-full xpo_bg-gradient-to-r xpo_from-violet-600 xpo_to-purple-600 xpo_text-white xpo_py-3.5 xpo_rounded-xl xpo_font-semibold xpo_flex xpo_items-center xpo_justify-center xpo_gap-2 hover:xpo_from-violet-700 hover:xpo_to-purple-700 xpo_transition-all xpo_shadow-lg xpo_shadow-purple-500/30 hover:xpo_shadow-xl hover:xpo_shadow-purple-500/40 disabled:xpo_opacity-50 disabled:xpo_cursor-not-allowed xpo_transform hover:xpo_scale-[1.02] active:xpo_scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="xpo_w-5 xpo_h-5 xpo_animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="xpo_w-5 xpo_h-5" />
                  </>
                )}
              </button>

              <p className="xpo_text-xs xpo_text-gray-500 xpo_text-center xpo_mt-4">
                By signing up, you agree to our{' '}
                <a href="#" className="xpo_text-purple-600 hover:xpo_text-purple-700 xpo_font-medium">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="xpo_text-purple-600 hover:xpo_text-purple-700 xpo_font-medium">Privacy Policy</a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginRegistration;