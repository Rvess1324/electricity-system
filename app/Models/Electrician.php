<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property Carbon|null $reviewed_at
 */
class Electrician extends Model
{
    public const PENDING = 'pending';

    public const APPROVED = 'approved';

    public const REJECTED = 'rejected';

    public const SUSPENDED = 'suspended';

    public const STATUSES = [self::PENDING, self::APPROVED, self::REJECTED, self::SUSPENDED];

    public const QUALIFICATIONS = ['prc', 'tesda', 'other'];

    protected $fillable = [
        'user_id', 'license_no', 'specialization', 'phone_no', 'address', 'qualification_type',
        'years_experience', 'service_area', 'previous_work',
        'status', 'status_reason', 'reviewed_at', 'reviewed_by',
    ];

    protected function casts(): array
    {
        return ['reviewed_at' => 'datetime'];
    }

    public function isApproved(): bool
    {
        return $this->status === self::APPROVED;
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return HasMany<ServiceRequest, $this> */
    public function serviceRequests(): HasMany
    {
        return $this->hasMany(ServiceRequest::class);
    }

    /** @return HasMany<ElectricianDocument, $this> */
    public function documents(): HasMany
    {
        return $this->hasMany(ElectricianDocument::class);
    }

    /** An application can only be approved once it has an ID and a qualification document. */
    public function hasRequiredDocuments(): bool
    {
        $types = $this->documents()->pluck('type');

        return $types->contains('id') && $types->contains('qualification');
    }
}
