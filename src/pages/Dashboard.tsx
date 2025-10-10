import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LogOut, Search, User, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ShopCard from "@/components/dashboard/ShopCard";
import BookingModal from "@/components/dashboard/BookingModal";
import UpcomingBookings from "@/components/dashboard/UpcomingBookings";

const CATEGORIES = ["All", "Salon", "Mechanic", "Clinic", "Spa", "Gym", "Other"];

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [shops, setShops] = useState<any[]>([]);
  const [filteredShops, setFilteredShops] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedShop, setSelectedShop] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
    fetchShops();
  }, []);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  useEffect(() => {
    filterShops();
  }, [shops, selectedCategory, searchQuery]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setUser(user);
  };

  const fetchShops = async () => {
    const { data, error } = await supabase
      .from("shops")
      .select("*, services(*)")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setShops(data);
    }
  };

  const fetchBookings = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("bookings")
      .select("*, shops(name, address)")
      .eq("customer_id", user.id)
      .gte("booking_time", new Date().toISOString())
      .order("booking_time", { ascending: true });

    if (!error && data) {
      setBookings(data);
    }
  };

  const filterShops = () => {
    let filtered = shops;

    if (selectedCategory !== "All") {
      filtered = filtered.filter((shop) => shop.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter((shop) =>
        shop.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredShops(filtered);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
    toast({
      title: "Logged out",
      description: "See you soon!",
    });
  };

  return (
    <div className="min-h-screen">
      {/* Top Bar */}
      <header className="glass-strong border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48 glass">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search shops..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 glass"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="glass"
            >
              <User className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="glass hover:bg-destructive/20"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Upcoming Bookings */}
        {bookings.length > 0 && <UpcomingBookings bookings={bookings} />}

        {/* Shop Grid */}
        <section>
          <h2 className="text-2xl font-bold mb-6">
            {selectedCategory === "All" ? "All Shops" : `${selectedCategory}s`}
          </h2>
          
          {filteredShops.length === 0 ? (
            <div className="glass-strong p-12 rounded-2xl text-center">
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No shops found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or search query
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredShops.map((shop) => (
                <ShopCard
                  key={shop.id}
                  shop={shop}
                  onClick={() => setSelectedShop(shop)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Booking Modal */}
      {selectedShop && (
        <BookingModal
          shop={selectedShop}
          onClose={() => setSelectedShop(null)}
          onBooked={() => {
            setSelectedShop(null);
            fetchBookings();
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;