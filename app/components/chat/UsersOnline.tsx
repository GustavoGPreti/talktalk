import Image from 'next/image';
import { UserData } from '@/app/types/chat';
import { useTranslation } from 'react-i18next';
import React from 'react';

interface UsersOnlineProps {
  users: UserData[];
  isHost?: boolean;
  selfToken?: string;
  onKick?: (userToken: string, apelido: string) => void;
}

function UsersOnline({ users, isHost = false, selfToken, onKick }: UsersOnlineProps) {
  const { t } = useTranslation('');
  
  return (
    <div className="bg-white dark:bg-zinc-900 m-2 rounded-md shadow-sm border border-gray-200 dark:border-zinc-800">
      <h2 className="text-medium bg-gray-50 dark:bg-zinc-800 rounded-t-md p-3 font-semibold flex items-center gap-2 border-b border-gray-200 dark:border-zinc-700">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
        {t('chat.usuarios_online.titulo')} ({users.length})
      </h2>
      <div className="flex flex-col gap-3 p-3 max-h-[300px] overflow-y-auto">
        {users.length > 0 ? (
          users.map((user) => (
            <div
              key={user.userToken}
              className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors duration-200"
            >
              <Image
                src={user.avatar}
                alt={user.apelido}
                width={40}
                height={40}
                className="rounded-full border-2 p-1"
                style={{ borderColor: user.color }}
              />              <div className="flex flex-col">
                {user.host && (
                  <div className="relative">
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg animate-pulse">
                      <span className="text-[8px]">👑</span>
                    </div>
                  </div>
                )}
                <span className="font-medium" style={{ color: user.color }}>
                  {user.apelido}
                </span>
                <span className="text-xs text-gray-500">
                  {user.host ? t('chat.usuarios_online.anfitriao') : t('chat.usuarios_online.convidado')}
                </span>
              </div>
              {isHost && user.userToken !== selfToken && onKick && (
                <button
                  onClick={() => onKick(user.userToken, user.apelido)}
                  className="ml-auto px-2 py-1 text-xs rounded-md bg-red-500/10 text-red-600 hover:bg-red-500/20 dark:text-red-400 transition-colors"
                >
                  {t('chat.usuarios_online.expulsar')}
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="text-center p-4 text-gray-500">
            {t('chat.usuarios_online.nenhum_conectado')}
          </div>
        )}
      </div>
    </div>
  );
}

export default React.memo(UsersOnline, (prev, next) => {
  if (prev.users.length !== next.users.length) return false;
  // Shallow compare by userToken to detect meaningful changes
  for (let i = 0; i < prev.users.length; i++) {
    if (prev.users[i].userToken !== next.users[i].userToken) return false;
    if (prev.users[i].host !== next.users[i].host) return false;
  }
  return true;
});