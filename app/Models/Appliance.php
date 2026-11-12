<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Appliance extends Model
{
    protected $fillable = ['household_id', 'appliance_name', 'wattage', 'quantity', 'hours_per_day', 'category'];
    public function household() { return $this->belongsTo(Household::class); }
    public function planItems() { return $this->hasMany(PlanItem::class); }
}