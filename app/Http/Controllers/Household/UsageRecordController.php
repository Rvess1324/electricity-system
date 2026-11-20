<?php

namespace App\Http\Controllers\Household;

use App\Http\Controllers\Controller;
use App\Models\Meter;
use App\Models\UsageRecord;
use Closure;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class UsageRecordController extends Controller
{
    private const DUPLICATE_DATE_MESSAGE = 'A usage record for this meter on that date already exists. Edit that record instead.';

    private function household()
    {
        return Auth::user()->household()->firstOrCreate([], ['address' => 'Not set yet']);
    }

    // The meter must be mine
    private function meterOrFail(Meter $meter): void
    {
        abort_unless($meter->household_id === $this->household()->id, 403);
    }

    // The record must belong to that meter
    private function recordOrFail(Meter $meter, UsageRecord $usage): void
    {
        $this->meterOrFail($meter);
        abort_unless($usage->meter_id === $meter->id, 404);
    }

    /**
     * One reading per meter per day. kwh_used is stored with 2 decimals, so
     * reject extra precision instead of silently rounding it.
     *
     * @return array<string, array<int, mixed>>
     */
    private function rules(Meter $meter, ?UsageRecord $usage = null): array
    {
        return [
            'usage_date' => [
                'required',
                'date_format:Y-m-d',
                'before_or_equal:today',
                Rule::unique('usage_records', 'usage_date')
                    ->where('meter_id', $meter->id)
                    ->ignore($usage?->id),
            ],
            'kwh_used' => ['required', 'numeric', 'min:0', 'max:99999', 'decimal:0,2'],
        ];
    }

    /**
     * @return array<string, string>
     */
    private function messages(): array
    {
        return [
            'usage_date.unique' => self::DUPLICATE_DATE_MESSAGE,
            'kwh_used.decimal' => 'Enter kWh with at most 2 decimal places.',
        ];
    }

    // Two requests can both pass validation; the unique index stops the second one
    private function saveOrFail(Closure $save): void
    {
        try {
            $save();
        } catch (UniqueConstraintViolationException) {
            throw ValidationException::withMessages(['usage_date' => self::DUPLICATE_DATE_MESSAGE]);
        }
    }

    // Cost is calculated here, never typed by the user
    private function withCost(array $data): array
    {
        $data['estimated_cost'] = round($data['kwh_used'] * config('electricity.rate'), 2);

        return $data;
    }

    public function index(Meter $meter)
    {
        $this->meterOrFail($meter);

        $records = $meter->usageRecords()->orderByDesc('usage_date')->get();

        return Inertia::render('household/usage/index', [
            'meter' => $meter,
            'records' => $records,
            'rate' => config('electricity.rate'),
            'totals' => [
                'kwh' => (float) $records->sum('kwh_used'),
                'cost' => (float) $records->sum('estimated_cost'),
            ],
        ]);
    }

    public function create(Meter $meter)
    {
        $this->meterOrFail($meter);

        return Inertia::render('household/usage/create', [
            'meter' => $meter,
            'rate' => config('electricity.rate'),
        ]);
    }

    public function store(Request $request, Meter $meter)
    {
        $this->meterOrFail($meter);
        $data = $this->withCost($request->validate($this->rules($meter), $this->messages()));

        $this->saveOrFail(fn () => $meter->usageRecords()->create($data));

        return redirect()->route('household.meters.usage.index', $meter);
    }

    public function edit(Meter $meter, UsageRecord $usage)
    {
        $this->recordOrFail($meter, $usage);

        return Inertia::render('household/usage/edit', [
            'meter' => $meter,
            'record' => $usage,
            'rate' => config('electricity.rate'),
        ]);
    }

    public function update(Request $request, Meter $meter, UsageRecord $usage)
    {
        $this->recordOrFail($meter, $usage);
        $data = $this->withCost($request->validate($this->rules($meter, $usage), $this->messages()));

        $this->saveOrFail(fn () => $usage->update($data));

        return redirect()->route('household.meters.usage.index', $meter);
    }

    public function destroy(Meter $meter, UsageRecord $usage)
    {
        $this->recordOrFail($meter, $usage);
        $usage->delete();

        return redirect()->route('household.meters.usage.index', $meter);
    }
}
