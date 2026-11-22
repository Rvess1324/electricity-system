import { Form, Head } from '@inertiajs/react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TeamInvitationAlert from '@/components/team-invitation-alert';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { store } from '@/routes/register';
import type { TeamInvitationContext } from '@/types';

type Props = {
    passwordRules: string;
    teamInvitation?: TeamInvitationContext | null;
};

const field =
    'flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50';

export default function Register({ passwordRules, teamInvitation }: Props) {
    const [role, setRole] = useState<'household' | 'electrician'>('household');

    return (
        <>
            <Head title="Register" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        {teamInvitation && (
                            <TeamInvitationAlert
                                invitation={teamInvitation}
                                action="Register"
                            />
                        )}

                        <div className="grid gap-6">
                            <fieldset className="grid gap-2">
                                <legend className="mb-1 text-sm font-medium">
                                    I am registering as
                                </legend>
                                <div className="grid grid-cols-2 gap-3">
                                    {(
                                        [
                                            ['household', 'Household owner'],
                                            ['electrician', 'Electrician'],
                                        ] as const
                                    ).map(([value, label]) => (
                                        <label
                                            key={value}
                                            className={`cursor-pointer rounded-lg border p-3 text-center text-sm font-medium ${
                                                role === value
                                                    ? 'border-primary bg-primary/5'
                                                    : ''
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="role"
                                                value={value}
                                                checked={role === value}
                                                onChange={() => setRole(value)}
                                                className="sr-only"
                                            />
                                            {label}
                                        </label>
                                    ))}
                                </div>
                                <InputError message={errors.role} />
                                {role === 'electrician' && (
                                    <p className="text-xs text-muted-foreground">
                                        An admin reviews every electrician
                                        application. After you verify your
                                        email you can upload your ID and
                                        license or certificate.
                                    </p>
                                )}
                            </fieldset>

                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    autoComplete="name"
                                    name="name"
                                    placeholder="Full name"
                                />
                                <InputError
                                    message={errors.name}
                                    className="mt-2"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    autoComplete="email"
                                    name="email"
                                    placeholder="email@example.com"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="phone_no">Phone number</Label>
                                <Input
                                    id="phone_no"
                                    type="tel"
                                    required
                                    autoComplete="tel"
                                    name="phone_no"
                                    placeholder="09123456789"
                                />
                                <InputError message={errors.phone_no} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="address">
                                    {role === 'household'
                                        ? 'Home address'
                                        : 'Address'}
                                </Label>
                                <Input
                                    id="address"
                                    type="text"
                                    required
                                    autoComplete="street-address"
                                    name="address"
                                    placeholder="House no., street, barangay, city"
                                />
                                <InputError message={errors.address} />
                            </div>

                            {role === 'electrician' && (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="qualification_type">
                                            Qualification
                                        </Label>
                                        <select
                                            id="qualification_type"
                                            name="qualification_type"
                                            required
                                            defaultValue=""
                                            className={field}
                                        >
                                            <option value="" disabled>
                                                Choose one...
                                            </option>
                                            <option value="prc">
                                                PRC license
                                            </option>
                                            <option value="tesda">
                                                TESDA certificate (NC II)
                                            </option>
                                            <option value="other">
                                                Other
                                            </option>
                                        </select>
                                        <InputError
                                            message={errors.qualification_type}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="license_no">
                                            License or certificate number
                                        </Label>
                                        <Input
                                            id="license_no"
                                            type="text"
                                            required
                                            name="license_no"
                                        />
                                        <InputError message={errors.license_no} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="specialization">
                                            Specialization
                                        </Label>
                                        <Input
                                            id="specialization"
                                            type="text"
                                            name="specialization"
                                            placeholder="e.g. Residential wiring"
                                        />
                                        <InputError
                                            message={errors.specialization}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="years_experience">
                                            Years of experience
                                        </Label>
                                        <Input
                                            id="years_experience"
                                            type="number"
                                            min={0}
                                            max={60}
                                            required
                                            name="years_experience"
                                        />
                                        <InputError
                                            message={errors.years_experience}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="service_area">
                                            Service area
                                        </Label>
                                        <Input
                                            id="service_area"
                                            type="text"
                                            required
                                            name="service_area"
                                            placeholder="Barangays or cities you serve"
                                        />
                                        <InputError
                                            message={errors.service_area}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="previous_work">
                                            Previous work (optional)
                                        </Label>
                                        <textarea
                                            id="previous_work"
                                            name="previous_work"
                                            rows={3}
                                            className={field}
                                        />
                                        <InputError
                                            message={errors.previous_work}
                                        />
                                    </div>
                                </>
                            )}

                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <PasswordInput
                                    id="password"
                                    required
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder="Password"
                                    passwordrules={passwordRules}
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">
                                    Confirm password
                                </Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    required
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder="Confirm password"
                                    passwordrules={passwordRules}
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 w-full"
                                data-test="register-user-button"
                            >
                                {processing && <Spinner />}
                                Create account
                            </Button>
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <TextLink
                                href={
                                    teamInvitation
                                        ? login.url({
                                              query: {
                                                  invitation:
                                                      teamInvitation.code,
                                              },
                                          })
                                        : login()
                                }
                                data-test="team-invitation-login-link"
                            >
                                Log in
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}

Register.layout = {
    title: 'Create an account',
    description: 'Enter your details below to create your account',
};
