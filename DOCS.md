# Project Documentation

## Stack
- Vite
- React
- TypeScript
- PHP
- MySQL (remote)
- Tailwind CSS

## Structure
- `public/` (web root)
- `public/api/` (PHP API endpoints)
- `public/Login/` (login UI + auth endpoints)
- `src/` (React app)

## Auth
- Frontend uses `Login/me.php` and `Login/access.php` (see `src/auth/authConfig.ts`).
- Sessions are cookie-based (see `public/Login/*.php`).

## DB
- DB connection is configured in `public/api/db.php` (PDO MySQL).
- Credentials are not documented here; they come from the server config.

## API endpoints
| Endpoint | Description | Called from |
|---|---|---|
| `/api/allergens/list.php` | — | src/api/allergens.ts, src/api/products.ts, src/api/productVariants.ts, src/api/subproducts.ts |
| `/api/audit-log/list.php` | — | src/api/audit.ts |
| `/api/autosave.php` | — | — |
| `/api/bootstrap.php` | — | — |
| `/api/clientContacts/create.php` | — | src/api/clientContacts.ts |
| `/api/clientContacts/delete.php` | — | src/api/clientContacts.ts |
| `/api/clientContacts/list.php` | — | src/api/clientContacts.ts |
| `/api/clientContacts/update.php` | — | src/api/clientContacts.ts |
| `/api/clients/get.php` | — | src/api/clients.ts |
| `/api/clients/list.php` | — | src/api/clientMealTypes.ts, src/api/clients.ts, src/components/MealsPickedGlobalTable.tsx, src/components/MealsPickedGlobalTotalsTable.tsx, src/pages/MealsApproval.tsx |
| `/api/clients/list_full.php` | — | src/api/clients.ts |
| `/api/clients/mealTypes/list.php` | — | src/api/clientMealTypes.ts, src/components/MealsPickedGlobalTable.tsx, src/components/MealsPickedGlobalTotalsTable.tsx, src/pages/MealsApproval.tsx |
| `/api/clients/mealTypes/update.php` | — | src/api/clientMealTypes.ts |
| `/api/clients/save.php` | — | src/api/clients.ts |
| `/api/client_departments/add.php` | — | src/api/clientDepartments.ts |
| `/api/client_departments/delete.php` | — | src/api/clientDepartments.ts |
| `/api/client_departments/list.php` | — | src/api/clientDepartments.ts, src/components/MealsPickedGlobalTable.tsx, src/pages/MealsApproval.tsx |
| `/api/client_departments/update.php` | — | src/api/clientDepartments.ts |
| `/api/client_department_diets/add.php` | — | src/api/clientDepartmentDiets.ts |
| `/api/client_department_diets/delete.php` | — | src/api/clientDepartmentDiets.ts |
| `/api/client_department_diets/list.php` | — | src/api/clientDepartmentDiets.ts |
| `/api/client_department_diets/update.php` | — | src/api/clientDepartmentDiets.ts |
| `/api/client_diets/add.php` | — | src/api/clientDiets.ts |
| `/api/client_diets/delete.php` | — | src/api/clientDiets.ts |
| `/api/client_diets/list.php` | — | src/api/clientDiets.ts, src/components/MealsPickedGlobalTable.tsx, src/components/MealsPickedGlobalTotalsTable.tsx, src/pages/MealsApproval.tsx |
| `/api/client_diets/update.php` | — | src/api/clientDiets.ts |
| `/api/contracts/delete.php` | — | src/api/contracts.ts, src/api/kitchenPeriods.ts |
| `/api/contracts/departments/list.php` | — | src/api/clientDepartments.ts, src/api/contractDepartments.ts, src/api/departments.ts, src/components/MealsPickedGlobalTable.tsx, src/pages/MealsApproval.tsx |
| `/api/contracts/departments/update.php` | — | src/api/clientDepartments.ts, src/api/contractDepartments.ts |
| `/api/contracts/department_diet/list.php` | — | src/api/clientDepartmentDiets.ts |
| `/api/contracts/department_diet/update.php` | — | src/api/clientDepartmentDiets.ts |
| `/api/contracts/diets/list.php` | — | src/api/clientDepartmentDiets.ts, src/api/clientDiets.ts, src/api/contractDiets.ts, src/api/diets.ts, src/components/MealsPickedGlobalTable.tsx, src/components/MealsPickedGlobalTotalsTable.tsx, src/pages/MealsApproval.tsx |
| `/api/contracts/diets/update.php` | — | src/api/clientDepartmentDiets.ts, src/api/clientDiets.ts, src/api/contractDiets.ts |
| `/api/contracts/diet_meal_types/list.php` | — | src/api/contractDietMealTypes.ts |
| `/api/contracts/diet_meal_types/update.php` | — | src/api/contractDietMealTypes.ts |
| `/api/contracts/full.php` | — | src/api/clients.ts |
| `/api/contracts/get.php` | — | src/api/clients.ts, src/api/contracts.ts |
| `/api/contracts/kitchen_periods/add.php` | — | src/api/kitchenPeriods.ts |
| `/api/contracts/kitchen_periods/delete.php` | — | src/api/kitchenPeriods.ts |
| `/api/contracts/kitchen_periods/get.php` | — | — |
| `/api/contracts/kitchen_periods/list.php` | — | src/api/kitchenPeriods.ts |
| `/api/contracts/kitchen_periods/update.php` | — | src/api/kitchenPeriods.ts |
| `/api/contracts/list.php` | — | src/api/clients.ts, src/api/contractDepartments.ts, src/api/contractDietMealTypes.ts, src/api/contractDiets.ts, src/api/contractMealTypes.ts, src/api/contracts.ts, src/api/kitchenPeriods.ts, src/api/kitchensExtended.ts |
| `/api/contracts/list_kitchens.php` | — | src/api/kitchens.ts |
| `/api/contracts/meal_types/list.php` | ŁADUJEMY bootstrap Z PUBLIC_HTML, a nie z PRIVATE_HTML | src/api/contractDietMealTypes.ts, src/api/contractMealTypes.ts, src/api/mealTypes.ts, src/components/MealsPickedGlobalTable.tsx, src/components/MealsPickedGlobalTotalsTable.tsx, src/pages/MealsApproval.tsx |
| `/api/contracts/meal_types/update.php` | — | src/api/contractDietMealTypes.ts, src/api/contractMealTypes.ts |
| `/api/contracts/prices/get_contract_meal_prices.php` | — | src/pages/ContractConfig.tsx |
| `/api/contracts/prices/save_contract_meal_prices.php` | — | src/pages/ContractConfig.tsx |
| `/api/contracts/save.php` | — | src/api/clients.ts, src/api/contracts.ts |
| `/api/dashboard/map_data.php` | — | src/api/dashboardMap.ts |
| `/api/db.php` | — | — |
| `/api/departments/delete.php` | — | src/api/clientDepartments.ts, src/api/departments.ts |
| `/api/departments/get.php` | — | src/api/departments.ts |
| `/api/departments/list.php` | — | src/api/clientDepartments.ts, src/api/contractDepartments.ts, src/api/departments.ts, src/components/MealsPickedGlobalTable.tsx, src/pages/MealsApproval.tsx |
| `/api/departments/save.php` | — | src/api/departments.ts |
| `/api/diet/meals_approval/list.php` | — | src/pages/MealsApproval.tsx |
| `/api/diet/meals_approval/set_status.php` | — | src/pages/MealsApproval.tsx |
| `/api/diet/meals_table/list.php` | — | src/api/mealsPickedGlobal.ts |
| `/api/diet/meal_variants/batch.php` | — | src/components/MealsPickedGlobalTable.tsx, src/components/MealsPickedGlobalTotalsTable.tsx |
| `/api/diets/delete.php` | — | src/api/clientDepartmentDiets.ts, src/api/clientDiets.ts, src/api/diets.ts |
| `/api/diets/get.php` | — | src/api/diets.ts |
| `/api/diets/list.php` | — | src/api/clientDepartmentDiets.ts, src/api/clientDiets.ts, src/api/contractDiets.ts, src/api/diets.ts, src/components/MealsPickedGlobalTable.tsx, src/components/MealsPickedGlobalTotalsTable.tsx, src/pages/MealsApproval.tsx |
| `/api/diets/save.php` | — | src/api/diets.ts |
| `/api/kitchens/get.php` | — | src/api/kitchenDetails.ts |
| `/api/kitchens/get_all.php` | — | src/api/kitchensAll.ts |
| `/api/kitchens/list.php` | — | src/api/kitchensExtended.ts, src/components/MealsPickedGlobalTable.tsx, src/pages/MealsApproval.tsx |
| `/api/kitchens/save.php` | — | src/api/kitchenDetails.ts |
| `/api/kitchens/save_all.php` | — | src/api/kitchensAll.ts, src/api/kitchenSave.ts, src/pages/KitchenConfig.tsx |
| `/api/meal_types/delete.php` | — | src/api/mealTypes.ts |
| `/api/meal_types/get.php` | — | src/api/mealTypes.ts |
| `/api/meal_types/list.php` | — | src/api/contractDietMealTypes.ts, src/api/contractMealTypes.ts, src/api/mealTypes.ts, src/components/MealsPickedGlobalTable.tsx, src/components/MealsPickedGlobalTotalsTable.tsx, src/pages/MealsApproval.tsx |
| `/api/meal_types/save.php` | — | src/api/mealTypes.ts |
| `/api/nutrition_database/get.php` | — | src/api/nutritionDatabase.ts, src/api/products.ts, src/api/productVariants.ts, src/api/subproducts.ts |
| `/api/nutrition_database/history.php` | — | src/api/nutritionDatabase.ts |
| `/api/nutrition_database/list.php` | — | src/api/nutritionDatabase.ts, src/api/products.ts, src/api/productVariants.ts, src/api/subproducts.ts |
| `/api/nutrition_database/stats.php` | — | src/api/nutritionDatabase.ts |
| `/api/nutrition_database/upload.php` | — | src/api/nutritionDatabase.ts |
| `/api/pageAccess/delete.php` | /api/pageAccess/delete.php | src/api/pageAccess.ts |
| `/api/pageAccess/get.php` | /api/pageAccess/get.php | src/api/pageAccess.ts |
| `/api/pageAccess/list.php` | /api/pageAccess/list.php | src/api/pageAccess.ts |
| `/api/pageAccess/save.php` | /api/pageAccess/save.php | src/api/pageAccess.ts |
| `/api/permissions/create.php` | — | src/api/permissions.ts |
| `/api/permissions/delete.php` | — | src/api/permissions.ts |
| `/api/permissions/get.php` | — | src/api/permissions.ts |
| `/api/permissions/list.php` | — | src/api/permissions.ts |
| `/api/permissions/update.php` | — | src/api/permissions.ts |
| `/api/products/create.php` | — | src/api/products.ts, src/api/subproducts.ts |
| `/api/products/delete.php` | — | src/api/products.ts, src/api/subproducts.ts |
| `/api/products/get.php` | — | src/api/nutritionDatabase.ts, src/api/products.ts, src/api/subproducts.ts |
| `/api/products/list.php` | — | src/api/nutritionDatabase.ts, src/api/products.ts, src/api/subproducts.ts |
| `/api/products/update.php` | — | src/api/products.ts, src/api/subproducts.ts |
| `/api/product_categories/create.php` | — | src/api/productCategories.ts |
| `/api/product_categories/delete.php` | — | src/api/productCategories.ts |
| `/api/product_categories/list.php` | — | src/api/productCategories.ts |
| `/api/product_categories/update.php` | — | src/api/productCategories.ts |
| `/api/product_subcategories/create.php` | — | src/api/productCategories.ts |
| `/api/product_subcategories/delete.php` | — | src/api/productCategories.ts |
| `/api/product_subcategories/list.php` | — | src/api/productCategories.ts |
| `/api/product_subcategories/reorder.php` | — | src/api/productCategories.ts |
| `/api/product_subcategories/update.php` | — | src/api/productCategories.ts |
| `/api/product_variants/check_ean.php` | — | src/api/productVariants.ts |
| `/api/product_variants/create.php` | — | src/api/productVariants.ts |
| `/api/product_variants/delete.php` | — | src/api/productVariants.ts |
| `/api/product_variants/get.php` | — | src/api/productVariants.ts |
| `/api/product_variants/list.php` | — | src/api/productVariants.ts |
| `/api/product_variants/update.php` | — | src/api/productVariants.ts |
| `/api/roles/create.php` | — | src/api/roles.ts |
| `/api/roles/delete.php` | — | src/api/roles.ts |
| `/api/roles/get.php` | — | src/api/roles.ts |
| `/api/roles/list.php` | — | src/api/roles.ts |
| `/api/roles/setPermissions.php` | — | src/api/roles.ts |
| `/api/roles/update.php` | — | src/api/roles.ts |
| `/api/subproducts/create.php` | — | src/api/subproducts.ts |
| `/api/subproducts/delete.php` | — | src/api/subproducts.ts |
| `/api/subproducts/get.php` | — | src/api/subproducts.ts |
| `/api/subproducts/list.php` | — | src/api/subproducts.ts |
| `/api/subproducts/update.php` | — | src/api/subproducts.ts |
| `/api/users/create.php` | — | src/api/users.ts |
| `/api/users/delete.php` | — | src/api/users.ts |
| `/api/users/get.php` | UPEWNIJ SIĘ, ŻE MASZ TO: | src/api/users.ts |
| `/api/users/list.php` | — | src/api/users.ts |
| `/api/users/setRoles.php` | — | src/api/users.ts |
| `/api/users/update.php` | — | src/api/users.ts |

