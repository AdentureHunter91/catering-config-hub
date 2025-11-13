import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ContractsList from "./pages/ContractsList";
import ContractConfig from "./pages/ContractConfig";
import KitchensList from "./pages/KitchensList";
import KitchenConfig from "./pages/KitchenConfig";
import UsersList from "./pages/UsersList";
import UserConfig from "./pages/UserConfig";
import RoleConfig from "./pages/RoleConfig";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/kontrakty" element={<ContractsList />} />
          <Route path="/kontrakty/:id" element={<ContractConfig />} />
          <Route path="/kuchnie" element={<KitchensList />} />
          <Route path="/kuchnie/:id" element={<KitchenConfig />} />
          <Route path="/uzytkownicy" element={<UsersList />} />
          <Route path="/uzytkownicy/:id" element={<UserConfig />} />
          <Route path="/role/:id" element={<RoleConfig />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
