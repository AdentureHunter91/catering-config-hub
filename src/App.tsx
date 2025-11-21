import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";

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
import PageAccessList from "./pages/PageAccessList";
import PageAccessConfig from "./pages/PageAccessConfig";
import AuditLog from "./pages/AuditLog";
import NotFound from "./pages/NotFound";

import { AccessProvider } from "./auth/AccessContext";
import Router from "./Router";

const queryClient = new QueryClient();

const App = () => (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        {/** Aplikacja działa w /Config więc basename musi zostać */}
        <BrowserRouter basename="/Config">

          {/** AccessProvider musi otaczać cały Router */}
          <AccessProvider>
            <Router
                pages={{
                  Index,
                  ContractsList,
                  ContractConfig,
                  ClientsList,
                  ClientConfig,
                  KitchensList,
                  KitchenConfig,
                  DepartmentsList,
                  DepartmentConfig,
                  DietsList,
                  DietConfig,
                  MealTypesList,
                  MealTypeConfig,
                  UsersList,
                  UserConfig,
                  RoleConfig,
                  PermissionsList,
                  PermissionConfig,
                  PageAccessList,
                  PageAccessConfig,
                  AuditLog,
                  NotFound
                }}
            />
          </AccessProvider>

        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
);

export default App;
