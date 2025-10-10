import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { X, Phone, MapPin, Star, CreditCard, Wallet, Smartphone } from "lucide-react";

interface BookingModalProps {
  shop: any;
  onClose: () => void;
  onBooked: () => void;
}

const BookingModal = ({ shop, onClose, onBooked }: BookingModalProps) => {
  const [step, setStep] = useState(1);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [bookingTime, setBookingTime] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const calculateTotal = () => {
    return shop.services
      .filter((s: any) => selectedServices.includes(s.id))
      .reduce((sum: number, s: any) => sum + parseFloat(s.price), 0);
  };

  const handleSubmit = async () => {
    if (selectedServices.length === 0) {
      toast({
        title: "No services selected",
        description: "Please select at least one service",
        variant: "destructive",
      });
      return;
    }

    if (!bookingTime) {
      toast({
        title: "Date required",
        description: "Please select a booking time",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("Not authenticated");

      // Create booking
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          customer_id: user.id,
          shop_id: shop.id,
          booking_time: bookingTime,
          payment_method: paymentMethod,
          total_amount: calculateTotal(),
          notes: notes || null,
          status: "pending",
          payment_status: "pending",
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Link services
      const serviceLinks = selectedServices.map((serviceId) => ({
        booking_id: booking.id,
        service_id: serviceId,
      }));

      const { error: servicesError } = await supabase
        .from("booking_services")
        .insert(serviceLinks);

      if (servicesError) throw servicesError;

      toast({
        title: "Booking confirmed!",
        description: `Your appointment at ${shop.name} has been booked.`,
      });

      onBooked();
    } catch (error: any) {
      toast({
        title: "Booking failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="glass-strong max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center justify-between">
            <span>{shop.name}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="hover:bg-destructive/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Shop Info */}
          <div className="space-y-3 pb-6 border-b border-border/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{shop.address}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="w-4 h-4" />
              <span>{shop.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-semibold">{shop.rating || "New"}</span>
            </div>
          </div>

          {/* Step 1: Select Services */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Select Services</h3>
              {shop.services.map((service: any) => (
                <div key={service.id} className="flex items-center gap-3 p-4 glass rounded-lg">
                  <Checkbox
                    checked={selectedServices.includes(service.id)}
                    onCheckedChange={() => handleServiceToggle(service.id)}
                  />
                  <div className="flex-1">
                    <p className="font-semibold">{service.name}</p>
                    {service.description && (
                      <p className="text-sm text-muted-foreground">{service.description}</p>
                    )}
                    <p className="text-sm text-muted-foreground mt-1">
                      {service.duration} min
                    </p>
                  </div>
                  <span className="font-semibold text-primary">
                    ${parseFloat(service.price).toFixed(2)}
                  </span>
                </div>
              ))}
              <Button
                onClick={() => setStep(2)}
                disabled={selectedServices.length === 0}
                className="w-full gradient-primary"
              >
                Continue
              </Button>
            </div>
          )}

          {/* Step 2: Booking Details */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Booking Details</h3>
              
              <div className="space-y-2">
                <Label htmlFor="bookingTime">Preferred Date & Time</Label>
                <Input
                  id="bookingTime"
                  type="datetime-local"
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="glass"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special requirements?"
                  className="glass"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1 glass"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  className="flex-1 gradient-primary"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Payment */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Payment Method</h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => setPaymentMethod("cash")}
                  className={`w-full p-4 glass rounded-lg flex items-center gap-3 transition-all ${
                    paymentMethod === "cash" ? "ring-2 ring-primary" : ""
                  }`}
                >
                  <Wallet className="w-5 h-5 text-primary" />
                  <span className="font-semibold">Cash</span>
                </button>
                
                <button
                  onClick={() => setPaymentMethod("upi")}
                  className={`w-full p-4 glass rounded-lg flex items-center gap-3 transition-all ${
                    paymentMethod === "upi" ? "ring-2 ring-primary" : ""
                  }`}
                >
                  <Smartphone className="w-5 h-5 text-primary" />
                  <span className="font-semibold">UPI</span>
                </button>
                
                <button
                  onClick={() => setPaymentMethod("card")}
                  className={`w-full p-4 glass rounded-lg flex items-center gap-3 transition-all ${
                    paymentMethod === "card" ? "ring-2 ring-primary" : ""
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-primary" />
                  <span className="font-semibold">Credit/Debit Card</span>
                </button>
              </div>

              <div className="glass p-4 rounded-lg">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total Amount:</span>
                  <span className="text-primary">${calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="flex-1 glass"
                >
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 gradient-primary"
                >
                  {loading ? "Booking..." : "Confirm Booking"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;