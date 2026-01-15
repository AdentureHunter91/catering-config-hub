// src/api/nutritionDatabase.ts
import { API_BASE } from "./apiBase";

const API = `${API_BASE}/nutrition_database`;

export interface NutritionDatabaseEntry {
  id: number;
  code: string;
  name_pl: string;
  name_en: string | null;
  waste_percent: number | null;
  energy_kj: number | null;
  energy_kcal: number | null;
  energy_kj_1169: number | null;
  energy_kcal_1169: number | null;
  water: number | null;
  protein_total: number | null;
  protein_animal: number | null;
  protein_plant: number | null;
  protein_1169: number | null;
  fat: number | null;
  carbohydrates_total: number | null;
  carbohydrates_available: number | null;
  ash: number | null;
  sodium: number | null;
  salt: number | null;
  potassium: number | null;
  calcium: number | null;
  phosphorus: number | null;
  magnesium: number | null;
  iron: number | null;
  zinc: number | null;
  copper: number | null;
  manganese: number | null;
  iodine: number | null;
  vitamin_a: number | null;
  retinol: number | null;
  beta_carotene: number | null;
  vitamin_d: number | null;
  vitamin_e: number | null;
  vitamin_b1: number | null;
  vitamin_b2: number | null;
  niacin: number | null;
  vitamin_b6: number | null;
  folate: number | null;
  vitamin_b12: number | null;
  vitamin_c: number | null;
  saturated_fat: number | null;
  cholesterol: number | null;
  sugars: number | null;
  fiber: number | null;
}

export interface NutritionDatabaseStats {
  records_count: number;
  last_upload: {
    id: number;
    file_name: string;
    uploaded_by: string;
    uploaded_at: string;
    records_count: number;
    status: "success" | "error";
    error_message: string | null;
  } | null;
}

export interface NutritionDatabaseUploadHistory {
  id: number;
  file_name: string;
  uploaded_by: string;
  uploaded_at: string;
  records_count: number;
  status: "success" | "error";
  error_message: string | null;
}

export interface NutritionDatabaseUploadPayload {
  file_name: string;
  uploaded_by: string;
  records: Record<string, string | number | null>[];
}

export async function getNutritionDatabaseEntries(search?: string, limit?: number): Promise<NutritionDatabaseEntry[]> {
  let url = `${API}/list.php`;
  const params = new URLSearchParams();
  
  if (search) params.append("search", search);
  if (limit) params.append("limit", limit.toString());
  
  if (params.toString()) url += `?${params.toString()}`;
  
  const r = await fetch(url);
  const j = await r.json();
  
  if (!j.success) {
    throw new Error(j.error || "Failed to load nutrition database");
  }
  
  return j.data || [];
}

export async function getNutritionDatabaseEntry(id: number): Promise<NutritionDatabaseEntry> {
  const r = await fetch(`${API}/get.php?id=${id}`);
  const j = await r.json();
  
  if (!j.success) {
    throw new Error(j.error || "Failed to load nutrition database entry");
  }
  
  return j.data;
}

export async function getNutritionDatabaseStats(): Promise<NutritionDatabaseStats> {
  const r = await fetch(`${API}/stats.php`);
  const j = await r.json();
  
  if (!j.success) {
    throw new Error(j.error || "Failed to load stats");
  }
  
  return j.data;
}

export async function getNutritionDatabaseHistory(limit?: number): Promise<NutritionDatabaseUploadHistory[]> {
  let url = `${API}/history.php`;
  if (limit) url += `?limit=${limit}`;
  
  const r = await fetch(url);
  const j = await r.json();
  
  if (!j.success) {
    throw new Error(j.error || "Failed to load history");
  }
  
  return j.data || [];
}

