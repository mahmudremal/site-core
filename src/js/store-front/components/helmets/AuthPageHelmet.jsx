import { Helmet } from "react-helmet";
import { useParams } from "react-router-dom";

const AuthPageHelmet = () => {
  const { type: loginType } = useParams();

  const isSignIn = loginType === "signin";
  const isRegister = loginType === "register";

  const title = isSignIn
    ? "Sign In | Your Store Name"
    : isRegister
    ? "Register | Your Store Name"
    : "Authentication | Your Store Name";

  const description = isSignIn
    ? "Sign in to your account to access your orders, wishlist, and personalized recommendations."
    : isRegister
    ? "Create a new account to enjoy fast checkout, order tracking, and exclusive offers."
    : "Access your account or create a new one to enjoy all the benefits of shopping with us.";

  const url = isSignIn
    ? "https://www.yourstore.com/auth/signin"
    : isRegister
    ? "https://www.yourstore.com/auth/register"
    : "https://www.yourstore.com/auth";

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content="noindex, nofollow" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:image" content="https://www.yourstore.com/images/auth-og-image.jpg" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content="https://www.yourstore.com/images/auth-twitter-image.jpg" />
    </Helmet>
  );
};

export default AuthPageHelmet;
