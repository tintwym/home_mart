<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Subcategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    /**
     * IKEA-style taxonomy: each row is one subcategory under a parent category.
     *
     * @var list<array{name: string, subcategory_name: string, slug?: string}>
     */
    public function run(): void
    {
        $rows = [
            ['name' => 'Furniture', 'subcategory_name' => 'Sofas & armchairs'],
            ['name' => 'Furniture', 'subcategory_name' => 'Beds & mattresses', 'slug' => 'beds-mattresses-furniture'],
            ['name' => 'Furniture', 'subcategory_name' => 'Wardrobes'],
            ['name' => 'Furniture', 'subcategory_name' => 'Chests of drawers'],
            ['name' => 'Furniture', 'subcategory_name' => 'Tables & desks'],
            ['name' => 'Furniture', 'subcategory_name' => 'Chairs & stools'],
            ['name' => 'Furniture', 'subcategory_name' => 'TV & media furniture'],
            ['name' => 'Furniture', 'subcategory_name' => 'Bookcases & shelving units'],
            ['name' => 'Furniture', 'subcategory_name' => 'Cabinets & sideboards'],
            ['name' => 'Furniture', 'subcategory_name' => 'Room dividers'],
            ['name' => 'Furniture', 'subcategory_name' => "Children's furniture"],
            // Slug must differ from Outdoor › "Outdoor furniture" (same label, unique slugs).
            ['name' => 'Furniture', 'subcategory_name' => 'Outdoor furniture', 'slug' => 'patio-furniture'],
            ['name' => 'Storage & organization', 'subcategory_name' => 'Shelving systems'],
            ['name' => 'Storage & organization', 'subcategory_name' => 'Boxes & baskets'],
            ['name' => 'Storage & organization', 'subcategory_name' => 'Clothing & shoe storage'],
            ['name' => 'Storage & organization', 'subcategory_name' => 'Hooks & rails'],
            ['name' => 'Storage & organization', 'subcategory_name' => 'Garage & utility storage'],
            ['name' => 'Storage & organization', 'subcategory_name' => 'Home office organization'],
            ['name' => 'Beds & mattresses', 'subcategory_name' => 'Bed frames'],
            ['name' => 'Beds & mattresses', 'subcategory_name' => 'Mattresses'],
            ['name' => 'Beds & mattresses', 'subcategory_name' => 'Bedding sets'],
            ['name' => 'Beds & mattresses', 'subcategory_name' => 'Pillows'],
            ['name' => 'Beds & mattresses', 'subcategory_name' => 'Duvets'],
            ['name' => 'Beds & mattresses', 'subcategory_name' => 'Bed linen'],
            ['name' => 'Kitchen', 'subcategory_name' => 'Kitchen cabinets & fronts'],
            ['name' => 'Kitchen', 'subcategory_name' => 'Kitchen appliances'],
            ['name' => 'Kitchen', 'subcategory_name' => 'Cookware'],
            ['name' => 'Kitchen', 'subcategory_name' => 'Tableware'],
            ['name' => 'Kitchen', 'subcategory_name' => 'Kitchen utensils'],
            ['name' => 'Kitchen', 'subcategory_name' => 'Food storage'],
            ['name' => 'Kitchen', 'subcategory_name' => 'Kitchen organization'],
            ['name' => 'Kitchen', 'subcategory_name' => 'Kitchen textiles'],
            ['name' => 'Home textiles', 'subcategory_name' => 'Curtains & blinds'],
            ['name' => 'Home textiles', 'subcategory_name' => 'Rugs'],
            ['name' => 'Home textiles', 'subcategory_name' => 'Cushions & throws'],
            ['name' => 'Home textiles', 'subcategory_name' => 'Towels'],
            ['name' => 'Home textiles', 'subcategory_name' => 'Bath textiles'],
            ['name' => 'Home textiles', 'subcategory_name' => 'Table linens'],
            ['name' => 'Lighting', 'subcategory_name' => 'Ceiling lights'],
            ['name' => 'Lighting', 'subcategory_name' => 'Floor lamps'],
            ['name' => 'Lighting', 'subcategory_name' => 'Table lamps'],
            ['name' => 'Lighting', 'subcategory_name' => 'Wall lamps'],
            ['name' => 'Lighting', 'subcategory_name' => 'Smart lighting'],
            ['name' => 'Lighting', 'subcategory_name' => 'Light bulbs & accessories'],
            ['name' => 'Home décor', 'subcategory_name' => 'Mirrors'],
            ['name' => 'Home décor', 'subcategory_name' => 'Frames & pictures'],
            ['name' => 'Home décor', 'subcategory_name' => 'Plants & plant pots'],
            ['name' => 'Home décor', 'subcategory_name' => 'Vases & decorative objects'],
            ['name' => 'Home décor', 'subcategory_name' => 'Candles & candleholders'],
            ['name' => 'Home décor', 'subcategory_name' => 'Clocks'],
            ['name' => 'Bathroom', 'subcategory_name' => 'Bathroom furniture'],
            ['name' => 'Bathroom', 'subcategory_name' => 'Shower & bath'],
            ['name' => 'Bathroom', 'subcategory_name' => 'Bathroom accessories'],
            ['name' => 'Bathroom', 'subcategory_name' => 'Towels & mats'],
            ['name' => 'Bathroom', 'subcategory_name' => 'Storage for bathroom'],
            ['name' => 'Laundry & cleaning', 'subcategory_name' => 'Laundry baskets & bags'],
            ['name' => 'Laundry & cleaning', 'subcategory_name' => 'Drying racks'],
            ['name' => 'Laundry & cleaning', 'subcategory_name' => 'Ironing'],
            ['name' => 'Laundry & cleaning', 'subcategory_name' => 'Cleaning tools'],
            ['name' => 'Laundry & cleaning', 'subcategory_name' => 'Waste sorting & bins'],
            ['name' => 'Children & baby', 'subcategory_name' => 'Baby furniture'],
            ['name' => 'Children & baby', 'subcategory_name' => 'Kids beds'],
            ['name' => 'Children & baby', 'subcategory_name' => 'Kids storage'],
            ['name' => 'Children & baby', 'subcategory_name' => 'Toys & play'],
            ['name' => 'Children & baby', 'subcategory_name' => 'Kids textiles'],
            ['name' => 'Outdoor', 'subcategory_name' => 'Outdoor furniture'],
            ['name' => 'Outdoor', 'subcategory_name' => 'Outdoor lighting'],
            ['name' => 'Outdoor', 'subcategory_name' => 'Gardening'],
            ['name' => 'Outdoor', 'subcategory_name' => 'Outdoor storage'],
            ['name' => 'Electronics & accessories', 'subcategory_name' => 'Charging & cables'],
            ['name' => 'Electronics & accessories', 'subcategory_name' => 'Speakers'],
            ['name' => 'Electronics & accessories', 'subcategory_name' => 'Smart home'],
            ['name' => 'Tools & hardware', 'subcategory_name' => 'Handles & knobs'],
            ['name' => 'Tools & hardware', 'subcategory_name' => 'Hinges & fittings'],
            ['name' => 'Tools & hardware', 'subcategory_name' => 'Screws & fixings'],
            ['name' => 'Tools & hardware', 'subcategory_name' => 'Wall mounting'],
            ['name' => 'Pets', 'subcategory_name' => 'Pet beds'],
            ['name' => 'Pets', 'subcategory_name' => 'Bowls & feeding'],
            ['name' => 'Pets', 'subcategory_name' => 'Pet accessories'],
        ];

        foreach ($rows as $row) {
            $parentName = $row['name'];
            $childName = $row['subcategory_name'];
            $childSlug = $row['slug'] ?? Str::slug($childName);

            $parentSlug = Str::slug($parentName);
            $parent = Category::updateOrCreate(
                ['slug' => $parentSlug],
                ['name' => $parentName],
            );

            Subcategory::updateOrCreate(
                ['slug' => $childSlug],
                ['category_id' => $parent->id, 'name' => $childName],
            );
        }
    }
}
