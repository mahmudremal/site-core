import App from './App';
import { StrictMode } from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { PopupProvider } from './contexts/PopupContext';
import { LocaleProvider } from './contexts/LocaleContext';
import { RequestProvider } from './contexts/RequestContext';
import { OfflineProvider } from './contexts/OfflineContext';
import { SessionProvider } from './contexts/SessionContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { RecommendationProvider } from './contexts/RecommendationContext';

export default function StoreFront() {
  return (
    <StrictMode>
      <SessionProvider>
        <RequestProvider>
          <BrowserRouter>
            <PopupProvider>
              <CurrencyProvider>
                <LocaleProvider>
                  <ThemeProvider>
                    <AuthProvider>
                      <CartProvider>
                        <WishlistProvider>
                          <OfflineProvider>
                            <RecommendationProvider>
                              <Toaster />
                              <App />
                            </RecommendationProvider>
                          </OfflineProvider>
                        </WishlistProvider>
                      </CartProvider>
                    </AuthProvider>
                  </ThemeProvider>
                </LocaleProvider>
              </CurrencyProvider>
            </PopupProvider>
          </BrowserRouter>
        </RequestProvider>
      </SessionProvider>
    </StrictMode>
  )
}