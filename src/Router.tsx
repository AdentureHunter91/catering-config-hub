import React from "react";
import { Routes, Route } from "react-router-dom";

import { RequireLogin } from "./auth/RequireLogin";
import { RequireAccess } from "./auth/RequireAccess";

/* Import stron */
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";

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
import NotificationsConfig from "./pages/NotificationsConfig";
import NotificationsHistory from "./pages/NotificationsHistory";


export default function Router() {
    return (
        <Routes>
            {/* LANDING PAGE - publiczna, bez logowania */}
            <Route path="/" element={<LandingPage />} />

            {/* WSZYSTKO PONIŻEJ WYMAGA LOGOWANIA */}
            <Route
                path="/dashboard"
                element={
                    <RequireLogin>
                        <RequireAccess page="config.dashboard">
                            <Dashboard />
                        </RequireAccess>
                    </RequireLogin>
                }
            />

            {/* KONTRAKTY */}
            <Route
                path="/kontrakty"
                element={
                    <RequireLogin>
                        <RequireAccess page="config.contracts">
                            <ContractsList />
                        </RequireAccess>
                    </RequireLogin>
                }
            />

            <Route
                path="/kontrakty/nowy"
                element={
                    <RequireLogin>
                        <RequireAccess page="config.contracts">
                            <ContractConfig isNew />
                        </RequireAccess>
                    </RequireLogin>
                }
            />

            <Route
                path="/kontrakty/:id"
                element={
                    <RequireLogin>
                        <RequireAccess page="config.contracts">
                            <ContractConfig />
                        </RequireAccess>
                    </RequireLogin>
                }
            />


            {/* KLIENCI */}
            <Route
                path="/klienci"
                element={
                    <RequireLogin>
                        <RequireAccess page="config.clients">
                            <ClientsList />
                        </RequireAccess>
                    </RequireLogin>
                }
            />

            <Route
                path="/klienci/nowy"
                element={
                    <RequireLogin>
                        <RequireAccess page="config.clients">
                            <ClientConfig />
                        </RequireAccess>
                    </RequireLogin>
                }
            />

            <Route
                path="/klienci/:id"
                element={
                    <RequireLogin>
                        <RequireAccess page="config.clients">
                            <ClientConfig />
                        </RequireAccess>
                    </RequireLogin>
                }
            />


            {/* KUCHNIE */}
            <Route
                path="/kuchnie"
                element={
                    <RequireLogin>
                        <RequireAccess page="config.kitchens">
                            <KitchensList />
                        </RequireAccess>
                    </RequireLogin>
                }
            />

            <Route
                path="/kuchnie/:id"
                element={
                    <RequireLogin>
                        <RequireAccess page="config.kitchens">
                            <KitchenConfig />
                        </RequireAccess>
                    </RequireLogin>
                }
            />


            {/* ODDZIAŁY */}
            <Route
                path="/oddzialy"
                element={
                    <RequireLogin>
                        <RequireAccess page="config.departments">
                            <DepartmentsList />
                        </RequireAccess>
                    </RequireLogin>
                }
            />

            <Route
                path="/oddzialy/:id"
                element={
                    <RequireLogin>
                        <RequireAccess page="config.departments">
                            <DepartmentConfig />
                        </RequireAccess>
                    </RequireLogin>
                }
            />


            {/* DIETY */}
            <Route
                path="/diety"
                element={
                    <RequireLogin>
                        <RequireAccess page="config.diets">
                            <DietsList />
                        </RequireAccess>
                    </RequireLogin>
                }
            />

            <Route
                path="/diety/:id"
                element={
                    <RequireLogin>
                        <RequireAccess page="config.diets">
                            <DietConfig />
                        </RequireAccess>
                    </RequireLogin>
                }
            />


            {/* POSIŁKI */}
            <Route
                path="/posilki"
                element={
                    <RequireLogin>
                        <RequireAccess page="config.meal_types">
                            <MealTypesList />
                        </RequireAccess>
                    </RequireLogin>
                }
            />

            <Route
                path="/posilki/:id"
                element={
                    <RequireLogin>
                        <RequireAccess page="config.meal_types">
                            <MealTypeConfig />
                        </RequireAccess>
                    </RequireLogin>
                }
            />


            {/* UŻYTKOWNICY */}
            <Route
                path="/uzytkownicy"
                element={
                    <RequireLogin>
                        <RequireAccess page="config.users">
                            <UsersList />
                        </RequireAccess>
                    </RequireLogin>
                }
            />

            <Route
                path="/uzytkownicy/:id"
                element={
                    <RequireLogin>
                        <RequireAccess page="config.users">
                            <UserConfig />
                        </RequireAccess>
                    </RequireLogin>
                }
            />


            {/* ROLE / PERMISJE */}
            <Route
                path="/role/:id"
                element={
                    <RequireLogin>
                        <RequireAccess page="config.roles">
                            <RoleConfig />
                        </RequireAccess>
                    </RequireLogin>
                }
            />

            <Route
                path="/uprawnienia"
                element={
                    <RequireLogin>
                        <RequireAccess page="config.permissions">
                            <PermissionsList />
                        </RequireAccess>
                    </RequireLogin>
                }
            />

            <Route
                path="/uprawnienia/:id"
                element={
                    <RequireLogin>
                        <RequireAccess page="config.permissions">
                            <PermissionConfig />
                        </RequireAccess>
                    </RequireLogin>
                }
            />

            {/* Dostęp do stron */}
            <Route
                path="/dostep-stron"
                element={
                    <RequireLogin>
                        <RequireAccess page="config.page_access">
                            <PageAccessList />
                        </RequireAccess>
                    </RequireLogin>
                }
            />

            <Route
                path="/dostep-stron/:id"
                element={
                    <RequireLogin>
                        <RequireAccess page="config.page_access">
                            <PageAccessConfig />
                        </RequireAccess>
                    </RequireLogin>
                }
            />


            {/* AUDYT */}
            <Route
                path="/audit"
                element={
                    <RequireLogin>
                        <RequireAccess page="config.audit">
                            <AuditLog />
                        </RequireAccess>
                    </RequireLogin>
                }
            />

            {/* PRODUKTY */}
            <Route
                path="/settings/productCategories"
                element={
                    <RequireLogin>
                        <RequireAccess page="config.products">
                            <ProductCategories />
                        </RequireAccess>
                    </RequireLogin>
                }
            />

            <Route
                path="/settings/products"
                element={
                    <RequireLogin>
                        <RequireAccess page="config.products">
                            <ProductsConfig />
                        </RequireAccess>
                    </RequireLogin>
                }
            />

            <Route
                path="/settings/nutritionDatabase"
                element={
                    <RequireLogin>
                        <RequireAccess page="config.products">
                            <NutritionDatabaseUpload />
                        </RequireAccess>
                    </RequireLogin>
                }
            />
            <Route
                path="/settings/notifications"
                element={
                    <RequireLogin>
                        <RequireAccess page="config.page_access">
                            <NotificationsConfig />
                        </RequireAccess>
                    </RequireLogin>
                }
            />
            <Route
                path="/settings/notifications-history"
                element={
                    <RequireLogin>
                        <RequireAccess page="config.page_access">
                            <NotificationsHistory />
                        </RequireAccess>
                    </RequireLogin>
                }
            />


            {/* --- DIETETYKA ---*/}
            {/* Przegląd i akceptacja posiłków */}
            <Route
                path="/dietetyka/akceptacja-posilkow"
                element={
                    <RequireLogin>
                        <MealsApproval />
                    </RequireLogin>
                }
            />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}
