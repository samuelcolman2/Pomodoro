import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const DEFAULT_SECONDS = 25 * 60; // 25 minutos

const formatTime = (totalSeconds: number) => {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
};

const Index = () => {
  const [secondsLeft, setSecondsLeft] = useState<number>(DEFAULT_SECONDS);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const intervalRef = useRef<number | null>(null);

  // Beep suave ao finalizar
  const playBeep = () => {
    const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = 880; // tom alto e suave
    o.connect(g);
    g.connect(ctx.destination);
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1);
    o.start();
    o.stop(ctx.currentTime + 1);
  };

  useEffect(() => {
    if (!isRunning) return;
    intervalRef.current = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(intervalRef.current!);
          intervalRef.current = null;
          setIsRunning(false);
          playBeep();
          toast.success("Ciclo concluído! Faça uma breve pausa.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning]);

  const toggle = () => setIsRunning((r) => !r);
  const reset = () => {
    setIsRunning(false);
    setSecondsLeft(DEFAULT_SECONDS);
  };

  const progressLabel = useMemo(
    () => (isRunning ? "Em andamento" : secondsLeft === 0 ? "Finalizado" : "Pronto"),
    [isRunning, secondsLeft]
  );

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <main className="w-full max-w-md animate-fade-in">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight">Pomodoro Timer</h1>
          <p className="text-muted-foreground mt-2">Foco simples, resultados reais.</p>
        </header>

        <section aria-label="Timer Pomodoro" className="bg-card border rounded-lg shadow-sm p-8">
          <div className="text-center">
            <div className="text-7xl font-semibold tabular-nums select-none" aria-live="polite" aria-atomic>
              {formatTime(secondsLeft)}
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{progressLabel}</p>
          </div>

          <div className="mt-8 flex items-center justify-center gap-3">
            <Button onClick={toggle} className="hover-scale" aria-label={isRunning ? "Pausar" : "Iniciar"}>
              {isRunning ? "Pausar" : "Iniciar"}
            </Button>
            <Button variant="secondary" onClick={reset} className="hover-scale" aria-label="Resetar">
              Resetar
            </Button>
          </div>
        </section>

        <aside className="sr-only">
          Duração padrão de 25 minutos. Use os botões para iniciar, pausar e resetar o contador.
        </aside>
      </main>
    </div>
  );
};

export default Index;
