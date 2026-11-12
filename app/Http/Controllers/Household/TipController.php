<?php

namespace App\Http\Controllers\Household;

use App\Http\Controllers\Controller;
use App\Models\EnergyTip;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class TipController extends Controller
{
    private function household()
    {
        return Auth::user()->household()->firstOrCreate([], ['address' => 'Not set yet']);
    }

    // Browse all tips, optionally filtered by category
    public function index(Request $request)
    {
        $household = $this->household();

        $savedIds = $household->savedTips()->pluck('energy_tips.id')->all();

        // Categories of my appliances, lower-cased so "cooling" matches "Cooling"
        $myCategories = $household->appliances()
            ->whereNotNull('category')
            ->pluck('category')
            ->map(fn ($c) => strtolower(trim($c)))
            ->unique()
            ->values();

        $query = EnergyTip::latest();
        if ($request->filled('category')) {
            $query->where('category', $request->input('category'));
        }

        $tips = $query->get()->map(fn ($t) => [
            'id'          => $t->id,
            'title'       => $t->title,
            'description' => $t->description,
            'category'    => $t->category,
            'saved'       => in_array($t->id, $savedIds),
            'suggested'   => $t->category !== null && $myCategories->contains(strtolower($t->category)),
        ])->sortByDesc('suggested')->values();

        return Inertia::render('household/tips/index', [
            'tips'       => $tips,
            'categories' => EnergyTip::CATEGORIES,
            'selected'   => $request->input('category', ''),
        ]);
    }

    // My saved tips, newest first
    public function saved()
    {
        $tips = $this->household()->savedTips()
            ->orderByPivot('saved_at', 'desc')
            ->get()
            ->map(fn ($t) => [
                'id'          => $t->id,
                'title'       => $t->title,
                'description' => $t->description,
                'category'    => $t->category,
                'saved_at'    => $t->pivot->saved_at,
            ]);

        return Inertia::render('household/tips/saved', ['tips' => $tips]);
    }

    public function save(EnergyTip $tip)
    {
        // Saving twice does nothing (the table also has a unique rule)
        $this->household()->savedTips()->syncWithoutDetaching([$tip->id]);

        return back();
    }

    public function unsave(EnergyTip $tip)
    {
        $this->household()->savedTips()->detach($tip->id);

        return back();
    }
}