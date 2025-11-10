import { NextResponse } from 'next/server';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { Writable } from 'stream';
import { createClient } from '@deepgram/sdk';
import linguasTranscript from '@/app/jsons/languages_stt.json';
import translate from 'google-translate-api-x';
import { withTimeout, TimeoutError } from '@/app/utils/api/timeoutPromise';

const deepgramApiKey = process.env.DEEPGRAM_API_KEY || '';
const deepgram = createClient(deepgramApiKey);

cloudinary.config();

export const maxDuration = 60; // Aumenta o timeout da função para 60 segundos
export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<NextResponse> {
  const startTime = Date.now();
  console.log('[TRANSCRIPTION] Iniciando processamento da requisição');

  const authorization = request.headers.get('authorization');

  console.log('[TRANSCRIPTION] Authorization header:', authorization);
  console.log('[TRANSCRIPTION] Cloudinary URL configurada:', process.env.CLOUDINARY_URL ? 'Sim' : 'Não');
  console.log('[TRANSCRIPTION] Deepgram API Key configurada:', deepgramApiKey ? 'Sim' : 'Não');

  if (!authorization || authorization !== `Bearer ${process.env.TRANSCRIPTION_API_KEY}`) {
    console.log('[TRANSCRIPTION] Falha na autorização');
    return new NextResponse(JSON.stringify({ error: 'Não autorizado' }), {
      status: 401,
    });
  }

  console.log('[TRANSCRIPTION] Autorização bem-sucedida, parseando formData...');
  const formDataStartTime = Date.now();
  const formData = await request.formData();
  console.log(`[TRANSCRIPTION] FormData parseado em ${Date.now() - formDataStartTime}ms`);

  const file = formData.get('base64File') as File | string | null;
  const lingua = formData.get('lingua');

  console.log('[TRANSCRIPTION] Língua solicitada:', lingua);
  console.log('[TRANSCRIPTION] Tipo do arquivo recebido:', typeof file);
  console.log('[TRANSCRIPTION] Tamanho do arquivo base64:', file && typeof file === 'string' ? file.length : 'N/A');

  if (!lingua || typeof lingua !== 'string') {
    console.log('[TRANSCRIPTION] Erro: Língua não especificada');
    return NextResponse.json({ error: 'Língua não especificada.' }, { status: 400 });
  }

  if (!linguasTranscript[lingua as string]) {
    console.log('[TRANSCRIPTION] Erro: Língua não disponível:', lingua);
    return NextResponse.json({ error: 'Língua para transcrição não disponível.' }, { status: 400 });
  }

  if (!file || typeof file !== 'string') {
    console.log('[TRANSCRIPTION] Erro: Arquivo inválido');
    return NextResponse.json({ error: 'Arquivo inválido.' }, { status: 400 });
  }

  try {
    console.log('[TRANSCRIPTION] Preparando arquivo para upload...');
    console.log(`[TRANSCRIPTION] Tamanho do arquivo base64: ${file.length} caracteres`);

    // Opção 1: Upload direto usando base64 URL (mais simples e eficiente)
    console.log('[TRANSCRIPTION] Iniciando upload para Cloudinary (método base64 direto)...');
    const cloudinaryStartTime = Date.now();

    const cloudinaryPromise = new Promise<UploadApiResponse>((resolve, reject) => {
      console.log('[TRANSCRIPTION] Usando upload direto de base64...');

      // Upload direto de base64 é mais eficiente que usar streams
      cloudinary.uploader.upload(
        'data:audio/wav;base64,' + file,
        {
          resource_type: 'video',
          folder: 'chat_audios',
          timeout: 45000,
          chunk_size: 6000000, // 6MB chunks para arquivos grandes
        },
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error) {
            console.error('[TRANSCRIPTION] Erro no upload do Cloudinary:', error);
            reject(error);
          } else if (!result) {
            reject(new Error('Upload failed without a specific error.'));
          } else {
            console.log('[TRANSCRIPTION] Upload para Cloudinary concluído com sucesso');
            resolve(result);
          }
        }
      );
    });

    const result = await withTimeout(
      cloudinaryPromise,
      50000,
      '[TRANSCRIPTION] Timeout no upload para Cloudinary após 50 segundos'
    );

    console.log(`[TRANSCRIPTION] Upload para Cloudinary concluído em ${Date.now() - cloudinaryStartTime}ms`);
    console.log('[TRANSCRIPTION] URL do arquivo:', result.secure_url);
    console.log('[TRANSCRIPTION] Public ID:', result.public_id);
    console.log('[TRANSCRIPTION] Formato do arquivo:', result.format);

    // Pequeno delay para garantir que o arquivo está disponível no Cloudinary
    await new Promise((resolve) => setTimeout(resolve, 500));

    console.log('[TRANSCRIPTION] Iniciando transcrição com Deepgram...');
    const deepgramStartTime = Date.now();

    const deepgramPromise = deepgram.listen.prerecorded.transcribeUrl(
      { url: result.secure_url },
      {
        model: 'nova-3',
        language: lingua || 'multi', // Usa a língua específica se disponível
        smart_format: true,
        punctuate: true,
        utterances: false,
        numerals: true,
      }
    );

    const { result: transcription, error } = await withTimeout(
      deepgramPromise,
      30000,
      '[TRANSCRIPTION] Timeout na transcrição Deepgram após 30 segundos'
    );

    console.log(`[TRANSCRIPTION] Transcrição Deepgram concluída em ${Date.now() - deepgramStartTime}ms`);

    if (error) {
      console.error('[TRANSCRIPTION] Erro na transcrição Deepgram:', error);
    }

    const transcript = transcription?.results?.channels?.[0]?.alternatives?.[0]?.transcript;
    console.log('[TRANSCRIPTION] Transcrição obtida:', transcript ? `"${transcript.substring(0, 100)}..."` : 'Vazia');

    if (transcript) {
      let translated: any = '';

      // Só traduz se o idioma detectado for diferente do idioma alvo
      const needsTranslation = true; // Sempre traduz por enquanto

      if (needsTranslation) {
        console.log('[TRANSCRIPTION] Iniciando tradução para:', lingua);
        const translateStartTime = Date.now();

        try {
          const translatePromise = translate(transcript, {
            to: lingua,
            autoCorrect: true,
            forceTo: true,
          });

          translated = await withTimeout(
            translatePromise,
            15000,
            '[TRANSCRIPTION] Timeout na tradução após 15 segundos'
          );

          console.log(`[TRANSCRIPTION] Tradução concluída em ${Date.now() - translateStartTime}ms`);
          console.log(
            '[TRANSCRIPTION] Texto traduzido:',
            translated.text ? `"${translated.text.substring(0, 100)}..."` : 'Vazio'
          );
        } catch (error) {
          if (error instanceof TimeoutError) {
            console.error('[TRANSCRIPTION] Timeout na tradução:', error.message);
          } else {
            console.error('[TRANSCRIPTION] Erro na tradução:', error);
          }
          console.log('[TRANSCRIPTION] Continuando sem tradução...');
        }
      } else {
        console.log('[TRANSCRIPTION] Tradução não necessária, idiomas são iguais');
        translated = { text: transcript };
      }

      const totalTime = Date.now() - startTime;
      console.log(`[TRANSCRIPTION] Processamento total concluído em ${totalTime}ms`);

      return NextResponse.json({
        message: 'Upload e transcrição bem-sucedidos!',
        transcription: transcript,
        id: result.public_id,
        url: result.secure_url,
        translated: translated.text || '',
        lingua: lingua || '',
        status: 200,
        processingTime: totalTime,
      });
    }

    const totalTime = Date.now() - startTime;
    console.log(`[TRANSCRIPTION] Processamento concluído sem transcrição em ${totalTime}ms`);

    return NextResponse.json({
      message: 'Upload bem-sucedido! Porém não transcreveu :(',
      url: result.secure_url,
      id: result.public_id,
      processingTime: totalTime,
    });
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error('[TRANSCRIPTION] Erro geral no processamento:', error);
    console.error(`[TRANSCRIPTION] Erro após ${totalTime}ms de processamento`);

    let errorMessage = 'Ocorreu um erro no servidor durante o upload. :/';
    let statusCode = 500;

    if (error instanceof TimeoutError) {
      errorMessage = 'Operação excedeu o tempo limite';
      statusCode = 504;
      console.error(`[TRANSCRIPTION] Timeout detectado: ${error.message}`);
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        processingTime: totalTime,
        isTimeout: error instanceof TimeoutError,
      },
      { status: statusCode }
    );
  }
}
