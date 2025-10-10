import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, User, Phone, DollarSign } from "lucide-react";
import { format } from "date-fns";

interface AppointmentsPanelProps {
  shopId: string;
}

const AppointmentsPanel = ({ shopId }: AppointmentsPanelProps) => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchBookings();
  }, [shopId, filter]);

  const fetchBookings = async () => {
    let query = supabase
      .from("bookings")
      .select("*, profiles(full_name, phone)")
      .eq("shop_id", shopId)
      .order("booking_time", { ascending: true });

    if (filter !== "all") {
      query = query.eq("status", filter);
    }

    const { data, error } = await query;

    if (!error && data) {
      setBookings(data);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
    const { error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", bookingId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Updated",
        description: `Booking marked as ${status}`,
      });
      fetchBookings();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Appointments</h2>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48 glass">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {bookings.length === 0 ? (
        <Card className="glass-strong">
          <CardContent className="p-12 text-center">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No appointments</h3>
            <p className="text-muted-foreground">
              {filter === "all"
                ? "You don't have any bookings yet"
                : `No ${filter} appointments`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id} className="glass-strong">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <User className="w-5 h-5 text-primary" />
                        {booking.profiles?.full_name || "Customer"}
                      </h3>
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          booking.status === "completed"
                            ? "bg-green-500/20 text-green-400"
                            : booking.status === "confirmed"
                            ? "bg-blue-500/20 text-blue-400"
                            : booking.status === "pending"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {booking.status}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{format(new Date(booking.booking_time), "PPP")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{format(new Date(booking.booking_time), "p")}</span>
                      </div>
                      {booking.profiles?.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          <span>{booking.profiles.phone}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <DollarSign className="w-4 h-4 text-primary" />
                      <span className="font-semibold">
                        ${parseFloat(booking.total_amount).toFixed(2)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({booking.payment_method})
                      </span>
                    </div>

                    {booking.notes && (
                      <p className="text-sm text-muted-foreground italic">
                        Note: {booking.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    {booking.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => updateBookingStatus(booking.id, "confirmed")}
                          className="gradient-primary"
                        >
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updateBookingStatus(booking.id, "cancelled")}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                    {booking.status === "confirmed" && (
                      <Button
                        size="sm"
                        onClick={() => updateBookingStatus(booking.id, "completed")}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Complete
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AppointmentsPanel;