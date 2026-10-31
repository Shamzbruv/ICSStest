import { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
// Add page imports here
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';

const Home = lazy(() => import('@/pages/Home'));
const Contestants = lazy(() => import('@/pages/Contestants'));
const ContestantDetail = lazy(() => import('@/pages/ContestantDetail'));
const TokenStore = lazy(() => import('@/pages/TokenStore'));
const Battles = lazy(() => import('@/pages/Battles'));
const BattleLeaderboard = lazy(() => import('@/pages/BattleLeaderboard'));
const Leaderboard = lazy(() => import('@/pages/Leaderboard'));
const Parishes = lazy(() => import('@/pages/Parishes'));
const ContestantCompare = lazy(() => import('@/pages/ContestantCompare'));
const LiveStream = lazy(() => import('@/pages/LiveStream'));
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
const ContestantPortal = lazy(() => import('@/pages/ContestantPortal'));
const JudgePortal = lazy(() => import('@/pages/JudgePortal'));
const Judges = lazy(() => import('@/pages/Judges'));
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));

const PageSpinner = () => (
  <div className="fixed inset-0 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
  </div>
);

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Suspense fallback={<PageSpinner />}>
    <Routes>
      {/* Add your page Route elements here */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/contestants" element={<Contestants />} />
        <Route path="/contestant/:id" element={<ContestantDetail />} />
        <Route path="/battles" element={<Battles />} />
        <Route path="/battle-leaderboard" element={<BattleLeaderboard />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/parishes" element={<Parishes />} />
        <Route path="/compare" element={<ContestantCompare />} />
        <Route path="/tokens" element={<TokenStore />} />
        <Route path="/live" element={<LiveStream />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/judge" element={<JudgePortal />} />
        <Route path="/judges" element={<Judges />} />
        <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
          <Route path="/contestant-portal" element={<ContestantPortal />} />
        </Route>
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
    </Suspense>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App