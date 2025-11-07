import { transcriptAudio } from '@/app/utils/transcript/transcript';
import { LoaderCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function TranscriptButton({ lingua, base64 }: { lingua: string; base64: string }) {
  const [showingTranscript, setShowingTranscript] = useState(false);
  const [showingMore, setShowingMore] = useState(false);
  const [loadingTranscript, setLoadingTranscript] = useState(false);
  const [transcriptText, setTranscriptText] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const savedSettings = localStorage.getItem('talktalk_user_settings');
        let ownLingua = null;
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          ownLingua = settings.linguaSelecionada;
        }
        const response = await transcriptAudio({ audioBase64: base64, lingua: ownLingua || lingua });
        console.log(response);
        if (response.status) {
          setTranscriptText('Não foi possível transcrever o áudio.');
          setShowingTranscript(true);
          setLoadingTranscript(false);
          return;
        }
        setTranscriptText(response);
        setShowingTranscript(true);
        setLoadingTranscript(false);
      } catch (error) {
        console.error('Erro ao transcrever áudio:', error);
        setTranscriptText('Erro ao transcrever áudio.');
      }
    };

    if (loadingTranscript) {
      fetchData();
    }
  }, [loadingTranscript]);

  useEffect(() => {
    console.log(transcriptText);
  }, [transcriptText]);

  return (
    <div className="flex flex-col gap-2 items-start">
      <button
        className="cursor-pointer text-xs text-primary-400 hover:text-primary-500 hover:underline bg-transparent p-0 m-0 border-0 shadow-none"
        style={{ minWidth: 0 }}
        onClick={() => setLoadingTranscript((prev) => true)}
        // disabled={loadingTranscript}
      >
        Transcrever áudio
      </button>

      <LoaderCircle className={`text-2xl text-gray-400 animate-spin ${loadingTranscript ? 'block' : 'hidden'}`} />

      {showingTranscript && (
        <span className="text-xs text-gray-500 dark:text-gray-400 italic max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl break-words">
          {!showingMore && transcriptText.length > 20 ? transcriptText.substring(0, 20) + '...' : transcriptText}
          {/* {showingMore && <>{transcriptText}</>} */}
          {transcriptText.length > 20 && (
            <button
              className="ml-1 text-xs text-primary-400 hover:text-primary-500 hover:underline bg-transparent p-0 m-0 border-0 shadow-none"
              onClick={() => setShowingMore((prev) => !prev)}
            >
              {showingMore ? 'Mostrar menos' : 'Mostrar mais'}
            </button>
          )}
        </span>
      )}
    </div>
  );
}
