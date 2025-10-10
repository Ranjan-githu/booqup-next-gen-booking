import { Star, MapPin, Users, Store } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ShopCardProps {
  shop: any;
  onClick: () => void;
}

const ShopCard = ({ shop, onClick }: ShopCardProps) => {
  return (
    <Card
      onClick={onClick}
      className="glass-strong cursor-pointer hover:scale-105 hover:glow-red transition-all group overflow-hidden"
    >
      {/* Shop Image */}
      <div className="h-48 bg-gradient-to-br from-primary/20 to-primary/5 relative overflow-hidden">
        {shop.image_url ? (
          <img
            src={shop.image_url}
            alt={shop.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Store className="w-16 h-16 text-primary/40" />
          </div>
        )}
        <div className="absolute top-3 right-3 glass px-3 py-1 rounded-full flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          <span className="text-sm font-semibold">{shop.rating || "New"}</span>
        </div>
      </div>

      <CardContent className="p-6 space-y-3">
        <div>
          <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
            {shop.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {shop.description || "Quality service you can trust"}
          </p>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span className="truncate">{shop.address}</span>
          </div>
        </div>

        {shop.services && shop.services.length > 0 && (
          <div className="flex items-center gap-2 pt-2 border-t border-border/50">
            <span className="text-xs text-muted-foreground">
              {shop.services.length} service{shop.services.length !== 1 ? "s" : ""} available
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ShopCard;