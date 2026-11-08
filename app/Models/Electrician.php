<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Electrician extends Model
{
    protected $fillable = ['user_id', 'license_no', 'specialization'];
    public function user()            { return $this->belongsTo(User::class); }
    public function serviceRequests() { return $this->hasMany(ServiceRequest::class); }
}
