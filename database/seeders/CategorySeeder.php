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
        $furniture = [
            'Sofas & Sectionals',
            'Bed Frames',
            'Dining Tables',
            'Office Desks',
            'Wardrobes',
            'Coffee Tables',
            'Bookshelves',
            'Outdoor Seating',
            'Chairs',
            'Tables',
            'Lamps',
            'Decor',
            'Beds',
            'Mattresses',
            'Bedroom Sets',
            'Bathroom Fixtures',
            'Kitchen Appliances',
            'Personal Care',
            'Cookware',
            'Cutlery',
            'Dinnerware',
            'Glassware',
        ];

        foreach ($furniture as $item) {
            $slug = Str::slug($item);
            Category::firstOrCreate(
                ['slug' => $slug],
                ['name' => $item],
            );
        }
    }
}
