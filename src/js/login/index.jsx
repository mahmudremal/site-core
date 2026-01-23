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
    ...window?.siteCoreConfig ?? {}
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
          const data = { action: 'custom_login', nonce: mockLoginData?.nonce ?? '', ...loginForm };
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
    <div className="min-h-screen flex overflow-hidden bg-white">
      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex w-1/2 relative bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-overlay filter blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-300 rounded-full mix-blend-overlay filter blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          {/* Logo & Brand */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-white bg-opacity-20 backdrop-blur-lg rounded-xl flex items-center justify-center border border-white border-opacity-30">
                <img src={mockLoginData.logoUrl} alt="Logo" className="w-8 h-8 rounded-lg" />
              </div>
              <span className="text-2xl font-bold">{mockLoginData.siteName}</span>
            </div>
          </div>

          {/* Hero Content */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h1 className="text-5xl font-bold leading-tight">
                Welcome to the
                <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-200 to-purple-200">
                  Future of Work
                </span>
              </h1>
              <p className="text-xl text-purple-100 max-w-md">
                Join thousands of professionals who trust our platform for seamless collaboration and productivity.
              </p>
            </div>

            {/* Feature Cards */}
            <div className="space-y-4 pt-8">
              <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-xl bg-white bg-opacity-10 backdrop-blur-sm flex items-center justify-center flex-shrink-0 group-hover:bg-opacity-20 transition-all">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Secure & Private</h3>
                  <p className="text-purple-200 text-sm">Enterprise-grade security to protect your data</p>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-xl bg-white bg-opacity-10 backdrop-blur-sm flex items-center justify-center flex-shrink-0 group-hover:bg-opacity-20 transition-all">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Lightning Fast</h3>
                  <p className="text-purple-200 text-sm">Optimized performance for the best experience</p>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-xl bg-white bg-opacity-10 backdrop-blur-sm flex items-center justify-center flex-shrink-0 group-hover:bg-opacity-20 transition-all">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">AI-Powered</h3>
                  <p className="text-purple-200 text-sm">Smart features that adapt to your workflow</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-sm text-purple-200">
            © {new Date().getFullYear()} {mockLoginData.siteName}. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Side - Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-purple-600 rounded-xl flex items-center justify-center">
              <img src={mockLoginData.logoUrl} alt="Logo" className="w-8 h-8 rounded-lg" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{mockLoginData.siteName}</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {isLogin ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="text-gray-600">
              {isLogin
                ? 'Enter your credentials to access your account'
                : 'Sign up to get started with our platform'}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex gap-2 mb-8 bg-gray-200 p-1 rounded-xl">
            <button
              onClick={() => {
                setIsLogin(true);
                setMessage({ type: '', text: '' });
              }}
              className={`flex-1 py-3 px-4 text-sm font-medium rounded-lg transition-all ${isLogin
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Login
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setMessage({ type: '', text: '' });
              }}
              className={`flex-1 py-3 px-4 text-sm font-medium rounded-lg transition-all ${!isLogin
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Register
            </button>
          </div>

          {/* Message Display */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
              {message.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <span className="text-sm font-medium">{message.text}</span>
            </div>
          )}

          {/* Forms */}
          {isLogin ? (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Username or Email
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="username"
                    value={loginForm.username}
                    onChange={handleLoginChange}
                    onKeyPress={(e) => handleKeyPress(e, handleLoginSubmit)}
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-gray-900 placeholder-gray-400"
                    placeholder="Enter your username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={loginForm.password}
                    onChange={handleLoginChange}
                    onKeyPress={(e) => handleKeyPress(e, handleLoginSubmit)}
                    className="w-full pl-12 pr-12 py-3.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-gray-900 placeholder-gray-400"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    name="remember"
                    checked={loginForm.remember}
                    onChange={handleLoginChange}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
                  />
                  <span className="ml-2 text-sm text-gray-600 group-hover:text-gray-900 transition">Remember me</span>
                </label>
                <a href="#" className="text-sm font-medium text-purple-600 hover:text-purple-700 transition">
                  Forgot password?
                </a>
              </div>

              <button
                onClick={handleLoginSubmit}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  <>
                    Login
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="username"
                    value={registerForm.username}
                    onChange={handleRegisterChange}
                    onKeyPress={(e) => handleKeyPress(e, handleRegisterSubmit)}
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-gray-900 placeholder-gray-400"
                    placeholder="Choose a username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={registerForm.email}
                    onChange={handleRegisterChange}
                    onKeyPress={(e) => handleKeyPress(e, handleRegisterSubmit)}
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-gray-900 placeholder-gray-400"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={registerForm.password}
                    onChange={handleRegisterChange}
                    onKeyPress={(e) => handleKeyPress(e, handleRegisterSubmit)}
                    className="w-full pl-12 pr-12 py-3.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-gray-900 placeholder-gray-400"
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                onClick={handleRegisterSubmit}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                By signing up, you agree to our{' '}
                <a href="#" className="text-purple-600 hover:text-purple-700 font-medium">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-purple-600 hover:text-purple-700 font-medium">Privacy Policy</a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginRegistration;