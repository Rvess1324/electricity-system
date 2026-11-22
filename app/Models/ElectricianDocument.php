<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ElectricianDocument extends Model
{
    public const TYPES = ['id', 'qualification', 'certificate', 'other'];

    protected $fillable = ['electrician_id', 'type', 'path', 'original_name', 'mime', 'size'];

    /** @return BelongsTo<Electrician, $this> */
    public function electrician(): BelongsTo
    {
        return $this->belongsTo(Electrician::class);
    }
}
