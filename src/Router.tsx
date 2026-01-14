import React from "react";
import { Routes, Route } from "react-router-dom";

import { RequireLogin } from "./auth/RequireLogin";
import { RequireAccess } from "./auth/RequireAccess";

/* Import stron – identycznie jak w App.tsx */
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
import MealsApproval from "./pages/MealsApproval";
import ProductCategories from "./pages/ProductCategories";
import ProductsConfig from "./pages/ProductsConfig";
import NutritionDatabaseUpload from "./pages/NutritionDatabaseUpload";


export default function Router() {
    return (
        <RequireLogin>
            <Routes>

                {/* DASHBOARD */}
                <Route
                    path="/"
                    element={
                        <RequireAccess page="config.dashboard">
                            <Index />
                        </RequireAccess>
                    }
                />


                {/* KONTRAKTY */}
                <Route
                    path="/kontrakty"
                    element={
                        <RequireAccess page="config.contracts">
                            <ContractsList />
                        </RequireAccess>
                    }
                />

                <Route
                    path="/kontrakty/nowy"
                    element={
                        <RequireAccess page="config.contracts">
                            <ContractConfig isNew />
                        </RequireAccess>
                    }
                />

                <Route
                    path="/kontrakty/:id"
                    element={
                        <RequireAccess page="config.contracts">
                            <ContractConfig />
                        </RequireAccess>
                    }
                />


                {/* KLIENCI */}
                <Route
                    path="/klienci"
                    element={
                        <RequireAccess page="config.clients">
                            <ClientsList />
                        </RequireAccess>
                    }
                />

                <Route
                    path="/klienci/nowy"
                    element={
                        <RequireAccess page="config.clients">
                            <ClientConfig />
                        </RequireAccess>
                    }
                />

                <Route
                    path="/klienci/:id"
                    element={
                        <RequireAccess page="config.clients">
                            <ClientConfig />
                        </RequireAccess>
                    }
                />


                {/* KUCHNIE */}
                <Route
                    path="/kuchnie"
                    element={
                        <RequireAccess page="config.kitchens">
                            <KitchensList />
                        </RequireAccess>
                    }
                />

                <Route
                    path="/kuchnie/:id"
                    element={
                        <RequireAccess page="config.kitchens">
                            <KitchenConfig />
                        </RequireAccess>
                    }
                />


                {/* ODDZIAŁY */}
                <Route
                    path="/oddzialy"
                    element={
                        <RequireAccess page="config.departments">
                            <DepartmentsList />
                        </RequireAccess>
                    }
                />

                <Route
                    path="/oddzialy/:id"
                    element={
                        <RequireAccess page="config.departments">
                            <DepartmentConfig />
                        </RequireAccess>
                    }
                />


                {/* DIETY */}
                <Route
                    path="/diety"
                    element={
                        <RequireAccess page="config.diets">
                            <DietsList />
                        </RequireAccess>
                    }
                />

                <Route
                    path="/diety/:id"
                    element={
                        <RequireAccess page="config.diets">
                            <DietConfig />
                        </RequireAccess>
                    }
                />


                {/* POSIŁKI */}
                <Route
                    path="/posilki"
                    element={
                        <RequireAccess page="config.meal_types">
                            <MealTypesList />
                        </RequireAccess>
                    }
                />

                <Route
                    path="/posilki/:id"
                    element={
                        <RequireAccess page="config.meal_types">
                            <MealTypeConfig />
                        </RequireAccess>
                    }
                />


                {/* UŻYTKOWNICY */}
                <Route
                    path="/uzytkownicy"
                    element={
                        <RequireAccess page="config.users">
                            <UsersList />
                        </RequireAccess>
                    }
                />

                <Route
                    path="/uzytkownicy/:id"
                    element={
                        <RequireAccess page="config.users">
                            <UserConfig />
                        </RequireAccess>
                    }
                />


                {/* ROLE / PERMISJE */}
                <Route
                    path="/role/:id"
                    element={
                        <RequireAccess page="config.roles">
                            <RoleConfig />
                        </RequireAccess>
                    }
                />

                <Route
                    path="/uprawnienia"
                    element={
                        <RequireAccess page="config.permissions">
                            <PermissionsList />
                        </RequireAccess>
                    }
                />

                <Route
                    path="/uprawnienia/:id"
                    element={
                        <RequireAccess page="config.permissions">
                            <PermissionConfig />
                        </RequireAccess>
                    }
                />

                {/* Dostęp do stron */}
                <Route
                    path="/dostep-stron"
                    element={
                        <RequireAccess page="config.page_access">
                            <PageAccessList />
                        </RequireAccess>
                    }
                />

                <Route
                    path="/dostep-stron/:id"
                    element={
                        <RequireAccess page="config.page_access">
                            <PageAccessConfig />
                        </RequireAccess>
                    }
                />


                {/* AUDYT */}
                <Route
                    path="/audit"
                    element={
                        <RequireAccess page="config.audit">
                            <AuditLog />
                        </RequireAccess>
                    }
                />

                {/* PRODUKTY */}
                <Route
                    path="/settings/productCategories"
                    element={
                        <RequireAccess page="config.products">
                            <ProductCategories />
                        </RequireAccess>
                    }
                />

                <Route
                    path="/settings/products"
                    element={
                        <RequireAccess page="config.products">
                            <ProductsConfig />
                        </RequireAccess>
                    }
                />

                <Route
                    path="/settings/nutritionDatabase"
                    element={
                        <RequireAccess page="config.products">
                            <NutritionDatabaseUpload />
                        </RequireAccess>
                    }
                />


                {/* 404 */}
                <Route path="*" element={<NotFound />} />

                {/* --- DIETETYKA ---*/}
                {/* Przegląd i akceptacja posiłków */}
                <Route
                    path="/dietetyka/akceptacja-posilkow"
                    element={
                        <MealsApproval />
                    }
                />


            </Routes>
        </RequireLogin>
    );
}
