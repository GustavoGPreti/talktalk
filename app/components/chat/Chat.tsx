import React, { ReactNode } from 'react';

type SectionProps = { children: ReactNode; className?: string };

const Section = React.memo(({ children, className }: SectionProps) => {
  return <div className={className}>{children}</div>;
});

Section.displayName = 'SectionMemo';

type ChatCompound = React.MemoExoticComponent<({ children, className }: SectionProps) => React.ReactElement> & {
  Header: typeof Section;
  Body: typeof Section;
  Footer: typeof Section;
  Avatars: typeof Section;
  LanguageOptions: typeof Section;
  Settings: typeof Section;
};

const ChatComponentBase = React.memo(({ children, className }: SectionProps) => {
  return <div className={className}>{children}</div>;
});

ChatComponentBase.displayName = 'ChatComponentBase';

const ChatComponent = ChatComponentBase as ChatCompound;
ChatComponent.Header = Section;
ChatComponent.Body = Section;
ChatComponent.Footer = Section;
ChatComponent.Avatars = Section;
ChatComponent.LanguageOptions = Section;
ChatComponent.Settings = Section;

export default ChatComponent;
