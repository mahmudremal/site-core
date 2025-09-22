import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, ShoppingBag } from 'lucide-react';
import AuthPageHelmet from '../components/helmets/AuthPageHelmet';

const LoginPage = () => {
  const { type: loginType } = useParams(); // signin | register
  const isRegister = loginType === 'register';
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    acceptTerms: false
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log('Form submitted:', formData);
  };

  return (
    <div className="xpo_min-h-screen xpo_bg-gradient-to-br xpo_from-blue-50 xpo_to-indigo-100 xpo_flex xpo_items-center xpo_justify-center xpo_p-4">
      <AuthPageHelmet />
      <div className="xpo_w-full xpo_max-w-md xpo_bg-white xpo_rounded-2xl xpo_shadow-xl xpo_overflow-hidden">
        {/* Header */}
        <div className="xpo_bg-gradient-to-r xpo_from-blue-600 xpo_to-indigo-600 xpo_px-8 xpo_py-6">
          <div className="xpo_flex xpo_items-center xpo_justify-center xpo_mb-4">
            <ShoppingBag className="xpo_w-8 xpo_h-8 xpo_text-white xpo_mr-2" />
            <h1 className="xpo_text-2xl xpo_font-bold xpo_text-white">MoonlitMeadow</h1>
          </div>
          <p className="xpo_text-blue-100 xpo_text-center">
            {isRegister ? 'Create your account' : 'Welcome back'}
          </p>
        </div>

        {/* Form */}
        <div className="xpo_px-8 xpo_py-6">
          <form onSubmit={handleSubmit} className="xpo_space-y-6">
            {isRegister && (
              <div className="xpo_grid xpo_grid-cols-2 xpo_gap-4">
                <div>
                  <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-2">
                    First Name
                  </label>
                  <div className="xpo_relative">
                    <User className="xpo_absolute xpo_left-3 xpo_top-1/2 xpo_transform xpo_-translate-y-1/2 xpo_w-4 xpo_h-4 xpo_text-gray-400" />
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="xpo_w-full xpo_pl-10 xpo_pr-4 xpo_py-3 xpo_border xpo_border-gray-300 xpo_rounded-lg focus:xpo_ring-2 focus:xpo_ring-blue-500 focus:xpo_border-transparent xpo_transition-all"
                      placeholder="John"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-2">
                    Last Name
                  </label>
                  <div className="xpo_relative">
                    <User className="xpo_absolute xpo_left-3 xpo_top-1/2 xpo_transform xpo_-translate-y-1/2 xpo_w-4 xpo_h-4 xpo_text-gray-400" />
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="xpo_w-full xpo_pl-10 xpo_pr-4 xpo_py-3 xpo_border xpo_border-gray-300 xpo_rounded-lg focus:xpo_ring-2 focus:xpo_ring-blue-500 focus:xpo_border-transparent xpo_transition-all"
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-2">
                Email Address
              </label>
              <div className="xpo_relative">
                <Mail className="xpo_absolute xpo_left-3 xpo_top-1/2 xpo_transform xpo_-translate-y-1/2 xpo_w-4 xpo_h-4 xpo_text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="xpo_w-full xpo_pl-10 xpo_pr-4 xpo_py-3 xpo_border xpo_border-gray-300 xpo_rounded-lg focus:xpo_ring-2 focus:xpo_ring-blue-500 focus:xpo_border-transparent xpo_transition-all"
                  placeholder="john@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-2">
                Password
              </label>
              <div className="xpo_relative">
                <Lock className="xpo_absolute xpo_left-3 xpo_top-1/2 xpo_transform xpo_-translate-y-1/2 xpo_w-4 xpo_h-4 xpo_text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="xpo_w-full xpo_pl-10 xpo_pr-12 xpo_py-3 xpo_border xpo_border-gray-300 xpo_rounded-lg focus:xpo_ring-2 focus:xpo_ring-blue-500 focus:xpo_border-transparent xpo_transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="xpo_absolute xpo_right-3 xpo_top-1/2 xpo_transform xpo_-translate-y-1/2 xpo_text-gray-400 hover:xpo_text-gray-600"
                >
                  {showPassword ? <EyeOff className="xpo_w-4 xpo_h-4" /> : <Eye className="xpo_w-4 xpo_h-4" />}
                </button>
              </div>
            </div>

            {isRegister && (
              <div>
                <label className="xpo_block xpo_text-sm xpo_font-medium xpo_text-gray-700 xpo_mb-2">
                  Confirm Password
                </label>
                <div className="xpo_relative">
                  <Lock className="xpo_absolute xpo_left-3 xpo_top-1/2 xpo_transform xpo_-translate-y-1/2 xpo_w-4 xpo_h-4 xpo_text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="xpo_w-full xpo_pl-10 xpo_pr-12 xpo_py-3 xpo_border xpo_border-gray-300 xpo_rounded-lg focus:xpo_ring-2 focus:xpo_ring-blue-500 focus:xpo_border-transparent xpo_transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="xpo_absolute xpo_right-3 xpo_top-1/2 xpo_transform xpo_-translate-y-1/2 xpo_text-gray-400 hover:xpo_text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="xpo_w-4 xpo_h-4" /> : <Eye className="xpo_w-4 xpo_h-4" />}
                  </button>
                </div>
              </div>
            )}

            {!isRegister && (
              <div className="xpo_flex xpo_items-center xpo_justify-between">
                <div className="xpo_flex xpo_items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="xpo_h-4 xpo_w-4 xpo_text-blue-600 focus:xpo_ring-blue-500 xpo_border-gray-300 xpo_rounded"
                  />
                  <label htmlFor="remember-me" className="xpo_ml-2 xpo_block xpo_text-sm xpo_text-gray-700">
                    Remember me
                  </label>
                </div>
                <Link to="/forgot-password" className="xpo_text-sm xpo_text-blue-600 hover:xpo_text-blue-500">
                  Forgot password?
                </Link>
              </div>
            )}

            {isRegister && (
              <div className="xpo_flex xpo_items-center">
                <input
                  id="accept-terms"
                  name="acceptTerms"
                  type="checkbox"
                  checked={formData.acceptTerms}
                  onChange={handleInputChange}
                  className="xpo_h-4 xpo_w-4 xpo_text-blue-600 focus:xpo_ring-blue-500 xpo_border-gray-300 xpo_rounded"
                  required
                />
                <label htmlFor="accept-terms" className="xpo_ml-2 xpo_block xpo_text-sm xpo_text-gray-700">
                  I agree to the{' '}
                  <Link to="/terms" className="xpo_text-blue-600 hover:xpo_text-blue-500">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="xpo_text-blue-600 hover:xpo_text-blue-500">
                    Privacy Policy
                  </Link>
                </label>
              </div>
            )}

            <button
              type="submit"
              className="xpo_w-full xpo_bg-gradient-to-r xpo_from-blue-600 xpo_to-indigo-600 xpo_text-white xpo_py-3 xpo_px-4 xpo_rounded-lg xpo_font-medium hover:xpo_from-blue-700 hover:xpo_to-indigo-700 focus:xpo_outline-none focus:xpo_ring-2 focus:xpo_ring-offset-2 focus:xpo_ring-blue-500 xpo_transition-all xpo_duration-200"
            >
              {isRegister ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="xpo_mt-6">
            <div className="xpo_relative">
              <div className="xpo_absolute xpo_inset-0 xpo_flex xpo_items-center">
                <div className="xpo_w-full xpo_border-t xpo_border-gray-300" />
              </div>
              <div className="xpo_relative xpo_flex xpo_justify-center xpo_text-sm">
                <span className="xpo_px-2 xpo_bg-white xpo_text-gray-500">Or continue with</span>
              </div>
            </div>
          </div>

          {/* Social Login */}
          <div className="xpo_mt-6 xpo_grid xpo_grid-cols-2 xpo_gap-3">
            <button
              type="button"
              className="xpo_w-full xpo_inline-flex xpo_justify-center xpo_py-2 xpo_px-4 xpo_border xpo_border-gray-300 xpo_rounded-md xpo_shadow-sm xpo_bg-white xpo_text-sm xpo_font-medium xpo_text-gray-500 hover:xpo_bg-gray-50 xpo_transition-colors"
            >
              <svg className="xpo_w-5 xpo_h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="xpo_ml-2">Google</span>
            </button>

            <button
              type="button"
              className="xpo_w-full xpo_inline-flex xpo_justify-center xpo_py-2 xpo_px-4 xpo_border xpo_border-gray-300 xpo_rounded-md xpo_shadow-sm xpo_bg-white xpo_text-sm xpo_font-medium xpo_text-gray-500 hover:xpo_bg-gray-50 xpo_transition-colors"
            >
              <svg className="xpo_w-5 xpo_h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span className="xpo_ml-2">Facebook</span>
            </button>
          </div>

          {/* Switch between login and register */}
          <div className="xpo_mt-6 xpo_text-center">
            <p className="xpo_text-sm xpo_text-gray-600">
              {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
              <Link
                to={isRegister ? '/auth/signin' : '/auth/register'}
                className="xpo_font-medium xpo_text-blue-600 hover:xpo_text-blue-500"
              >
                {isRegister ? 'Sign in' : 'Sign up'}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;