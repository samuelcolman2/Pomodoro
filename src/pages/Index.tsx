import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Moon, Sun } from "lucide-react";

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
  // Duração editável (minutos)
  const [durationMinutes, setDurationMinutes] = useState<number>(25);
  const [secondsLeft, setSecondsLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const intervalRef = useRef<number | null>(null);

  // Tema claro/escuro
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    const stored = localStorage.getItem("theme") as "light" | "dark" | null;
    if (stored) return stored;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  // Beep suave ao finalizar
  const playBeep = () => {
    const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = 880;
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
    setSecondsLeft(durationMinutes * 60);
  };

  const applyDuration = () => {
    if (durationMinutes < 1) {
      toast.error("A duração mínima é 1 minuto.");
      return;
    }
    setIsRunning(false);
    setSecondsLeft(durationMinutes * 60);
    toast.success(`Duração definida para ${durationMinutes} min.`);
  };

  const progressLabel = useMemo(
    () => (isRunning ? "Em andamento" : secondsLeft === 0 ? "Finalizado" : "Pronto"),
    [isRunning, secondsLeft]
  );

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <main className="w-full max-w-md animate-fade-in">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pomodoro Timer</h1>
            <p className="text-muted-foreground mt-1 text-sm">Foco simples, resultados reais.</p>
          </div>
          <Button variant="outline" size="icon" onClick={toggleTheme} aria-label="Alternar tema" className="hover-scale">
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </header>

        <section aria-label="Timer Pomodoro" className="bg-card border rounded-lg shadow-sm p-6">
          <div className="text-center">
            <div className="text-7xl font-semibold tabular-nums select-none" aria-live="polite" aria-atomic>
              {formatTime(secondsLeft)}
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{progressLabel}</p>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-end">
            <div>
              <Label htmlFor="minutes">Duração (min)</Label>
              <Input
                id="minutes"
                type="number"
                min={1}
                max={180}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                disabled={isRunning}
              />
            </div>
            <Button onClick={applyDuration} disabled={isRunning} className="hover-scale" aria-label="Definir duração">
              Definir
            </Button>
          </div>

          <div className="mt-6 flex items-center justify-center gap-3">
            <Button onClick={toggle} className="hover-scale" aria-label={isRunning ? "Pausar" : "Iniciar"}>
              {isRunning ? "Pausar" : "Iniciar"}
            </Button>
            <Button variant="secondary" onClick={reset} className="hover-scale" aria-label="Resetar">
              Resetar
            </Button>
          </div>
        </section>

        <aside className="sr-only">
          Duração padrão editável em minutos. Use os botões para iniciar, pausar e resetar o contador. Alternância de tema disponível.
        </aside>
      </main>
    </div>
  );
};

export default Index;
