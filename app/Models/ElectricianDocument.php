<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ElectricianDocument extends Model
{
    public const TYPES = ['id', 'qualification', 'certificate', 'other'];

    protected $fillable = ['electrician_id', 'type', 'path', 'contents', 'original_name', 'mime', 'size'];

    // The file contents can be large; never include them when a model is serialised
    protected $hidden = ['contents'];

    /** @return BelongsTo<Electrician, $this> */
    public function electrician(): BelongsTo
    {
        return $this->belongsTo(Electrician::class);
    }
}
