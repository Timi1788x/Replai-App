import { FieldGroup, TextInput, TextArea, Toggle, type StepProps } from './shared';
import { Shield } from 'lucide-react';

export default function RulesStep({ register }: StepProps) {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
                <Shield size={18} className="text-accent" />
                <h2 className="text-lg font-bold text-white">Rules & Compliance</h2>
            </div>
            <p className="text-xs text-dark-400 -mt-4 mb-4">
                House rules, pet and visitor policies, deposits — the AI will reference these when guests ask.
            </p>

            {/* ─── Quiet Hours ──────────────── */}
            <FieldGroup label="Quiet Hours">
                <div className="grid grid-cols-2 gap-3">
                    <TextInput
                        label="From"
                        placeholder="22:00"
                        {...register('guest_facing.rules.quiet_hours.from')}
                    />
                    <TextInput
                        label="To"
                        placeholder="07:00"
                        {...register('guest_facing.rules.quiet_hours.to')}
                    />
                </div>
                <TextInput
                    label="Additional notes"
                    placeholder="Please be considerate of neighbors on Sundays"
                    {...register('guest_facing.rules.quiet_hours.notes')}
                />
            </FieldGroup>

            {/* ─── Pets ─────────────────────── */}
            <FieldGroup label="Pet Policy">
                <Toggle
                    label="Pets allowed"
                    {...register('guest_facing.rules.pets.allowed')}
                />
                <div className="grid grid-cols-2 gap-3">
                    <TextInput
                        label="Fee (€)"
                        type="number"
                        placeholder="25"
                        {...register('guest_facing.rules.pets.fee_eur', { valueAsNumber: true })}
                    />
                    <TextInput
                        label="Max Weight (kg)"
                        type="number"
                        placeholder="15"
                        {...register('guest_facing.rules.pets.max_weight_kg', { valueAsNumber: true })}
                    />
                </div>
                <TextInput
                    label="Restrictions"
                    placeholder="No cats. Dogs only on ground floor units."
                    {...register('guest_facing.rules.pets.restrictions')}
                />
            </FieldGroup>

            {/* ─── Visitors ─────────────────── */}
            <FieldGroup label="Visitor Policy">
                <Toggle
                    label="Visitors allowed"
                    {...register('guest_facing.rules.visitors.allowed')}
                />
                <div className="grid grid-cols-2 gap-3">
                    <TextInput
                        label="Max Visitors"
                        type="number"
                        placeholder="4"
                        {...register('guest_facing.rules.visitors.max_guests', { valueAsNumber: true })}
                    />
                </div>
                <Toggle
                    label="Overnight visitors allowed"
                    {...register('guest_facing.rules.visitors.overnight_allowed')}
                />
                <TextInput
                    label="Notes"
                    placeholder="Visitors must leave by 10 PM"
                    {...register('guest_facing.rules.visitors.notes')}
                />
            </FieldGroup>

            {/* ─── Parties & Smoking ────────── */}
            <FieldGroup label="Events & Smoking">
                <Toggle
                    label="Parties allowed"
                    {...register('guest_facing.rules.parties.allowed')}
                />
                <TextInput
                    label="Party Notes"
                    placeholder="Small gatherings up to 8 people OK"
                    {...register('guest_facing.rules.parties.notes')}
                />
                <Toggle
                    label="Smoking allowed"
                    {...register('guest_facing.rules.smoking.allowed')}
                />
                <TextInput
                    label="Designated Area"
                    placeholder="Balcony only"
                    {...register('guest_facing.rules.smoking.designated_area')}
                />
                <TextInput
                    label="Penalty (€)"
                    type="number"
                    placeholder="200"
                    {...register('guest_facing.rules.smoking.penalty_eur', { valueAsNumber: true })}
                />
            </FieldGroup>

            {/* ─── Deposit & Tax ─────────────── */}
            <FieldGroup label="Deposit & City Tax">
                <div className="grid grid-cols-2 gap-3">
                    <TextInput
                        label="Deposit Amount (€)"
                        type="number"
                        placeholder="300"
                        {...register('guest_facing.rules.deposit.amount_eur', { valueAsNumber: true })}
                    />
                    <TextInput
                        label="Deposit Method"
                        placeholder="Credit card hold"
                        {...register('guest_facing.rules.deposit.method')}
                    />
                </div>
                <TextArea
                    label="Return Policy"
                    placeholder="Released within 7 days after checkout if no damages"
                    rows={2}
                    {...register('guest_facing.rules.deposit.return_policy')}
                />

                <div className="grid grid-cols-2 gap-3">
                    <TextInput
                        label="City Tax (€/person/night)"
                        type="number"
                        step="0.01"
                        placeholder="3.20"
                        {...register('guest_facing.rules.city_tax.per_person_per_night_eur', { valueAsNumber: true })}
                    />
                    <div className="flex items-end pb-2">
                        <Toggle
                            label="Included in price"
                            {...register('guest_facing.rules.city_tax.included_in_price')}
                        />
                    </div>
                </div>
                <TextInput
                    label="Collection Method"
                    placeholder="Collected on-site in cash"
                    {...register('guest_facing.rules.city_tax.collection_method')}
                />
            </FieldGroup>
        </div>
    );
}
