import { NextResponse } from 'next/server';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { Writable } from 'stream';
import { createClient } from '@deepgram/sdk';
import linguasTranscript from "@/app/jsons/languages_stt.json";
import translate from 'google-translate-api-x';

const deepgramApiKey = process.env.DEEPGRAM_API_KEY || '';
const deepgram = createClient(deepgramApiKey);

cloudinary.config();

export async function POST(request: Request): Promise<NextResponse> {
    const authorization = request.headers.get('authorization');

    console.log('Authorization header:', authorization);

    if (!authorization || authorization !== `Bearer ${process.env.TRANSCRIPTION_API_KEY}`) {
        return new NextResponse(JSON.stringify({ error: 'Não autorizado' }), {
            status: 401,
        });
    }
    const formData = await request.formData();
    const file = formData.get('base64File') as File | string | null;
    const lingua = formData.get('lingua');


    if (!lingua || typeof lingua !== "string") {
        return NextResponse.json(
            { error: "Língua não especificada." },
            { status: 400 }
        );
    }

    if(!linguasTranscript[lingua as string]) {
        return NextResponse.json(
            { error: "Língua para transcrição não disponível." },
            { status: 400 }
        );
    }

    if (!file || typeof file !== "string") {
        return NextResponse.json(
            { error: "Arquivo inválido." },
            { status: 400 }
        );
    }

    try {
        const buffer = "data:audio/wav;base64," + file;

        const result = await new Promise<UploadApiResponse>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    resource_type: 'video',
                    folder: 'chat_audios',
                },
                (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
                    if (error || !result) {
                        return reject(error || new Error('Upload failed without a specific error.'));
                    }
                    resolve(result);
                }
            );

            const writableStream = new Writable({
                write: (chunk, encoding, callback) => {
                    uploadStream.write(chunk, encoding);
                    callback();
                },
            });

            writableStream.on('finish', () => {
                uploadStream.end();
            });

            writableStream.end(buffer);
        });

        //-----------------------------------------
        // Transcrever com a API do Deepgram
        //-----------------------------------------

        const { result: transcription, error } = await deepgram.listen.prerecorded.transcribeUrl(
            { url: result.secure_url },
            {
                model: 'nova-3',
                language: "multi",
                smart_format: true,
            },
        );

        if (error) {
            console.error(error);
        }

        if (transcription?.results.channels[0].alternatives[0].transcript) {
            let translated: any = "";
            try {
                console.log(lingua)
                translated = await translate(transcription.results.channels[0].alternatives[0].transcript, { to: lingua, autoCorrect: true, forceTo: true });
            } catch (error) {
                console.error('Erro na tradução:', error);
            }
            return NextResponse.json({
                message: 'Upload e transcrição bem-sucedidos!',
                transcription: transcription.results.channels[0].alternatives[0].transcript,
                id: result.public_id,
                url: result.secure_url,
                translated: translated.text,
                lingua: lingua || "",
                status: 200
            });
        }

        return NextResponse.json({
            message: 'Upload bem-sucedido! Porém não transcreveu :(',
            url: result.secure_url,
            id: result.public_id
        });

    } catch (error) {
        console.error('Erro no upload para o Cloudinary:', error);
        return NextResponse.json(
            { error: 'Ocorreu um erro no servidor durante o upload. :/' },
            { status: 500 }
        );
    }
}