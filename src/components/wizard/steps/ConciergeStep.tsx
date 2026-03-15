import { FieldGroup, TextInput, type StepProps } from './shared';
import { MapPin, UtensilsCrossed, Bus, Phone } from 'lucide-react';

export default function ConciergeStep({ register }: StepProps) {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
                <MapPin size={18} className="text-accent" />
                <h2 className="text-lg font-bold text-white">Local Guide</h2>
            </div>
            <p className="text-xs text-dark-400 -mt-4 mb-4">
                Nearby essentials and recommendations. The AI concierge will use these to help guests.
            </p>

            {/* ─── Emergency Contacts ────────── */}
            <FieldGroup label="Emergency Contacts">
                <div className="flex items-center gap-2 mb-1">
                    <Phone size={14} className="text-dark-400" />
                    <span className="text-xs text-dark-500">Official emergency numbers</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <TextInput
                        label="Police"
                        placeholder="110"
                        {...register('guest_facing.concierge.emergency_contacts.police')}
                    />
                    <TextInput
                        label="Fire"
                        placeholder="112"
                        {...register('guest_facing.concierge.emergency_contacts.fire')}
                    />
                    <TextInput
                        label="Ambulance"
                        placeholder="112"
                        {...register('guest_facing.concierge.emergency_contacts.ambulance')}
                    />
                    <TextInput
                        label="EU Emergency"
                        placeholder="112"
                        {...register('guest_facing.concierge.emergency_contacts.european_emergency')}
                    />
                </div>
            </FieldGroup>

            {/* ─── Supermarkets ──────────────── */}
            <FieldGroup label="Nearest Supermarkets">
                {[0, 1].map((i) => (
                    <div key={i} className="p-3 rounded-lg bg-dark-800/50 border border-dark-700/50 space-y-2">
                        <span className="text-xs font-medium text-dark-300">Supermarket {i + 1}</span>
                        <div className="grid grid-cols-2 gap-3">
                            <TextInput label="Name" placeholder="SPAR" {...register(`guest_facing.concierge.supermarkets.${i}.name`)} />
                            <TextInput label="Distance (m)" type="number" placeholder="350" {...register(`guest_facing.concierge.supermarkets.${i}.distance_m`, { valueAsNumber: true })} />
                        </div>
                        <TextInput label="Address" placeholder="Hauptstraße 15" {...register(`guest_facing.concierge.supermarkets.${i}.address`)} />
                        <TextInput label="Hours" placeholder="Mon-Sat 7:00-20:00" {...register(`guest_facing.concierge.supermarkets.${i}.hours`)} />
                    </div>
                ))}
            </FieldGroup>

            {/* ─── Pharmacies ───────────────── */}
            <FieldGroup label="Nearest Pharmacy">
                <div className="p-3 rounded-lg bg-dark-800/50 border border-dark-700/50 space-y-2">
                    <div className="grid grid-cols-2 gap-3">
                        <TextInput label="Name" placeholder="Stadt-Apotheke" {...register('guest_facing.concierge.pharmacies.0.name')} />
                        <TextInput label="Distance (m)" type="number" placeholder="500" {...register('guest_facing.concierge.pharmacies.0.distance_m', { valueAsNumber: true })} />
                    </div>
                    <TextInput label="Address" placeholder="Marktplatz 3" {...register('guest_facing.concierge.pharmacies.0.address')} />
                    <div className="grid grid-cols-2 gap-3">
                        <TextInput label="Phone" placeholder="+43 5522 1234" {...register('guest_facing.concierge.pharmacies.0.phone')} />
                        <TextInput label="Emergency Phone" placeholder="+43 5522 1234" {...register('guest_facing.concierge.pharmacies.0.emergency_phone')} />
                    </div>
                </div>
            </FieldGroup>

            {/* ─── Restaurants ───────────────── */}
            <FieldGroup label="Restaurant Recommendations">
                <div className="flex items-center gap-2 mb-1">
                    <UtensilsCrossed size={14} className="text-dark-400" />
                    <span className="text-xs text-dark-500">Your personal picks for guests</span>
                </div>
                {[0, 1, 2].map((i) => (
                    <div key={i} className="p-3 rounded-lg bg-dark-800/50 border border-dark-700/50 space-y-2">
                        <span className="text-xs font-medium text-dark-300">Restaurant {i + 1}</span>
                        <div className="grid grid-cols-2 gap-3">
                            <TextInput label="Name" placeholder="Gasthaus Adler" {...register(`guest_facing.concierge.restaurants.${i}.name`)} />
                            <TextInput label="Cuisine" placeholder="Austrian" {...register(`guest_facing.concierge.restaurants.${i}.cuisine`)} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <TextInput label="Address" placeholder="Bahnhofstraße 8" {...register(`guest_facing.concierge.restaurants.${i}.address`)} />
                            <div>
                                <label className="block text-xs font-medium text-dark-400 mb-1">Price Range</label>
                                <select
                                    className="w-full bg-dark-800 text-dark-200 text-sm rounded-lg px-3 py-2 border border-dark-700 outline-none focus:border-accent/50"
                                    {...register(`guest_facing.concierge.restaurants.${i}.price_range`)}
                                >
                                    <option value="">Select</option>
                                    <option value="€">€</option>
                                    <option value="€€">€€</option>
                                    <option value="€€€">€€€</option>
                                    <option value="€€€€">€€€€</option>
                                </select>
                            </div>
                        </div>
                        <TextInput label="Host Tip" placeholder="Try the Wiener Schnitzel — best in town!" {...register(`guest_facing.concierge.restaurants.${i}.host_tip`)} />
                    </div>
                ))}
            </FieldGroup>

            {/* ─── Public Transport ──────────── */}
            <FieldGroup label="Public Transport">
                <div className="flex items-center gap-2 mb-1">
                    <Bus size={14} className="text-dark-400" />
                    <span className="text-xs text-dark-500">Nearest stop and ticket info</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <TextInput label="Nearest Stop" placeholder="Dornbirn Bahnhof" {...register('guest_facing.concierge.public_transport.nearest_stop')} />
                    <TextInput label="Distance (m)" type="number" placeholder="200" {...register('guest_facing.concierge.public_transport.distance_m', { valueAsNumber: true })} />
                </div>
                <TextInput label="Ticket Info" placeholder="Buy tickets via the ÖBB app or at the station" {...register('guest_facing.concierge.public_transport.ticket_info')} />
            </FieldGroup>
        </div>
    );
}
