import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { descriptografarUserData, criptografarUserData } from '@/app/services/cryptoService';

const prisma = new PrismaClient();

export async function GET(request: NextRequest, props: { params: Promise<{ roomCode: string }> }) {
  const params = await props.params;
  try {
    const roomCode = await params.roomCode;
    
    const messages = await prisma.mensagens.findMany({
      where: {
        codigoSala: roomCode
      },
      orderBy: {
        dataEnvio: 'asc'
      }
    });

    const roomUsers = await prisma.salas_Usuarios.findMany({
      where: {
        codigoSala: roomCode
      }
    });

    const usersData = await Promise.all(
      roomUsers.map(async (user) => {
        try {
          const decrypted = await descriptografarUserData(user.userData);
          return decrypted?.data;
        } catch (error) {
          console.error('Erro ao descriptografar dados:', error);
          return null;
        }
      })
    );

    const formattedMessages = await Promise.all(messages.map(async (msg) => {
      const sender = usersData.find(u => u?.userToken === msg.usuario);
      
      try {
        const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL 
          ? `${process.env.NEXT_PUBLIC_PROTOCOL!}://${process.env.NEXT_PUBLIC_VERCEL_URL}` 
          : 'http://localhost:3000';
        const decryptResponse = await fetch(`${baseUrl}/api/crypto`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.CRYPTO_API_KEY}`,
          },
          body: JSON.stringify({
            data: msg.mensagem,
            action: 'decrypt',
          }),
        });

        if (!decryptResponse.ok) {
          throw new Error(`Erro na resposta: ${decryptResponse.status}`);
        }

        const decryptResult = await decryptResponse.json();
        
        return {
          message: decryptResult.data,
          messageTraduzido: msg.mensagemTraduzida || decryptResult.data,
          senderId: msg.usuario,
          senderApelido: msg.apelido || 'Usuário desconhecido',
          senderAvatar: msg.avatar || '',
          senderColor: sender?.color || '#000000',
          date: msg.dataEnvio,
          lingua: msg.linguaOriginal || 'pt'
        };
      } catch (error) {
        console.error('Erro ao descriptografar mensagem:', error);
        return {
          message: 'Erro ao descriptografar mensagem',
          messageTraduzido: 'Erro ao descriptografar mensagem',
          senderId: msg.usuario,
          senderApelido: msg.apelido || 'Usuário desconhecido',
          senderAvatar: msg.avatar || '',
          senderColor: sender?.color || '#000000',
          date: msg.dataEnvio,
          lingua: msg.linguaOriginal || 'pt'
        };
      }
    }));

    return NextResponse.json(formattedMessages);
  } catch (error) {
    console.error('Erro ao buscar mensagens:', error);
    return NextResponse.json({ error: 'Erro ao buscar mensagens' }, { status: 500 });
  }
}