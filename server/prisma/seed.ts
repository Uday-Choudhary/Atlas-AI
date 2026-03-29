import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash("test1234", 10);

    // Create test user
    const user = await prisma.user.upsert({
        where: { email: "test@atlas.ai" },
        update: {
            password: hashedPassword,
            firstName: "Test",
            lastName: "User",
        },
        create: {
            email: "test@atlas.ai",
            password: hashedPassword,
            firstName: "Test",
            lastName: "User",
        },
    });

    console.log("✅ Test user created:", user.email);

    // Create sample community trips
    const parisItinerary = {
        trip_plan: {
            destination: "Paris, France",
            duration: "3 days",
            origin: "New York",
            budget: "Medium",
            group_size: "Couple",
            hotels: [
                {
                    hotel_name: "Hôtel Le Marais",
                    hotel_address: "12 Rue de Rivoli, 75004 Paris",
                    price_per_night: "$180",
                    hotel_image_url: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800",
                    geo_coordinates: { latitude: 48.8566, longitude: 2.3522 },
                    rating: 4.5,
                    description: "Charming boutique hotel in the heart of Le Marais district"
                }
            ],
            itinerary: [
                {
                    day: 1,
                    day_plan: "Iconic Paris Landmarks",
                    best_time_to_visit_day: "Morning to Evening",
                    activities: [
                        {
                            place_name: "Eiffel Tower",
                            place_details: "Iconic iron lattice tower offering panoramic city views from three levels.",
                            place_image_url: "https://images.unsplash.com/photo-1543349689-9a4d426bee8e?w=800",
                            geo_coordinates: { latitude: 48.8584, longitude: 2.2945 },
                            place_address: "Champ de Mars, 5 Avenue Anatole France, 75007 Paris",
                            ticket_pricing: "€26.80 (summit access)",
                            time_travel_each_location: "2-3 hours",
                            best_time_to_visit: "Morning (9-10 AM)"
                        },
                        {
                            place_name: "Louvre Museum",
                            place_details: "World's largest art museum, home to the Mona Lisa and Venus de Milo.",
                            place_image_url: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800",
                            geo_coordinates: { latitude: 48.8606, longitude: 2.3376 },
                            place_address: "Rue de Rivoli, 75001 Paris",
                            ticket_pricing: "€17",
                            time_travel_each_location: "3-4 hours",
                            best_time_to_visit: "Afternoon (2-6 PM)"
                        },
                        {
                            place_name: "Seine River Cruise",
                            place_details: "Evening cruise along the Seine with views of illuminated Paris landmarks.",
                            place_image_url: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800",
                            geo_coordinates: { latitude: 48.8600, longitude: 2.3200 },
                            place_address: "Port de la Bourdonnais, 75007 Paris",
                            ticket_pricing: "€15",
                            time_travel_each_location: "1.5 hours",
                            best_time_to_visit: "Evening (8-10 PM)"
                        }
                    ]
                },
                {
                    day: 2,
                    day_plan: "Art & Culture",
                    best_time_to_visit_day: "Morning to Afternoon",
                    activities: [
                        {
                            place_name: "Musée d'Orsay",
                            place_details: "Impressionist and post-impressionist masterpieces in a former railway station.",
                            place_image_url: "https://images.unsplash.com/photo-1583265627959-fb7042f5133b?w=800",
                            geo_coordinates: { latitude: 48.8600, longitude: 2.3266 },
                            place_address: "1 Rue de la Légion d'Honneur, 75007 Paris",
                            ticket_pricing: "€16",
                            time_travel_each_location: "3 hours",
                            best_time_to_visit: "Morning (9:30 AM)"
                        },
                        {
                            place_name: "Montmartre & Sacré-Cœur",
                            place_details: "Bohemian hilltop district with the stunning white basilica and artist square.",
                            place_image_url: "https://images.unsplash.com/photo-1550340499-a6c60fc8287c?w=800",
                            geo_coordinates: { latitude: 48.8867, longitude: 2.3431 },
                            place_address: "35 Rue du Chevalier de la Barre, 75018 Paris",
                            ticket_pricing: "Free (dome €7)",
                            time_travel_each_location: "2-3 hours",
                            best_time_to_visit: "Afternoon"
                        }
                    ]
                },
                {
                    day: 3,
                    day_plan: "Royal Paris",
                    best_time_to_visit_day: "Full Day",
                    activities: [
                        {
                            place_name: "Palace of Versailles",
                            place_details: "Former royal residence with stunning gardens, Hall of Mirrors, and Grand Trianon.",
                            place_image_url: "https://images.unsplash.com/photo-1584266032559-fe41e5542d85?w=800",
                            geo_coordinates: { latitude: 48.8049, longitude: 2.1204 },
                            place_address: "Place d'Armes, 78000 Versailles",
                            ticket_pricing: "€21",
                            time_travel_each_location: "5-6 hours",
                            best_time_to_visit: "Full Day (9 AM - 3 PM)"
                        }
                    ]
                }
            ]
        }
    };

    const tokyoItinerary = {
        trip_plan: {
            destination: "Tokyo, Japan",
            duration: "4 days",
            origin: "London",
            budget: "High",
            group_size: "Friends",
            hotels: [
                {
                    hotel_name: "Park Hyatt Tokyo",
                    hotel_address: "3-7-1-2 Nishi-Shinjuku, Shinjuku-ku, Tokyo",
                    price_per_night: "$450",
                    hotel_image_url: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800",
                    geo_coordinates: { latitude: 35.6855, longitude: 139.6917 },
                    rating: 4.8,
                    description: "Luxury hotel in Shinjuku with iconic views of Mount Fuji"
                }
            ],
            itinerary: [
                {
                    day: 1,
                    day_plan: "Traditional Tokyo",
                    best_time_to_visit_day: "Morning to Evening",
                    activities: [
                        {
                            place_name: "Senso-ji Temple",
                            place_details: "Tokyo's oldest and most significant temple in Asakusa, with the iconic Thunder Gate.",
                            place_image_url: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800",
                            geo_coordinates: { latitude: 35.7148, longitude: 139.7967 },
                            place_address: "2-3-1 Asakusa, Taito-ku, Tokyo",
                            ticket_pricing: "Free",
                            time_travel_each_location: "2 hours",
                            best_time_to_visit: "Early Morning (6-8 AM)"
                        },
                        {
                            place_name: "Shibuya Crossing",
                            place_details: "The world-famous scramble intersection, a symbol of Tokyo's incredible energy.",
                            place_image_url: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800",
                            geo_coordinates: { latitude: 35.6595, longitude: 139.7004 },
                            place_address: "Shibuya, Tokyo",
                            ticket_pricing: "Free",
                            time_travel_each_location: "1 hour",
                            best_time_to_visit: "Evening"
                        }
                    ]
                }
            ]
        }
    };

    await prisma.trip.upsert({
        where: { id: "seed-trip-paris" },
        update: {},
        create: {
            id: "seed-trip-paris",
            userId: user.id,
            title: "Romantic Paris Getaway",
            destination: "Paris, France",
            startDate: new Date("2026-05-15"),
            endDate: new Date("2026-05-18"),
            budget: "Medium",
            groupSize: "Couple",
            travelStyle: "Cultural",
            isPublic: true,
            itinerary: parisItinerary,
            forkCount: 12,
            likes: 45,
        },
    });

    await prisma.trip.upsert({
        where: { id: "seed-trip-tokyo" },
        update: {},
        create: {
            id: "seed-trip-tokyo",
            userId: user.id,
            title: "Tokyo Adventure with Friends",
            destination: "Tokyo, Japan",
            startDate: new Date("2026-06-01"),
            endDate: new Date("2026-06-05"),
            budget: "High",
            groupSize: "Friends",
            travelStyle: "Adventure",
            isPublic: true,
            itinerary: tokyoItinerary,
            forkCount: 8,
            likes: 32,
        },
    });

    console.log("✅ Sample community trips created");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
