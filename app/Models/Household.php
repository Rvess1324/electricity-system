<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Household extends Model
{
    protected $fillable = ['user_id', 'address', 'phone_no'];

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return HasMany<Meter, $this> */
    public function meters(): HasMany
    {
        return $this->hasMany(Meter::class);
    }

    /** @return HasMany<Appliance, $this> */
    public function appliances(): HasMany
    {
        return $this->hasMany(Appliance::class);
    }

    /** @return HasMany<EnergyPlan, $this> */
    public function energyPlans(): HasMany
    {
        return $this->hasMany(EnergyPlan::class);
    }

    /** @return HasMany<ServiceRequest, $this> */
    public function serviceRequests(): HasMany
    {
        return $this->hasMany(ServiceRequest::class);
    }

    /** @return BelongsToMany<EnergyTip, $this> */
    public function savedTips(): BelongsToMany
    {
        return $this->belongsToMany(EnergyTip::class, 'saved_tips')->withPivot('saved_at')->withTimestamps();
    }
}
