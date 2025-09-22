import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, Shield, CheckCircle } from 'lucide-react';

const LoginPage = () => {
  const [loginType, setLoginType] = useState('signin');
  const isRegister = loginType === 'register';
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  const switchMode = () => {
    setLoginType(isRegister ? 'signin' : 'register');
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      phone: ''
    });
  };

  return (
    <div className="xpo_min-h-screen xpo_bg-gradient-to-br xpo_from-blue-50 xpo_via-white xpo_to-purple-50 xpo_flex xpo_items-center xpo_justify-center xpo_p-4">
      <div className="xpo_max-w-4xl xpo_w-full xpo_grid xpo_grid-cols-1 lg:xpo_grid-cols-2 xpo_bg-white xpo_rounded-3xl xpo_shadow-2xl xpo_overflow-hidden">
        
        <div className="xpo_relative xpo_bg-gradient-to-br xpo_from-blue-600 xpo_to-purple-700 xpo_p-8 lg:xpo_p-12 xpo_flex xpo_flex-col xpo_justify-center xpo_text-white">
          <div className="xpo_absolute xpo_inset-0 xpo_bg-black xpo_bg-opacity-20"></div>
          <div className="xpo_relative xpo_z-10">
            <h1 className="xpo_text-4xl lg:xpo_text-5xl xpo_font-bold xpo_mb-6 xpo_leading-tight">
              {isRegister ? 'Join Our Community' : 'Welcome Back'}
            </h1>
            <p className="xpo_text-xl xpo_text-blue-100 xpo_mb-8 xpo_leading-relaxed">
              {isRegister 
                ? 'Create your account and discover amazing products tailored just for you.'
                : 'Sign in to your account and continue your shopping journey.'
              }
            </p>
            
            <div className="xpo_space-y-4">
              <div className="xpo_flex xpo_items-center xpo_gap-3">
                <Shield className="xpo_w-6 xpo_h-6 xpo_text-blue-200" />
                <span className="xpo_text-blue-100">Secure & Protected</span>
              </div>
              <div className="xpo_flex xpo_items-center xpo_gap-3">
                <CheckCircle className="xpo_w-6 xpo_h-6 xpo_text-green-300" />
                <span className="xpo_text-blue-100">Trusted by 10,000+ Users</span>
              </div>
              <div className="xpo_flex xpo_items-center xpo_gap-3">
                <ArrowRight className="xpo_w-6 xpo_h-6 xpo_text-purple-200" />
                <span className="xpo_text-blue-100">Fast & Easy Setup</span>
              </div>
            </div>
          </div>
          
          <div className="xpo_absolute xpo_bottom-0 xpo_right-0 xpo_w-32 xpo_h-32 xpo_bg-white xpo_bg-opacity-10 xpo_rounded-tl-full"></div>
          <div className="xpo_absolute xpo_top-0 xpo_left-0 xpo_w-24 xpo_h-24 xpo_bg-white xpo_bg-opacity-10 xpo_rounded-br-full"></div>
        </div>

        <div className="xpo_p-8 lg:xpo_p-12 xpo_flex xpo_flex-col xpo_justify-center">
          <div className="xpo_mb-8">
            <h2 className="xpo_text-3xl xpo_font-bold xpo_text-gray-900 xpo_mb-2">
              {isRegister ? 'Create Account' : 'Sign In'}
            </h2>
            <p className="xpo_text-gray-600">
              {isRegister 
                ? 'Fill in your details to get started'
                : 'Enter your credentials to access your account'
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="xpo_space-y-6">
            {isRegister && (
              <div className="xpo_grid xpo_grid-cols-1 sm:xpo_grid-cols-2 xpo_gap-4">
                <div className="xpo_relative">
                  <User className="xpo_absolute xpo_left-3 xpo_top-1/2 xpo_transform xpo_-translate-y-1/2 xpo_text-gray-400 xpo_w-5 xpo_h-5" />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="First Name"
                    className="xpo_w-full xpo_pl-10 xpo_pr-4 xpo_py-3 xpo_border xpo_border-gray-300 xpo_rounded-xl focus:xpo_ring-2 focus:xpo_ring-blue-500 focus:xpo_border-transparent xpo_transition-all"
                    required
                  />
                </div>
                <div className="xpo_relative">
                  <User className="xpo_absolute xpo_left-3 xpo_top-1/2 xpo_transform xpo_-translate-y-1/2 xpo_text-gray-400 xpo_w-5 xpo_h-5" />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Last Name"
                    className="xpo_w-full xpo_pl-10 xpo_pr-4 xpo_py-3 xpo_border xpo_border-gray-300 xpo_rounded-xl focus:xpo_ring-2 focus:xpo_ring-blue-500 focus:xpo_border-transparent xpo_transition-all"
                    required
                  />
                </div>
              </div>
            )}

            <div className="xpo_relative">
              <Mail className="xpo_absolute xpo_left-3 xpo_top-1/2 xpo_transform xpo_-translate-y-1/2 xpo_text-gray-400 xpo_w-5 xpo_h-5" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email Address"
                className="xpo_w-full xpo_pl-10 xpo_pr-4 xpo_py-3 xpo_border xpo_border-gray-300 xpo_rounded-xl focus:xpo_ring-2 focus:xpo_ring-blue-500 focus:xpo_border-transparent xpo_transition-all"
                required
              />
            </div>

            {isRegister && (
              <div className="xpo_relative">
                <Phone className="xpo_absolute xpo_left-3 xpo_top-1/2 xpo_transform xpo_-translate-y-1/2 xpo_text-gray-400 xpo_w-5 xpo_h-5" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Phone Number"
                  className="xpo_w-full xpo_pl-10 xpo_pr-4 xpo_py-3 xpo_border xpo_border-gray-300 xpo_rounded-xl focus:xpo_ring-2 focus:xpo_ring-blue-500 focus:xpo_border-transparent xpo_transition-all"
                  required
                />
              </div>
            )}

            <div className="xpo_relative">
              <Lock className="xpo_absolute xpo_left-3 xpo_top-1/2 xpo_transform xpo_-translate-y-1/2 xpo_text-gray-400 xpo_w-5 xpo_h-5" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Password"
                className="xpo_w-full xpo_pl-10 xpo_pr-12 xpo_py-3 xpo_border xpo_border-gray-300 xpo_rounded-xl focus:xpo_ring-2 focus:xpo_ring-blue-500 focus:xpo_border-transparent xpo_transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="xpo_absolute xpo_right-3 xpo_top-1/2 xpo_transform xpo_-translate-y-1/2 xpo_text-gray-400 hover:xpo_text-gray-600"
              >
                {showPassword ? <EyeOff className="xpo_w-5 xpo_h-5" /> : <Eye className="xpo_w-5 xpo_h-5" />}
              </button>
            </div>

            {isRegister && (
              <div className="xpo_relative">
                <Lock className="xpo_absolute xpo_left-3 xpo_top-1/2 xpo_transform xpo_-translate-y-1/2 xpo_text-gray-400 xpo_w-5 xpo_h-5" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm Password"
                  className="xpo_w-full xpo_pl-10 xpo_pr-12 xpo_py-3 xpo_border xpo_border-gray-300 xpo_rounded-xl focus:xpo_ring-2 focus:xpo_ring-blue-500 focus:xpo_border-transparent xpo_transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="xpo_absolute xpo_right-3 xpo_top-1/2 xpo_transform xpo_-translate-y-1/2 xpo_text-gray-400 hover:xpo_text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="xpo_w-5 xpo_h-5" /> : <Eye className="xpo_w-5 xpo_h-5" />}
                </button>
              </div>
            )}

            {isRegister ? (
              <div className="xpo_flex xpo_items-start xpo_gap-3">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="xpo_mt-1 xpo_w-4 xpo_h-4 xpo_text-blue-600 xpo_border-gray-300 xpo_rounded focus:xpo_ring-blue-500"
                  required
                />
                <label htmlFor="agreeTerms" className="xpo_text-sm xpo_text-gray-600">
                  I agree to the{' '}
                  <a href="#" className="xpo_text-blue-600 hover:xpo_text-blue-800 xpo_font-medium">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="xpo_text-blue-600 hover:xpo_text-blue-800 xpo_font-medium">
                    Privacy Policy
                  </a>
                </label>
              </div>
            ) : (
              <div className="xpo_flex xpo_items-center xpo_justify-between">
                <div className="xpo_flex xpo_items-center xpo_gap-2">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="xpo_w-4 xpo_h-4 xpo_text-blue-600 xpo_border-gray-300 xpo_rounded focus:xpo_ring-blue-500"
                  />
                  <label htmlFor="rememberMe" className="xpo_text-sm xpo_text-gray-600">
                    Remember me
                  </label>
                </div>
                <a href="#" className="xpo_text-sm xpo_text-blue-600 hover:xpo_text-blue-800 xpo_font-medium">
                  Forgot password?
                </a>
              </div>
            )}

            <button
              type="submit"
              className="xpo_w-full xpo_bg-gradient-to-r xpo_from-blue-600 xpo_to-purple-700 xpo_text-white xpo_py-3 xpo_px-4 xpo_rounded-xl xpo_font-semibold hover:xpo_from-blue-700 hover:xpo_to-purple-800 xpo_transform hover:xpo_scale-105 xpo_transition-all xpo_duration-200 xpo_shadow-lg hover:xpo_shadow-xl"
            >
              {isRegister ? 'Create Account' : 'Sign In'}
            </button>

            <div className="xpo_relative">
              <div className="xpo_absolute xpo_inset-0 xpo_flex xpo_items-center">
                <div className="xpo_w-full xpo_border-t xpo_border-gray-300"></div>
              </div>
              <div className="xpo_relative xpo_flex xpo_justify-center xpo_text-sm">
                <span className="xpo_px-2 xpo_bg-white xpo_text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="xpo_grid xpo_grid-cols-2 xpo_gap-4">
              <button
                type="button"
                className="xpo_flex xpo_items-center xpo_justify-center xpo_px-4 xpo_py-3 xpo_border xpo_border-gray-300 xpo_rounded-xl xpo_shadow-sm xpo_bg-white xpo_text-sm xpo_font-medium xpo_text-gray-700 hover:xpo_bg-gray-50 xpo_transition-colors"
              >
                <svg className="xpo_w-5 xpo_h-5 xpo_mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
              <button
                type="button"
                className="xpo_flex xpo_items-center xpo_justify-center xpo_px-4 xpo_py-3 xpo_border xpo_border-gray-300 xpo_rounded-xl xpo_shadow-sm xpo_bg-white xpo_text-sm xpo_font-medium xpo_text-gray-700 hover:xpo_bg-gray-50 xpo_transition-colors"
              >
                <svg className="xpo_w-5 xpo_h-5 xpo_mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
                Twitter
              </button>
            </div>
          </form>

          <div className="xpo_mt-8 xpo_text-center">
            <p className="xpo_text-gray-600">
              {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={switchMode}
                className="xpo_text-blue-600 hover:xpo_text-blue-800 xpo_font-medium hover:xpo_underline"
              >
                {isRegister ? 'Sign in' : 'Create account'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;