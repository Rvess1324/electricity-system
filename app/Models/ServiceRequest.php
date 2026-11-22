<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServiceRequest extends Model
{
    protected $fillable = ['household_id', 'meter_id', 'electrician_id', 'issue_description', 'status', 'requested_date', 'resolved_date'];

    /** @return BelongsTo<Household, $this> */
    public function household(): BelongsTo
    {
        return $this->belongsTo(Household::class);
    }

    /** @return BelongsTo<Meter, $this> */
    public function meter(): BelongsTo
    {
        return $this->belongsTo(Meter::class);
    }

    /** @return BelongsTo<Electrician, $this> */
    public function electrician(): BelongsTo
    {
        return $this->belongsTo(Electrician::class);
    }
}
