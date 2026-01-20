import { useState, useMemo, useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Marker, Polyline, Popup, useMap } from "react-leaflet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
    Building2, 
    ChefHat, 
    Users, 
    BedDouble, 
    FileText,
    ExternalLink,
    MapPin,
    TrendingUp,
    Percent
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { ClientMapData, KitchenMapData } from "@/api/dashboardMap";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Polish cities coordinates (approximate centers)
const CITY_COORDINATES: Record<string, [number, number]> = {
    "Warszawa": [52.2297, 21.0122],
    "Kraków": [50.0647, 19.9450],
    "Łódź": [51.7592, 19.4560],
    "Wrocław": [51.1079, 17.0385],
    "Poznań": [52.4064, 16.9252],
    "Gdańsk": [54.3520, 18.6466],
    "Szczecin": [53.4285, 14.5528],
    "Bydgoszcz": [53.1235, 18.0084],
    "Lublin": [51.2465, 22.5684],
    "Białystok": [53.1325, 23.1688],
    "Katowice": [50.2649, 19.0238],
    "Gdynia": [54.5189, 18.5305],
    "Częstochowa": [50.8118, 19.1203],
    "Radom": [51.4027, 21.1471],
    "Sosnowiec": [50.2863, 19.1042],
    "Toruń": [53.0138, 18.5984],
    "Kielce": [50.8661, 20.6286],
    "Rzeszów": [50.0412, 21.9991],
    "Gliwice": [50.2945, 18.6714],
    "Zabrze": [50.3249, 18.7857],
    "Olsztyn": [53.7784, 20.4801],
    "Bielsko-Biała": [49.8224, 19.0444],
    "Bytom": [50.3484, 18.9156],
    "Zielona Góra": [51.9356, 15.5062],
    "Rybnik": [50.1022, 18.5463],
    "Ruda Śląska": [50.2558, 18.8556],
    "Tychy": [50.1319, 18.9643],
    "Opole": [50.6751, 17.9213],
    "Gorzów Wielkopolski": [52.7368, 15.2288],
    "Dąbrowa Górnicza": [50.3217, 19.1940],
    "Płock": [52.5463, 19.7065],
    "Elbląg": [54.1561, 19.4044],
    "Wałbrzych": [50.7714, 16.2843],
    "Włocławek": [52.6483, 19.0677],
    "Tarnów": [50.0121, 20.9858],
    "Chorzów": [50.2974, 18.9545],
    "Koszalin": [54.1943, 16.1714],
    "Kalisz": [51.7611, 18.0853],
    "Legnica": [51.2070, 16.1619],
    "Grudziądz": [53.4837, 18.7536],
    "Jaworzno": [50.2053, 19.2750],
    "Słupsk": [54.4641, 17.0285],
    "Jastrzębie-Zdrój": [49.9500, 18.5833],
    "Nowy Sącz": [49.6250, 20.6917],
    "Jelenia Góra": [50.9044, 15.7194],
    "Siedlce": [52.1676, 22.2900],
    "Mysłowice": [50.2083, 19.1333],
    "Konin": [52.2230, 18.2511],
    "Piła": [53.1514, 16.7386],
    "Piotrków Trybunalski": [51.4054, 19.6903],
    "Lubin": [51.4000, 16.2000],
    "Inowrocław": [52.7556, 18.2611],
    "Ostrów Wielkopolski": [51.6500, 17.8167],
    "Suwałki": [54.1000, 22.9333],
    "Stargard": [53.3333, 15.0500],
    "Gniezno": [52.5333, 17.6000],
    "Ostrowiec Świętokrzyski": [50.9333, 21.4000],
    "Siemianowice Śląskie": [50.3000, 19.0333],
    "Głogów": [51.6667, 16.0833],
    "Pabianice": [51.6667, 19.3500],
    "Leszno": [51.8500, 16.5833],
    "Żory": [50.0500, 18.7000],
    "Pruszków": [52.1667, 20.8000],
    "Zamość": [50.7167, 23.2500],
    "Tomaszów Mazowiecki": [51.5333, 20.0167],
    "Ełk": [53.8333, 22.3667],
    "Stalowa Wola": [50.5833, 22.0500],
    "Mielec": [50.2833, 21.4333],
    "Tarnobrzeg": [50.5833, 21.6833],
    "Kędzierzyn-Koźle": [50.3500, 18.2167],
    "Biała Podlaska": [52.0333, 23.1167],
    "Puławy": [51.4167, 21.9667],
    "Świdnica": [50.8500, 16.4833],
    "Przemyśl": [49.7833, 22.7667],
    "Łomża": [53.1667, 22.0667],
    "Zgierz": [51.8500, 19.4000],
    "Chełm": [51.1333, 23.4667],
    "Oświęcim": [50.0333, 19.2333],
    "Skierniewice": [51.9500, 20.1500],
    "Starachowice": [51.0500, 21.0667],
    "Wejherowo": [54.6000, 18.2333],
    "Rumia": [54.5667, 18.3833],
    "Radomsko": [51.0667, 19.4500],
    "Kutno": [52.2333, 19.3667],
    "Krosno": [49.6833, 21.7667],
    "Skarżysko-Kamienna": [51.1167, 20.8667],
    "Żary": [51.6333, 15.1333],
    "Ciechanów": [52.8833, 20.6167],
    "Otwock": [52.1000, 21.2667],
    "Piaseczno": [52.0833, 21.0167],
    "Racibórz": [50.0833, 18.2167],
    "Sanok": [49.5500, 22.2000],
    "Nowa Sól": [51.8000, 15.7167],
    "Zawiercie": [50.4833, 19.4167],
    // Mniejsze miasta
    "Sierpc": [52.8553, 19.6697],
    "Rypin": [53.0667, 19.4333],
    "Nidzica": [53.3592, 20.4267],
    "Działdowo": [53.2333, 20.1833],
    "Mława": [53.1167, 20.3833],
    "Płońsk": [52.6167, 20.3667],
    "Żuromin": [53.0667, 19.9167],
    "Lipno": [52.8500, 19.1833],
    "Brodnica": [53.2500, 19.4000],
    "Golub-Dobrzyń": [53.1167, 19.0500],
    "Wąbrzeźno": [53.2833, 18.9500],
    "Nowe Miasto Lubawskie": [53.4167, 19.6000],
    "Iława": [53.5833, 19.5667],
    "Szczytno": [53.5667, 21.0167],
    "Mrągowo": [53.8667, 21.3000],
    "Lidzbark Warmiński": [54.1333, 20.5833],
    "Bartoszyce": [54.2500, 20.8167],
    "Braniewo": [54.3833, 19.8167],
    "Kętrzyn": [54.0833, 21.3667],
    "Giżycko": [54.0333, 21.7667],
    "Węgorzewo": [54.2167, 21.7500],
    "Gołdap": [54.3167, 22.3000],
    "Olecko": [54.0333, 22.5000],
    "Augustów": [53.8333, 23.0000],
    "Sejny": [54.1167, 23.3500],
    "Grajewo": [53.6500, 22.4500],
    "Kolno": [53.4000, 21.9333],
    "Ostrołęka": [53.0833, 21.5667],
    "Maków Mazowiecki": [52.8667, 21.1000],
    "Przasnysz": [53.0167, 20.8833],
    "Pułtusk": [52.7000, 21.0833],
    "Wyszków": [52.5833, 21.4667],
    "Legionowo": [52.4000, 20.9333],
    "Nowy Dwór Mazowiecki": [52.4333, 20.7167],
    "Sochaczew": [52.2333, 20.2500],
    "Żyrardów": [52.0500, 20.4500],
    "Grójec": [51.8667, 20.8667],
    "Garwolin": [51.9000, 21.6167],
    "Mińsk Mazowiecki": [52.1833, 21.5667],
    "Sokołów Podlaski": [52.4167, 22.2500],
    "Węgrów": [52.4000, 22.0167],
    "Łuków": [51.9333, 22.3833],
    "Radzyń Podlaski": [51.7833, 22.6167],
    "Parczew": [51.6333, 22.9000],
    "Włodawa": [51.5500, 23.5500],
    "Hrubieszów": [50.8000, 23.8833],
    "Krasnystaw": [50.9833, 23.1667],
    "Lubartów": [51.4667, 22.6000],
    "Łęczna": [51.3000, 22.8833],
    "Świdnik": [51.2167, 22.6833],
    "Kraśnik": [50.9167, 22.2167],
    "Janów Lubelski": [50.7000, 22.4167],
    "Biłgoraj": [50.5333, 22.7167]
};

