import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { createClient } from '@deepgram/sdk';

export async function GET() {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    configurations: {
      transcriptionApiKey: {
        configured: !!process.env.TRANSCRIPTION_API_KEY,
        length: process.env.TRANSCRIPTION_API_KEY?.length || 0,
      },
      deepgram: {
        apiKeyConfigured: !!process.env.DEEPGRAM_API_KEY,
        apiKeyLength: process.env.DEEPGRAM_API_KEY?.length || 0,
        clientInitialized: false,
      },
      cloudinary: {
        urlConfigured: !!process.env.CLOUDINARY_URL,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'not set',
        apiKeyConfigured: !!process.env.CLOUDINARY_API_KEY,
        apiSecretConfigured: !!process.env.CLOUDINARY_API_SECRET,
      },
    },
    tests: {
      deepgram: {
        status: 'pending',
        message: '',
      },
      cloudinary: {
        status: 'pending',
        message: '',
      },
    },
  };

  try {
    const deepgramApiKey = process.env.DEEPGRAM_API_KEY || '';
    if (deepgramApiKey) {
      const deepgram = createClient(deepgramApiKey);
      diagnostics.configurations.deepgram.clientInitialized = true;

      try {
        const { result } = await deepgram.manage.getProjects();
        if (result) {
          diagnostics.tests.deepgram.status = 'success';
          diagnostics.tests.deepgram.message = 'Deepgram API conectada com sucesso';
          diagnostics.tests.deepgram.projectsCount = result.projects?.length || 0;
        }
      } catch (error: any) {
        diagnostics.tests.deepgram.status = 'error';
        diagnostics.tests.deepgram.message = error.message || 'Erro ao conectar com Deepgram';
      }
    } else {
      diagnostics.tests.deepgram.status = 'skipped';
      diagnostics.tests.deepgram.message = 'DEEPGRAM_API_KEY não configurada';
    }
  } catch (error: any) {
    diagnostics.tests.deepgram.status = 'error';
    diagnostics.tests.deepgram.message = error.message || 'Erro ao inicializar Deepgram';
  }

  try {
    cloudinary.config();

    if (process.env.CLOUDINARY_URL) {
      try {
        const pingResult = await cloudinary.api.ping();
        diagnostics.tests.cloudinary.status = 'success';
        diagnostics.tests.cloudinary.message = 'Cloudinary conectado com sucesso';
        diagnostics.tests.cloudinary.pingStatus = pingResult.status;
      } catch (error: any) {
        diagnostics.tests.cloudinary.status = 'error';
        diagnostics.tests.cloudinary.message = error.message || 'Erro ao conectar com Cloudinary';
        diagnostics.tests.cloudinary.errorCode = error.http_code;
      }
    } else {
      diagnostics.tests.cloudinary.status = 'skipped';
      diagnostics.tests.cloudinary.message = 'CLOUDINARY_URL não configurada';
    }
  } catch (error: any) {
    diagnostics.tests.cloudinary.status = 'error';
    diagnostics.tests.cloudinary.message = error.message || 'Erro ao configurar Cloudinary';
  }

  const hasAllRequiredConfigs =
    diagnostics.configurations.transcriptionApiKey.configured &&
    diagnostics.configurations.deepgram.apiKeyConfigured &&
    diagnostics.configurations.cloudinary.urlConfigured;

  diagnostics.summary = {
    ready: hasAllRequiredConfigs,
    message: hasAllRequiredConfigs
      ? 'Todas as configurações necessárias estão presentes'
      : 'Algumas configurações estão faltando',
    missingConfigs: [],
  };

  if (!diagnostics.configurations.transcriptionApiKey.configured) {
    diagnostics.summary.missingConfigs.push('TRANSCRIPTION_API_KEY');
  }
  if (!diagnostics.configurations.deepgram.apiKeyConfigured) {
    diagnostics.summary.missingConfigs.push('DEEPGRAM_API_KEY');
  }
  if (!diagnostics.configurations.cloudinary.urlConfigured) {
    diagnostics.summary.missingConfigs.push('CLOUDINARY_URL');
  }

  return NextResponse.json(diagnostics, { status: 200 });
}

export async function POST(request: Request) {
  try {
    const startTime = Date.now();
    const body = await request.json();

    const testAudioBase64 = body.testAudio || 'UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';

    const steps = {
      parseRequest: 0,
      cloudinaryUpload: 0,
      deepgramTranscription: 0,
      total: 0,
    };

    const parseStartTime = Date.now();
    steps.parseRequest = parseStartTime - startTime;

    let cloudinaryUrl = '';
    let cloudinaryError = null;

    if (process.env.CLOUDINARY_URL) {
      const cloudinaryStartTime = Date.now();
      try {
        cloudinary.config();
        const uploadResult = await cloudinary.uploader.upload(
          `data:audio/wav;base64,${testAudioBase64}`,
          {
            resource_type: 'video',
            folder: 'test_audios',
            timeout: 10000,
          }
        );
        cloudinaryUrl = uploadResult.secure_url;
        steps.cloudinaryUpload = Date.now() - cloudinaryStartTime;
      } catch (error: any) {
        cloudinaryError = error.message;
        steps.cloudinaryUpload = Date.now() - cloudinaryStartTime;
      }
    }

    let deepgramResult = null;
    let deepgramError = null;

    if (process.env.DEEPGRAM_API_KEY && cloudinaryUrl) {
      const deepgramStartTime = Date.now();
      try {
        const deepgram = createClient(process.env.DEEPGRAM_API_KEY);
        const { result } = await deepgram.listen.prerecorded.transcribeUrl(
          { url: cloudinaryUrl },
          {
            model: 'nova-3',
            language: 'multi',
            smart_format: true,
          }
        );
        deepgramResult = result?.results?.channels?.[0]?.alternatives?.[0]?.transcript || 'No transcript';
        steps.deepgramTranscription = Date.now() - deepgramStartTime;
      } catch (error: any) {
        deepgramError = error.message;
        steps.deepgramTranscription = Date.now() - deepgramStartTime;
      }
    }

    steps.total = Date.now() - startTime;

    return NextResponse.json({
      success: !cloudinaryError && !deepgramError,
      timings: steps,
      results: {
        cloudinary: {
          uploaded: !!cloudinaryUrl,
          url: cloudinaryUrl || null,
          error: cloudinaryError,
        },
        deepgram: {
          transcribed: !!deepgramResult,
          transcript: deepgramResult,
          error: deepgramError,
        },
      },
      recommendations: {
        cloudinaryTooSlow: steps.cloudinaryUpload > 10000,
        deepgramTooSlow: steps.deepgramTranscription > 5000,
        totalTooSlow: steps.total > 20000,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Test failed',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
