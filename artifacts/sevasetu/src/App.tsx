import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Book from "@/pages/book";
import Bookings from "@/pages/bookings";
import Admin from "@/pages/admin";
import AdminCraftsmen from "@/pages/admin-craftsmen";
import AdminContent from "@/pages/admin-content";
import AdminNotifications from "@/pages/admin-notifications";
import Join from "@/pages/join";
import CraftsmanPortal from "@/pages/craftsman-portal";
import Invoice from "@/pages/invoice";
import Pay from "@/pages/pay";
import Terms from "@/pages/terms";
import Privacy from "@/pages/privacy";
import Refund from "@/pages/refund";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/book" component={Book} />
      <Route path="/bookings" component={Bookings} />
      <Route path="/bookings/:id/invoice" component={Invoice} />
      <Route path="/bookings/:id/pay" component={Pay} />
      <Route path="/admin" component={Admin} />
      <Route path="/admin/craftsmen" component={AdminCraftsmen} />
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
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
