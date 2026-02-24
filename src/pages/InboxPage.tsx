import ChatList from '../components/chat/ChatList';
import ChatWindow from '../components/chat/ChatWindow';

export default function InboxPage() {
    return (
        <div className="flex h-full">
            <div className="w-[380px] shrink-0">
                <ChatList />
            </div>
            <ChatWindow />
        </div>
    );
}
