import { NextResponse } from 'next/server';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { createClient } from '@deepgram/sdk';
import linguasTranscript from '@/app/jsons/languages_stt.json';
import translate from 'google-translate-api-x';
import Busboy from 'busboy';

const deepgramApiKey = process.env.DEEPGRAM_API_KEY || '';
const deepgram = createClient(deepgramApiKey);

cloudinary.config();

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<NextResponse> {
  const startTime = Date.now();

  const authorization = request.headers.get('authorization');

  if (!authorization || authorization !== `Bearer ${process.env.TRANSCRIPTION_API_KEY}`) {
    return new NextResponse(JSON.stringify({ error: 'Não autorizado' }), {
      status: 401,
    });
  }

  const formDataStartTime = Date.now();

  try {
    let base64File: string = '';
    let lingua: string = '';

    const headers: Record<string, string | string[]> = {};
    request.headers.forEach((value, key) => {
      headers[key.toLowerCase()] = value;
    });

    const bb = Busboy({ headers });

    const parsePromise = new Promise<void>((resolve, reject) => {
      bb.on('field', (fieldname, val) => {
        if (fieldname === 'base64File') {
          base64File = val;
        } else if (fieldname === 'lingua') {
          lingua = val;
        }
      });

      bb.on('error', (err) => {
        reject(err);
      });

      bb.on('close', () => {
        resolve();
      });
    });

    const body = await request.arrayBuffer();

    bb.write(Buffer.from(body));
    bb.end();

    await parsePromise;

    let file = base64File;

    if (file.startsWith('data:')) {
      const commaIndex = file.indexOf(',');
      if (commaIndex !== -1) {
        file = file.substring(commaIndex + 1);
      }
    }

    let fileContent: string;
    if (typeof file === 'string') {
      fileContent = file;
    } else {
      return NextResponse.json({ error: 'Arquivo inválido.' }, { status: 400 });
    }

    if (!lingua || typeof lingua !== 'string') {
      return NextResponse.json({ error: 'Língua não especificada.' }, { status: 400 });
    }

    if (!linguasTranscript[lingua as string]) {
      return NextResponse.json({ error: 'Língua para transcrição não disponível.' }, { status: 400 });
    }

    if (!fileContent) {
      return NextResponse.json({ error: 'Arquivo inválido.' }, { status: 400 });
    }

    if (fileContent.length > 10 * 1024 * 1024 * 1.37) {
      return NextResponse.json({ error: 'Arquivo muito grande. Máximo: 10MB' }, { status: 413 });
    }

    const cloudinaryStartTime = Date.now();

    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader.upload(
        'data:audio/wav;base64,' + fileContent,
        {
          resource_type: 'video',
          folder: 'chat_audios',
          timeout: 45000,
          chunk_size: 6000000,
        },
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error) {
            reject(error);
          } else if (!result) {
            reject(new Error('Upload failed without a specific error.'));
          } else {
            resolve(result);
          }
        }
      );
    });

    await new Promise((resolve) => setTimeout(resolve, 500));

    const deepgramStartTime = Date.now();

    const deepgramPromise = deepgram.listen.prerecorded.transcribeUrl(
      { url: result.secure_url },
      {
        model: 'nova-3',
        language: lingua || 'multi',
        smart_format: true,
        punctuate: true,
        utterances: false,
        numerals: true,
      }
    );

    const { result: transcription, error } = await deepgramPromise;

    if (error) {
      console.error('Erro na transcrição Deepgram:', error);
    }

    const transcript = transcription?.results?.channels?.[0]?.alternatives?.[0]?.transcript;

    if (transcript) {
      let translated: any = '';

      const needsTranslation = true;

      if (needsTranslation) {
        try {
          const translatePromise = translate(transcript, {
            to: lingua,
            autoCorrect: true,
            forceTo: true,
          });

          translated = await translatePromise;
        } catch (error) {
          console.error('Erro na tradução:', error);
        }
      } else {
        translated = { text: transcript };
      }

      const totalTime = Date.now() - startTime;

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

    return NextResponse.json({
      message: 'Upload bem-sucedido! Porém não transcreveu :(',
      url: result.secure_url,
      id: result.public_id,
      processingTime: totalTime,
    });
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error('Erro geral no processamento:', error);

    let errorMessage = 'Ocorreu um erro no servidor durante o upload. :/';
    let statusCode = 500;

    return NextResponse.json(
      {
        error: errorMessage,
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        processingTime: totalTime,
      },
      { status: statusCode }
    );
  }
}
