'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ColorBlindType, useColorBlind } from '@/app/contexts/ColorBlindContext';

interface ColorTestProps {
  colorBlindType: ColorBlindType | undefined;
}

type PlateKind = 'rg' | 'by' | 'control';

type Plate = {
  id: string;
  kind: PlateKind;
  answer: string; // supports 1- or 2-digit
};

// Predefined simple set of plates to sample different confusion lines
const PLATES: Plate[] = [
  { id: 'p1', kind: 'rg', answer: '12' },
  { id: 'p2', kind: 'rg', answer: '6' },
  { id: 'p3', kind: 'rg', answer: '8' },
  { id: 'p4', kind: 'by', answer: '29' },
  { id: 'p5', kind: 'by', answer: '5' },
  { id: 'p6', kind: 'control', answer: '45' },
];

// Color palettes roughly approximating Ishihara contrast pairs
type Scheme = { bg: string[]; fg: string[] };

const basePalettes: Record<PlateKind, Scheme> = {
  rg: {
    bg: ['#CFEFD5', '#DFF5E1', '#D1F2D8', '#E3F8E9', '#D7F2E0'],
    fg: ['#B71C1C', '#C62828', '#D32F2F', '#E53935', '#F44336'],
  },
  by: {
    bg: ['#CFE8FF', '#DCEFFF', '#D6F7FF', '#CCE5FF', '#D9F1FF'],
    fg: ['#FFC107', '#FFCA28', '#FFD54F', '#FFB300', '#F7B801'],
  },
  control: {
    bg: ['#E6E9F5', '#E3F2FD', '#E0F7FA', '#E8F5E9', '#F3E5F5'],
    fg: ['#1F2937', '#111827', '#0F172A', '#1E40AF', '#065F46'],
  },
} as const;

function getPalettes(highContrast: boolean): Record<PlateKind, Scheme> {
  if (!highContrast) return basePalettes;
  // Boosted contrast variants
  return {
    rg: {
      bg: ['#EAF9EE', '#E5F7EA', '#E9FAEE', '#F1FFF5', '#E8FAF0'],
      fg: ['#8B0000', '#9E0000', '#B00000', '#C51212', '#D61A1A'],
    },
    by: {
      bg: ['#EAF4FF', '#EDF7FF', '#E7FBFF', '#EAF5FF', '#EEF9FF'],
      fg: ['#FFB300', '#FFAA00', '#FFA000', '#FF9900', '#FF8C00'],
    },
    control: {
      bg: ['#F1F4FB', '#F2F8FF', '#EBFBFF', '#F1FAF5', '#F7EEFB'],
      fg: ['#0B132B', '#0A0F1F', '#111827', '#0F172A', '#1E3A8A'],
    },
  };
}

const CANVAS_SIZE = 320;
const BG_DOT_MIN = 5;
const BG_DOT_MAX = 10;
const BG_DOT_COUNT = 700;
const FG_DOT_MIN = 9;
const FG_DOT_MAX = 15;
const FG_TARGET_COUNT = 420;

