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
        // IKEA-style taxonomy (parents + subcategories).
        $tree = [
            'Furniture' => [
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
            ],
            'Storage & organization' => [
                'Shelving systems',
                'Boxes & baskets',
                'Clothing & shoe storage',
                'Hooks & rails',
                'Garage & utility storage',
                'Home office organization',
            ],
            'Kitchen' => [
                'Kitchen cabinets & fronts',
                'Cookware',
                'Tableware',
                'Kitchen utensils',
                'Food storage',
                'Kitchen organization',
                'Kitchen textiles',
            ],
            'Home textiles' => [
                'Curtains & blinds',
                'Rugs',
                'Cushions & throws',
                'Towels',
                'Bath textiles',
                'Table linens',
            ],
            'Lighting' => [
                'Ceiling lights',
                'Floor lamps',
                'Table lamps',
                'Wall lamps',
                'Smart lighting',
                'Light bulbs & accessories',
            ],
            'Home décor' => [
                'Mirrors',
                'Frames & pictures',
                'Plants & plant pots',
                'Vases & decorative objects',
                'Candles & candleholders',
                'Clocks',
            ],
            'Bathroom' => [
                'Bathroom furniture',
                'Bathroom accessories',
                'Bathroom storage',
                'Shower & bath',
            ],
            'Laundry & cleaning' => [
                'Laundry baskets & bags',
                'Drying racks',
                'Ironing',
                'Cleaning tools',
                'Waste sorting & bins',
            ],
            'Children & baby' => [
                'Baby furniture',
                'Kids beds',
                'Kids storage',
                'Toys & play',
                'Kids textiles',
            ],
            'Outdoor' => [
                'Outdoor furniture',
                'Outdoor lighting',
                'Gardening',
                'Outdoor storage',
            ],
            'Tools & hardware' => [
                'Handles & knobs',
                'Hinges & fittings',
                'Screws & fixings',
                'Wall mounting',
            ],
            'Pets' => [
                'Pet beds',
                'Bowls & feeding',
                'Pet accessories',
            ],
        ];

        foreach ($tree as $parentName => $children) {
            $parentSlug = Str::slug($parentName);
            /** @var \App\Models\Category $parent */
            $parent = Category::firstOrCreate(
                ['slug' => $parentSlug],
                ['name' => $parentName, 'parent_id' => null],
            );

            foreach ($children as $childName) {
                $childSlug = Str::slug($childName);
                Category::firstOrCreate(
                    ['slug' => $childSlug],
                    ['name' => $childName, 'parent_id' => $parent->id],
                );
            }
        }
    }
}
