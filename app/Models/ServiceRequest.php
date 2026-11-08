<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceRequest extends Model
{
    protected $fillable = ['household_id', 'meter_id', 'electrician_id', 'issue_description', 'status', 'requested_date', 'resolved_date'];
    public function household()   { return $this->belongsTo(Household::class); }
    public function meter()       { return $this->belongsTo(Meter::class); }
    public function electrician() { return $this->belongsTo(Electrician::class); }
}
