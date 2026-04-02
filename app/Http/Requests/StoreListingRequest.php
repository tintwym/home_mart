<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreListingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:5000'],
            'subcategory_id' => ['required', 'exists:subcategories,id'],
            'condition' => ['required', 'string', 'in:new,like_new,good,fair'],
            'price' => ['required', 'numeric', 'min:0'],
            'image' => ['required', 'image', 'max:10240'], // 10 MB (Laravel max is in KB)
            'meetup_location' => ['nullable', 'string', 'max:255'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'image.required' => __('listing.image_required'),
            'image.image' => __('validation.image'),
            'image.max' => __('listing.image_max_size'),
        ];
    }
}
