import React, { useState, useEffect, useCallback } from 'react';

const phrases = [
  { title: 'Mapeie Competências', sub: 'Identifique gaps técnicos com exames personalizados' },
  { title: 'Avalie seu Time', sub: 'Descubra forças e oportunidades em cada squad' },
  { title: 'Evolução Contínua', sub: 'Acompanhe o crescimento técnico ao longo do tempo' },
  { title: 'Decisão com Dados', sub: 'Relatórios agregados por cargo, squad e setor' },
  { title: 'Assessment Justo', sub: 'Questões sorteadas dinamicamente por tema e senioridade' },
];

const blips = [
  { angle: 30, distance: 35, size: 3, delay: 0.8 },
  { angle: 120, distance: 55, size: 2.5, delay: 2.1 },
  { angle: 210, distance: 42, size: 3.5, delay: 3.5 },
  { angle: 310, distance: 60, size: 2, delay: 5.0 },
  { angle: 65, distance: 70, size: 2.8, delay: 1.5 },
  { angle: 260, distance: 28, size: 3.2, delay: 4.2 },
  { angle: 340, distance: 50, size: 2.2, delay: 6.0 },
  { angle: 170, distance: 68, size: 2.7, delay: 2.8 },
];

const RadarScan: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  const tick = useCallback(() => {
    setFade(false);
    setTimeout(() => {
      setIndex((i) => (i + 1) % phrases.length);
      setFade(true);
    }, 400);
  }, []);

  useEffect(() => {
    const id = setInterval(tick, 5000);
    return () => clearInterval(id);
  }, [tick]);

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-full min-h-[500px] overflow-hidden">
      <style>{`
        @keyframes radar-sweep {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes blip-pulse {
          0%, 100% { opacity: 0; transform: scale(0); }
          15% { opacity: 1; transform: scale(1); }
          40% { opacity: 0.8; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.3); }
        }
        @keyframes ring-fade-in {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        .radar-sweep {
          animation: radar-sweep 4s linear infinite;
          transform-origin: center;
        }
      `}</style>

    {/* Rings */}
    <svg
      viewBox="0 0 240 240"
      className="absolute w-[240px] h-[240px] md:w-[300px] md:h-[300px]"
      style={{ filter: 'drop-shadow(0 0 30px hsla(175, 75%, 50%, 0.08))' }}
    >
      <defs>
        <linearGradient id="ring-fade" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="hsla(175, 70%, 55%, 0.25)" />
          <stop offset="100%" stopColor="hsla(190, 65%, 50%, 0.05)" />
        </linearGradient>
      </defs>

      {/* Ring 1 */}
      <circle
        cx="120" cy="120" r="30"
        fill="none" stroke="hsla(175, 70%, 55%, 0.12)"
        strokeWidth="0.5"
        strokeDasharray="3 5"
        style={{ animation: 'ring-fade-in 1s ease-out' }}
      />
      {/* Ring 2 */}
      <circle
        cx="120" cy="120" r="55"
        fill="none" stroke="hsla(175, 65%, 50%, 0.10)"
        strokeWidth="0.5"
        strokeDasharray="4 7"
        style={{ animation: 'ring-fade-in 1.2s ease-out 0.1s both' }}
      />
      {/* Ring 3 */}
      <circle
        cx="120" cy="120" r="80"
        fill="none" stroke="hsla(175, 60%, 48%, 0.08)"
        strokeWidth="0.5"
        strokeDasharray="5 9"
        style={{ animation: 'ring-fade-in 1.4s ease-out 0.2s both' }}
      />
      {/* Ring 4 */}
      <circle
        cx="120" cy="120" r="105"
        fill="none" stroke="hsla(190, 65%, 50%, 0.06)"
        strokeWidth="0.5"
        strokeDasharray="6 11"
        style={{ animation: 'ring-fade-in 1.6s ease-out 0.3s both' }}
      />

      {/* Crosshairs */}
      <line x1="120" y1="10" x2="120" y2="230" stroke="hsla(175, 60%, 50%, 0.06)" strokeWidth="0.5" />
      <line x1="10" y1="120" x2="230" y2="120" stroke="hsla(175, 60%, 50%, 0.06)" strokeWidth="0.5" />
      <line x1="42" y1="42" x2="198" y2="198" stroke="hsla(175, 60%, 50%, 0.04)" strokeWidth="0.5" />
      <line x1="198" y1="42" x2="42" y2="198" stroke="hsla(175, 60%, 50%, 0.04)" strokeWidth="0.5" />

      {/* Sweep line */}
      <g className="radar-sweep">
        <line
          x1="120" y1="120" x2="120" y2="0"
          stroke="url(#ring-fade)"
          strokeWidth="2"
          style={{ filter: 'blur(1px)' }}
        />
      </g>

      {/* Blips */}
      {blips.map((blip, i) => {
        const rad = (blip.angle * Math.PI) / 180;
        const cx = 120 + blip.distance * Math.cos(rad);
        const cy = 120 + blip.distance * Math.sin(rad);
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={blip.size}
            fill="hsla(175, 80%, 65%, 0.9)"
            style={{
              animation: `blip-pulse 6s ease-out ${blip.delay}s infinite`,
              filter: 'blur(0.5px)',
            }}
          />
        );
      })}
    </svg>

    {/* Central icon */}
    <div className="absolute flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-white/5 backdrop-blur-sm border border-white/8">
      <img src="/icon.svg" alt="" className="w-7 h-7 md:w-8 md:h-8 opacity-80" />
    </div>

    {/* Rotating text */}
    <div className="absolute bottom-12 md:bottom-16 text-center px-6">
      <div
        className="transition-all duration-[400ms] ease-out"
        style={{
          opacity: fade ? 1 : 0,
          transform: `translateY(${fade ? 0 : '8px'})`,
        }}
      >
        <h2 className="text-white text-xl md:text-2xl font-heading font-bold tracking-tight drop-shadow-sm">
          {phrases[index].title}
        </h2>
        <p className="text-white/70 text-sm md:text-base mt-2 max-w-[300px] mx-auto leading-relaxed">
          {phrases[index].sub}
        </p>
      </div>
    </div>
  </div>
  );
};

export default RadarScan;
