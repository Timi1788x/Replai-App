import type { ChannelType } from '../../types/database';
import { MessageSquare, Phone, Mail, Smartphone } from 'lucide-react';

interface ChannelIconProps {
    channel: ChannelType;
    size?: number;
    className?: string;
}

const channelConfig: Record<ChannelType, { icon: typeof MessageSquare; color: string; label: string }> = {
    airbnb: { icon: MessageSquare, color: '#FF5A5F', label: 'Airbnb' },
    whatsapp: { icon: Phone, color: '#25D366', label: 'WhatsApp' },
    email: { icon: Mail, color: '#4A90D9', label: 'Email' },
    sms: { icon: Smartphone, color: '#A855F7', label: 'SMS' },
};

export default function ChannelIcon({ channel, size = 18, className = '' }: ChannelIconProps) {
    const config = channelConfig[channel];
    const Icon = config.icon;

    return (
        <div
            className={`flex items-center justify-center rounded-lg ${className}`}
            style={{ backgroundColor: `${config.color}20`, width: size + 12, height: size + 12 }}
            title={config.label}
        >
            <Icon size={size} style={{ color: config.color }} />
        </div>
    );
}
