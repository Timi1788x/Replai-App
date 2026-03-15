import { FieldGroup, TextInput, TextArea, type StepProps } from './shared';
import { Wifi, Thermometer, Trash2 } from 'lucide-react';

export default function HowToStep({ register, errors }: StepProps) {
    const howToErrors = errors.guest_facing?.property_howto;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
                <Wifi size={18} className="text-accent" />
                <h2 className="text-lg font-bold text-white">Property How-To</h2>
            </div>
            <p className="text-xs text-dark-400 -mt-4 mb-4">
                WiFi, climate control, appliances, and waste disposal — everything guests need to know.
            </p>

            {/* ─── WiFi ─────────────────────── */}
            <FieldGroup label="WiFi">
                <div className="grid grid-cols-2 gap-3">
                    <TextInput
                        label="SSID (Network Name)"
                        placeholder="AlpineStay-Guest"
                        error={howToErrors?.wifi?.ssid?.message}
                        {...register('guest_facing.property_howto.wifi.ssid')}
                    />
                    <TextInput
                        label="Password"
                        placeholder="Welcome2Alps!"
                        error={howToErrors?.wifi?.password?.message}
                        {...register('guest_facing.property_howto.wifi.password')}
                    />
                </div>
            </FieldGroup>

            {/* ─── Climate ──────────────────── */}
            <FieldGroup label="Climate Control">
                <div className="flex items-center gap-2 mb-1">
                    <Thermometer size={14} className="text-dark-400" />
                    <span className="text-xs text-dark-500">How the heating/cooling works</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <TextInput
                        label="Heating Type"
                        placeholder="Underfloor heating"
                        {...register('guest_facing.property_howto.climate.heating_type')}
                    />
                    <TextInput
                        label="Thermostat Brand"
                        placeholder="tado°"
                        {...register('guest_facing.property_howto.climate.thermostat_brand')}
                    />
                </div>
                <TextArea
                    label="Instructions"
                    placeholder="The thermostat is on the wall in the hallway. Set the desired temperature on the display."
                    rows={2}
                    {...register('guest_facing.property_howto.climate.instructions')}
                />
            </FieldGroup>

            {/* ─── Key Appliances ────────────── */}
            <FieldGroup label="Key Appliances">
                <p className="text-[11px] text-dark-500 mb-2">
                    Add instructions for common appliances. Use the schema's appliance names.
                </p>

                {/* Washing Machine */}
                <div className="p-3 rounded-lg bg-dark-800/50 border border-dark-700/50 space-y-2">
                    <span className="text-xs font-medium text-dark-300">Washing Machine</span>
                    <div className="grid grid-cols-2 gap-3">
                        <TextInput
                            label="Brand"
                            placeholder="Bosch"
                            {...register('guest_facing.property_howto.appliances.washing_machine.brand')}
                        />
                        <TextInput
                            label="Location"
                            placeholder="Bathroom cabinet"
                            {...register('guest_facing.property_howto.appliances.washing_machine.location')}
                        />
                    </div>
                    <TextArea
                        label="Instructions"
                        placeholder="Pods are under the sink. Use 30° eco cycle."
                        rows={2}
                        {...register('guest_facing.property_howto.appliances.washing_machine.instructions')}
                    />
                </div>

                {/* Dishwasher */}
                <div className="p-3 rounded-lg bg-dark-800/50 border border-dark-700/50 space-y-2">
                    <span className="text-xs font-medium text-dark-300">Dishwasher</span>
                    <div className="grid grid-cols-2 gap-3">
                        <TextInput
                            label="Brand"
                            placeholder="Miele"
                            {...register('guest_facing.property_howto.appliances.dishwasher.brand')}
                        />
                        <TextInput
                            label="Location"
                            placeholder="Kitchen island left"
                            {...register('guest_facing.property_howto.appliances.dishwasher.location')}
                        />
                    </div>
                    <TextArea
                        label="Instructions"
                        placeholder="Tabs are in the drawer below. Use the Auto program."
                        rows={2}
                        {...register('guest_facing.property_howto.appliances.dishwasher.instructions')}
                    />
                </div>

                {/* Coffee Machine */}
                <div className="p-3 rounded-lg bg-dark-800/50 border border-dark-700/50 space-y-2">
                    <span className="text-xs font-medium text-dark-300">Coffee Machine</span>
                    <div className="grid grid-cols-2 gap-3">
                        <TextInput
                            label="Brand"
                            placeholder="De'Longhi"
                            {...register('guest_facing.property_howto.appliances.coffee_machine.brand')}
                        />
                        <TextInput
                            label="Location"
                            placeholder="Kitchen counter"
                            {...register('guest_facing.property_howto.appliances.coffee_machine.location')}
                        />
                    </div>
                    <TextArea
                        label="Instructions"
                        placeholder="Press the power button, wait 30s for warmup, then choose your drink."
                        rows={2}
                        {...register('guest_facing.property_howto.appliances.coffee_machine.instructions')}
                    />
                </div>
            </FieldGroup>

            {/* ─── Trash Disposal ────────────── */}
            <FieldGroup label="Trash & Recycling">
                <div className="flex items-center gap-2 mb-1">
                    <Trash2 size={14} className="text-dark-400" />
                    <span className="text-xs text-dark-500">Where and when to dispose trash</span>
                </div>
                <TextInput
                    label="Recycling Location"
                    placeholder="Bins are in the courtyard behind the building"
                    {...register('guest_facing.property_howto.trash_disposal.recycling_location')}
                />
                <div className="grid grid-cols-2 gap-3">
                    <TextInput
                        label="Residual Waste"
                        placeholder="Grey bin, any day"
                        {...register('guest_facing.property_howto.trash_disposal.schedule.residual')}
                    />
                    <TextInput
                        label="Paper"
                        placeholder="Blue bin, Mondays"
                        {...register('guest_facing.property_howto.trash_disposal.schedule.paper')}
                    />
                    <TextInput
                        label="Plastic"
                        placeholder="Yellow bag, Wednesdays"
                        {...register('guest_facing.property_howto.trash_disposal.schedule.plastic')}
                    />
                    <TextInput
                        label="Bio Waste"
                        placeholder="Brown bin, Tuesdays"
                        {...register('guest_facing.property_howto.trash_disposal.schedule.bio')}
                    />
                </div>
                <TextArea
                    label="Special Instructions"
                    placeholder="Glass bottles go to the collection point on Marktplatz (5 min walk)"
                    rows={2}
                    {...register('guest_facing.property_howto.trash_disposal.special_instructions')}
                />
            </FieldGroup>
        </div>
    );
}
