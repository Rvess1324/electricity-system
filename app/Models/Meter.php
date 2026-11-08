<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Meter extends Model
{
    protected $fillable = ['household_id', 'meter_no', 'meter_type', 'installation_date'];
    public function household()       { return $this->belongsTo(Household::class); }
    public function usageRecords()    { return $this->hasMany(UsageRecord::class); }
    public function serviceRequests() { return $this->hasMany(ServiceRequest::class); }
}
