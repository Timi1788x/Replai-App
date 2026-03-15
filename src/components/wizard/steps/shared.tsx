import type { UseFormRegister, FieldErrors } from 'react-hook-form';
import type { PropertyKnowledgePayload } from '../../../types/propertyKnowledge';

// Shared types for all step components
export interface StepProps {
    register: UseFormRegister<PropertyKnowledgePayload>;
    errors: FieldErrors<PropertyKnowledgePayload>;
}

// Shared input components for consistent styling
export function FieldGroup({ children, label }: { children: React.ReactNode; label: string }) {
    return (
        <div>
            <h3 className="text-sm font-semibold text-dark-200 mb-3 flex items-center gap-2">
                <div className="w-1 h-4 rounded bg-accent/60" />
                {label}
            </h3>
            <div className="space-y-3 pl-3">{children}</div>
        </div>
    );
}

export function TextInput({
    label,
    error,
    ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
    return (
        <div>
            <label className="block text-xs font-medium text-dark-400 mb-1">{label}</label>
            <input
                {...props}
                className="w-full bg-dark-800 text-dark-200 text-sm rounded-lg px-3 py-2 border border-dark-700 outline-none focus:border-accent/50 transition-colors"
            />
            {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
        </div>
    );
}

export function TextArea({
    label,
    error,
    ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; error?: string }) {
    return (
        <div>
            <label className="block text-xs font-medium text-dark-400 mb-1">{label}</label>
            <textarea
                {...props}
                className="w-full bg-dark-800 text-dark-200 text-sm rounded-lg px-3 py-2 border border-dark-700 outline-none focus:border-accent/50 transition-colors resize-none"
            />
            {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
        </div>
    );
}

export function Toggle({
    label,
    ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
    return (
        <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
                <input type="checkbox" className="sr-only peer" {...props} />
                <div className="w-9 h-5 bg-dark-700 rounded-full peer-checked:bg-accent/60 transition-colors" />
                <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-dark-400 rounded-full peer-checked:translate-x-4 peer-checked:bg-white transition-all" />
            </div>
            <span className="text-sm text-dark-300 group-hover:text-dark-200 transition-colors">{label}</span>
        </label>
    );
}
