import { DietPlan, MealSlot, NutritionGoal, DietExclusion, DietSubstitution, DietClientAssignment } from "@/types/dietPlan";

const baseMeals: MealSlot[] = [
  { id: "m1", name: "Śniadanie", timeFrom: "06:00", timeTo: "08:00", defaultPortionGrams: "350g", type: "Gorący/Zimny", itemCount: "3-5 elementów", sortOrder: 1, inherited: false, overridden: false },
  { id: "m2", name: "II Śniadanie", timeFrom: "09:30", timeTo: "10:30", defaultPortionGrams: "150g", type: "Zimny", itemCount: "1-2 elementów", sortOrder: 2, inherited: false, overridden: false },
  { id: "m3", name: "Obiad", timeFrom: "11:30", timeTo: "13:30", defaultPortionGrams: "Zupa 250ml + Gł. 300g + Dod. 150g", type: "Gorący", itemCount: "3 kursy", sortOrder: 3, inherited: false, overridden: false },
  { id: "m4", name: "Podwieczorek", timeFrom: "15:00", timeTo: "16:00", defaultPortionGrams: "150g", type: "Zimny", itemCount: "1-2 elementów", sortOrder: 4, inherited: false, overridden: false },
  { id: "m5", name: "Kolacja", timeFrom: "17:00", timeTo: "19:00", defaultPortionGrams: "300g", type: "Gorący/Zimny", itemCount: "2-3 kursy", sortOrder: 5, inherited: false, overridden: false },
];

const baseGoals: NutritionGoal[] = [
  { nutrient: "Kcal", unit: "kcal", min: 1800, max: 2200, pctKcal: "—", source: "inherited" },
  { nutrient: "Białko", unit: "g", min: 45, max: 65, pctKcal: "15-20%", source: "inherited" },
  { nutrient: "Tłuszcz", unit: "g", min: 50, max: 75, pctKcal: "25-35%", source: "inherited" },
  { nutrient: "Węglowodany", unit: "g", min: 225, max: 310, pctKcal: "50-60%", source: "inherited" },
  { nutrient: "Błonnik", unit: "g", min: 25, max: null, pctKcal: "—", source: "inherited" },
  { nutrient: "Sód", unit: "mg", min: null, max: 2300, pctKcal: "—", source: "inherited" },
];

const inheritedMeals = (overrideIds: string[] = []): MealSlot[] =>
  baseMeals.map((m) => ({ ...m, inherited: true, overridden: overrideIds.includes(m.id) }));

const inheritedGoals = (overrides: Record<string, Partial<NutritionGoal>> = {}): NutritionGoal[] =>
  baseGoals.map((g) => overrides[g.nutrient] ? { ...g, ...overrides[g.nutrient], source: "overridden" as const } : g);

