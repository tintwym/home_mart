<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Subcategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    /**
     * IKEA-style taxonomy: categories (parents) and subcategories (children).
     * Child entries may be a string name or [ 'name' => ..., 'slug' => ... ] when the slug must be unique globally.
     */
    public function run(): void
    {
        $tree = [
            'Furniture' => [
                'Sofas & armchairs',
                ['name' => 'Beds & mattresses', 'slug' => 'beds-mattresses-furniture'],
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
            'Beds & mattresses' => [
                'Bed frames',
                'Mattresses',
                'Bedding sets',
                'Pillows',
                'Duvets',
                'Bed linen',
            ],
            'Kitchen' => [
                'Kitchen cabinets & fronts',
                'Kitchen appliances',
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
                'Shower & bath',
                'Bathroom accessories',
                'Towels & mats',
                'Storage for bathroom',
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
            'Electronics & accessories' => [
                'Charging & cables',
                'Speakers',
                'Smart home',
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
            $parent = Category::firstOrCreate(
                ['slug' => $parentSlug],
                ['name' => $parentName],
            );

            foreach ($children as $child) {
                if (is_string($child)) {
                    $childName = $child;
                    $childSlug = Str::slug($childName);
                } else {
                    $childName = $child['name'];
                    $childSlug = $child['slug'];
                }

                Subcategory::firstOrCreate(
                    ['slug' => $childSlug],
                    ['category_id' => $parent->id, 'name' => $childName],
                );
            }
        }
    }
}
