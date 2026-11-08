<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SavedTip extends Model
{
    protected $fillable = ['household_id', 'energy_tip_id', 'saved_at'];
}
