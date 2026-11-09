<?php

namespace App\Http\Controllers\Household;

use App\Http\Controllers\Controller;
use App\Models\Appliance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ApplianceController extends Controller
{
    // The logged-in user's household (created automatically if missing)
    private function household()
    {
        return Auth::user()->household()->firstOrCreate([], ['address' => 'Not set yet']);
    }

    // A household may only touch its own appliances
    private function ownOrFail(Appliance $appliance): void
    {
        abort_unless($appliance->household_id === $this->household()->id, 403);
    }

    private function rules(): array
    {
        return [
            'appliance_name' => ['required', 'string', 'max:100'],
            'wattage'        => ['required', 'integer', 'min:1', 'max:100000'],
            'hours_per_day'  => ['required', 'numeric', 'min:0', 'max:24'],
            'category'       => ['nullable', 'string', 'max:50'],
        ];
    }

    public function index()
    {
        return Inertia::render('household/appliances/index', [
            'appliances' => $this->household()->appliances()->latest()->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('household/appliances/create');
    }

    public function store(Request $request)
    {
        $this->household()->appliances()->create($request->validate($this->rules()));

        return redirect()->route('household.appliances.index');
    }

    public function edit(Appliance $appliance)
    {
        $this->ownOrFail($appliance);

        return Inertia::render('household/appliances/edit', ['appliance' => $appliance]);
    }

    public function update(Request $request, Appliance $appliance)
    {
        $this->ownOrFail($appliance);
        $appliance->update($request->validate($this->rules()));

        return redirect()->route('household.appliances.index');
    }

    public function destroy(Appliance $appliance)
    {
        $this->ownOrFail($appliance);
        $appliance->delete();

        return redirect()->route('household.appliances.index');
    }
}