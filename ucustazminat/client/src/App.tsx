import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import { lazy, Suspense } from "react";

// Lazy load dashboard pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const NewClaim = lazy(() => import("./pages/NewClaim"));
const ClaimDetail = lazy(() => import("./pages/ClaimDetail"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminClaims = lazy(() => import("./pages/admin/AdminClaims"));
const AdminClaimDetail = lazy(() => import("./pages/admin/AdminClaimDetail"));
const AdminAirlines = lazy(() => import("./pages/admin/AdminAirlines"));
const AdminStats = lazy(() => import("./pages/admin/AdminStats"));
const AdminBlog = lazy(() => import("./pages/admin/AdminBlog"));
const AdminSupport = lazy(() => import("./pages/admin/AdminSupport"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const KVKKPolicy = lazy(() => import("./pages/KVKKPolicy"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Support = lazy(() => import("./pages/Support"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
import CookieBanner from "./components/CookieBanner";

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 bg-primary animate-pulse" />
        <span className="text-lg font-medium">Yükleniyor...</span>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Switch>
        {/* Public routes */}
        <Route path="/" component={Home} />
        <Route path="/giris" component={Login} />
        <Route path="/kayit" component={Register} />
        <Route path="/sifremi-unuttum" component={ForgotPassword} />
        <Route path="/sifre-sifirla" component={ResetPassword} />
        <Route path="/email-dogrula" component={VerifyEmail} />
        
        {/* User dashboard routes */}
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/dashboard/new-claim" component={NewClaim} />
        <Route path="/dashboard/claims/:id" component={ClaimDetail} />
        <Route path="/dashboard/support" component={Support} />
        
        {/* Admin routes */}
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin/claims" component={AdminClaims} />
        <Route path="/admin/claims/:id" component={AdminClaimDetail} />
        <Route path="/admin/airlines" component={AdminAirlines} />
        <Route path="/admin/stats" component={AdminStats} />
        <Route path="/admin/blog" component={AdminBlog} />
        <Route path="/admin/support" component={AdminSupport} />
        <Route path="/admin/users" component={AdminUsers} />
        
        {/* Blog pages */}
        <Route path="/blog" component={Blog} />
        <Route path="/blog/:slug" component={BlogPost} />
        
        {/* Legal pages */}
        <Route path="/terms" component={TermsOfService} />
        <Route path="/privacy" component={PrivacyPolicy} />
        <Route path="/kvkk" component={KVKKPolicy} />
        
        {/* Fallback routes */}
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
          <CookieBanner />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
