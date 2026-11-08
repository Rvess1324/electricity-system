<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlanItem extends Model
{
    protected $fillable = ['energy_plan_id', 'appliance_id', 'planned_hours_per_day', 'priority'];
    public function energyPlan() { return $this->belongsTo(EnergyPlan::class); }
    public function appliance()  { return $this->belongsTo(Appliance::class); }
}
