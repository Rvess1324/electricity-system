<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Household extends Model
{
    protected $fillable = ['user_id', 'address', 'phone_no'];
    public function user()            { return $this->belongsTo(User::class); }
    public function meters()          { return $this->hasMany(Meter::class); }
    public function appliances()      { return $this->hasMany(Appliance::class); }
    public function energyPlans()     { return $this->hasMany(EnergyPlan::class); }
    public function serviceRequests() { return $this->hasMany(ServiceRequest::class); }
    public function savedTips()       { return $this->belongsToMany(EnergyTip::class, 'saved_tips')->withPivot('saved_at')->withTimestamps(); }
}
