import DietLayout from "@/components/DietLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Construction } from "lucide-react";

interface Props {
  title: string;
}

export default function DietPlaceholder({ title }: Props) {
  return (
    <DietLayout>
      <h1 className="text-2xl font-bold mb-6">{title}</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-muted-foreground">
            <Construction className="h-5 w-5" />
            W budowie
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Moduł <strong>{title}</strong> jest w trakcie implementacji.
          </p>
        </CardContent>
      </Card>
    </DietLayout>
  );
}
