import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, X } from "lucide-react";

const CATEGORIES = ["Salon", "Mechanic", "Clinic", "Spa", "Gym", "Other"];

interface ShopSetupProps {
  userId: string;
  onComplete: () => void;
}

interface Service {
  name: string;
  description: string;
  price: string;
  duration: string;
}

const ShopSetup = ({ userId, onComplete }: ShopSetupProps) => {
  const [loading, setLoading] = useState(false);
  const [shopName, setShopName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [services, setServices] = useState<Service[]>([
    { name: "", description: "", price: "", duration: "" },
  ]);
  const { toast } = useToast();

  const addService = () => {
    setServices([...services, { name: "", description: "", price: "", duration: "" }]);
  };

  const removeService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const updateService = (index: number, field: keyof Service, value: string) => {
    const updated = [...services];
    updated[index][field] = value;
    setServices(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create shop
      const { data: shop, error: shopError } = await supabase
        .from("shops")
        .insert({
          owner_id: userId,
          name: shopName,
          description: description || null,
          category,
          address,
          phone,
        })
        .select()
        .single();

      if (shopError) throw shopError;

      // Add services
      const validServices = services.filter(
        (s) => s.name && s.price && s.duration
      );

      if (validServices.length > 0) {
        const serviceData = validServices.map((s) => ({
          shop_id: shop.id,
          name: s.name,
          description: s.description || null,
          price: parseFloat(s.price),
          duration: parseInt(s.duration),
        }));

        const { error: servicesError } = await supabase
          .from("services")
          .insert(serviceData);

        if (servicesError) throw servicesError;
      }

      toast({
        title: "Shop created!",
        description: "Your shop is now live on Booqup.",
      });

      onComplete();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="glass-strong p-8 rounded-2xl space-y-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold">Create Your Shop</h2>
          <p className="text-muted-foreground">
            Set up your shop profile to start receiving bookings
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="shopName">Shop Name *</Label>
              <Input
                id="shopName"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="My Amazing Shop"
                required
                className="glass"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger className="glass">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell customers about your shop..."
                className="glass"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Main St, City, Country"
                required
                className="glass"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1234567890"
                required
                className="glass"
              />
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Services</h3>
              <Button
                type="button"
                onClick={addService}
                size="sm"
                className="gradient-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Service
              </Button>
            </div>

            {services.map((service, index) => (
              <div key={index} className="glass p-4 rounded-lg space-y-3 relative">
                {services.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => removeService(index)}
                    size="icon"
                    variant="ghost"
                    className="absolute top-2 right-2 hover:bg-destructive/20"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Service Name *</Label>
                    <Input
                      value={service.name}
                      onChange={(e) => updateService(index, "name", e.target.value)}
                      placeholder="Haircut"
                      required
                      className="glass"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Price (USD) *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={service.price}
                      onChange={(e) => updateService(index, "price", e.target.value)}
                      placeholder="25.00"
                      required
                      className="glass"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Duration (minutes) *</Label>
                    <Input
                      type="number"
                      value={service.duration}
                      onChange={(e) => updateService(index, "duration", e.target.value)}
                      placeholder="30"
                      required
                      className="glass"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input
                      value={service.description}
                      onChange={(e) => updateService(index, "description", e.target.value)}
                      placeholder="Brief description"
                      className="glass"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full gradient-primary text-lg py-6"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Creating Shop...
              </>
            ) : (
              "Create Shop"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ShopSetup;