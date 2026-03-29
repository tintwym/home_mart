<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateListingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->route('listing')->user_id === $this->user()->id;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:5000'],
            'category_id' => ['required', 'exists:categories,id'],
            'condition' => ['required', 'string', 'in:new,like_new,good,fair'],
            'price' => ['required', 'numeric', 'min:0'],
            'image' => ['nullable', 'image', 'max:10240'], // 10 MB
            'meetup_location' => ['nullable', 'string', 'max:255'],
        ];
    }
}
