import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Book from "@/pages/book";
import Bookings from "@/pages/bookings";
import Admin from "@/pages/admin";
import AdminCraftsmen from "@/pages/admin-craftsmen";
import AdminContent from "@/pages/admin-content";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/book" component={Book} />
      <Route path="/bookings" component={Bookings} />
      <Route path="/admin" component={Admin} />
      <Route path="/admin/craftsmen" component={AdminCraftsmen} />
      <Route path="/admin/content" component={AdminContent} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
