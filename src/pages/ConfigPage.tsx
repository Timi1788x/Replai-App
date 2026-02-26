import { useState } from 'react';
import { Settings, Upload, Plus, Save, Trash2, Home, Loader2, CheckCircle } from 'lucide-react';
import { useSyncKnowledgeBase } from '../api/useSyncKnowledgeBase';

interface PropertyConfig {
    id: string;
    name: string;
    wifiName: string;
    wifiPassword: string;
    checkInTime: string;
    checkOutTime: string;
    checkInInstructions: string;
    parkingRules: string;
    houseRules: string;
    files: string[];
}

const emptyConfig: Omit<PropertyConfig, 'id'> = {
    name: '',
    wifiName: '',
    wifiPassword: '',
    checkInTime: '15:00',
    checkOutTime: '10:00',
    checkInInstructions: '',
    parkingRules: '',
    houseRules: '',
    files: [],
};

export default function ConfigPage() {
    const [configs, setConfigs] = useState<PropertyConfig[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const syncKB = useSyncKnowledgeBase();

    const selected = configs.find((c) => c.id === selectedId);

    const addProperty = () => {
        const newConfig: PropertyConfig = {
            ...emptyConfig,
            id: `prop-${Date.now()}`,
            name: `Property ${configs.length + 1}`,
        };
        setConfigs((prev) => [...prev, newConfig]);
        setSelectedId(newConfig.id);
    };

    const updateField = (field: keyof PropertyConfig, value: string) => {
        setConfigs((prev) =>
            prev.map((c) => (c.id === selectedId ? { ...c, [field]: value } : c))
        );
    };

    const handleSync = () => {
        if (!selected) return;
        syncKB.mutate({
            property_id: selected.id,
            property_name: selected.name,
            wifi_name: selected.wifiName,
            wifi_password: selected.wifiPassword,
            check_in_time: selected.checkInTime,
            check_out_time: selected.checkOutTime,
            check_in_instructions: selected.checkInInstructions,
            parking_rules: selected.parkingRules,
            house_rules: selected.houseRules,
            additional_documents: selected.files,
        });
    };

    return (
        <div className="h-full overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center">
                        <Settings size={20} className="text-accent" />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold text-white">Property Configurator</h1>
                        <p className="text-xs text-dark-400">Manage property info & knowledge base for AI context</p>
                    </div>
                </div>

                <div className="flex gap-6">
                    {/* Property selector */}
                    <div className="w-56 shrink-0 space-y-2">
                        {configs.map((c) => (
                            <button
                                key={c.id}
                                onClick={() => setSelectedId(c.id)}
                                className={`w-full text-left p-3 rounded-xl transition-all text-sm cursor-pointer flex items-center gap-2
                  ${selectedId === c.id
                                        ? 'bg-accent/15 text-accent border border-accent/25'
                                        : 'bg-dark-900 text-dark-300 border border-dark-800 hover:bg-dark-800'
                                    }`}
                            >
                                <Home size={14} />
                                {c.name}
                            </button>
                        ))}
                        <button
                            onClick={addProperty}
                            className="w-full text-left p-3 rounded-xl text-sm text-dark-500 border border-dashed border-dark-700 hover:border-dark-500 hover:text-dark-400 transition-colors flex items-center gap-2 cursor-pointer"
                        >
                            <Plus size={14} />
                            Add Property
                        </button>
                    </div>

                    {/* Config form */}
                    {selected ? (
                        <div className="flex-1 bg-dark-900 rounded-2xl border border-dark-800 p-6 space-y-5">
                            <div>
                                <label className="block text-xs font-medium text-dark-400 mb-1.5">Property Name</label>
                                <input
                                    value={selected.name}
                                    onChange={(e) => updateField('name', e.target.value)}
                                    className="w-full bg-dark-800 text-dark-200 text-sm rounded-lg px-3 py-2 border border-dark-700 outline-none focus:border-accent/50 transition-colors"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-dark-400 mb-1.5">WiFi Network</label>
                                    <input
                                        value={selected.wifiName}
                                        onChange={(e) => updateField('wifiName', e.target.value)}
                                        className="w-full bg-dark-800 text-dark-200 text-sm rounded-lg px-3 py-2 border border-dark-700 outline-none focus:border-accent/50 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-dark-400 mb-1.5">WiFi Password</label>
                                    <input
                                        value={selected.wifiPassword}
                                        onChange={(e) => updateField('wifiPassword', e.target.value)}
                                        className="w-full bg-dark-800 text-dark-200 text-sm rounded-lg px-3 py-2 border border-dark-700 outline-none focus:border-accent/50 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-dark-400 mb-1.5">Check-in Time</label>
                                    <input
                                        type="time"
                                        value={selected.checkInTime}
                                        onChange={(e) => updateField('checkInTime', e.target.value)}
                                        className="w-full bg-dark-800 text-dark-200 text-sm rounded-lg px-3 py-2 border border-dark-700 outline-none focus:border-accent/50 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-dark-400 mb-1.5">Check-out Time</label>
                                    <input
                                        type="time"
                                        value={selected.checkOutTime}
                                        onChange={(e) => updateField('checkOutTime', e.target.value)}
                                        className="w-full bg-dark-800 text-dark-200 text-sm rounded-lg px-3 py-2 border border-dark-700 outline-none focus:border-accent/50 transition-colors"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-dark-400 mb-1.5">Check-in Instructions</label>
                                <textarea
                                    value={selected.checkInInstructions}
                                    onChange={(e) => updateField('checkInInstructions', e.target.value)}
                                    rows={3}
                                    className="w-full bg-dark-800 text-dark-200 text-sm rounded-lg px-3 py-2 border border-dark-700 outline-none focus:border-accent/50 transition-colors resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-dark-400 mb-1.5">Parking Rules</label>
                                <textarea
                                    value={selected.parkingRules}
                                    onChange={(e) => updateField('parkingRules', e.target.value)}
                                    rows={2}
                                    className="w-full bg-dark-800 text-dark-200 text-sm rounded-lg px-3 py-2 border border-dark-700 outline-none focus:border-accent/50 transition-colors resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-dark-400 mb-1.5">House Rules</label>
                                <textarea
                                    value={selected.houseRules}
                                    onChange={(e) => updateField('houseRules', e.target.value)}
                                    rows={2}
                                    className="w-full bg-dark-800 text-dark-200 text-sm rounded-lg px-3 py-2 border border-dark-700 outline-none focus:border-accent/50 transition-colors resize-none"
                                />
                            </div>

                            {/* File upload area */}
                            <div>
                                <label className="block text-xs font-medium text-dark-400 mb-1.5">Documents</label>
                                <div className="border border-dashed border-dark-600 rounded-xl p-6 text-center hover:border-accent/40 transition-colors">
                                    <Upload size={24} className="mx-auto text-dark-500 mb-2" />
                                    <p className="text-xs text-dark-400">Drop PDFs or documents here, or click to upload</p>
                                    <p className="text-[10px] text-dark-500 mt-1">These files provide context for AI-generated replies</p>
                                </div>
                                {selected.files.length > 0 && (
                                    <div className="mt-2 space-y-1">
                                        {selected.files.map((f) => (
                                            <div key={f} className="flex items-center justify-between bg-dark-800 rounded-lg px-3 py-2">
                                                <span className="text-xs text-dark-300">{f}</span>
                                                <button className="text-dark-500 hover:text-red-400 transition-colors cursor-pointer">
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Save */}
                            <div className="flex items-center justify-end gap-3 pt-2">
                                {syncKB.isSuccess && (
                                    <span className="flex items-center gap-1 text-xs text-emerald-400">
                                        <CheckCircle size={12} />
                                        Synced
                                    </span>
                                )}
                                <button
                                    onClick={handleSync}
                                    disabled={syncKB.isPending}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-dark transition-colors disabled:opacity-50 cursor-pointer"
                                >
                                    {syncKB.isPending ? (
                                        <Loader2 size={14} className="animate-spin" />
                                    ) : (
                                        <Save size={14} />
                                    )}
                                    Push to Backend
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center bg-dark-900 rounded-2xl border border-dark-800 p-12 text-center">
                            <Home size={32} className="text-dark-600 mb-3" />
                            <p className="text-sm text-dark-400 font-medium">No property selected</p>
                            <p className="text-xs text-dark-500 mt-1">
                                Click "Add Property" to create your first property configuration.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
