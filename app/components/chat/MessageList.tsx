import { forwardRef, memo } from 'react';

interface MessageListProps {
  children: React.ReactNode;
  className?: string;
}

const MessageListBase = forwardRef<HTMLDivElement, MessageListProps>(({ children, className }, ref) => {
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
});
MessageListBase.displayName = 'MessageList';

const MessageList = memo(MessageListBase);
export default MessageList;
