import { Check } from 'lucide-react';

interface WizardStepperProps {
    steps: string[];
    currentStep: number;
}

export default function WizardStepper({ steps, currentStep }: WizardStepperProps) {
    return (
        <div className="flex items-center gap-1 mb-8">
            {steps.map((label, i) => {
                const isCompleted = i < currentStep;
                const isActive = i === currentStep;

                return (
                    <div key={label} className="flex items-center flex-1">
                        {/* Step circle */}
                        <div className="flex items-center gap-2 min-w-0">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-all duration-300
                                    ${isCompleted
                                        ? 'bg-accent text-white'
                                        : isActive
                                            ? 'bg-accent/20 text-accent border-2 border-accent'
                                            : 'bg-dark-800 text-dark-500 border border-dark-700'
                                    }`}
                            >
                                {isCompleted ? <Check size={14} /> : i + 1}
                            </div>
                            <span
                                className={`text-xs font-medium truncate hidden lg:block transition-colors
                                    ${isActive ? 'text-white' : isCompleted ? 'text-dark-300' : 'text-dark-500'}`}
                            >
                                {label}
                            </span>
                        </div>

                        {/* Connector line */}
                        {i < steps.length - 1 && (
                            <div
                                className={`flex-1 h-px mx-3 transition-colors duration-300
                                    ${isCompleted ? 'bg-accent/50' : 'bg-dark-700'}`}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
