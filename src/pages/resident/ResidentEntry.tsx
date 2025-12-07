import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { FLAT_RANGES } from "@/config/auth";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Home, ArrowLeft } from "lucide-react";

export default function ResidentEntry() {
  const navigate = useNavigate();
  const { loginAsResident } = useAuth();
  const [flatNumber, setFlatNumber] = useState("");
  const [inputMode, setInputMode] = useState<"select" | "type">("select");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!flatNumber) {
      toast({
        title: "Error",
        description: "Please select or enter your flat number.",
        variant: "destructive",
      });
      return;
    }

    const success = loginAsResident(flatNumber);

    if (success) {
      toast({
        title: "Welcome!",
        description: `You are viewing as Flat ${flatNumber}.`,
      });
      navigate("/resident/dashboard");
    } else {
      toast({
        title: "Invalid Flat Number",
        description: "Please enter a valid flat number (101-130, 201-230, 301-330, 401-430, 501-530).",
        variant: "destructive",
      });
    }
  };

  const allFlats = FLAT_RANGES.getValidFlats();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <PageContainer>
        <div className="mx-auto max-w-md">
          <Button
            variant="ghost"
            className="mb-6 gap-2"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>

          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-accent/20 text-accent-foreground">
                <Home className="h-7 w-7" />
              </div>
              <CardTitle>Resident Access</CardTitle>
              <CardDescription>
                Enter your flat number to view community transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={inputMode === "select" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setInputMode("select");
                      setFlatNumber("");
                    }}
                  >
                    Select from list
                  </Button>
                  <Button
                    type="button"
                    variant={inputMode === "type" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setInputMode("type");
                      setFlatNumber("");
                    }}
                  >
                    Type manually
                  </Button>
                </div>

                {inputMode === "select" ? (
                  <div className="space-y-2">
                    <Label htmlFor="flatSelect">Select Your Flat</Label>
                    <Select value={flatNumber} onValueChange={setFlatNumber}>
                      <SelectTrigger id="flatSelect">
                        <SelectValue placeholder="Choose your flat number" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {[1, 2, 3, 4, 5].map((floor) => (
                          <div key={floor}>
                            <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                              Floor {floor}
                            </div>
                            {allFlats
                              .filter((f) => f.startsWith(String(floor)))
                              .map((flat) => (
                                <SelectItem key={flat} value={flat}>
                                  Flat {flat}
                                </SelectItem>
                              ))}
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="flatInput">Enter Flat Number</Label>
                    <Input
                      id="flatInput"
                      type="text"
                      value={flatNumber}
                      onChange={(e) => setFlatNumber(e.target.value)}
                      placeholder="e.g., 203, 415, 529"
                      maxLength={3}
                    />
                    <p className="text-xs text-muted-foreground">
                      Valid flats: 101-130, 201-230, 301-330, 401-430, 501-530
                    </p>
                  </div>
                )}

                <Button type="submit" className="w-full" size="lg">
                  View Transactions
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    </div>
  );
}