// Helper to find city coordinates with fuzzy matching
function getCityCoordinates(city: string): [number, number] | null {
    if (!city) return null;
    
    const normalizedCity = city.trim();
    
    // Direct match
    if (CITY_COORDINATES[normalizedCity]) {
        return CITY_COORDINATES[normalizedCity];
    }
    
    // Case-insensitive match
    const lowerCity = normalizedCity.toLowerCase();
    for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
        if (key.toLowerCase() === lowerCity) {
            return coords;
        }
    }
    
    // Partial match (city name contains or is contained)
    for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
        if (key.toLowerCase().includes(lowerCity) || lowerCity.includes(key.toLowerCase())) {
            return coords;
        }
    }
    
    return null;
}

// Map bounds fitter component
function MapBoundsFitter({ positions }: { positions: [number, number][] }) {
    const map = useMap();
    
    useEffect(() => {
        if (positions.length > 0) {
            const bounds = positions.reduce(
                (acc, pos) => ({
                    minLat: Math.min(acc.minLat, pos[0]),
                    maxLat: Math.max(acc.maxLat, pos[0]),
                    minLng: Math.min(acc.minLng, pos[1]),
                    maxLng: Math.max(acc.maxLng, pos[1]),
                }),
                { minLat: 90, maxLat: -90, minLng: 180, maxLng: -180 }
            );
            
            map.fitBounds([
                [bounds.minLat - 0.5, bounds.minLng - 0.5],
                [bounds.maxLat + 0.5, bounds.maxLng + 0.5]
            ]);
        }
    }, [positions, map]);
    
    return null;
}

