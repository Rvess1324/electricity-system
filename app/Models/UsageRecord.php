<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UsageRecord extends Model
{
    protected $fillable = ['meter_id', 'usage_date', 'kwh_used', 'estimated_cost'];
    public function meter() { return $this->belongsTo(Meter::class); }
}
