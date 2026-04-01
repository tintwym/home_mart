<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // IKEA-style taxonomy (flattened).
        // Our categories table is flat (no parent_id), so we seed common shopper-facing buckets.
        $items = [
            // Furniture
            'Sofas & armchairs',
            'Beds & mattresses',
            'Wardrobes',
            'Chests of drawers',
            'Tables & desks',
            'Chairs & stools',
            'TV & media furniture',
            'Bookcases & shelving units',
            'Cabinets & sideboards',
            'Room dividers',
            "Children's furniture",
            'Outdoor furniture',

            // Storage & organization
            'Storage & organization',
            'Boxes & baskets',
            'Clothing & shoe storage',
            'Hooks & rails',
            'Garage & utility storage',
            'Home office organization',

            // Kitchen
            'Kitchen',
            'Cookware',
            'Tableware',
            'Kitchen utensils',
            'Food storage',
            'Kitchen organization',
            'Kitchen textiles',

            // Home textiles
            'Home textiles',
            'Curtains & blinds',
            'Rugs',
            'Cushions & throws',
            'Towels',
            'Bath textiles',
            'Table linens',

            // Lighting
            'Lighting',
            'Ceiling lights',
            'Floor lamps',
            'Table lamps',
            'Wall lamps',
            'Smart lighting',
            'Light bulbs & accessories',

            // Home décor
            'Home décor',
            'Mirrors',
            'Frames & pictures',
            'Plants & plant pots',
            'Vases & decorative objects',
            'Candles & candleholders',
            'Clocks',

            // Bathroom
            'Bathroom',
            'Bathroom furniture',
            'Bathroom accessories',
            'Bathroom storage',

            // Laundry & cleaning
            'Laundry & cleaning',
            'Laundry baskets & bags',
            'Drying racks',
            'Ironing',
            'Cleaning tools',
            'Waste sorting & bins',

            // Children & baby
            'Children & baby',
            'Baby furniture',
            'Kids beds',
            'Kids storage',
            'Toys & play',
            'Kids textiles',

            // Outdoor
            'Outdoor',
            'Outdoor lighting',
            'Gardening',
            'Outdoor storage',

            // Tools & hardware
            'Tools & hardware',
            'Handles & knobs',
            'Hinges & fittings',
            'Screws & fixings',
            'Wall mounting',

            // Optional marketplace-friendly
            'Pets',
        ];

        foreach ($items as $item) {
            $slug = Str::slug($item);
            Category::firstOrCreate(
                ['slug' => $slug],
                ['name' => $item],
            );
        }
    }
}
