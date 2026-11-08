<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EnergyTip extends Model
{
    protected $fillable = ['admin_id', 'title', 'description', 'category'];
    public function admin()      { return $this->belongsTo(Admin::class); }
    public function households() { return $this->belongsToMany(Household::class, 'saved_tips'); }
}
