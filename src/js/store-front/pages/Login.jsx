import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, Shield, Star, Users, Loader2 } from 'lucide-react';
import { useLocale } from '../hooks/useLocale';
import { useCurrency } from '../hooks/useCurrency';
import { sprintf } from 'sprintf-js';
import MoonlitSky from '../components/backgrounds/MoonlitSky';
import { useAuth } from '../hooks/useAuth';
import { ReviewBarSkeleton } from '../components/skeletons/SkeletonLoader';
import { notify } from '@functions';
import AuthVerify from '../components/parts/AuthVerify';

const LoginPage = () => {
  const { __ } = useLocale();
  const { money } = useCurrency();
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const { type: loginType } = useParams(); // signin | register | verify
  const isRegister = loginType === 'register';
  const [loading, setLoading] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(null);
  const [testimonials, setTestimonials] = useState([]);

  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    lastName: '',
    password: '',
    firstName: '',
    agreeTerms: false,
    rememberMe: false,
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    login({ isRegister, ...formData })
      .then(data => {
        // login
        if (data?.account_id) {
          const { account_id, verification: { emailSent = true, smsSent = false } = {} } = data;
          navigate(`/auth/verify/${account_id}/${smsSent ? 'sms' : emailSent ? 'email' : 'token'}/0`);
        }
      })
      .catch(err => notify.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setReviewLoading(true);
    const delay = setTimeout(() => {
      setTestimonials([
        {
          name: "Sarah Johnson",
          role: "Verified Customer",
          content: "Amazing shopping experience! Fast delivery and excellent customer service.",
          rating: 5,
          avatar: "https://images.unsplash.com/photo-1615109398623-88346a601842?w=60&h=60&fit=crop&crop=face"
        },
        {
          name: "Michael Chen",
          role: "Premium Member",
          content: "Best prices and quality products. I've been shopping here for 2 years!",
          rating: 5,
          avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face"
        },
        {
          name: "Emma Davis",
          role: "Verified Customer",
          content: "Love the user-friendly interface and quick checkout process.",
          rating: 5,
          avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face"
        }
      ]);
      setReviewLoading(false);
    }, 1500);

    return () => clearTimeout(delay);
  }, []);


  return (
    <div className="min-h-screen bg-gradient-to-br from-scprimary-50 via-scwhite to-scwhite-50">
      <div className="flex min-h-screen">

        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-scprimary-600 to-scwhite-700 relative overflow-hidden">
          <div className="absolute inset-0 bg-scprimary bg-opacity-20">
            <div className="opacity-40 h-full">
              <MoonlitSky />
            </div>
          </div>

          <div className="relative z-10 flex flex-col justify-center items-center p-12 text-scwhite">
            <div className="mb-8 text-center">
              <h1 className="text-4xl font-bold mb-4">{__('Welcome to', 'site-core')}</h1>
              <p className="text-xl text-scaccent-100 mb-8">
                {__('Your premium shopping destination', 'site-core')}
              </p>

              <div className="grid grid-cols-3 gap-8 mb-12">
                <div className="text-center">
                  <div className="bg-scwhite bg-opacity-20 rounded-full p-4 mb-3 inline-block">
                    <Shield className="w-8 h-8" />
                  </div>
                  <p className="text-sm text-scaccent-100">{__('Secure Shopping', 'site-core')}</p>
                </div>
                <div className="text-center">
                  <div className="bg-scwhite bg-opacity-20 rounded-full p-4 mb-3 inline-block">
                    <Star className="w-8 h-8" />
                  </div>
                  <p className="text-sm text-scaccent-100">{__('Premium Quality', 'site-core')}</p>
                </div>
                <div className="text-center">
                  <div className="bg-scwhite bg-opacity-20 rounded-full p-4 mb-3 inline-block">
                    <Users className="w-8 h-8" />
                  </div>
                  <p className="text-sm text-scaccent-100">{sprintf(__('%s Customers', 'site-core'), '10M+')}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6 w-full max-w-md">
              {reviewLoading ? <ReviewBarSkeleton count={3} /> : testimonials.map((testimonial, index) => (
                <div key={index} className="bg-scwhite bg-opacity-10 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex items-center mb-3">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-10 h-10 rounded-full mr-3"
                    />
                    <div>
                      <p className="font-medium text-sm">{testimonial.name}</p>
                      <p className="text-xs text-scaccent-200">{testimonial.role}</p>
                    </div>
                    <div className="ml-auto flex">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-scaccent-100">{testimonial.content}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="absolute top-0 right-0 w-64 h-64 bg-scwhite bg-opacity-10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-scwhite bg-opacity-10 rounded-full -ml-24 -mb-24"></div>
        </div>

        <div className="flex-1 flex items-center justify-center p-8 relative">
          <div className="lg:hidden absolute top-0 left-0 w-full h-full z-0">
            <MoonlitSky />
          </div>
          <div className="w-full max-w-md relative z-10">
            {['bye', 'signin', 'register'].includes(loginType) && (
              <div className="bg-scwhite/70 rounded-3xl shadow-2xl p-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {isRegister ? __('Create Account', 'site-core') : __('Welcome Back', 'site-core')}
                  </h2>
                  <p className="text-gray-600">
                    {isRegister
                      ? __('Join thousands of satisfied customers', 'site-core')
                      : __('Sign in to your account to continue', 'site-core')
                    }
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {isRegister && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          required
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          placeholder={__('First Name', 'site-core')}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-scaccent-500 focus:border-transparent transition-all"
                        />
                      </div>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          required
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          placeholder={__('Last Name', 'site-core')}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-scaccent-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>
                  )}

                  <div className="relative">
                    {
                      isRegister ?
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" /> :
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    }
                    <input
                      required
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      type={isRegister ? 'email' : 'text'}
                      placeholder={isRegister ? __('Email Address', 'site-core') : __('Email address / Phone number / Username', 'site-core')}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-scaccent-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {isRegister && (
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder={__('Phone Number', 'site-core')}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-scaccent-500 focus:border-transparent transition-all"
                      />
                    </div>
                  )}

                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      required
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder={__('Password', 'site-core')}
                      type={showPassword ? "text" : "password"}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-scaccent-500 focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => !prev)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                    </button>
                  </div>

                  {isRegister && (
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        name="confirmPassword"
                        onChange={handleInputChange}
                        placeholder="Confirm Password"
                        value={formData.confirmPassword}
                        type={showPassword ? "text" : "password"}
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-scaccent-500 focus:border-transparent transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(prev => !prev)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                      </button>
                    </div>
                  )}

                  {isRegister && (
                    <div className="flex items-start gap-3">
                      <input
                        required
                        type="checkbox"
                        id="agreeTerms"
                        name="agreeTerms"
                        onChange={handleInputChange}
                        checked={formData.agreeTerms}
                        className="mt-1 w-4 h-4 text-scaccent-600 bg-gray-100 border-gray-300 rounded focus:ring-scaccent-500"
                      />
                      <label htmlFor="agreeTerms" className="text-sm text-gray-600" dangerouslySetInnerHTML={{ __html: sprintf(__('I agree to the %s Terms of Service %s and %s Privacy Policy %s', 'site-core'), '<a href="#" target="_blank" class="text-scaccent-600 hover:text-scaccent-800 underline">', '</a>', '<a href="#" target="_blank" class="text-scaccent-600 hover:text-scaccent-800 underline">', '</a>') }}>
                      </label>
                    </div>
                  )}

                  {!isRegister && (
                    <div className="flex items-center justify-between">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          id="rememberMe"
                          name="rememberMe"
                          onChange={handleInputChange}
                          checked={formData.rememberMe}
                          className="w-4 h-4 text-scaccent-600 bg-gray-100 border-gray-300 rounded focus:ring-scaccent-500"
                        />
                        <span className="ml-2 text-sm text-gray-600">{__('Remember me', 'site-core')}</span>
                      </label>
                      <Link href="/auth/reset-password" className="text-sm text-scaccent-600 hover:text-scaccent-800 underline">
                        {__('Forgot password?', 'site-core')}
                      </Link>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-scprimary-600 to-scwhite-600 text-scwhite py-3 px-6 rounded-xl font-medium hover:from-scprimary-700 hover:to-scwhite-700 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
                  >
                    {loading ? __('Matching...', 'site-core') : isRegister ? __('Create Account', 'site-core') : __('Sign In', 'site-core')}
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                  </button>

                  <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative bg-scwhite/60 px-4 text-sm text-gray-500">
                      {__('Or continue with', 'site-core')}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      className="w-full border border-gray-300 py-3 px-4 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      Google
                    </button>
                    <button
                      type="button"
                      className="w-full border border-gray-300 py-3 px-4 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="#1877f2" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                      Facebook
                    </button>
                  </div>
                </form>
              </div>
            )}

            {['signin', 'register'].includes(loginType) && (
              <div className="text-center mt-6">
                <p className="text-gray-600">
                  {isRegister ? 'Already have an account?' : "Don't have an account?"}
                  <Link
                    to={`/auth/${isRegister ? 'signin' : 'register'}`}
                    className="ml-1 text-scaccent-600 hover:text-scaccent-800 font-medium underline"
                  >
                    {isRegister ? __('Sign In', 'site-core') : __('Create Account', 'site-core')}
                  </Link>
                </p>
              </div>
            )}

            {['verify', 'otp'].includes(loginType) && (
              <AuthVerify />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;