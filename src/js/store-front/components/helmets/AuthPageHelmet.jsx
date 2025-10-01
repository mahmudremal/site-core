import { Helmet } from "react-helmet";
import { useParams } from "react-router-dom";
import { sprintf } from "sprintf-js";
import { site_url } from "@functions";

const AuthPageHelmet = () => {
  const { type: loginType } = useParams();

  const siteName = 'Moonlit Meadow';
  const isSignIn = loginType === 'signin';
  const isRegister = loginType === 'register';

  const title = isSignIn
    ? sprintf(__('Sign In | %s', 'site-core'), siteName)
    : isRegister
    ? sprintf(__('Register | %s', 'site-core'), siteName)
    : sprintf(__('Authentication | %s', 'site-core'), siteName);

  const description = isSignIn
    ? __('Sign in to your Moonlit Meadow account to access orders, wishlist, and personalized recommendations. Enjoy enterprise-grade shopping in Bangladesh.', 'site-core')
    : isRegister
    ? __('Create a new Moonlit Meadow account to enjoy fast checkout, order tracking, and exclusive offers. Shop the latest products with confidence.', 'site-core')
    : __('Access your account or create a new one to enjoy all the benefits of shopping securely with Moonlit Meadow.', 'site-core');

  const url = isSignIn ? site_url(`/auth/signin`) : isRegister ? site_url(`/auth/register`) : site_url(`/auth`);

  const ogImage = site_url(`/images/auth-og-image.jpg`);

  return (
    <Helmet>
      {/* Basic SEO */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {/* Auth pages shouldn't be indexed */}
      <meta name="robots" content="noindex, nofollow" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content="en_BD" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:site" content="@MoonlitMeadow" />
    </Helmet>
  );
};

export default AuthPageHelmet;
