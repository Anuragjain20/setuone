import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { CityProvider } from "@/context/CityContext";
import { AdminGuard } from "@/components/admin-guard";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import CityLanding from "@/pages/city-landing";
import Book from "@/pages/book";
import Bookings from "@/pages/bookings";
import Admin from "@/pages/admin";
import AdminCraftsmen from "@/pages/admin-craftsmen";
import AdminContent from "@/pages/admin-content";
import AdminNotifications from "@/pages/admin-notifications";
import AdminBookings from "@/pages/admin-bookings";
import AdminApplications from "@/pages/admin-applications";
import AdminCustomers from "@/pages/admin-customers";
import AdminAnalytics from "@/pages/admin-analytics";
import Join from "@/pages/join";
import CraftsmanPortal from "@/pages/craftsman-portal";
import Invoice from "@/pages/invoice";
import Terms from "@/pages/terms";
import Privacy from "@/pages/privacy";
import Refund from "@/pages/refund";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/city/:slug" component={CityLanding} />
      <Route path="/book" component={Book} />
      <Route path="/bookings" component={Bookings} />
      <Route path="/bookings/:id/invoice" component={Invoice} />
      <Route path="/admin" component={Admin} />
      <Route path="/admin/bookings" component={AdminBookings} />
      <Route path="/admin/applications" component={AdminApplications} />
      <Route path="/admin/craftsmen" component={AdminCraftsmen} />
      <Route path="/admin/customers" component={AdminCustomers} />
      <Route path="/admin/analytics" component={AdminAnalytics} />
      <Route path="/admin/content" component={AdminContent} />
      <Route path="/admin/notifications" component={AdminNotifications} />
      <Route path="/join" component={Join} />
      <Route path="/craftsman" component={CraftsmanPortal} />
      <Route path="/terms" component={Terms} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/refund" component={Refund} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CityProvider>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <AdminGuard>
                <Router />
              </AdminGuard>
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </CityProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
