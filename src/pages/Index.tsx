import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Shield, Home } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container flex min-h-screen flex-col items-center justify-center py-12">
        <div className="mb-12 text-center animate-fade-in">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <Building2 className="h-10 w-10" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">D Block</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Community Finance Tracker
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Transparent management of our community's income and expenses
          </p>
        </div>

        <div className="grid w-full max-w-2xl gap-6 sm:grid-cols-2">
          <Card className="cursor-pointer transition-all hover:shadow-lg hover:border-primary/50" onClick={() => navigate("/admin/login")}>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Shield className="h-7 w-7" />
              </div>
              <CardTitle>Administrator</CardTitle>
              <CardDescription>
                Manage transactions, add income and expenses
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button className="w-full" size="lg">
                Admin Login
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer transition-all hover:shadow-lg hover:border-primary/50" onClick={() => navigate("/resident")}>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-accent/20 text-accent-foreground">
                <Home className="h-7 w-7" />
              </div>
              <CardTitle>Resident</CardTitle>
              <CardDescription>
                View all transactions and monthly summaries
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Button variant="secondary" className="w-full" size="lg">
                Enter as Resident
              </Button>
            </CardContent>
          </Card>
        </div>

        <p className="mt-12 text-center text-sm text-muted-foreground">
          Flats 101–530 · 5 Floors · 150 Units
        </p>
      </div>
    </div>
  );
};

export default Index;
