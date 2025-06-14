'use server';

import * as crypto from 'crypto';
import * as dotenv from 'dotenv';
dotenv.config({ path: '../../../.env' });

interface CriptografiaResult {
  chave: string;
  iv: string;
  dadoCriptografado: string;
}

export const criptografar = async (string: string): Promise<string> => {
  const hash = crypto.createHash('sha256');
  hash.update(string);
  return hash.digest('hex');
};

export const criptografarUserData = async (data: any): Promise<CriptografiaResult> => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET não está definido');
  }
  const jwtSecretIv = process.env.JWT_SECRET_IV;
  if (!jwtSecretIv) {
    throw new Error('JWT_SECRET_IV não está definido');
  }
  const chave = crypto.createHash('sha256').update(String(jwtSecret)).digest();
  const iv = Buffer.from(jwtSecretIv, 'hex');
  if (iv.length !== 16) {
    throw new Error('JWT_SECRET_IV deve ter 16 bytes (32 caracteres hexadecimais)');
  }
  const aes = crypto.createCipheriv('aes-256-cbc', chave, iv);

  const dadoCriptografado = Buffer.concat([aes.update(JSON.stringify(data), 'utf8'), aes.final()]);

  return {
    chave: chave.toString('hex'),
    iv: iv.toString('hex'),
    dadoCriptografado: dadoCriptografado.toString('hex'),
  };
};

export const descriptografarUserData = async (dadoCriptografado: string): Promise<any> => {
  if (!dadoCriptografado || !dadoCriptografado.trim() || !/^[0-9a-fA-F]+$/.test(dadoCriptografado.trim())) {
    console.error("Dado criptografado inválido");
    return '';
  }
  
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET não está definido');
  }
  const jwtSecretIv = process.env.JWT_SECRET_IV;
  if (!jwtSecretIv) {
    throw new Error('JWT_SECRET_IV não está definido');
  }
  const chave = crypto.createHash('sha256').update(String(jwtSecret)).digest();
  const iv = Buffer.from(jwtSecretIv, 'hex');
  if (iv.length !== 16) {
    throw new Error('JWT_SECRET_IV deve ter 16 bytes (32 caracteres hexadecimais)');
  }
  if (dadoCriptografado.trim().length == 0) return '';
  const decipher = crypto.createDecipheriv('aes-256-cbc', chave, iv);

  const dadoDescriptografado = Buffer.concat([
    decipher.update(Buffer.from(dadoCriptografado, 'hex')),
    decipher.final(),
  ]);
  const dadoDescriptografadoJson = JSON.parse(dadoDescriptografado.toString('utf8'));

  return dadoDescriptografadoJson;
};

export const verificarDados = async (data: any, dataCriptografada: CriptografiaResult): Promise<boolean> => {
  const dadoDescriptografado = await descriptografarUserData(dataCriptografada.dadoCriptografado);
  return JSON.stringify(data) === JSON.stringify(dadoDescriptografado);
};

export const verificarHash = async (string: string, hash: string): Promise<boolean> => {
  const stringHash = crypto.createHash('sha256').update(string).digest('hex');
  return stringHash === hash;
};

export const encrypt = async (data: string): Promise<string> => {
  const jwtSecret = process.env.JWT_SECRET;
  const jwtSecretIv = process.env.JWT_SECRET_IV;
  
  if (!jwtSecret || !jwtSecretIv) {
    throw new Error('Chaves de criptografia não configuradas');
  }

  const key = crypto.createHash('sha256').update(String(jwtSecret)).digest();
  const iv = Buffer.from(jwtSecretIv, 'hex');
  
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  const encrypted = Buffer.concat([
    cipher.update(data, 'utf8'),
    cipher.final()
  ]);

  return encrypted.toString('hex');
};

export const decrypt = async (encryptedData: string): Promise<string> => {
  const jwtSecret = process.env.JWT_SECRET;
  const jwtSecretIv = process.env.JWT_SECRET_IV;
  
  if (!jwtSecret || !jwtSecretIv) {
    throw new Error('Chaves de criptografia não configuradas');
  }

  const key = crypto.createHash('sha256').update(String(jwtSecret)).digest();
  const iv = Buffer.from(jwtSecretIv, 'hex');
  
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedData, 'hex')),
    decipher.final()
  ]);

  return decrypted.toString('utf8');
};