type SelectedItem = 
    | { type: "client"; data: ClientMapData }
    | { type: "kitchen"; data: KitchenMapData }
    | null;

type ClientStatus = ClientMapData["status"];

type ClientStatusSegment = {
    status: ClientStatus;
    label: string;
    color: string;
    ringColor: string;
    weight: number;
};

type ClientMarker = {
    client: ClientMapData;
    coords: [number, number];
    radius: number;
    beds: number;
    segments: ClientStatusSegment[];
    gradient: string;
    borderColor: string;
    icon: L.DivIcon;
};

interface DashboardMapProps {
    clients: ClientMapData[];
    kitchens: KitchenMapData[];
    isLoading: boolean;
}

const STATUS_META: Record<ClientStatus, { label: string; color: string; ringColor: string; badgeClass: string }> = {
    active: { label: "Aktywny", color: "#22c55e", ringColor: "#16a34a", badgeClass: "bg-green-500" },
    planned: { label: "Planowany", color: "#3b82f6", ringColor: "#2563eb", badgeClass: "bg-blue-500" },
    expired: { label: "Wygasły", color: "#9ca3af", ringColor: "#6b7280", badgeClass: "bg-gray-400" },
    none: { label: "Brak kontraktu", color: "#d1d5db", ringColor: "#9ca3af", badgeClass: "bg-gray-300" }
};

const getStatusMeta = (status: ClientStatus) => STATUS_META[status] ?? STATUS_META.none;

const getClientStatusSegments = (client: ClientMapData): ClientStatusSegment[] => {
    const segments: ClientStatusSegment[] = [];
    const activeBeds = client.active_contract_beds ?? 0;
    const plannedBeds = client.planned_contract_beds ?? 0;

    if (activeBeds > 0) {
        const meta = getStatusMeta("active");
        segments.push({ status: "active", label: meta.label, color: meta.color, ringColor: meta.ringColor, weight: activeBeds });
    }

    if (plannedBeds > 0) {
        const meta = getStatusMeta("planned");
        segments.push({ status: "planned", label: meta.label, color: meta.color, ringColor: meta.ringColor, weight: plannedBeds });
    }

    if (!segments.length) {
        const meta = getStatusMeta(client.status);
        segments.push({ status: client.status, label: meta.label, color: meta.color, ringColor: meta.ringColor, weight: 1 });
    } else if (client.status === "expired") {
        const meta = getStatusMeta("expired");
        segments.push({ status: "expired", label: meta.label, color: meta.color, ringColor: meta.ringColor, weight: 1 });
    }

    return segments;
};

const buildConicGradient = (segments: ClientStatusSegment[]) => {
    const total = segments.reduce((sum, seg) => sum + seg.weight, 0);
    if (!total) return STATUS_META.none.color;

    let current = 0;
    const stops = segments.map((segment) => {
        const start = (current / total) * 360;
        current += segment.weight;
        const end = (current / total) * 360;
        return `${segment.color} ${start}deg ${end}deg`;
    });

    return `conic-gradient(${stops.join(", ")})`;
};

