'use server';

const TRANSCRIPTION_API_KEY = process.env.TRANSCRIPTION_API_KEY!;
if (!TRANSCRIPTION_API_KEY) throw new Error('TRANSCRIPTION_API_KEY is not defined');

export async function transcriptAudio({ audioBase64, lingua }: { audioBase64: string; lingua: any }) {
  const form = new FormData();
  form.append('base64File', audioBase64);
  form.append('lingua', lingua.value);

  let baseUrl = 'http://localhost:3000';

  if (process.env.NEXT_PUBLIC_API_URL) {
    baseUrl = process.env.NEXT_PUBLIC_API_URL;
  } else if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    const protocol = process.env.NEXT_PUBLIC_PROTOCOL || 'https';
    baseUrl = `${protocol}://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }

  const url = `${baseUrl}/api/transcription`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TRANSCRIPTION_API_KEY}`,
    },
    body: form,
  });

  if (!res.ok) {
    return { status: res.status };
  }

  const response = await res.json();
  if (!response.translated || response.translated === '') {
    return response.transcription;
  } else {
    return response.translated;
  }
}
