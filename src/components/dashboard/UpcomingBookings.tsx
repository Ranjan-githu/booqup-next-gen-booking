import { Calendar, Clock, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

interface UpcomingBookingsProps {
  bookings: any[];
}

const UpcomingBookings = ({ bookings }: UpcomingBookingsProps) => {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">Upcoming Appointments</h2>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {bookings.map((booking) => (
          <Card
            key={booking.id}
            className="glass-strong min-w-[320px] hover:scale-105 transition-all"
          >
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">{booking.shops.name}</h3>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  booking.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                  booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {booking.status}
                </div>
              </div>

              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{format(new Date(booking.booking_time), "PPP")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{format(new Date(booking.booking_time), "p")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate">{booking.shops.address}</span>
                </div>
              </div>

              {booking.queue_number && (
                <div className="pt-3 border-t border-border/50">
                  <p className="text-sm">
                    Queue Number: <span className="font-bold text-primary">#{booking.queue_number}</span>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default UpcomingBookings;