export default function DashboardMap({ clients, kitchens, isLoading }: DashboardMapProps) {
    const navigate = useNavigate();
    const [selectedItem, setSelectedItem] = useState<SelectedItem>(null);
    
    // Calculate max values for scaling
    const maxClientBeds = useMemo(() => {
        return Math.max(
            ...clients.map(c => c.total_beds || c.active_contract_beds || c.planned_contract_beds || 100),
            100
        );
    }, [clients]);
    
    const maxKitchenOsobodni = useMemo(() => {
        return Math.max(
            ...kitchens.map(k => k.max_osobodni || k.current_osobodni || 100),
            100
        );
    }, [kitchens]);
    
    // Prepare map markers
    const clientMarkers = useMemo(() => {
        const markers: ClientMarker[] = [];

        clients.forEach((client) => {
            const coords = getCityCoordinates(client.city);
            if (!coords) return;

            const beds = client.active_contract_beds || client.planned_contract_beds || client.total_beds || 0;
            const radius = Math.max(8, Math.min(30, (beds / maxClientBeds) * 25 + 8));
            const diameter = radius * 2;
            const segments = getClientStatusSegments(client);
            const gradient = buildConicGradient(segments);
            const borderColor = segments.length > 1 ? "rgba(15, 23, 42, 0.55)" : segments[0].ringColor;

            const icon = L.divIcon({
                className: "client-status-icon",
                html: `<div class="client-status-marker" style="width:${diameter}px;height:${diameter}px;background:${gradient};border-color:${borderColor};"></div>`,
                iconSize: [diameter, diameter],
                iconAnchor: [diameter / 2, diameter / 2]
            });

            markers.push({
                client,
                coords,
                radius,
                beds,
                segments,
                gradient,
                borderColor,
                icon
            });
        });

        return markers;
    }, [clients, maxClientBeds]);
    
    const kitchenMarkers = useMemo(() => {
        return kitchens.map(kitchen => {
            const coords = getCityCoordinates(kitchen.city);
            if (!coords) return null;
            
            // Offset kitchens slightly so they don't overlap with clients in same city
            const offsetCoords: [number, number] = [coords[0] + 0.02, coords[1] - 0.02];
            
            const capacity = kitchen.max_osobodni || kitchen.current_osobodni || 0;
            const radius = Math.max(10, Math.min(35, (capacity / maxKitchenOsobodni) * 28 + 10));
            
            return {
                kitchen,
                coords: offsetCoords,
                radius,
                capacity
            };
        }).filter(Boolean);
    }, [kitchens, maxKitchenOsobodni]);
    
    // Collect all positions for bounds
    const allPositions = useMemo(() => {
        const positions: [number, number][] = [];
        clientMarkers.forEach(m => m && positions.push(m.coords));
        kitchenMarkers.forEach(m => m && positions.push(m.coords));
        return positions;
    }, [clientMarkers, kitchenMarkers]);

    const kitchenCoordsById = useMemo(() => {
        return new Map(kitchenMarkers.map((marker) => [marker.kitchen.id, marker.coords]));
    }, [kitchenMarkers]);

    const clientCoordsById = useMemo(() => {
        return new Map(clientMarkers.map((marker) => [marker.client.id, marker.coords]));
    }, [clientMarkers]);

    const connectionLines = useMemo(() => {
        const lines: { id: string; positions: [[number, number], [number, number]] }[] = [];

        clients.forEach((client) => {
            const rawKitchenIds = Array.isArray(client.kitchen_ids)
                ? client.kitchen_ids
                : client.kitchen_id
                    ? [client.kitchen_id]
                    : [];

            if (!rawKitchenIds.length) return;

            const clientCoords = clientCoordsById.get(client.id);
            if (!clientCoords) return;

            rawKitchenIds.forEach((kitchenId, index) => {
                const kitchenCoords = kitchenCoordsById.get(kitchenId);
                if (!kitchenCoords) return;

                lines.push({
                    id: `link-${client.id}-${kitchenId}-${index}`,
                    positions: [kitchenCoords, clientCoords]
                });
            });
        });

        return lines;
    }, [clients, clientCoordsById, kitchenCoordsById]);
    
    const getStatusColor = (status: ClientStatus) => getStatusMeta(status).badgeClass;
    const getStatusLabel = (status: ClientStatus) => getStatusMeta(status).label;
    
    if (isLoading) {
        return (
            <Card className="h-[400px]">
                <CardContent className="p-0 h-full">
                    <Skeleton className="w-full h-full rounded-lg" />
                </CardContent>
            </Card>
        );
    }
    
    return (
        <div className="flex gap-4 h-[400px]">
            {/* Map */}
            <Card className="flex-1">
                <CardContent className="p-0 h-full">
                    <MapContainer
                        center={[52.0, 19.0]}
                        zoom={6}
                        className="w-full h-full rounded-lg"
                        style={{ minHeight: "100%" }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        
                        {allPositions.length > 0 && <MapBoundsFitter positions={allPositions} />}

                        {connectionLines.map((line) => (
                            <Polyline
                                key={line.id}
                                positions={line.positions}
                                pathOptions={{
                                    color: "#f59e0b",
                                    weight: 2,
                                    opacity: 0.7,
                                    dashArray: "8 12",
                                    className: "map-connection-line"
                                }}
                            />
                        ))}
                        
                        {/* Kitchen markers (orange/amber) */}
                        {kitchenMarkers.map((marker) => marker && (
                            <CircleMarker
                                key={`kitchen-${marker.kitchen.id}`}
                                center={marker.coords}
                                radius={marker.radius}
                                pathOptions={{
                                    fillColor: "#f97316",
                                    fillOpacity: 0.7,
                                    color: "#ea580c",
                                    weight: 3,
                                }}
                                eventHandlers={{
                                    click: () => setSelectedItem({ type: "kitchen", data: marker.kitchen })
                                }}
                            >
                                <Popup>
                                    <div className="font-medium">{marker.kitchen.name}</div>
                                    <div className="text-sm text-muted-foreground">{marker.kitchen.city}</div>
                                </Popup>
                            </CircleMarker>
                        ))}
                        
                        {/* Client markers (colored by status) */}
                        {clientMarkers.map((marker) => marker && (
                            <Marker
                                key={`client-${marker.client.id}`}
                                position={marker.coords}
                                icon={marker.icon}
                                eventHandlers={{
                                    click: () => setSelectedItem({ type: "client", data: marker.client })
                                }}
                            >
                                <Popup>
                                    <div className="font-medium">{marker.client.short_name}</div>
                                    <div className="text-sm text-muted-foreground">{marker.client.city}</div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </CardContent>
            </Card>
            
            {/* Details Panel */}
            <Card className="w-80 flex flex-col">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        {selectedItem ? (
                            selectedItem.type === "client" ? (
                                <>
                                    <Building2 className="h-4 w-4" />
                                    Szczegóły klienta
                                </>
                            ) : (
                                <>
                                    <ChefHat className="h-4 w-4" />
                                    Szczegóły kuchni
                                </>
                            )
                        ) : (
                            <>
                                <MapPin className="h-4 w-4" />
                                Legenda mapy
                            </>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full pr-4">
                        {selectedItem ? (
                            selectedItem.type === "client" ? (
                                <ClientDetails 
                                    client={selectedItem.data} 
                                    onNavigate={navigate}
                                    getStatusColor={getStatusColor}
                                    getStatusLabel={getStatusLabel}
                                />
                            ) : (
                                <KitchenDetails 
                                    kitchen={selectedItem.data}
                                    onNavigate={navigate}
                                />
                            )
                        ) : (
                            <MapLegend />
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
}

function ClientDetails({ 
    client, 
    onNavigate, 
    getStatusColor, 
    getStatusLabel 
}: { 
    client: ClientMapData;
    onNavigate: (path: string) => void;
    getStatusColor: (status: ClientStatus) => string;
    getStatusLabel: (status: ClientStatus) => string;
}) {
    const contractBeds = client.active_contract_beds || client.planned_contract_beds || 0;
    const coveragePercent = client.total_beds && contractBeds 
        ? Math.round((contractBeds / client.total_beds) * 100) 
        : null;
    const statusSegments = getClientStatusSegments(client);
    
    return (
        <div className="space-y-4">
            <div>
                <h3 className="font-semibold text-lg">{client.short_name}</h3>
                <p className="text-sm text-muted-foreground">{client.full_name}</p>
            </div>
            
            <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{client.city}</span>
            </div>
            
            {client.address && (
                <p className="text-sm text-muted-foreground">{client.address}</p>
            )}
            
            <Separator />
            
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <div className="flex flex-wrap justify-end gap-2">
                        {statusSegments.map((segment) => (
                            <Badge key={`status-${segment.status}`} className={getStatusColor(segment.status)}>
                                {getStatusLabel(segment.status)}
                            </Badge>
                        ))}
                    </div>
                </div>
                
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <BedDouble className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Łóżka w szpitalu</span>
                    </div>
                    <span className="font-medium">{client.total_beds ?? "-"}</span>
                </div>
                
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Łóżka w kontrakcie</span>
                    </div>
                    <span className="font-medium">{contractBeds || "-"}</span>
                </div>
                
                {coveragePercent !== null && (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Percent className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Pokrycie szpitala</span>
                        </div>
                        <span className={`font-medium ${coveragePercent >= 100 ? "text-green-600" : "text-amber-600"}`}>
                            {coveragePercent}%
                        </span>
                    </div>
                )}
            </div>
            
            <Separator />
            
            <div className="space-y-2">
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => onNavigate(`/settings/clients/${client.id}`)}
                >
                    <Building2 className="h-4 w-4 mr-2" />
                    Przejdź do klienta
                    <ExternalLink className="h-3 w-3 ml-auto" />
                </Button>
                
                {client.contract_id && (
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => onNavigate(`/settings/contracts/${client.contract_id}`)}
                    >
                        <FileText className="h-4 w-4 mr-2" />
                        Przejdź do kontraktu
                        <ExternalLink className="h-3 w-3 ml-auto" />
                    </Button>
                )}
            </div>
        </div>
    );
}

function KitchenDetails({ 
    kitchen, 
    onNavigate 
}: { 
    kitchen: KitchenMapData;
    onNavigate: (path: string) => void;
}) {
    const utilizationPercent = kitchen.max_osobodni && kitchen.current_osobodni
        ? Math.round((kitchen.current_osobodni / kitchen.max_osobodni) * 100)
        : null;
    
    return (
        <div className="space-y-4">
            <div>
                <h3 className="font-semibold text-lg">{kitchen.name}</h3>
            </div>
            
            <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{kitchen.city}</span>
            </div>
            
            {kitchen.address && (
                <p className="text-sm text-muted-foreground">{kitchen.address}</p>
            )}
            
            <Separator />
            
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Maks. osobodni</span>
                    </div>
                    <span className="font-medium">{kitchen.max_osobodni ?? "-"}</span>
                </div>
                
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Aktualne osobodni</span>
                    </div>
                    <span className="font-medium text-green-600">{kitchen.current_osobodni ?? "-"}</span>
                </div>
                
                {kitchen.planned_osobodni && kitchen.planned_osobodni > 0 && (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Planowane osobodni</span>
                        </div>
                        <span className="font-medium text-blue-600">{kitchen.planned_osobodni}</span>
                    </div>
                )}
                
                {utilizationPercent !== null && (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Percent className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Wykorzystanie</span>
                        </div>
                        <span className={`font-medium ${
                            utilizationPercent >= 90 ? "text-red-600" : 
                            utilizationPercent >= 70 ? "text-amber-600" : "text-green-600"
                        }`}>
                            {utilizationPercent}%
                        </span>
                    </div>
                )}
                
                <Separator />
                
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Pracownicy</span>
                    </div>
                    <span className="font-medium">{kitchen.employees ?? "-"}</span>
                </div>
                
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Aktywne kontrakty</span>
                    <Badge variant="outline" className="bg-green-500/10 text-green-700">
                        {kitchen.active_contracts}
                    </Badge>
                </div>
                
                {kitchen.planned_contracts > 0 && (
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Planowane kontrakty</span>
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-700">
                            {kitchen.planned_contracts}
                        </Badge>
                    </div>
                )}
            </div>
            
            <Separator />
            
            <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => onNavigate(`/settings/kitchens/${kitchen.id}`)}
            >
                <ChefHat className="h-4 w-4 mr-2" />
                Przejdź do kuchni
                <ExternalLink className="h-3 w-3 ml-auto" />
            </Button>
        </div>
    );
}

function MapLegend() {
    return (
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
                Kliknij na marker, aby zobaczyć szczegóły
            </p>
            
            <Separator />
            
            <div className="space-y-3">
                <h4 className="font-medium text-sm">Klienci (szpitale)</h4>
                <div className="space-y-2 pl-2">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-green-500" />
                        <span className="text-sm">Aktywny kontrakt</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-blue-500" />
                        <span className="text-sm">Planowany kontrakt</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-gray-400" />
                        <span className="text-sm">Wygasły / brak kontraktu</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full client-status-legend" />
                        <span className="text-sm">Mieszane statusy kontraktów</span>
                    </div>
                </div>
                <p className="text-xs text-muted-foreground pl-2">
                    Rozmiar = liczba łóżek w kontrakcie
                </p>
            </div>
            
            <Separator />
            
            <div className="space-y-3">
                <h4 className="font-medium text-sm">Kuchnie</h4>
                <div className="space-y-2 pl-2">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-orange-500 border-2 border-orange-600" />
                        <span className="text-sm">Kuchnia</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="map-connection-legend" />
                        <span className="text-sm">Powiązanie kuchnia-klient</span>
                    </div>
                </div>
                <p className="text-xs text-muted-foreground pl-2">
                    Rozmiar = maks. osobodni (potencjał)
                </p>
            </div>
        </div>
    );
}
