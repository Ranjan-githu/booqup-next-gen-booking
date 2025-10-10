import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Store, BarChart3, Calendar, History } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AnalyticsPanel from "@/components/owner/AnalyticsPanel";
import AppointmentsPanel from "@/components/owner/AppointmentsPanel";
import ShopSetup from "@/components/owner/ShopSetup";

const OwnerDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [shop, setShop] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    // Check if user is owner
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    const isOwner = roles?.some((r) => r.role === "owner");
    
    if (!isOwner) {
      toast({
        title: "Access denied",
        description: "This area is for shop owners only.",
        variant: "destructive",
      });
      navigate("/dashboard");
      return;
    }

    setUser(user);
    fetchShop(user.id);
  };

  const fetchShop = async (userId: string) => {
    const { data, error } = await supabase
      .from("shops")
      .select("*, services(*)")
      .eq("owner_id", userId)
      .single();

    if (!error && data) {
      setShop(data);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
    toast({
      title: "Logged out",
      description: "See you soon!",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  // If no shop, show setup
  if (!shop) {
    return (
      <div className="min-h-screen">
        <header className="glass-strong border-b border-border/50">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Store className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold">Shop Setup</h1>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="glass hover:bg-destructive/20"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </header>
        <ShopSetup userId={user.id} onComplete={() => fetchShop(user.id)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Top Bar */}
      <header className="glass-strong border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Store className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">{shop.name}</h1>
              <p className="text-sm text-muted-foreground">{shop.category}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="glass hover:bg-destructive/20"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="glass-strong p-1">
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="appointments" className="gap-2">
              <Calendar className="w-4 h-4" />
              Appointments
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="w-4 h-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics">
            <AnalyticsPanel shopId={shop.id} />
          </TabsContent>

          <TabsContent value="appointments">
            <AppointmentsPanel shopId={shop.id} />
          </TabsContent>

          <TabsContent value="history">
            <div className="glass-strong p-12 rounded-2xl text-center">
              <History className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">History</h3>
              <p className="text-muted-foreground">
                View past bookings and transactions
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default OwnerDashboard;