export const MOCK_DIET_PLANS: DietPlan[] = [
  {
    id: 1, name: "Dieta Podstawowa", code: "STANDARD", type: "base", baseDietId: null, baseDietName: null, baseDietCode: null,
    icon: "📋", status: "active", kcalTarget: 2000, exclusionsSummary: "—", clientCount: 8,
    mealSlots: baseMeals, nutritionGoals: baseGoals,
    exclusions: [],
    substitutions: [],
    clients: [
      { clientId: 1, clientName: "Szpital Miejski", assigned: true, dateFrom: "2025-01-01", dateTo: "", notes: "" },
      { clientId: 2, clientName: "Szkoła Podstawowa nr 5", assigned: true, dateFrom: "2025-01-01", dateTo: "", notes: "" },
      { clientId: 3, clientName: "DPS Słoneczny", assigned: true, dateFrom: "2025-03-01", dateTo: "", notes: "" },
    ],
    description: "Dieta standardowa, zbilansowana, przeznaczona dla osób dorosłych bez specjalnych wymagań żywieniowych.",
    derivedDietIds: [2, 3, 4, 5, 6, 7, 8, 9],
    createdAt: "2024-06-01", updatedAt: "2025-09-01",
  },
  {
    id: 2, name: "Dieta Bezglutenowa", code: "GF", type: "derived", baseDietId: 1, baseDietName: "Dieta Podstawowa", baseDietCode: "STANDARD",
    icon: "🥗", status: "active", kcalTarget: 2000, exclusionsSummary: "Gluten", clientCount: 6,
    mealSlots: inheritedMeals(), nutritionGoals: inheritedGoals(),
    exclusions: [
      { id: "ex1", category: "allergen", name: "Gluten", active: true, reason: "Celiakia / nietolerancja glutenu", fromBase: false },
    ],
    substitutions: [
      { id: "sub1", menuElement: "Dodatek obiadu", original: "Bułka pszenna", replacement: "Bułka bezglutenowa", changeType: "Wyłączenie alergenu", appliesTo: ["GF", "DF"] },
      { id: "sub2", menuElement: "Obiad", original: "Makaron penne", replacement: "Makaron GF ryżowy", changeType: "Wyłączenie alergenu", appliesTo: ["GF"] },
      { id: "sub3", menuElement: "Śniadanie", original: "Chleb pszenny", replacement: "Chleb bezglutenowy", changeType: "Wyłączenie alergenu", appliesTo: ["GF"] },
      { id: "sub4", menuElement: "Podwieczorek", original: "Herbatniki", replacement: "Herbatniki GF", changeType: "Wyłączenie alergenu", appliesTo: ["GF"] },
    ],
    clients: [
      { clientId: 1, clientName: "Szpital Miejski", assigned: true, dateFrom: "2025-01-01", dateTo: "", notes: "Oddział gastro" },
      { clientId: 4, clientName: "Przedszkole Bajka", assigned: true, dateFrom: "2025-02-01", dateTo: "", notes: "" },
    ],
    description: "Dieta bezglutenowa, pochodna od Diety Podstawowej. Wyklucza produkty zawierające gluten.",
    derivedDietIds: [],
    createdAt: "2024-08-01", updatedAt: "2025-09-05",
  },
  {
    id: 3, name: "Dieta Cukrzycowa", code: "DIABETIC", type: "derived", baseDietId: 1, baseDietName: "Dieta Podstawowa", baseDietCode: "STANDARD",
    icon: "💊", status: "active", kcalTarget: 1800, exclusionsSummary: "Niski IG", clientCount: 5,
    mealSlots: inheritedMeals(), nutritionGoals: inheritedGoals({ Kcal: { min: 1600, max: 1800, source: "overridden" }, Węglowodany: { min: 180, max: 250, pctKcal: "45-55%", source: "overridden" } }),
    exclusions: [
      { id: "ex2", category: "dish_category", name: "Bez potraw o wysokim IG", active: true, reason: "Kontrola glikemii", fromBase: false },
    ],
    substitutions: [
      { id: "sub5", menuElement: "Deser", original: "Budyń waniliowy", replacement: "Galaretka bez cukru", changeType: "Ograniczenie IG", appliesTo: ["DIABETIC"] },
      { id: "sub6", menuElement: "Śniadanie", original: "Bułka pszenna", replacement: "Chleb razowy", changeType: "Niski IG", appliesTo: ["DIABETIC"] },
    ],
    clients: [
      { clientId: 1, clientName: "Szpital Miejski", assigned: true, dateFrom: "2025-01-01", dateTo: "", notes: "Oddział wew." },
    ],
    description: "Dieta cukrzycowa z ograniczonym indeksem glikemicznym. Pochodna od Diety Podstawowej.",
    derivedDietIds: [],
    createdAt: "2024-09-01", updatedAt: "2025-08-20",
  },
  {
    id: 4, name: "Dieta Renalna", code: "RENAL", type: "derived", baseDietId: 1, baseDietName: "Dieta Podstawowa", baseDietCode: "STANDARD",
    icon: "🫘", status: "active", kcalTarget: 1800, exclusionsSummary: "Niski Na/K", clientCount: 3,
    mealSlots: inheritedMeals(), nutritionGoals: inheritedGoals({ Kcal: { min: 1600, max: 1800, source: "overridden" }, Sód: { max: 1500, source: "overridden" } }),
    exclusions: [
      { id: "ex3", category: "ingredient", name: "Produkty wysokosodowe", active: true, reason: "Niewydolność nerek", fromBase: false },
      { id: "ex4", category: "ingredient", name: "Produkty bogate w potas", active: true, reason: "Kontrola K+", fromBase: false },
    ],
    substitutions: [
      { id: "sub7", menuElement: "Obiad", original: "Zupa pomidorowa", replacement: "Zupa krem z dyni (niskosodowa)", changeType: "Limit Na", appliesTo: ["RENAL"] },
    ],
    clients: [
      { clientId: 1, clientName: "Szpital Miejski", assigned: true, dateFrom: "2025-04-01", dateTo: "", notes: "Oddział nefro" },
    ],
    description: "Dieta renalna z ograniczeniem sodu i potasu.",
    derivedDietIds: [],
    createdAt: "2025-01-01", updatedAt: "2025-07-15",
  },
  {
    id: 5, name: "Bez mleczarstwa", code: "DF", type: "derived", baseDietId: 1, baseDietName: "Dieta Podstawowa", baseDietCode: "STANDARD",
    icon: "🥛", status: "active", kcalTarget: 2000, exclusionsSummary: "Laktoza", clientCount: 4,
    mealSlots: inheritedMeals(), nutritionGoals: inheritedGoals(),
    exclusions: [
      { id: "ex5", category: "allergen", name: "Laktoza", active: true, reason: "Nietolerancja laktozy", fromBase: false },
    ],
    substitutions: [
      { id: "sub8", menuElement: "Śniadanie", original: "Masło", replacement: "Margaryna", changeType: "Wyłączenie alergenu", appliesTo: ["DF"] },
      { id: "sub9", menuElement: "Deser", original: "Budyń mleczny", replacement: "Budyń sojowy", changeType: "Wyłączenie alergenu", appliesTo: ["DF"] },
      { id: "sub10", menuElement: "Podwieczorek", original: "Jogurt naturalny", replacement: "Mus owocowy", changeType: "Wyłączenie alergenu", appliesTo: ["DF", "VEG"] },
      { id: "sub11", menuElement: "Obiad", original: "Sos śmietanowy", replacement: "Sos warzywny", changeType: "Wyłączenie alergenu", appliesTo: ["DF"] },
      { id: "sub12", menuElement: "Śniadanie", original: "Ser żółty", replacement: "Pasta z awokado", changeType: "Wyłączenie alergenu", appliesTo: ["DF"] },
      { id: "sub13", menuElement: "Kolacja", original: "Twaróg", replacement: "Hummus", changeType: "Wyłączenie alergenu", appliesTo: ["DF"] },
    ],
    clients: [],
    description: "Dieta bez produktów mleczarskich.",
    derivedDietIds: [],
    createdAt: "2025-02-01", updatedAt: "2025-08-10",
  },
  {
    id: 6, name: "Wegetariańska", code: "VEG", type: "derived", baseDietId: 1, baseDietName: "Dieta Podstawowa", baseDietCode: "STANDARD",
    icon: "🍃", status: "active", kcalTarget: 2000, exclusionsSummary: "Mięso", clientCount: 3,
    mealSlots: inheritedMeals(), nutritionGoals: inheritedGoals({ Białko: { min: 40, max: 60, pctKcal: "12-18%", source: "overridden" } }),
    exclusions: [
      { id: "ex6", category: "ingredient", name: "Mięso i drób", active: true, reason: "Dieta wegetariańska", fromBase: false },
      { id: "ex7", category: "ingredient", name: "Ryby", active: true, reason: "Dieta wegetariańska", fromBase: false },
    ],
    substitutions: [
      { id: "sub14", menuElement: "Obiad", original: "Pierś z kurczaka", replacement: "Kotlet z soczewicy", changeType: "Zamiennik białka", appliesTo: ["VEG"] },
      { id: "sub15", menuElement: "Kolacja", original: "Polędwica drobiowa", replacement: "Tofu marynowane", changeType: "Zamiennik białka", appliesTo: ["VEG"] },
    ],
    clients: [],
    description: "Dieta wegetariańska z odpowiednimi zamiennikami białka.",
    derivedDietIds: [],
    createdAt: "2025-03-01", updatedAt: "2025-07-20",
  },
  {
    id: 7, name: "Dieta miękka", code: "SOFT", type: "derived", baseDietId: 1, baseDietName: "Dieta Podstawowa", baseDietCode: "STANDARD",
    icon: "🧈", status: "active", kcalTarget: 2000, exclusionsSummary: "Tekstura", clientCount: 2,
    mealSlots: inheritedMeals(), nutritionGoals: inheritedGoals(),
    exclusions: [
      { id: "ex8", category: "dish_category", name: "Bez potraw twardych/chrupkich", active: true, reason: "Zaburzenia żucia/połykania", fromBase: false },
    ],
    substitutions: [],
    clients: [],
    description: "Dieta miękka — zmieniona tekstura potraw, te same składniki co w bazowej.",
    derivedDietIds: [],
    createdAt: "2025-04-01", updatedAt: "2025-06-15",
  },
  {
    id: 8, name: "Pediatryczna", code: "PED", type: "derived", baseDietId: 1, baseDietName: "Dieta Podstawowa", baseDietCode: "STANDARD",
    icon: "🧒", status: "active", kcalTarget: 1200, exclusionsSummary: "60% porcji", clientCount: 4,
    mealSlots: inheritedMeals(), nutritionGoals: inheritedGoals({ Kcal: { min: 1000, max: 1400, source: "overridden" }, Białko: { min: 30, max: 45, pctKcal: "12-18%", source: "overridden" } }),
    exclusions: [
      { id: "ex9", category: "dish_category", name: "Bez potraw ostro przyprawionych", active: true, reason: "Dieta pediatryczna", fromBase: false },
    ],
    substitutions: [
      { id: "sub16", menuElement: "Dodatek obiadu", original: "Surówka z kapusty", replacement: "Surówka z marchewki", changeType: "Preferencja klienta", appliesTo: ["PED"] },
    ],
    clients: [
      { clientId: 2, clientName: "Szkoła Podstawowa nr 5", assigned: true, dateFrom: "2025-01-01", dateTo: "", notes: "" },
      { clientId: 4, clientName: "Przedszkole Bajka", assigned: true, dateFrom: "2025-01-01", dateTo: "", notes: "" },
    ],
    description: "Dieta pediatryczna — 60% porcji standardowej, dostosowane cele kaloryczne.",
    derivedDietIds: [],
    createdAt: "2025-01-15", updatedAt: "2025-09-01",
  },
  {
    id: 9, name: "Płynna", code: "LIQUID", type: "derived", baseDietId: 1, baseDietName: "Dieta Podstawowa", baseDietCode: "STANDARD",
    icon: "💧", status: "draft", kcalTarget: 1500, exclusionsSummary: "Tylko płyny", clientCount: 1,
    mealSlots: inheritedMeals(["m1", "m3", "m5"]),
    nutritionGoals: inheritedGoals({ Kcal: { min: 1200, max: 1600, source: "overridden" } }),
    exclusions: [
      { id: "ex10", category: "dish_category", name: "Tylko zupy i koktajle", active: true, reason: "Dieta płynna pooperacyjna", fromBase: false },
    ],
    substitutions: [],
    clients: [
      { clientId: 1, clientName: "Szpital Miejski", assigned: true, dateFrom: "2025-06-01", dateTo: "2025-12-31", notes: "Oddział chirurgii" },
    ],
    description: "Dieta płynna — tylko zupy, koktajle, napoje. Inna struktura posiłków.",
    derivedDietIds: [],
    createdAt: "2025-06-01", updatedAt: "2025-08-30",
  },
];
