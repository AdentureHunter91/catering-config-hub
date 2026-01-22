import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { buildAuthUrl } from "@/api/apiBase";
import { 
  ChefHat, 
  LogIn,
  Utensils,
  Clock,
  Shield
} from "lucide-react";

const LandingPage = () => {
  const handleLogin = () => {
    const returnUrl = window.location.origin + "/dashboard";
    window.location.href = buildAuthUrl(`Login/?returnUrl=${encodeURIComponent(returnUrl)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">CateringHub</span>
          </div>
          <Button onClick={handleLogin} variant="outline" className="gap-2">
            <LogIn className="w-4 h-4" />
            Zaloguj się
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 pt-16">
        <div className="max-w-2xl mx-auto text-center py-20">
          {/* Logo */}
          <div className="w-24 h-24 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-8 shadow-lg">
            <ChefHat className="w-14 h-14 text-primary-foreground" />
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            CateringHub
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8">
            Wewnętrzny system zarządzania cateringiem
          </p>

          <Button size="lg" onClick={handleLogin} className="gap-2 text-lg px-8 mb-12">
            <LogIn className="w-5 h-5" />
            Zaloguj się do systemu
          </Button>

          {/* Quick Info Cards */}
          <div className="grid md:grid-cols-3 gap-4 mt-8">
            <Card className="border-0 shadow-md bg-card/50">
              <CardContent className="p-5 text-center">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Utensils className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-medium text-sm">Zarządzanie</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Kontrakty, klienci, kuchnie
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-md bg-card/50">
              <CardContent className="p-5 text-center">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-medium text-sm">Dietetyka</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Posiłki, diety, jadłospisy
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-md bg-card/50">
              <CardContent className="p-5 text-center">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-medium text-sm">Produkty</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Baza produktów i wartości odżywcze
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-6 border-t bg-muted/30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ChefHat className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">CateringHub</span>
          </div>
          <p className="text-xs text-muted-foreground">
            System wewnętrzny — dostęp tylko dla uprawnionych użytkowników
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
