import { Switch, Route, useLocation } from "wouter";
import { useEffect, useRef } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { StoreProvider } from "@/lib/store-context";
import { CurrencyProvider } from "@/lib/currency-context";
import { BrandingProvider } from "@/lib/branding-context";
import Home from "@/pages/Home";
import Products from "@/pages/Products";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import OrderSuccess from "@/pages/OrderSuccess";
import Admin from "@/pages/Admin";
import Wishlist from "@/pages/Wishlist";
import Account from "@/pages/Account";
import BlogList from "@/pages/BlogList";
import BlogPost from "@/pages/BlogPost";
import LandingPage from "@/pages/LandingPage";
import DynamicLandingPage from "@/pages/DynamicLandingPage";
import NotFound from "@/pages/not-found";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { apiFetch } from "@/lib/api";

const queryClient = new QueryClient();

function PixelInjector() {
  const injectedFb = useRef(false);
  const injectedTt = useRef(false);

  useEffect(() => {
    apiFetch<{ facebookPixelId?: string; tiktokPixelId?: string }>(
      "/api/settings",
      { auth: false },
    )
      .then((data: { facebookPixelId?: string; tiktokPixelId?: string }) => {
        const fbId = data.facebookPixelId?.trim();
        const ttId = data.tiktokPixelId?.trim();

        if (fbId && !injectedFb.current) {
          injectedFb.current = true;
          const script = document.createElement("script");
          script.innerHTML = `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${fbId}');
            fbq('track', 'PageView');
          `;
          document.head.appendChild(script);
        }

        if (ttId && !injectedTt.current) {
          injectedTt.current = true;
          const script = document.createElement("script");
          script.innerHTML = `
            !function (w, d, t) {
              w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
              ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],
              ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
              for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
              ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
              ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript";n.async=!0;n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
              ttq.load('${ttId}');
              ttq.page();
            }(window, document, 'ttq');
          `;
          document.head.appendChild(script);
        }
      })
      .catch(() => {});
  }, []);

  return null;
}

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}

function WithLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col w-full">
      <Navbar />
      <AnnouncementBar />
      <main className="flex-1 min-w-0">{children}</main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrandingProvider>
      <CurrencyProvider>
      <StoreProvider>
        <TooltipProvider>
          <PixelInjector />
          <ScrollToTop />
          <Switch>
            {/* ── Admin-managed landing pages (DB-backed) — NO Navbar/Footer ── */}
            <Route path="/offer/:slug" component={DynamicLandingPage} />
            {/* ── Legacy product landing pages ── */}
            <Route path="/offer/product/:id">
              {() => <LandingPage />}
            </Route>

            <Route path="/admin" component={Admin} />
            <Route path="/products/:slug">
              {(params) => (
                <WithLayout><ProductDetail /></WithLayout>
              )}
            </Route>
            <Route path="/products">
              <WithLayout><Products /></WithLayout>
            </Route>
            <Route path="/cart">
              <WithLayout><Cart /></WithLayout>
            </Route>
            <Route path="/checkout">
              <WithLayout><Checkout /></WithLayout>
            </Route>
            <Route path="/order-success">
              <WithLayout><OrderSuccess /></WithLayout>
            </Route>
            <Route path="/wishlist">
              <WithLayout><Wishlist /></WithLayout>
            </Route>
            <Route path="/account">
              <WithLayout><Account /></WithLayout>
            </Route>
            <Route path="/blog/:slug">
              {(params) => (
                <WithLayout><BlogPost /></WithLayout>
              )}
            </Route>
            <Route path="/blog">
              <WithLayout><BlogList /></WithLayout>
            </Route>
            <Route path="/">
              <WithLayout><Home /></WithLayout>
            </Route>
            <Route>
              <WithLayout><NotFound /></WithLayout>
            </Route>
          </Switch>
          <Toaster />
          <SonnerToaster position="top-center" richColors />
        </TooltipProvider>
      </StoreProvider>
      </CurrencyProvider>
      </BrandingProvider>
    </QueryClientProvider>
  );
}

export default App;