## Login endpoints
| Endpoint | Description | Called from |
|---|---|---|
| `/Login/access.php` | /Login/access.php | src/auth/authConfig.ts |
| `/Login/auth.php` | — | — |
| `/Login/index.php` | — | — |
| `/Login/login.php` | — | — |
| `/Login/logout.php` | — | src/components/Layout.tsx |
| `/Login/me.php` | /Login/me.php | src/api/auth.ts, src/auth/authConfig.ts |
| `/Login/register.php` | — | — |
| `/Login/register_submit.php` | — | — |

_Note: endpoint usage is detected heuristically from `src/` and may require manual verification._

## Dashboard map roadmap
Potential improvements for future iterations of the dashboard map:
- Geocoding + cached `lat/lng` in DB for address-level accuracy (no more city-only markers).
- Filters/layers (status, type, active vs planned, capacity ranges).
- City-level aggregation badges instead of full clustering.
- Hover highlight of connections (kitchen -> client) and quick isolate controls.
- Legend as a control panel (toggles, filters, status switches).
- Distance tools (range from kitchen to clients, nearest-kitchen highlight).
- Capacity/utilization overlays (heatmap or choropleth by area).
- Time view (snapshot by date, or simple timeline for changes).
- Quick search + auto-zoom to entity.
- Export current map view (PNG) + shareable link with filters.