function drawPlate(canvas: HTMLCanvasElement, plate: Plate, scheme: Scheme, highContrast: boolean) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  // Circular mask (like Ishihara plate)
  ctx.save();
  ctx.beginPath();
  ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, CANVAS_SIZE / 2 - 4, 0, Math.PI * 2);
  ctx.clip();

  // Draw background dots first
  for (let i = 0; i < BG_DOT_COUNT; i++) {
    const r = Math.random() * (BG_DOT_MAX - BG_DOT_MIN) + BG_DOT_MIN;
    const x = Math.random() * CANVAS_SIZE;
    const y = Math.random() * CANVAS_SIZE;
    ctx.beginPath();
    ctx.fillStyle = scheme.bg[Math.floor(Math.random() * scheme.bg.length)];
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Offscreen canvas to rasterize the numeral
  const off = document.createElement('canvas');
  off.width = CANVAS_SIZE;
  off.height = CANVAS_SIZE;
  const octx = off.getContext('2d');
  if (!octx) return;
  octx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  octx.fillStyle = '#000';
  octx.textAlign = 'center';
  octx.textBaseline = 'middle';
  // Font size adjusted by digits
  const fontSize = plate.answer.length === 1 ? 180 : 150;
  octx.font = `bold ${fontSize}px sans-serif`;
  octx.fillText(plate.answer, CANVAS_SIZE / 2, CANVAS_SIZE / 2 + 8);
  const img = octx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  const data = img.data;

  // Optional: subtle light stroke under the numeral to improve readability in high-contrast mode
  if (highContrast) {
    ctx.save();
    ctx.fillStyle = 'transparent';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const fontSize = plate.answer.length === 1 ? 180 : 150;
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.lineWidth = 8;
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.strokeText(plate.answer, CANVAS_SIZE / 2, CANVAS_SIZE / 2 + 8);
    ctx.restore();
  }

  // Draw foreground dots where the numeral mask is present (ensure minimum amount)
  let placed = 0;
  let safe = 0;
  while (placed < FG_TARGET_COUNT && safe < FG_TARGET_COUNT * 10) {
    safe++;
    const r = Math.random() * (FG_DOT_MAX - FG_DOT_MIN) + FG_DOT_MIN;
    const x = Math.random() * CANVAS_SIZE;
    const y = Math.random() * CANVAS_SIZE;
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const idx = (iy * CANVAS_SIZE + ix) * 4;
    const isNumber = data[idx + 3] > 20; // alpha > threshold
    if (isNumber) {
      placed++;
      ctx.beginPath();
      ctx.fillStyle = scheme.fg[Math.floor(Math.random() * scheme.fg.length)];
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
  // Outer ring
  ctx.beginPath();
  ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, CANVAS_SIZE / 2 - 4, 0, Math.PI * 2);
  ctx.lineWidth = 4;
  ctx.strokeStyle = 'rgba(0,0,0,0.05)';
  ctx.stroke();
}

const ColorBlindTest = ({ colorBlindType = 'none' }: ColorTestProps) => {
  const { t } = useTranslation();
  const { setColorBlindType } = useColorBlind();
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Array<{ value: string; sawNothing: boolean }>>(
    () => PLATES.map(() => ({ value: '', sawNothing: false }))
  );
  const [finished, setFinished] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [highContrast, setHighContrast] = useState(true);

  const currentPlate = useMemo(() => PLATES[index], [index]);
  const total = PLATES.length;

  useEffect(() => {
    if (!started || finished) return;
    const c = canvasRef.current;
    if (c) {
      const schemes = getPalettes(highContrast);
      const scheme = schemes[currentPlate.kind];
      drawPlate(c, currentPlate, scheme, highContrast);
    }
    // Redraw on resize (optional); keep it simple for now
  }, [started, finished, currentPlate, highContrast]);

  const handleChange = (v: string) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = { value: v.replace(/[^0-9]/g, ''), sawNothing: false };
      return next;
    });
  };

  const handleSawNothing = () => {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = { value: '', sawNothing: true };
      return next;
    });
  };

  const canPrev = index > 0;
  const canNext = index < total - 1;

  const goNext = () => setIndex((i) => Math.min(total - 1, i + 1));
  const goPrev = () => setIndex((i) => Math.max(0, i - 1));

  const restart = useCallback(() => {
    setStarted(false);
    setFinished(false);
    setIndex(0);
    setAnswers(PLATES.map(() => ({ value: '', sawNothing: false })));
  }, []);

  const result = useMemo(() => {
    if (!finished) return null;
    let correct = 0;
    let rgMistakes = 0;
    let byMistakes = 0;
    let controlMistakes = 0;
    PLATES.forEach((p, i) => {
      const a = answers[i];
      const ok = !a.sawNothing && a.value === p.answer;
      if (ok) correct++;
      else {
        if (p.kind === 'rg') rgMistakes++;
        else if (p.kind === 'by') byMistakes++;
        else controlMistakes++;
      }
    });

    // Heuristic suggestion
    let suggestion: ColorBlindType = 'none';
    if (controlMistakes >= 1 && correct <= 1) {
      suggestion = 'acromatopsia';
    } else if (rgMistakes >= 2 && byMistakes <= 1) {
      suggestion = 'deuteranomalia'; // generic red-green deficiency
    } else if (byMistakes >= 2) {
      suggestion = 'tritanomalia';
    } else if (rgMistakes >= 1 && byMistakes === 0) {
      suggestion = 'protanomalia';
    }

    return { correct, total, rgMistakes, byMistakes, controlMistakes, suggestion };
  }, [answers, finished]);

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-medium">{t('chat.configuracoes.acessibilidade.daltonismo.teste.titulo')}</h4>

      {!started && !finished && (
        <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {t('chat.configuracoes.acessibilidade.daltonismo.teste.ishihara.descricao')}
          </p>
          <button
            onClick={() => setStarted(true)}
            className="mt-3 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            {t('chat.configuracoes.acessibilidade.daltonismo.teste.ishihara.iniciar')}
          </button>
        </div>
      )}

      {started && !finished && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>
              {t('chat.configuracoes.acessibilidade.daltonismo.teste.ishihara.progresso', {
                atual: index + 1,
                total,
              })}
            </span>
          </div>
          <div className="w-full flex items-center justify-center">
            <canvas
              ref={canvasRef}
              width={CANVAS_SIZE}
              height={CANVAS_SIZE}
              className="rounded-xl shadow border border-gray-200 dark:border-gray-700"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
            <label className="text-sm text-gray-700 dark:text-gray-300">
              {t('chat.configuracoes.acessibilidade.daltonismo.teste.ishihara.digite_numero')}
            </label>
            <input
              value={answers[index].value}
              onChange={(e) => handleChange(e.target.value)}
              inputMode="numeric"
              pattern="[0-9]*"
              className="flex-1 p-2 rounded-lg border bg-white dark:bg-gray-800 dark:border-gray-700"
              placeholder="--"
            />
            <label className="ml-auto inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={highContrast}
                onChange={(e) => setHighContrast(e.target.checked)}
                className="h-4 w-4"
              />
              {t('chat.configuracoes.acessibilidade.daltonismo.teste.ishihara.aumentar_contraste')}
            </label>
            <button
              onClick={handleSawNothing}
              className="px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              {t('chat.configuracoes.acessibilidade.daltonismo.teste.ishihara.nao_vejo')}
            </button>
          </div>
          <div className="flex items-center justify-between">
            <button
              onClick={goPrev}
              disabled={!canPrev}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50"
            >
              {t('chat.configuracoes.acessibilidade.daltonismo.teste.ishihara.anterior')}
            </button>
            {canNext ? (
              <button
                onClick={goNext}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                {t('chat.configuracoes.acessibilidade.daltonismo.teste.ishihara.proximo')}
              </button>
            ) : (
              <button
                onClick={() => setFinished(true)}
                className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
              >
                {t('chat.configuracoes.acessibilidade.daltonismo.teste.ishihara.finalizar')}
              </button>
            )}
          </div>
        </div>
      )}

      {finished && result && (
        <div className="space-y-3 p-4 rounded-lg bg-gray-100 dark:bg-gray-800">
          <h5 className="font-medium">{t('chat.configuracoes.acessibilidade.daltonismo.teste.ishihara.resultado.titulo')}</h5>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {t('chat.configuracoes.acessibilidade.daltonismo.teste.ishihara.progresso', {
              atual: result.correct,
              total: result.total,
            })}
          </p>

          {result.suggestion === 'none' && (
            <p className="text-sm text-green-700 dark:text-green-300">
              {t('chat.configuracoes.acessibilidade.daltonismo.teste.ishihara.resultado.normal')}
            </p>
          )}
          {result.suggestion === 'deuteranomalia' && (
            <p className="text-sm">
              {t('chat.configuracoes.acessibilidade.daltonismo.teste.ishihara.resultado.rg_sugestao')}
            </p>
          )}
          {result.suggestion === 'protanomalia' && (
            <p className="text-sm">
              {t('chat.configuracoes.acessibilidade.daltonismo.teste.ishihara.resultado.rg_sugestao')}
            </p>
          )}
          {result.suggestion === 'tritanomalia' && (
            <p className="text-sm">
              {t('chat.configuracoes.acessibilidade.daltonismo.teste.ishihara.resultado.by_sugestao')}
            </p>
          )}
          {result.suggestion === 'acromatopsia' && (
            <p className="text-sm">
              {t('chat.configuracoes.acessibilidade.daltonismo.teste.ishihara.resultado.acromatopsia')}
            </p>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => setColorBlindType(result.suggestion)}
              className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700"
            >
              {t('chat.configuracoes.acessibilidade.daltonismo.teste.ishihara.resultado.aplicar_filtro')}
            </button>
            <button
              onClick={restart}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600"
            >
              {t('chat.configuracoes.acessibilidade.daltonismo.teste.ishihara.resultado.reiniciar')}
            </button>
          </div>

          {colorBlindType !== 'none' && (
            <div className="mt-2 text-xs text-primary-600 dark:text-primary-400">
              {t('chat.configuracoes.acessibilidade.daltonismo.teste.modo_ativo', { tipo: colorBlindType })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ColorBlindTest;