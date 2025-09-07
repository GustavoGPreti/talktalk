import { NextRequest, NextResponse } from 'next/server';
import * as crypto from 'crypto';

const API_KEY = process.env.CRYPTO_API_KEY;

interface CryptoRequest {
  data: any;
  action: 'encrypt' | 'decrypt' | 'encryptUserData' | 'decryptUserData' | 'hash' | 'verifyHash' | 'verifyData';
  apiKey: string;
  hash?: string;
  dataCriptografada?: {
    chave: string;
    iv: string;
    dadoCriptografado: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    const authorization = req.headers.get('authorization');

    if (!authorization || authorization !== `Bearer ${API_KEY}`) {
      return new NextResponse(JSON.stringify({ error: 'Não autorizado' }), {
        status: 401,
      });
    }

    const body: CryptoRequest = await req.json();

    if (!body.data || !body.action) {
      return new NextResponse(JSON.stringify({ error: 'Dados inválidos' }), {
        status: 400,
      });
    }


    const jwtSecret = process.env.JWT_SECRET;
    const jwtSecretIv = process.env.JWT_SECRET_IV;

    if (!jwtSecret || !jwtSecretIv) {
      return new NextResponse(JSON.stringify({ error: 'Configuração inválida' }), {
        status: 500,
      });
    }

    switch (body.action) {
      case 'hash': {
        const hash = crypto.createHash('sha256');
        hash.update(body.data);
        return new NextResponse(
          JSON.stringify({
            data: hash.digest('hex'),
          }),
          { status: 200 }
        );
      }

      case 'verifyHash': {
        if (!body.hash) {
          return new NextResponse(JSON.stringify({ error: 'Hash não fornecido' }), {
            status: 400,
          });
        }
        const stringHash = crypto.createHash('sha256').update(body.data).digest('hex');
        return new NextResponse(
          JSON.stringify({
            data: stringHash === body.hash,
          }),
          { status: 200 }
        );
      }

      case 'encrypt': {
        const chave = crypto.createHash('sha256').update(String(jwtSecret)).digest();
        const iv = Buffer.from(jwtSecretIv, 'hex');
        const cipher = crypto.createCipheriv('aes-256-cbc', chave, iv);
        const encrypted = Buffer.concat([
          cipher.update(body.data, 'utf8'),
          cipher.final()
        ]);
        return new NextResponse(
          JSON.stringify({
            data: encrypted.toString('hex'),
          }),
          { status: 200 }
        );
      }

      case 'decrypt': {
        const chave = crypto.createHash('sha256').update(String(jwtSecret)).digest();
        const iv = Buffer.from(jwtSecretIv, 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', chave, iv);
        const decrypted = Buffer.concat([
          decipher.update(Buffer.from(body.data, 'hex')),
          decipher.final()
        ]);
        return new NextResponse(
          JSON.stringify({
            data: decrypted.toString('utf8'),
          }),
          { status: 200 }
        );
      }

      case 'encryptUserData': {
        const chave = crypto.createHash('sha256').update(String(jwtSecret)).digest();
        const iv = Buffer.from(jwtSecretIv, 'hex');
        const aes = crypto.createCipheriv('aes-256-cbc', chave, iv);
        const dadoCriptografado = Buffer.concat([aes.update(JSON.stringify(body.data), 'utf8'), aes.final()]);
        return new NextResponse(
          JSON.stringify({
            data: dadoCriptografado.toString('hex'),
          }),
          { status: 200 }
        );
      }

      case 'decryptUserData': {
        if (!body.data || !body.data.trim() || !/^[0-9a-fA-F]+$/.test(body.data.trim())) {
          return new NextResponse(JSON.stringify({ error: 'Dado criptografado inválido' }), {
            status: 400,
          });
        }

        const chave = crypto.createHash('sha256').update(String(jwtSecret)).digest();
        const iv = Buffer.from(jwtSecretIv, 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', chave, iv);
        const dadoDescriptografado = Buffer.concat([decipher.update(Buffer.from(body.data, 'hex')), decipher.final()]);

        return new NextResponse(
          JSON.stringify({
            data: JSON.parse(dadoDescriptografado.toString('utf8')),
          }),
          { status: 200 }
        );
      }

      case 'verifyData': {
        if (!body.dataCriptografada) {
          return new NextResponse(JSON.stringify({ error: 'Dados criptografados não fornecidos' }), {
            status: 400,
          });
        }

        const dadoDescriptografado = await descriptografarUserData(body.dataCriptografada.dadoCriptografado);
        return new NextResponse(
          JSON.stringify({
            data: JSON.stringify(body.data) === JSON.stringify(dadoDescriptografado),
          }),
          { status: 200 }
        );
      }

      default:
        return new NextResponse(JSON.stringify({ error: 'Ação inválida' }), {
          status: 400,
        });
    }
  } catch (error) {
    console.error('Erro na API de criptografia:', error);
    return new NextResponse(JSON.stringify({ error: 'Erro interno' }), {
      status: 500,
    });
  }
}

async function descriptografarUserData(dadoCriptografado: string): Promise<any> {
  const jwtSecret = process.env.JWT_SECRET;
  const jwtSecretIv = process.env.JWT_SECRET_IV;

  if (!jwtSecret || !jwtSecretIv) {
    throw new Error('Configuração inválida');
  }

  const chave = crypto.createHash('sha256').update(String(jwtSecret)).digest();
  const iv = Buffer.from(jwtSecretIv, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', chave, iv);

  const dadoDescriptografado = Buffer.concat([
    decipher.update(Buffer.from(dadoCriptografado, 'hex')),
    decipher.final(),
  ]);

  return JSON.parse(dadoDescriptografado.toString('utf8'));
}
