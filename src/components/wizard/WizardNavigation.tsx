import { ChevronLeft, ChevronRight, Save, Loader2 } from 'lucide-react';

interface WizardNavigationProps {
    currentStep: number;
    totalSteps: number;
    onBack: () => void;
    onNext: () => void;
    onSubmit: () => void;
    isSubmitting: boolean;
}

export default function WizardNavigation({
    currentStep,
    totalSteps,
    onBack,
    onNext,
    onSubmit,
    isSubmitting,
}: WizardNavigationProps) {
    const isFirst = currentStep === 0;
    const isLast = currentStep === totalSteps - 1;

    return (
        <div className="flex items-center justify-between pt-6 border-t border-dark-800">
            {/* Back */}
            <button
                type="button"
                onClick={onBack}
                disabled={isFirst}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-dark-300 hover:text-white hover:bg-dark-800 transition-all disabled:opacity-0 disabled:pointer-events-none cursor-pointer"
            >
                <ChevronLeft size={16} />
                Back
            </button>

            {/* Step counter */}
            <span className="text-xs text-dark-500">
                Step {currentStep + 1} of {totalSteps}
            </span>

            {/* Next / Submit */}
            {isLast ? (
                <button
                    type="button"
                    onClick={onSubmit}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent-dark transition-colors disabled:opacity-50 cursor-pointer"
                >
                    {isSubmitting ? (
                        <Loader2 size={16} className="animate-spin" />
                    ) : (
                        <Save size={16} />
                    )}
                    Save & Push
                </button>
            ) : (
                <button
                    type="button"
                    onClick={onNext}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-accent/15 text-accent text-sm font-semibold hover:bg-accent/25 transition-colors cursor-pointer"
                >
                    Next
                    <ChevronRight size={16} />
                </button>
            )}
        </div>
    );
}
