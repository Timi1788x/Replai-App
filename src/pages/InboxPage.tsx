import ChatList from '../components/chat/ChatList';
import ChatWindow from '../components/chat/ChatWindow';
import OnboardingChecklist from '../components/OnboardingChecklist';

export default function InboxPage() {
    return (
        <div className="flex flex-col h-full">
            <OnboardingChecklist />
            <div className="flex flex-1 min-h-0">
                <div className="w-[380px] shrink-0">
                    <ChatList />
                </div>
                <ChatWindow />
            </div>
        </div>
    );
}

