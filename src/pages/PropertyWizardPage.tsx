import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useProperties } from '../api/useProperties';
import { usePropertyKnowledge, useUpsertPropertyKnowledge } from '../api/usePropertyKnowledge';
import type { PropertyKnowledgePayload } from '../types/propertyKnowledge';
import WizardStepper from '../components/wizard/WizardStepper';
import WizardNavigation from '../components/wizard/WizardNavigation';
import LogisticsStep from '../components/wizard/steps/LogisticsStep';
import HowToStep from '../components/wizard/steps/HowToStep';
import RulesStep from '../components/wizard/steps/RulesStep';
import ConciergeStep from '../components/wizard/steps/ConciergeStep';
import InternalOpsStep from '../components/wizard/steps/InternalOpsStep';
import { Building2, Check, Loader2 } from 'lucide-react';

// ─── Step definitions ─────────────────────────────────────────

const STEP_LABELS = ['Logistics', 'How-To', 'Rules', 'Local Guide', 'Internal Ops'];

// Field paths that each step must validate before advancing
const STEP_FIELDS: (keyof PropertyKnowledgePayload | string)[][] = [
    ['guest_facing.logistics'],
    ['guest_facing.property_howto'],
    ['guest_facing.rules'],
    ['guest_facing.concierge'],
    ['internal_ops'],
];

// ─── Default values ───────────────────────────────────────────

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

// ─── Page component ───────────────────────────────────────────

export default function PropertyWizardPage() {
    const [step, setStep] = useState(0);
    const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Fetch properties for the selector
    const { data: properties = [], isLoading: propsLoading } = useProperties();

    // Fetch existing knowledge for selected property
    const { data: existingKnowledge, isLoading: knowledgeLoading } = usePropertyKnowledge(selectedPropertyId);

    // Upsert mutation
    const upsertMutation = useUpsertPropertyKnowledge();

    // Form setup — single form instance for all steps
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

    // ─── Navigation handlers ──────────────────────────────────

    const handleNext = async () => {
        const fieldsToValidate = STEP_FIELDS[step];
        const valid = await trigger(fieldsToValidate as never[]);
        if (valid) setStep((s) => Math.min(s + 1, STEP_LABELS.length - 1));
    };

    const handleBack = () => setStep((s) => Math.max(s - 1, 0));

    const handleFinalSubmit = handleSubmit(async (data) => {
        if (!selectedPropertyId) return;

        setSaveSuccess(false);
        await upsertMutation.mutateAsync({
            property_id: selectedPropertyId,
            knowledge_payload: data,
        });
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
    });

    // ─── Render steps ─────────────────────────────────────────

    const stepProps = { register, errors };

    const renderStep = () => {
        switch (step) {
            case 0: return <LogisticsStep {...stepProps} />;
            case 1: return <HowToStep {...stepProps} />;
            case 2: return <RulesStep {...stepProps} />;
            case 3: return <ConciergeStep {...stepProps} />;
            case 4: return <InternalOpsStep {...stepProps} />;
            default: return null;
        }
    };

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

                    {/* Property selector */}
                    <div className="flex items-center gap-2">
                        {propsLoading ? (
                            <Loader2 size={16} className="text-accent animate-spin" />
                        ) : (
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
                        )}
                    </div>
                </div>

                {/* Stepper */}
                <WizardStepper steps={STEP_LABELS} currentStep={step} />

                {/* Success toast */}
                {saveSuccess && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20 mt-2 animate-in fade-in slide-in-from-top-1">
                        <Check size={14} className="text-green-400" />
                        <span className="text-xs text-green-300">Knowledge base saved and ready for AI</span>
                    </div>
                )}
            </div>

            {/* ── Step content (scrollable) ── */}
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
        </div>
    );
}
