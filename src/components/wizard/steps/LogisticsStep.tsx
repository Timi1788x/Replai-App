import { FieldGroup, TextInput, Toggle, type StepProps } from './shared';
import { Clock, Car, KeyRound } from 'lucide-react';

export default function LogisticsStep({ register, errors }: StepProps) {
    const logErrors = errors.guest_facing?.logistics;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
                <Clock size={18} className="text-accent" />
                <h2 className="text-lg font-bold text-white">Logistics & Access</h2>
            </div>
            <p className="text-xs text-dark-400 -mt-4 mb-4">
                Check-in/out times, parking, and access instructions. Guests see all of this.
            </p>

            {/* ─── Check-in ─────────────────── */}
            <FieldGroup label="Check-in">
                <div className="grid grid-cols-2 gap-3">
                    <TextInput
                        label="Standard Check-in Time"
                        placeholder="15:00"
                        error={logErrors?.check_in?.standard_time?.message}
                        {...register('guest_facing.logistics.check_in.standard_time')}
                    />
                </div>

                <Toggle
                    label="Offer early check-in"
                    {...register('guest_facing.logistics.check_in.early_check_in.available')}
                />
                <div className="grid grid-cols-3 gap-3">
                    <TextInput
                        label="Earliest"
                        placeholder="13:00"
                        {...register('guest_facing.logistics.check_in.early_check_in.earliest')}
                    />
                    <TextInput
                        label="Latest"
                        placeholder="14:30"
                        {...register('guest_facing.logistics.check_in.early_check_in.latest')}
                    />
                    <TextInput
                        label="Fee (€)"
                        type="number"
                        placeholder="0"
                        {...register('guest_facing.logistics.check_in.early_check_in.fee_eur', { valueAsNumber: true })}
                    />
                </div>

                <Toggle
                    label="Offer late check-in"
                    {...register('guest_facing.logistics.check_in.late_check_in.available')}
                />

                <Toggle
                    label="Luggage drop-off available"
                    {...register('guest_facing.logistics.check_in.luggage_drop_off.available')}
                />
                <TextInput
                    label="Drop-off instructions"
                    placeholder="Leave bags in the entrance hallway, inside closet #2"
                    {...register('guest_facing.logistics.check_in.luggage_drop_off.instructions')}
                />
            </FieldGroup>

            {/* ─── Check-out ────────────────── */}
            <FieldGroup label="Check-out">
                <div className="grid grid-cols-2 gap-3">
                    <TextInput
                        label="Standard Check-out Time"
                        placeholder="10:00"
                        error={logErrors?.check_out?.standard_time?.message}
                        {...register('guest_facing.logistics.check_out.standard_time')}
                    />
                </div>
                <Toggle
                    label="Offer late check-out"
                    {...register('guest_facing.logistics.check_out.late_check_out.available')}
                />
                <div className="grid grid-cols-3 gap-3">
                    <TextInput
                        label="Latest"
                        placeholder="13:00"
                        {...register('guest_facing.logistics.check_out.late_check_out.latest')}
                    />
                    <TextInput
                        label="Fee (€)"
                        type="number"
                        placeholder="0"
                        {...register('guest_facing.logistics.check_out.late_check_out.fee_eur', { valueAsNumber: true })}
                    />
                </div>
            </FieldGroup>

            {/* ─── Parking ──────────────────── */}
            <FieldGroup label="Parking">
                <div className="flex items-center gap-2 mb-2">
                    <Car size={14} className="text-dark-400" />
                    <Toggle
                        label="Parking available"
                        {...register('guest_facing.logistics.parking.available')}
                    />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-medium text-dark-400 mb-1">Type</label>
                        <select
                            className="w-full bg-dark-800 text-dark-200 text-sm rounded-lg px-3 py-2 border border-dark-700 outline-none focus:border-accent/50"
                            {...register('guest_facing.logistics.parking.type')}
                        >
                            <option value="">Select type</option>
                            <option value="underground">Underground</option>
                            <option value="outdoor">Outdoor</option>
                            <option value="street">Street</option>
                            <option value="garage">Garage</option>
                        </select>
                    </div>
                    <TextInput
                        label="Max Height (m)"
                        type="number"
                        step="0.1"
                        placeholder="1.9"
                        {...register('guest_facing.logistics.parking.max_height_m', { valueAsNumber: true })}
                    />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <TextInput
                        label="Spot Number"
                        placeholder="P-42"
                        {...register('guest_facing.logistics.parking.spot_number')}
                    />
                    <TextInput
                        label="Fee/Night (€)"
                        type="number"
                        placeholder="15"
                        {...register('guest_facing.logistics.parking.fee_per_night_eur', { valueAsNumber: true })}
                    />
                </div>
                <TextInput
                    label="Instructions"
                    placeholder="Enter via Hauptstraße 12, use gate code 4711"
                    {...register('guest_facing.logistics.parking.instructions')}
                />
            </FieldGroup>

            {/* ─── Access ───────────────────── */}
            <FieldGroup label="Access">
                <div className="flex items-center gap-2 mb-2">
                    <KeyRound size={14} className="text-dark-400" />
                    <Toggle
                        label="Smart lock enabled"
                        {...register('guest_facing.logistics.access.smart_lock.enabled')}
                    />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <TextInput
                        label="Smart Lock Brand"
                        placeholder="Nuki"
                        {...register('guest_facing.logistics.access.smart_lock.brand')}
                    />
                </div>
                <TextInput
                    label="Smart Lock Instructions"
                    placeholder="Code is sent via SMS 2 hours before check-in"
                    {...register('guest_facing.logistics.access.smart_lock.instructions')}
                />

                <Toggle
                    label="Keybox backup enabled"
                    {...register('guest_facing.logistics.access.keybox.enabled')}
                />
                <div className="grid grid-cols-2 gap-3">
                    <TextInput
                        label="Keybox Location"
                        placeholder="Next to front door, behind the plant"
                        {...register('guest_facing.logistics.access.keybox.location')}
                    />
                    <TextInput
                        label="Keybox Code"
                        placeholder="1234"
                        {...register('guest_facing.logistics.access.keybox.code')}
                    />
                </div>

                <TextInput
                    label="Building Entry Instructions"
                    placeholder="Ring bell #3, then push the door"
                    {...register('guest_facing.logistics.access.building_entry')}
                />
            </FieldGroup>
        </div>
    );
}
