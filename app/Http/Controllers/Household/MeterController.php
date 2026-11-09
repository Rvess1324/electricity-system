<?php

namespace App\Http\Controllers\Household;

use App\Http\Controllers\Controller;
use App\Models\Meter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class MeterController extends Controller
{
    private function household()
    {
        return Auth::user()->household()->firstOrCreate([], ['address' => 'Not set yet']);
    }

    private function ownOrFail(Meter $meter): void
    {
        abort_unless($meter->household_id === $this->household()->id, 403);
    }

    private function rules(?Meter $meter = null): array
    {
        return [
            'meter_no'          => ['required', 'string', 'max:50', 'unique:meters,meter_no,' . ($meter?->id ?? 'NULL')],
            'meter_type'        => ['required', 'string', 'max:20'],
            'installation_date' => ['required', 'date'],
        ];
    }

    public function index()
    {
        return Inertia::render('household/meters/index', [
            'meters' => $this->household()->meters()->withCount('usageRecords')->latest()->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('household/meters/create');
    }

    public function store(Request $request)
    {
        $this->household()->meters()->create($request->validate($this->rules()));

        return redirect()->route('household.meters.index');
    }

    public function edit(Meter $meter)
    {
        $this->ownOrFail($meter);

        return Inertia::render('household/meters/edit', ['meter' => $meter]);
    }

    public function update(Request $request, Meter $meter)
    {
        $this->ownOrFail($meter);
        $meter->update($request->validate($this->rules($meter)));

        return redirect()->route('household.meters.index');
    }

    public function destroy(Meter $meter)
    {
        $this->ownOrFail($meter);
        $meter->delete();

        return redirect()->route('household.meters.index');
    }
}