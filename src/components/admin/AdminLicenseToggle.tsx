import { Loader2 } from 'lucide-react';
import { useSetLicenseActive } from '../../api/useAdminMutations';

interface Props {
    userId: string;
    isActive: boolean;
}

export default function AdminLicenseToggle({ userId, isActive }: Props) {
    const { mutate, isPending } = useSetLicenseActive();

    const toggle = () => {
        mutate({ target_user_id: userId, is_active: !isActive });
    };

    return (
        <button
            onClick={toggle}
            disabled={isPending}
            title={isActive ? 'Click to deactivate' : 'Click to activate'}
            className="relative flex items-center cursor-pointer disabled:cursor-wait"
        >
            {isPending ? (
                <Loader2 size={14} className="text-accent animate-spin" />
            ) : (
                <span
                    className={`w-9 h-5 rounded-full transition-colors relative ${
                        isActive ? 'bg-accent' : 'bg-dark-600'
                    }`}
                >
                    <span
                        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                            isActive ? 'left-4.5' : 'left-0.5'
                        }`}
                    />
                </span>
            )}
        </button>
    );
}
