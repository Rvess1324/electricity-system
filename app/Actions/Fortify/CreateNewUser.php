<?php

namespace App\Actions\Fortify;

use App\Actions\Teams\CreateTeam;
use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\Electrician;
use App\Models\Household;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    public function __construct(private CreateTeam $createTeam)
    {
        //
    }

    /**
     * Validate and create a newly registered user. Only households and electricians
     * can register publicly; an admin can never be created from this form.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        $data = Validator::make($input, [
            ...$this->profileRules(),
            'password' => $this->passwordRules(),
            'role' => ['required', Rule::in(['household', 'electrician'])],
            'phone_no' => ['required', 'string', 'max:20'],
            'address' => ['required', 'string', 'max:255'],

            // Electrician application
            'license_no' => ['required_if:role,electrician', 'nullable', 'string', 'max:50'],
            'qualification_type' => ['required_if:role,electrician', 'nullable', Rule::in(Electrician::QUALIFICATIONS)],
            'specialization' => ['nullable', 'string', 'max:100'],
            'years_experience' => ['required_if:role,electrician', 'nullable', 'integer', 'min:0', 'max:60'],
            'service_area' => ['required_if:role,electrician', 'nullable', 'string', 'max:255'],
            'previous_work' => ['nullable', 'string', 'max:2000'],
        ])->validate();

        return DB::transaction(function () use ($data) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => $data['password'],
                'role' => $data['role'],
            ]);

            // Restores the personal team the starter kit creates for every user
            $this->createTeam->handle($user, "{$user->name}'s Team", isPersonal: true);

            if ($data['role'] === 'electrician') {
                Electrician::create([
                    'user_id' => $user->id,
                    'license_no' => $data['license_no'],
                    'qualification_type' => $data['qualification_type'],
                    'specialization' => $data['specialization'] ?? null,
                    'phone_no' => $data['phone_no'],
                    'address' => $data['address'],
                    'years_experience' => $data['years_experience'],
                    'service_area' => $data['service_area'],
                    'previous_work' => $data['previous_work'] ?? null,
                    'status' => Electrician::PENDING,
                ]);
            } else {
                Household::create([
                    'user_id' => $user->id,
                    'address' => $data['address'],
                    'phone_no' => $data['phone_no'],
                ]);
            }

            return $user;
        });
    }
}
