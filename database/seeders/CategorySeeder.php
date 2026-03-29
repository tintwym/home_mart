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
        ];

        foreach ($furniture as $item) {
            Category::create([
                'name' => $item,
                'slug' => Str::slug($item),
            ]);
        }
    }
}