export async function uploadNutritionDatabase(payload: NutritionDatabaseUploadPayload): Promise<{ inserted: number; message: string }> {
  const r = await fetch(`${API}/upload.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  
  const j = await r.json();
  
  if (!j.success) {
    throw new Error(j.error || "Failed to upload nutrition database");
  }
  
  return j.data;
}

// Column mapping from Polish XLSX headers to English field names
export const XLSX_COLUMN_MAPPING: Record<string, string> = {
  "Numer kodowy": "code",
  "Nazwa polska produktu/potrawy": "name_pl",
  "Nazwa angielska produktu/potrawy English name food products and dishes": "name_en",
  "Odpadki": "waste_percent",
  // Energy columns - they come in pairs (kJ, kcal)
  // First pair is regular, second is according to 1169/2011 regulation
  // Columns 7-8: Wartość energetyczna (kJ, kcal)
  // Columns 9-10: Wartość energetyczna wg rozp. 1169/2011 (kJ, kcal)
  "Woda": "water",
  "Białko ogółem": "protein_total",
  "Białko zwierzęce": "protein_animal",
  "Białko roślinne": "protein_plant",
  "Białko ogółem wg rozp. 1169/2011": "protein_1169",
  "Tłuszcz": "fat",
  "Węglowodany ogółem": "carbohydrates_total",
  "Węglowodany przyswajalne": "carbohydrates_available",
  "Popiół": "ash",
  "Sód": "sodium",
  "Sól": "salt",
  "Potas": "potassium",
  "Wapń": "calcium",
  "Fosfor": "phosphorus",
  "Magnez": "magnesium",
  "Żelazo": "iron",
  "Cynk": "zinc",
  "Miedź": "copper",
  "Mangan": "manganese",
  "Jod": "iodine",
  "Witamina A": "vitamin_a",
  "Retinol": "retinol",
  "b-karoten": "beta_carotene",
  "Witamina D": "vitamin_d",
  "Witamina E": "vitamin_e",
  "Tiamina": "vitamin_b1",
  "Ryboflawina": "vitamin_b2",
  "Niacyna": "niacin",
  "Witamina B6": "vitamin_b6",
  "Foliany": "folate",
  "Witamina B12": "vitamin_b12",
  "Witamina C": "vitamin_c",
  "Kwasy tłuszczowe nasycone": "saturated_fat",
  "Cholesterol": "cholesterol",
  "Błonnik pokarmowy": "fiber",
};

// Parse XLSX data row by index (based on the actual column positions from the IŻŻ file)
export function parseXLSXRow(row: (string | number | null)[]): Record<string, string | number | null> {
  // Based on the parsed document:
  // Column indices (0-based):
  // 0: Lp.
  // 1: Numer kodowy
  // 2: Nazwa polska
  // 3: Nazwa angielska
  // 4: Nazwa systematyczna
  // 5: Odpadki (%)
  // 6: Wartość energetyczna kJ
  // 7: Wartość energetyczna kcal
  // 8: Wartość energetyczna wg 1169 kJ
  // 9: Wartość energetyczna wg 1169 kcal
  // 10: Woda
  // 11: Białko ogółem
  // 12: Białko zwierzęce
  // 13: Białko roślinne
  // 14: Białko ogółem wg rozp. 1169/2011
  // 15: Tłuszcz
  // 16: Węglowodany ogółem
  // 17: Węglowodany przyswajalne
  // 18: Popiół
  // 19: Sód
  // 20: Sól
  // 21: Potas
  // 22: Wapń
  // 23: Fosfor
  // 24: Magnez
  // 25: Żelazo
  // 26: Cynk
  // 27: Miedź
  // 28: Mangan
  // 29: Jod
  // 30: Witamina A
  // 31: Retinol
  // 32: b-karoten
  // 33: Witamina D
  // 34: Witamina E
  // 35: Tiamina (B1)
  // 36: Ryboflawina (B2)
  // 37: Niacyna
  // 38: Witamina B6
  // 39: Foliany
  // 40: Witamina B12
  // 41: Witamina C
  // ... (fatty acids and amino acids follow, but we'll skip most of them)
  // Around column 66-67: Cholesterol
  // Then amino acids and sugars...
  // Near the end: Błonnik pokarmowy
  
  return {
    code: row[1] as string,
    name_pl: row[2] as string,
    name_en: row[3] as string,
    waste_percent: row[5],
    energy_kj: row[6],
    energy_kcal: row[7],
    energy_kj_1169: row[8],
    energy_kcal_1169: row[9],
    water: row[10],
    protein_total: row[11],
    protein_animal: row[12],
    protein_plant: row[13],
    protein_1169: row[14],
    fat: row[15],
    carbohydrates_total: row[16],
    carbohydrates_available: row[17],
    ash: row[18],
    sodium: row[19],
    salt: row[20],
    potassium: row[21],
    calcium: row[22],
    phosphorus: row[23],
    magnesium: row[24],
    iron: row[25],
    zinc: row[26],
    copper: row[27],
    manganese: row[28],
    iodine: row[29],
    vitamin_a: row[30],
    retinol: row[31],
    beta_carotene: row[32],
    vitamin_d: row[33],
    vitamin_e: row[34],
    vitamin_b1: row[35],
    vitamin_b2: row[36],
    niacin: row[37],
    vitamin_b6: row[38],
    folate: row[39],
    vitamin_b12: row[40],
    vitamin_c: row[41],
    // Saturated fat is at index around 53 (sum of saturated fatty acids)
    saturated_fat: row[53],
    // Cholesterol is around index 66
    cholesterol: row[66],
    // Sugars - we'll need to calculate or find. Using carbohydrates_available as proxy
    sugars: null, // Will be set separately if found
    // Fiber is near the end
    fiber: row[89], // "Błonnik pokarmowy"
  };
}
