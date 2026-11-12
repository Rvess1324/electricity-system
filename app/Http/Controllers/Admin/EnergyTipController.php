<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\EnergyTip;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class EnergyTipController extends Controller
{
    private function rules(): array
    {
        return [
            'title'       => ['required', 'string', 'max:100'],
            'description' => ['required', 'string', 'max:2000'],
            'category'    => ['required', Rule::in(EnergyTip::CATEGORIES)],
        ];
    }

    public function index()
    {
        return Inertia::render('admin/tips/index', [
            'tips' => EnergyTip::latest()->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/tips/create', ['categories' => EnergyTip::CATEGORIES]);
    }

    public function store(Request $request)
    {
        $data = $request->validate($this->rules());
        // admin_id is nullable, so this works even if the admin has no admins row
        $data['admin_id'] = Auth::user()->admin?->id;

        EnergyTip::create($data);

        return redirect()->route('admin.tips.index');
    }

    public function edit(EnergyTip $tip)
    {
        return Inertia::render('admin/tips/edit', [
            'tip'        => $tip,
            'categories' => EnergyTip::CATEGORIES,
        ]);
    }

    public function update(Request $request, EnergyTip $tip)
    {
        $tip->update($request->validate($this->rules()));

        return redirect()->route('admin.tips.index');
    }

    public function destroy(EnergyTip $tip)
    {
        $tip->delete();

        return redirect()->route('admin.tips.index');
    }
}