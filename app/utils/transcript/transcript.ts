"use server";

const TRANSCRIPTION_API_KEY = process.env.TRANSCRIPTION_API_KEY!;
if (!TRANSCRIPTION_API_KEY) throw new Error("TRANSCRIPTION_API_KEY is not defined");

export async function transcriptAudio({
    audioBase64,
    lingua,
}: { audioBase64: string; lingua: any }) {
    const form = new FormData();
    form.append("base64File", audioBase64);
    form.append("lingua", lingua.value);

    const res = await fetch("http://localhost:3000/api/transcription", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${TRANSCRIPTION_API_KEY}`,
        },
        body: form,
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Transcription failed: ${res.status} ${err}`);
    }
    const response = await res.json();
    return response.transcription;
}