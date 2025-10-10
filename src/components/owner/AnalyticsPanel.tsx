import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, CheckCircle, TrendingUp } from "lucide-react";

interface AnalyticsPanelProps {
  shopId: string;
}

const AnalyticsPanel = ({ shopId }: AnalyticsPanelProps) => {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalIncome: 0,
    completedBookings: 0,
    pendingBookings: 0,
  });

  useEffect(() => {
    fetchAnalytics();
  }, [shopId]);

  const fetchAnalytics = async () => {
    // Fetch total bookings
    const { data: bookings } = await supabase
      .from("bookings")
      .select("*")
      .eq("shop_id", shopId);

    if (bookings) {
      const completed = bookings.filter((b) => b.status === "completed").length;
      const pending = bookings.filter((b) => b.status === "pending").length;
      const totalIncome = bookings
        .filter((b) => b.payment_status === "paid")
        .reduce((sum, b) => sum + parseFloat(String(b.total_amount)), 0);

      setStats({
        totalCustomers: bookings.length,
        totalIncome,
        completedBookings: completed,
        pendingBookings: pending,
      });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Analytics Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-strong">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats.totalCustomers}</div>
            <p className="text-xs text-muted-foreground mt-1">All time bookings</p>
          </CardContent>
        </Card>

        <Card className="glass-strong">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">${stats.totalIncome.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">From paid bookings</p>
          </CardContent>
        </Card>

        <Card className="glass-strong">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats.completedBookings}</div>
            <p className="text-xs text-muted-foreground mt-1">Services completed</p>
          </CardContent>
        </Card>

        <Card className="glass-strong">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats.pendingBookings}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting service</p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-strong">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Detailed analytics charts coming soon
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsPanel;