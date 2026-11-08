<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EnergyPlan extends Model
{
    protected $fillable = ['household_id', 'plan_name', 'monthly_kwh_target', 'monthly_budget', 'start_date', 'end_date'];
    public function household() { return $this->belongsTo(Household::class); }
    public function planItems() { return $this->hasMany(PlanItem::class); }
}
