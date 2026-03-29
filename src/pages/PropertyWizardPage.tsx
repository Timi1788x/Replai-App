import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useProperties, useCreateProperty } from '../api/useProperties';
import { usePropertyKnowledge, useUpsertPropertyKnowledge } from '../api/usePropertyKnowledge';
import type { PropertyKnowledgePayload } from '../types/propertyKnowledge';
import WizardStepper from '../components/wizard/WizardStepper';
import WizardNavigation from '../components/wizard/WizardNavigation';
import LogisticsStep from '../components/wizard/steps/LogisticsStep';
import HowToStep from '../components/wizard/steps/HowToStep';
import RulesStep from '../components/wizard/steps/RulesStep';
import ConciergeStep from '../components/wizard/steps/ConciergeStep';
import InternalOpsStep from '../components/wizard/steps/InternalOpsStep';
import { Building2, Check, Loader2, Plus, X, AlertCircle } from 'lucide-react';

// ─── Step definitions ─────────────────────────────────────────

const STEP_LABELS = ['Logistics', 'How-To', 'Rules', 'Local Guide', 'Internal Ops'];

const STEP_FIELDS: (keyof PropertyKnowledgePayload | string)[][] = [
    ['guest_facing.logistics'],
    ['guest_facing.property_howto'],
    ['guest_facing.rules'],
    ['guest_facing.concierge'],
    ['internal_ops'],
];

const DEFAULTS: PropertyKnowledgePayload = {
    guest_facing: {
        logistics: {
            check_in: { standard_time: '15:00' },
            check_out: { standard_time: '10:00' },
        },
        property_howto: {
            wifi: { ssid: '', password: '' },
        },
    },
};

// ─── New Property Modal ───────────────────────────────────────

interface NewPropertyModalProps {
    onClose: () => void;
    onCreated: (propertyId: string) => void;
}

function NewPropertyModal({ onClose, onCreated }: NewPropertyModalProps) {
    const createProperty = useCreateProperty();
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [error, setError] = useState('');
    const nameRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        nameRef.current?.focus();
    }, []);

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        if (!name.trim()) { setError('Property name is required.'); return; }
        setError('');
        try {
            const property = await createProperty.mutateAsync({ name, address });
            onCreated(property.id);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create property.');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-dark-900 border border-dark-700 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center">
                            <Building2 size={16} className="text-accent" />
                        </div>
                        <h2 className="text-sm font-semibold text-white">New Property</h2>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-dark-400 hover:text-white hover:bg-dark-800 transition-colors cursor-pointer">
                        <X size={16} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-dark-400 mb-1.5">
                            Property name <span className="text-red-400">*</span>
                        </label>
                        <input
                            ref={nameRef}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Alpine Chalet Zermatt"
                            className="w-full bg-dark-800 text-dark-200 text-sm rounded-lg px-3 py-2 border border-dark-700 outline-none focus:border-accent/50 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-dark-400 mb-1.5">
                            Address <span className="text-dark-600 font-normal">(optional)</span>
                        </label>
                        <input
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Bahnhofstrasse 1, Zermatt"
                            className="w-full bg-dark-800 text-dark-200 text-sm rounded-lg px-3 py-2 border border-dark-700 outline-none focus:border-accent/50 transition-colors"
                        />
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
                            <AlertCircle size={13} className="text-red-400 shrink-0" />
                            <p className="text-xs text-red-300">{error}</p>
                        </div>
                    )}

                    <div className="flex gap-3 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-dark-800 text-dark-300 text-sm font-medium hover:bg-dark-700 border border-dark-700 transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={createProperty.isPending}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-dark transition-colors disabled:opacity-50 cursor-pointer"
                        >
                            {createProperty.isPending ? (
                                <Loader2 size={14} className="animate-spin" />
                            ) : (
                                <Plus size={14} />
                            )}
                            Create
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Page component ───────────────────────────────────────────

