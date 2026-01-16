import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { buildAuthUrl } from "@/api/apiBase";
import { 
  ChefHat, 
  Users, 
  FileText, 
  BarChart3, 
  Shield, 
  Zap,
  ArrowRight,
  CheckCircle2
} from "lucide-react";

const LandingPage = () => {
  const handleLogin = () => {
    const returnUrl = window.location.origin + "/dashboard";
    window.location.href = buildAuthUrl(`Login?returnUrl=${encodeURIComponent(returnUrl)}`);
  };

  const features = [
    {
      icon: FileText,
      title: "Zarządzanie Kontraktami",
      description: "Pełna kontrola nad umowami z klientami, okresami rozliczeniowymi i cenami posiłków."
    },
    {
      icon: Users,
      title: "Baza Klientów",
      description: "Centralna baza danych klientów z oddziałami, dietami i typami posiłków."
    },
    {
      icon: ChefHat,
      title: "Konfiguracja Kuchni",
      description: "Zarządzanie kuchniami produkcyjnymi i ich przypisaniem do kontraktów."
    },
    {
      icon: BarChart3,
      title: "Wartości Odżywcze",
      description: "Baza danych IŻŻ z pełnymi wartościami odżywczymi produktów."
    },
    {
      icon: Shield,
      title: "System Uprawnień",
      description: "Zaawansowany system ról i uprawnień z pełnym audytem zmian."
    },
    {
      icon: Zap,
      title: "Automatyzacja",
      description: "Automatyczne generowanie jadłospisów i kalkulacja kosztów."
    }
  ];

  const benefits = [
    "Centralne zarządzanie wszystkimi kontraktami",
    "Pełna baza produktów z wartościami odżywczymi",
    "System diet i alergenów",
    "Audit log wszystkich operacji",
    "Integracja z kodem EAN",
    "Eksport danych do Excel"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">CateringHub</span>
          </div>
          <Button onClick={handleLogin} className="gap-2">
            Zaloguj się
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Kompleksowy system do
            <span className="text-primary block mt-2">zarządzania cateringiem</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Zarządzaj kontraktami, klientami, kuchniami i produktami w jednym miejscu. 
            Pełna kontrola nad wartościami odżywczymi i kosztami.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={handleLogin} className="gap-2 text-lg px-8">
              Rozpocznij teraz
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8">
              Dowiedz się więcej
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Funkcjonalności</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Wszystko czego potrzebujesz do efektywnego zarządzania firmą cateringową
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">
                Dlaczego CateringHub?
              </h2>
              <p className="text-muted-foreground mb-8">
                Nasz system został stworzony z myślą o firmach cateringowych, 
                które potrzebują niezawodnego narzędzia do zarządzania całą działalnością.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-8 lg:p-12">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-background rounded-xl p-6 shadow-lg text-center">
                  <div className="text-4xl font-bold text-primary mb-2">500+</div>
                  <div className="text-sm text-muted-foreground">Produktów w bazie</div>
                </div>
                <div className="bg-background rounded-xl p-6 shadow-lg text-center">
                  <div className="text-4xl font-bold text-primary mb-2">24/7</div>
                  <div className="text-sm text-muted-foreground">Dostępność systemu</div>
                </div>
                <div className="bg-background rounded-xl p-6 shadow-lg text-center">
                  <div className="text-4xl font-bold text-primary mb-2">100%</div>
                  <div className="text-sm text-muted-foreground">Zgodność z IŻŻ</div>
                </div>
                <div className="bg-background rounded-xl p-6 shadow-lg text-center">
                  <div className="text-4xl font-bold text-primary mb-2">∞</div>
                  <div className="text-sm text-muted-foreground">Możliwości</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Gotowy na usprawnienie swojej firmy?
          </h2>
          <p className="text-primary-foreground/80 mb-8 text-lg">
            Dołącz do grona zadowolonych użytkowników CateringHub
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            onClick={handleLogin}
            className="gap-2 text-lg px-8"
          >
            Zaloguj się do systemu
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-primary" />
            <span className="font-semibold">CateringHub</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 CateringHub. Wszelkie prawa zastrzeżone.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
