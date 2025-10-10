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
    login({isRegister, ...formData})
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
    <div className="xpo_min-h-screen xpo_bg-gradient-to-br xpo_from-scprimary-50 xpo_via-scwhite xpo_to-scwhite-50">
      <div className="xpo_flex xpo_min-h-screen">
        
        <div className="xpo_hidden lg:xpo_flex lg:xpo_w-1/2 xpo_bg-gradient-to-br xpo_from-scprimary-600 xpo_to-scwhite-700 xpo_relative xpo_overflow-hidden">
          <div className="xpo_absolute xpo_inset-0 xpo_bg-scprimary xpo_bg-opacity-20">
            <div className="xpo_opacity-40 xpo_h-full">
              <MoonlitSky />
            </div>
          </div>
          
          <div className="xpo_relative xpo_z-10 xpo_flex xpo_flex-col xpo_justify-center xpo_items-center xpo_p-12 xpo_text-scwhite">
            <div className="xpo_mb-8 xpo_text-center">
              <h1 className="xpo_text-4xl xpo_font-bold xpo_mb-4">{__('Welcome to', 'site-core')}</h1>
              <p className="xpo_text-xl xpo_text-scaccent-100 xpo_mb-8">
                {__('Your premium shopping destination', 'site-core')}
              </p>
              
              <div className="xpo_grid xpo_grid-cols-3 xpo_gap-8 xpo_mb-12">
                <div className="xpo_text-center">
                  <div className="xpo_bg-scwhite xpo_bg-opacity-20 xpo_rounded-full xpo_p-4 xpo_mb-3 xpo_inline-block">
                    <Shield className="xpo_w-8 xpo_h-8" />
                  </div>
                  <p className="xpo_text-sm xpo_text-scaccent-100">{__('Secure Shopping', 'site-core')}</p>
                </div>
                <div className="xpo_text-center">
                  <div className="xpo_bg-scwhite xpo_bg-opacity-20 xpo_rounded-full xpo_p-4 xpo_mb-3 xpo_inline-block">
                    <Star className="xpo_w-8 xpo_h-8" />
                  </div>
                  <p className="xpo_text-sm xpo_text-scaccent-100">{__('Premium Quality', 'site-core')}</p>
                </div>
                <div className="xpo_text-center">
                  <div className="xpo_bg-scwhite xpo_bg-opacity-20 xpo_rounded-full xpo_p-4 xpo_mb-3 xpo_inline-block">
                    <Users className="xpo_w-8 xpo_h-8" />
                  </div>
                  <p className="xpo_text-sm xpo_text-scaccent-100">{sprintf(__('%s Customers', 'site-core'), '10M+')}</p>
                </div>
              </div>
            </div>

            <div className="xpo_space-y-6 xpo_w-full xpo_max-w-md">
              {reviewLoading ? <ReviewBarSkeleton count={3} /> : testimonials.map((testimonial, index) => (
                <div key={index} className="xpo_bg-scwhite xpo_bg-opacity-10 xpo_backdrop-blur-sm xpo_rounded-xl xpo_p-4">
                  <div className="xpo_flex xpo_items-center xpo_mb-3">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      className="xpo_w-10 xpo_h-10 xpo_rounded-full xpo_mr-3"
                    />
                    <div>
                      <p className="xpo_font-medium xpo_text-sm">{testimonial.name}</p>
                      <p className="xpo_text-xs xpo_text-scaccent-200">{testimonial.role}</p>
                    </div>
                    <div className="xpo_ml-auto xpo_flex">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="xpo_w-3 xpo_h-3 xpo_fill-yellow-400 xpo_text-yellow-400" />
                      ))}
                    </div>
                  </div>
                  <p className="xpo_text-sm xpo_text-scaccent-100">{testimonial.content}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="xpo_absolute xpo_top-0 xpo_right-0 xpo_w-64 xpo_h-64 xpo_bg-scwhite xpo_bg-opacity-10 xpo_rounded-full xpo_-mr-32 xpo_-mt-32"></div>
          <div className="xpo_absolute xpo_bottom-0 xpo_left-0 xpo_w-48 xpo_h-48 xpo_bg-scwhite xpo_bg-opacity-10 xpo_rounded-full xpo_-ml-24 xpo_-mb-24"></div>
        </div>

        <div className="xpo_flex-1 xpo_flex xpo_items-center xpo_justify-center xpo_p-8 xpo_relative">
          <div className="lg:xpo_hidden xpo_absolute xpo_top-0 xpo_left-0 xpo_w-full xpo_h-full xpo_z-0">
            <MoonlitSky />
          </div>
          <div className="xpo_w-full xpo_max-w-md xpo_relative xpo_z-10">
            {['bye', 'signin', 'register'].includes(loginType) && (
              <div className="xpo_bg-scwhite/70 xpo_rounded-3xl xpo_shadow-2xl xpo_p-8">
                <div className="xpo_text-center xpo_mb-8">
                  <h2 className="xpo_text-3xl xpo_font-bold xpo_text-gray-900 xpo_mb-2">
                    {isRegister ? __('Create Account', 'site-core') : __('Welcome Back', 'site-core')}
                  </h2>
                  <p className="xpo_text-gray-600">
                    {isRegister 
                      ? __('Join thousands of satisfied customers', 'site-core')
                      : __('Sign in to your account to continue', 'site-core')
                    }
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="xpo_space-y-6">
                  {isRegister && (
                    <div className="xpo_grid xpo_grid-cols-2 xpo_gap-4">
                      <div className="xpo_relative">
                        <User className="xpo_absolute xpo_left-3 xpo_top-1/2 xpo_transform xpo_-translate-y-1/2 xpo_w-5 xpo_h-5 xpo_text-gray-400" />
                        <input
                          required
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          placeholder={__('First Name', 'site-core')}
                          className="xpo_w-full xpo_pl-10 xpo_pr-4 xpo_py-3 xpo_border xpo_border-gray-300 xpo_rounded-xl focus:xpo_ring-2 focus:xpo_ring-scaccent-500 focus:xpo_border-transparent xpo_transition-all"
                        />
                      </div>
                      <div className="xpo_relative">
                        <User className="xpo_absolute xpo_left-3 xpo_top-1/2 xpo_transform xpo_-translate-y-1/2 xpo_w-5 xpo_h-5 xpo_text-gray-400" />
                        <input
                          required
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          placeholder={__('Last Name', 'site-core')}
                          className="xpo_w-full xpo_pl-10 xpo_pr-4 xpo_py-3 xpo_border xpo_border-gray-300 xpo_rounded-xl focus:xpo_ring-2 focus:xpo_ring-scaccent-500 focus:xpo_border-transparent xpo_transition-all"
                        />
                      </div>
                    </div>
                  )}

                  <div className="xpo_relative">
                    {
                      isRegister ? 
                      <Mail className="xpo_absolute xpo_left-3 xpo_top-1/2 xpo_transform xpo_-translate-y-1/2 xpo_w-5 xpo_h-5 xpo_text-gray-400" /> :
                      <User className="xpo_absolute xpo_left-3 xpo_top-1/2 xpo_transform xpo_-translate-y-1/2 xpo_w-5 xpo_h-5 xpo_text-gray-400" />
                      }
                    <input
                      required
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      type={isRegister ? 'email' : 'text'}
                      placeholder={isRegister ? __('Email Address', 'site-core') : __('Email address / Phone number / Username', 'site-core')}
                      className="xpo_w-full xpo_pl-10 xpo_pr-4 xpo_py-3 xpo_border xpo_border-gray-300 xpo_rounded-xl focus:xpo_ring-2 focus:xpo_ring-scaccent-500 focus:xpo_border-transparent xpo_transition-all"
                    />
                  </div>

                  {isRegister && (
                    <div className="xpo_relative">
                      <Phone className="xpo_absolute xpo_left-3 xpo_top-1/2 xpo_transform xpo_-translate-y-1/2 xpo_w-5 xpo_h-5 xpo_text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder={__('Phone Number', 'site-core')}
                        className="xpo_w-full xpo_pl-10 xpo_pr-4 xpo_py-3 xpo_border xpo_border-gray-300 xpo_rounded-xl focus:xpo_ring-2 focus:xpo_ring-scaccent-500 focus:xpo_border-transparent xpo_transition-all"
                      />
                    </div>
                  )}

                  <div className="xpo_relative">
                    <Lock className="xpo_absolute xpo_left-3 xpo_top-1/2 xpo_transform xpo_-translate-y-1/2 xpo_w-5 xpo_h-5 xpo_text-gray-400" />
                    <input
                      required
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder={__('Password', 'site-core')}
                      type={showPassword ? "text" : "password"}
                      className="xpo_w-full xpo_pl-10 xpo_pr-12 xpo_py-3 xpo_border xpo_border-gray-300 xpo_rounded-xl focus:xpo_ring-2 focus:xpo_ring-scaccent-500 focus:xpo_border-transparent xpo_transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => !prev)}
                      className="xpo_absolute xpo_right-3 xpo_top-1/2 xpo_transform xpo_-translate-y-1/2 xpo_text-gray-400 hover:xpo_text-gray-600"
                    >
                      {showPassword ? <Eye className="xpo_w-5 xpo_h-5" /> : <EyeOff className="xpo_w-5 xpo_h-5" />}
                    </button>
                  </div>

                  {isRegister && (
                    <div className="xpo_relative">
                      <Lock className="xpo_absolute xpo_left-3 xpo_top-1/2 xpo_transform xpo_-translate-y-1/2 xpo_w-5 xpo_h-5 xpo_text-gray-400" />
                      <input
                        name="confirmPassword"
                        onChange={handleInputChange}
                        placeholder="Confirm Password"
                        value={formData.confirmPassword}
                        type={showPassword ? "text" : "password"}
                        className="xpo_w-full xpo_pl-10 xpo_pr-12 xpo_py-3 xpo_border xpo_border-gray-300 xpo_rounded-xl focus:xpo_ring-2 focus:xpo_ring-scaccent-500 focus:xpo_border-transparent xpo_transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(prev => !prev)}
                        className="xpo_absolute xpo_right-3 xpo_top-1/2 xpo_transform xpo_-translate-y-1/2 xpo_text-gray-400 hover:xpo_text-gray-600"
                      >
                        {showPassword ? <Eye className="xpo_w-5 xpo_h-5" /> : <EyeOff className="xpo_w-5 xpo_h-5" />}
                      </button>
                    </div>
                  )}

                  {isRegister && (
                    <div className="xpo_flex xpo_items-start xpo_gap-3">
                      <input
                        required
                        type="checkbox"
                        id="agreeTerms"
                        name="agreeTerms"
                        onChange={handleInputChange}
                        checked={formData.agreeTerms}
                        className="xpo_mt-1 xpo_w-4 xpo_h-4 xpo_text-scaccent-600 xpo_bg-gray-100 xpo_border-gray-300 xpo_rounded focus:xpo_ring-scaccent-500"
                      />
                      <label htmlFor="agreeTerms" className="xpo_text-sm xpo_text-gray-600" dangerouslySetInnerHTML={{__html: sprintf(__('I agree to the %s Terms of Service %s and %s Privacy Policy %s', 'site-core'), '<a href="#" target="_blank" class="xpo_text-scaccent-600 hover:xpo_text-scaccent-800 xpo_underline">', '</a>', '<a href="#" target="_blank" class="xpo_text-scaccent-600 hover:xpo_text-scaccent-800 xpo_underline">', '</a>')}}>
                      </label>
                    </div>
                  )}

                  {!isRegister && (
                    <div className="xpo_flex xpo_items-center xpo_justify-between">
                      <label className="xpo_flex xpo_items-center">
                        <input
                          type="checkbox"
                          id="rememberMe"
                          name="rememberMe"
                          onChange={handleInputChange}
                          checked={formData.rememberMe}
                          className="xpo_w-4 xpo_h-4 xpo_text-scaccent-600 xpo_bg-gray-100 xpo_border-gray-300 xpo_rounded focus:xpo_ring-scaccent-500"
                        />
                        <span className="xpo_ml-2 xpo_text-sm xpo_text-gray-600">{__('Remember me', 'site-core')}</span>
                      </label>
                      <Link href="/auth/reset-password" className="xpo_text-sm xpo_text-scaccent-600 hover:xpo_text-scaccent-800 xpo_underline">
                        {__('Forgot password?', 'site-core')}
                      </Link>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="xpo_w-full xpo_bg-gradient-to-r xpo_from-scprimary-600 xpo_to-scwhite-600 xpo_text-scwhite xpo_py-3 xpo_px-6 xpo_rounded-xl xpo_font-medium hover:xpo_from-scprimary-700 hover:xpo_to-scwhite-700 xpo_transition-all xpo_transform hover:xpo_scale-[1.02] xpo_flex xpo_items-center xpo_justify-center xpo_gap-2"
                  >
                    {loading ? __('Matching...', 'site-core') : isRegister ? __('Create Account', 'site-core') : __('Sign In', 'site-core')}
                    {loading ? <Loader2 className="xpo_w-4 xpo_h-4 xpo_animate-spin" /> : <ArrowRight className="xpo_w-4 xpo_h-4" />}
                  </button>

                  <div className="xpo_relative xpo_flex xpo_items-center xpo_justify-center">
                    <div className="xpo_absolute xpo_inset-0 xpo_flex xpo_items-center">
                      <div className="xpo_w-full xpo_border-t xpo_border-gray-300"></div>
                    </div>
                    <div className="xpo_relative xpo_bg-scwhite/60 xpo_px-4 xpo_text-sm xpo_text-gray-500">
                      {__('Or continue with', 'site-core')}
                    </div>
                  </div>

                  <div className="xpo_grid xpo_grid-cols-2 xpo_gap-4">
                    <button
                      type="button"
                      className="xpo_w-full xpo_border xpo_border-gray-300 xpo_py-3 xpo_px-4 xpo_rounded-xl xpo_font-medium hover:xpo_bg-gray-50 xpo_transition-colors xpo_flex xpo_items-center xpo_justify-center xpo_gap-2"
                    >
                      <svg className="xpo_w-5 xpo_h-5" viewBox="0 0 24 24">
                        <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Google
                    </button>
                    <button
                      type="button"
                      className="xpo_w-full xpo_border xpo_border-gray-300 xpo_py-3 xpo_px-4 xpo_rounded-xl xpo_font-medium hover:xpo_bg-gray-50 xpo_transition-colors xpo_flex xpo_items-center xpo_justify-center xpo_gap-2"
                    >
                      <svg className="xpo_w-5 xpo_h-5" fill="#1877f2" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      Facebook
                    </button>
                  </div>
                </form>
              </div>
            )}

            {['signin', 'register'].includes(loginType) && (
              <div className="xpo_text-center xpo_mt-6">
                <p className="xpo_text-gray-600">
                  {isRegister ? 'Already have an account?' : "Don't have an account?"}
                  <Link
                    to={`/auth/${isRegister ? 'signin' : 'register'}`}
                    className="xpo_ml-1 xpo_text-scaccent-600 hover:xpo_text-scaccent-800 xpo_font-medium xpo_underline"
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