export default function PropertyWizardPage() {
    const [step, setStep] = useState(0);
    const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [showNewModal, setShowNewModal] = useState(false);

    const { data: properties = [], isLoading: propsLoading } = useProperties();
    const { data: existingKnowledge, isLoading: knowledgeLoading } = usePropertyKnowledge(selectedPropertyId);
    const upsertMutation = useUpsertPropertyKnowledge();

    const selectedProperty = properties.find((p) => p.id === selectedPropertyId);

    const {
        register,
        handleSubmit,
        trigger,
        reset,
        formState: { errors },
    } = useForm<PropertyKnowledgePayload>({
        defaultValues: DEFAULTS,
        mode: 'onBlur',
    });

    // Auto-select first property
    useEffect(() => {
        if (properties.length > 0 && !selectedPropertyId) {
            setSelectedPropertyId(properties[0].id);
        }
    }, [properties, selectedPropertyId]);

    // Populate form when knowledge loads
    useEffect(() => {
        if (existingKnowledge?.knowledge_payload) {
            reset(existingKnowledge.knowledge_payload);
        } else if (selectedPropertyId) {
            reset(DEFAULTS);
        }
    }, [existingKnowledge, selectedPropertyId, reset]);

    const handleNext = async () => {
        const valid = await trigger(STEP_FIELDS[step] as never[]);
        if (valid) setStep((s) => Math.min(s + 1, STEP_LABELS.length - 1));
    };

    const handleBack = () => setStep((s) => Math.max(s - 1, 0));

    const handleFinalSubmit = handleSubmit(async (data) => {
        if (!selectedPropertyId || !selectedProperty) return;

        setSaveSuccess(false);
        await upsertMutation.mutateAsync({ property_id: selectedPropertyId, knowledge_payload: data });

        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
    });

    const renderStep = () => {
        const stepProps = { register, errors };
        switch (step) {
            case 0: return <LogisticsStep {...stepProps} />;
            case 1: return <HowToStep {...stepProps} />;
            case 2: return <RulesStep {...stepProps} />;
            case 3: return <ConciergeStep {...stepProps} />;
            case 4: return <InternalOpsStep {...stepProps} />;
            default: return null;
        }
    };

    // ── Zero-state: no properties yet ──
    if (!propsLoading && properties.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center gap-5 p-6">
                <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center">
                    <Building2 size={28} className="text-accent" />
                </div>
                <div className="text-center">
                    <h2 className="text-base font-semibold text-white mb-1">No properties yet</h2>
                    <p className="text-xs text-dark-500 max-w-xs">
                        Create your first property to start configuring the AI knowledge base.
                    </p>
                </div>
                <button
                    onClick={() => setShowNewModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent-dark transition-colors cursor-pointer"
                >
                    <Plus size={16} />
                    Create Property
                </button>
                {showNewModal && (
                    <NewPropertyModal
                        onClose={() => setShowNewModal(false)}
                        onCreated={(id) => { setSelectedPropertyId(id); setShowNewModal(false); }}
                    />
                )}
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* ── Header ── */}
            <div className="shrink-0 p-4 border-b border-dark-800 bg-dark-900">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center">
                            <Building2 size={18} className="text-accent" />
                        </div>
                        <div>
                            <h1 className="text-base font-bold text-white">Property Knowledge Base</h1>
                            <p className="text-[10px] text-dark-400">
                                Configure what your AI agent knows about this property
                            </p>
                        </div>
                    </div>

                    {/* Property selector + new button */}
                    <div className="flex items-center gap-2">
                        {propsLoading ? (
                            <Loader2 size={16} className="text-accent animate-spin" />
                        ) : (
                            <>
                                <select
                                    value={selectedPropertyId ?? ''}
                                    onChange={(e) => {
                                        setSelectedPropertyId(e.target.value);
                                        setStep(0);
                                    }}
                                    className="bg-dark-800 text-dark-200 text-sm rounded-lg px-3 py-2 border border-dark-700 outline-none focus:border-accent/50"
                                >
                                    {properties.map((p) => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                                <button
                                    onClick={() => setShowNewModal(true)}
                                    title="Add property"
                                    className="p-2 rounded-lg bg-dark-800 border border-dark-700 text-dark-400 hover:text-accent hover:border-accent/50 transition-colors cursor-pointer"
                                >
                                    <Plus size={15} />
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Stepper */}
                <WizardStepper steps={STEP_LABELS} currentStep={step} />

                {/* Success toast */}
                {saveSuccess && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20 mt-2 animate-in fade-in slide-in-from-top-1">
                        <Check size={14} className="text-green-400" />
                        <span className="text-xs text-green-300">Knowledge base saved and synced to AI</span>
                    </div>
                )}
            </div>

            {/* ── Step content ── */}
            <div className="flex-1 overflow-y-auto p-6">
                {knowledgeLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 size={24} className="text-accent animate-spin" />
                    </div>
                ) : (
                    <div className="max-w-2xl mx-auto">
                        {renderStep()}
                    </div>
                )}
            </div>

            {/* ── Navigation ── */}
            <div className="shrink-0 px-6 pb-4 bg-dark-950">
                <div className="max-w-2xl mx-auto">
                    <WizardNavigation
                        currentStep={step}
                        totalSteps={STEP_LABELS.length}
                        onBack={handleBack}
                        onNext={handleNext}
                        onSubmit={handleFinalSubmit}
                        isSubmitting={upsertMutation.isPending}
                    />
                </div>
            </div>

            {/* New property modal */}
            {showNewModal && (
                <NewPropertyModal
                    onClose={() => setShowNewModal(false)}
                    onCreated={(id) => {
                        setSelectedPropertyId(id);
                        setStep(0);
                        setShowNewModal(false);
                    }}
                />
            )}
        </div>
    );
}
