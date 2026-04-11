import { motion } from "framer-motion";
import { MapPin, Star, Ticket, Clock } from "lucide-react";

interface PlaceCardProps {
    place: {
        place_name: string;
        place_details?: string;
        place_image_url?: string;
        place_address?: string;
        ticket_pricing?: string;
        time_travel_each_location?: string;
        best_time_to_visit?: string;
        rating?: number;
        geo_coordinates?: {
            latitude: number;
            longitude: number;
        };
    };
    index?: number;
}

const getPlaceImage = (name: string) => {
    const query = name ? encodeURIComponent(name.split(" ")[0].replace(/[^a-zA-Z]/g, "")) : "landmark";
    return `https://loremflickr.com/400/400/${query},landmark/all`;
};

const PlaceCard = ({ place, index = 0 }: PlaceCardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className="rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-sm hover:shadow-lg transition-shadow duration-300 group"
        >
            {/* Image */}
            {place.place_image_url && (
                <div className="relative h-40 overflow-hidden">
                    <img
                        src={place.place_image_url || getPlaceImage(place.place_name || "landmark")}
                        alt={place.place_name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = getPlaceImage(place.place_name || "city") + `?random=${index}`;
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-card-overlay" />
                    {place.rating && (
                        <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            {place.rating}
                        </div>
                    )}
                </div>
            )}

            {/* Content */}
            <div className="p-4 bg-white">
                <h4 className="font-display text-[16px] font-bold text-gray-900 mb-1 leading-tight line-clamp-1">
                    {place.place_name}
                </h4>

                {place.place_details && (
                    <p className="text-[13px] font-body text-gray-500 line-clamp-2 mb-3">
                        {place.place_details}
                    </p>
                )}

                <div className="flex flex-wrap gap-2 mt-auto">
                    {place.place_address && (
                        <div className="flex items-center gap-1 text-[12px] font-body text-gray-500">
                            <MapPin className="h-3.5 w-3.5 text-[var(--color-teal-500)]" />
                            <span className="truncate max-w-[150px]">{place.place_address}</span>
                        </div>
                    )}
                    {place.ticket_pricing && (
                        <div className="flex items-center gap-1.5 text-[12px] font-body font-bold text-[var(--color-emerald-600)] bg-[var(--color-emerald-50)] px-2 py-0.5 rounded-md">
                            <Ticket className="h-3.5 w-3.5" />
                            {place.ticket_pricing}
                        </div>
                    )}
                    {place.time_travel_each_location && (
                        <div className="flex items-center gap-1.5 text-[12px] font-body font-medium text-[var(--color-ocean-600)] bg-[var(--color-ocean-50)] px-2 py-0.5 rounded-md">
                            <Clock className="h-3.5 w-3.5" />
                            {place.time_travel_each_location}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default PlaceCard;
