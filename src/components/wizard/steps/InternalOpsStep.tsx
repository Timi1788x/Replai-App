import { FieldGroup, TextInput, TextArea, type StepProps } from './shared';
import { Wrench, Building2, DollarSign, AlertTriangle } from 'lucide-react';

export default function InternalOpsStep({ register }: StepProps) {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
                <Wrench size={18} className="text-accent" />
                <h2 className="text-lg font-bold text-white">Internal Operations</h2>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 mb-4">
                <AlertTriangle size={14} className="text-red-400 shrink-0" />
                <p className="text-xs text-red-300">
                    This information is <strong>never</strong> shown to guests or the AI. Strictly for backend workflows.
                </p>
            </div>

            {/* ─── Cleaning ─────────────────── */}
            <FieldGroup label="Cleaning">
                <div className="p-3 rounded-lg bg-dark-800/50 border border-dark-700/50 space-y-2">
                    <span className="text-xs font-medium text-dark-300">Cleaning Crew</span>
                    <div className="grid grid-cols-2 gap-3">
                        <TextInput label="Name" placeholder="Maria's Cleaning" {...register('internal_ops.cleaning.crew_contact.name')} />
                        <TextInput label="Phone" placeholder="+43 664 1234567" {...register('internal_ops.cleaning.crew_contact.phone')} />
                    </div>
                    <TextInput label="Email" placeholder="maria@clean.at" {...register('internal_ops.cleaning.crew_contact.email')} />
                </div>
                <div className="p-3 rounded-lg bg-dark-800/50 border border-dark-700/50 space-y-2">
                    <span className="text-xs font-medium text-dark-300">Backup Contact</span>
                    <div className="grid grid-cols-2 gap-3">
                        <TextInput label="Name" placeholder="Lisa Backup" {...register('internal_ops.cleaning.backup_contact.name')} />
                        <TextInput label="Phone" placeholder="+43 664 7654321" {...register('internal_ops.cleaning.backup_contact.phone')} />
                    </div>
                </div>
                <TextArea
                    label="Schedule Notes"
                    placeholder="Cleaning between 11:00-14:00. Allow 2h for deep clean."
                    rows={2}
                    {...register('internal_ops.cleaning.schedule_notes')}
                />
                <TextInput label="Supplies Location" placeholder="Closet under the stairs, shelf B" {...register('internal_ops.cleaning.supplies_location')} />

                <div className="p-3 rounded-lg bg-dark-800/50 border border-dark-700/50 space-y-2">
                    <span className="text-xs font-medium text-dark-300">Linen Provider</span>
                    <div className="grid grid-cols-3 gap-3">
                        <TextInput label="Company" placeholder="Textil Mayer" {...register('internal_ops.cleaning.linen_provider.company')} />
                        <TextInput label="Phone" placeholder="+43 5522 9876" {...register('internal_ops.cleaning.linen_provider.phone')} />
                        <TextInput label="Delivery Day" placeholder="Mondays" {...register('internal_ops.cleaning.linen_provider.delivery_day')} />
                    </div>
                </div>
            </FieldGroup>

            {/* ─── Maintenance ──────────────── */}
            <FieldGroup label="Maintenance Vendors">
                {(['plumber', 'electrician', 'general_handyman'] as const).map((role) => (
                    <div key={role} className="p-3 rounded-lg bg-dark-800/50 border border-dark-700/50 space-y-2">
                        <span className="text-xs font-medium text-dark-300 capitalize">{role.replace('_', ' ')}</span>
                        <div className="grid grid-cols-2 gap-3">
                            <TextInput label="Name" placeholder="Hans Müller" {...register(`internal_ops.maintenance.${role}.name`)} />
                            <TextInput label="Phone" placeholder="+43 664 ..." {...register(`internal_ops.maintenance.${role}.phone`)} />
                        </div>
                        <TextInput label="Notes" placeholder="Available weekdays 8-17" {...register(`internal_ops.maintenance.${role}.notes`)} />
                    </div>
                ))}
                <div className="p-3 rounded-lg bg-dark-800/50 border border-dark-700/50 space-y-2">
                    <span className="text-xs font-medium text-dark-300">HVAC</span>
                    <div className="grid grid-cols-3 gap-3">
                        <TextInput label="Company" placeholder="Klima GmbH" {...register('internal_ops.maintenance.hvac.company')} />
                        <TextInput label="Phone" placeholder="+43 5522 ..." {...register('internal_ops.maintenance.hvac.phone')} />
                        <TextInput label="Contract ID" placeholder="KL-2024-001" {...register('internal_ops.maintenance.hvac.contract_id')} />
                    </div>
                </div>
            </FieldGroup>

            {/* ─── Building Management ──────── */}
            <FieldGroup label="Building Management">
                <div className="flex items-center gap-2 mb-1">
                    <Building2 size={14} className="text-dark-400" />
                    <span className="text-xs text-dark-500">HOA or building manager</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <TextInput label="Contact Name" placeholder="Hausverwaltung Alpen" {...register('internal_ops.building_management.contact.name')} />
                    <TextInput label="Phone" placeholder="+43 5522 ..." {...register('internal_ops.building_management.contact.phone')} />
                </div>
                <TextInput label="Email" placeholder="hv@alpen.at" {...register('internal_ops.building_management.contact.email')} />
                <TextArea
                    label="Notes"
                    placeholder="Key drop-off in lobby lockbox. Garbage rooms open 7-20."
                    rows={2}
                    {...register('internal_ops.building_management.notes')}
                />
            </FieldGroup>

            {/* ─── Troubleshooting ──────────── */}
            <FieldGroup label="Troubleshooting Locations">
                <div className="grid grid-cols-2 gap-3">
                    <TextInput label="Main Water Valve" placeholder="Basement, behind the boiler" {...register('internal_ops.troubleshooting.main_water_valve')} />
                    <TextInput label="Fuse Box" placeholder="Entrance hallway, top cabinet" {...register('internal_ops.troubleshooting.fuse_box')} />
                    <TextInput label="Gas Shutoff" placeholder="Kitchen, behind fridge" {...register('internal_ops.troubleshooting.gas_shutoff')} />
                    <TextInput label="Spare Keys" placeholder="Lockbox in garage" {...register('internal_ops.troubleshooting.spare_keys_location')} />
                </div>
                <div className="p-3 rounded-lg bg-dark-800/50 border border-dark-700/50 space-y-2">
                    <span className="text-xs font-medium text-dark-300">WiFi Router Admin</span>
                    <div className="grid grid-cols-2 gap-3">
                        <TextInput label="Location" placeholder="Living room TV cabinet" {...register('internal_ops.troubleshooting.wifi_router.location')} />
                        <TextInput label="Admin URL" placeholder="http://192.168.1.1" {...register('internal_ops.troubleshooting.wifi_router.admin_url')} />
                        <TextInput label="Admin User" placeholder="admin" {...register('internal_ops.troubleshooting.wifi_router.admin_user')} />
                        <TextInput label="Admin Password" placeholder="••••••••" type="password" {...register('internal_ops.troubleshooting.wifi_router.admin_password')} />
                    </div>
                </div>
                <TextInput label="Smart Lock Master Code" placeholder="••••••" type="password" {...register('internal_ops.troubleshooting.smart_lock_master_code')} />
            </FieldGroup>

            {/* ─── Financial ────────────────── */}
            <FieldGroup label="Financial">
                <div className="flex items-center gap-2 mb-1">
                    <DollarSign size={14} className="text-dark-400" />
                    <span className="text-xs text-dark-500">Cost tracking and payout info</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <TextInput label="Cleaning Fee (€)" type="number" placeholder="80" {...register('internal_ops.financial.cleaning_fee_eur', { valueAsNumber: true })} />
                    <TextInput label="Commission (%)" type="number" step="0.1" placeholder="15" {...register('internal_ops.financial.commission_rate_pct', { valueAsNumber: true })} />
                    <TextInput label="Payout Method" placeholder="Bank transfer, IBAN AT..." {...register('internal_ops.financial.payout_method')} />
                    <TextInput label="Tax ID" placeholder="ATU12345678" {...register('internal_ops.financial.tax_id')} />
                </div>
            </FieldGroup>
        </div>
    );
}
