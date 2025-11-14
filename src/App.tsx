import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ContractsList from "./pages/ContractsList";
import ContractConfig from "./pages/ContractConfig";
import ClientsList from "./pages/ClientsList";
import ClientConfig from "./pages/ClientConfig";
import KitchensList from "./pages/KitchensList";
import KitchenConfig from "./pages/KitchenConfig";
import DepartmentsList from "./pages/DepartmentsList";
import DepartmentConfig from "./pages/DepartmentConfig";
import DietsList from "./pages/DietsList";
import DietConfig from "./pages/DietConfig";
import MealTypesList from "./pages/MealTypesList";
import MealTypeConfig from "./pages/MealTypeConfig";
import UsersList from "./pages/UsersList";
import UserConfig from "./pages/UserConfig";
import RoleConfig from "./pages/RoleConfig";
import PermissionsList from "./pages/PermissionsList";
import PermissionConfig from "./pages/PermissionConfig";
import AuditLog from "./pages/AuditLog";
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
          <Route path="/klienci" element={<ClientsList />} />
          <Route path="/klienci/:id" element={<ClientConfig />} />
          <Route path="/kuchnie" element={<KitchensList />} />
          <Route path="/kuchnie/:id" element={<KitchenConfig />} />
          <Route path="/oddzialy" element={<DepartmentsList />} />
          <Route path="/oddzialy/:id" element={<DepartmentConfig />} />
          <Route path="/diety" element={<DietsList />} />
          <Route path="/diety/:id" element={<DietConfig />} />
          <Route path="/posilki" element={<MealTypesList />} />
          <Route path="/posilki/:id" element={<MealTypeConfig />} />
          <Route path="/uzytkownicy" element={<UsersList />} />
          <Route path="/uzytkownicy/:id" element={<UserConfig />} />
          <Route path="/role/:id" element={<RoleConfig />} />
          <Route path="/uprawnienia" element={<PermissionsList />} />
          <Route path="/uprawnienia/:id" element={<PermissionConfig />} />
          <Route path="/audit" element={<AuditLog />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
