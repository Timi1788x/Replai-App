import { useNavigate } from 'react-router-dom';
import { Rocket, Link2, Home, BookOpen, X, Check, ArrowRight } from 'lucide-react';
import { useHostSettings, useDismissOnboarding } from '../api/useHostSettings';
import { useProperties } from '../api/useProperties';
import { usePropertyKnowledge } from '../api/usePropertyKnowledge';

// ─── Step definitions ─────────────────────────────────────────

interface OnboardingStep {
    key: string;
    icon: typeof Rocket;
    title: string;
    description: string;
    route: string;
    checkCompleted: (ctx: StepContext) => boolean;
}

interface StepContext {
    propertiesCount: number;
    hasKnowledge: boolean;
}

const steps: OnboardingStep[] = [
    {
        key: 'channel',
        icon: Link2,
        title: 'Connect a PMS channel',
        description: 'Link your property management system to start receiving guest messages.',
        route: '/settings/channels',
        checkCompleted: () => false, // channel_connections not yet implemented
    },
    {
        key: 'property',
        icon: Home,
        title: 'Create your first property',
        description: 'Add a property so the AI knows which listing it\'s responding for.',
        route: '/config',
        checkCompleted: (ctx) => ctx.propertiesCount > 0,
    },
    {
        key: 'knowledge',
        icon: BookOpen,
        title: 'Fill in the knowledge base',
        description: 'Add check-in instructions, Wi-Fi, house rules — everything your guests ask about.',
        route: '/config',
        checkCompleted: (ctx) => ctx.hasKnowledge,
    },
];

// ─── Component ────────────────────────────────────────────────

export default function OnboardingChecklist() {
    const navigate = useNavigate();
    const { onboardingCompleted, isLoading } = useHostSettings();
    const { data: properties } = useProperties();
    const { data: knowledgeRows } = usePropertyKnowledge(properties?.[0]?.id ?? '');
    const dismissOnboarding = useDismissOnboarding();

    // Don't render while loading or after dismissed
    if (isLoading || onboardingCompleted) return null;

    const ctx: StepContext = {
        propertiesCount: properties?.length ?? 0,
        hasKnowledge: !!knowledgeRows?.knowledge_payload,
    };

    const completedCount = steps.filter((s) => s.checkCompleted(ctx)).length;
    const allDone = completedCount === steps.length;

    return (
        <div className="mx-4 mt-4 mb-2 bg-dark-900 border border-dark-800 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-dark-800">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center">
                        <Rocket size={18} className="text-accent" />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-white">
                            Get started with PACKED
                        </h2>
                        <p className="text-[11px] text-dark-400 mt-0.5">
                            {allDone
                                ? 'All done! You\'re ready to go.'
                                : `${completedCount} of ${steps.length} steps completed`}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => dismissOnboarding.mutate()}
                    className="p-1.5 rounded-lg text-dark-500 hover:text-dark-300 hover:bg-dark-800 transition-colors cursor-pointer"
                    title="Dismiss onboarding"
                >
                    <X size={16} />
                </button>
            </div>

            {/* Progress bar */}
            <div className="px-5 pt-3">
                <div className="h-1 bg-dark-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-accent rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${(completedCount / steps.length) * 100}%` }}
                    />
                </div>
            </div>

            {/* Steps */}
            <div className="p-3 space-y-1">
                {steps.map((step) => {
                    const done = step.checkCompleted(ctx);
                    const Icon = step.icon;

                    return (
                        <button
                            key={step.key}
                            onClick={() => navigate(step.route)}
                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200 cursor-pointer group
                                ${done
                                    ? 'bg-dark-800/30 opacity-60'
                                    : 'hover:bg-dark-800/60'
                                }`}
                        >
                            {/* Checkbox / icon */}
                            <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors
                                    ${done
                                        ? 'bg-emerald-500/15 text-emerald-400'
                                        : 'bg-dark-800 text-dark-400 group-hover:text-accent group-hover:bg-accent/10'
                                    }`}
                            >
                                {done ? <Check size={16} /> : <Icon size={16} />}
                            </div>

                            {/* Text */}
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium ${done ? 'text-dark-400 line-through' : 'text-dark-200'}`}>
                                    {step.title}
                                </p>
                                <p className="text-[11px] text-dark-500 mt-0.5 truncate">
                                    {step.description}
                                </p>
                            </div>

                            {/* Arrow */}
                            {!done && (
                                <ArrowRight
                                    size={14}
                                    className="text-dark-600 group-hover:text-accent shrink-0 transition-colors"
                                />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
