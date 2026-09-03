import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { ImportedSite } from '@/pages/ImportedSite';
import AdminPage from '@/pages/admin/AdminPage';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/admin/resources/:resource" component={AdminPage} />
        <Route path="/admin" component={AdminPage} />
        <Route path="/about" component={ImportedSite} />
        <Route path="/services" component={ImportedSite} />
        <Route path="/products" component={ImportedSite} />
        <Route path="/products/:slug" component={ImportedSite} />
        <Route path="/industries" component={ImportedSite} />
        <Route path="/careers" component={ImportedSite} />
        <Route path="/blog" component={ImportedSite} />
        <Route path="/blog/:slug" component={ImportedSite} />
        <Route path="/contact" component={ImportedSite} />
        <Route path="/" component={ImportedSite} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
