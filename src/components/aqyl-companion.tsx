"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { aqylActions, isAqylAction, type AqylAction } from "@/lib/aqyl-actions";
import {
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Grip,
  MessageCircle,
  Pause,
  Play,
  Send,
  X,
} from "lucide-react";
import { api, Robot } from "./ui";
import {
  answerGuide,
  guideSteps,
  GuideAnalytics,
  GuideAnswer,
  GuideLanguage,
} from "@/lib/aqyl-guide";
type Props = {
  draft?: { text: string; id: number } | null;
  language: GuideLanguage;
  data: {
    user: { user_id: string };
    org: { id: string; demo?: boolean };
    analytics: GuideAnalytics;
    ai: { enabled: boolean };
  } | null;
  section: string;
  days: number;
  screen: "none" | "manual" | "import" | "connector";
  focusedField?: string;
  onGuide: (action: AqylAction) => void;
  onEvidence: (id: string) => void;
  landing: boolean;
  suspended: boolean;
  open: boolean;
  setOpen: (v: boolean) => void;
  onNavigate: (s: string) => void;
  onRegister: () => void;
};
type Message = GuideAnswer & {
  question: string;
  action?: AqylAction | null;
  evidence?: string[];
  error?: boolean;
};
function saved(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function save(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* The helper also works without browser storage. */
  }
}
export default function AqylCompanion({
  draft,
  language,
  data,
  section,
  days,
  screen,
  focusedField,
  onGuide,
  onEvidence,
  landing,
  suspended,
  open,
  setOpen,
  onNavigate,
  onRegister,
}: Props) {
  const t = (r: string, k: string) => (language === "ru" ? r : k);
  const [messages, setMessages] = useState<Message[]>([]),
    [input, setInput] = useState(""),
    [busy, setBusy] = useState(false),
    [pendingQuestion, setPendingQuestion] = useState(""),
    [paused, setPaused] = useState(false),
    [welcome, setWelcome] = useState(false),
    [step, setStep] = useState<number | null>(null),
    [tip, setTip] = useState(true);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [highlight, setHighlight] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const dock = useRef<HTMLDivElement>(null),
    panel = useRef<HTMLElement>(null),
    end = useRef<HTMLDivElement>(null),
    trigger = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    x: number;
    y: number;
    left: number;
    top: number;
  } | null>(null);
  const request = useRef(0);
  const [modalHost, setModalHost] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setModalHost(
      screen === "manual" || screen === "import"
        ? document.getElementById("aqyl-modal-host")
        : null,
    );
  }, [screen]);
  const steps = guideSteps(language),
    current = step === null ? null : steps[step];
  const identity = data ? data.user.user_id + ":" + data.org.id : "guest";
  const seenKey = "bagyt-aqyl-tour-v1:" + identity;
  const clamp = (x: number, y: number) => ({
    x: Math.max(8, Math.min(window.innerWidth - 116, x)),
    y: Math.max(8, Math.min(window.innerHeight - 134, y)),
  });
  useEffect(() => {
    if (draft) {
      setInput(draft.text.slice(0, 1500));
      setStep(null);
      setWelcome(false);
    }
  }, [draft]);
  useEffect(() => {
    setPaused(saved("bagyt-aqyl-paused") === "true");
  }, []);
  useEffect(() => {
    document.documentElement.dataset.aqylMotion = paused ? "paused" : "active";
    return () => {
      delete document.documentElement.dataset.aqylMotion;
    };
  }, [paused]);
  useEffect(() => {
    setTip(true);
    const timer = setTimeout(() => setTip(false), 12000);
    return () => clearTimeout(timer);
  }, [section, landing]);
  useEffect(() => {
    request.current++;
    setMessages([]);
    setBusy(false);
    setPendingQuestion("");
    setInput("");
    setStep(null);
    setWelcome(false);
  }, [identity]);
  useEffect(() => {
    if (data && !landing && !suspended && !saved(seenKey)) {
      setWelcome(true);
      setOpen(true);
    }
  }, [data?.org.id, landing, suspended, seenKey, setOpen]);
  useEffect(() => {
    if (open && !suspended) panel.current?.focus({ preventScroll: true });
  }, [open, suspended]);
  useEffect(() => {
    end.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [messages, busy]);
  useEffect(() => {
    const resize = () => setPosition((p) => (p ? clamp(p.x, p.y) : p));
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);
  useEffect(() => {
    if (!current || suspended) {
      setHighlight(null);
      return;
    }
    const element = document.querySelector(current.selector);
    if (!element) {
      setHighlight(null);
      return;
    }
    element.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
      block: "center",
    });
    const measure = () => {
      const r = element.getBoundingClientRect();
      setHighlight({
        x: Math.max(4, r.left - 5),
        y: Math.max(4, r.top - 5),
        width: Math.min(r.width + 10, window.innerWidth - 8),
        height: Math.min(r.height + 10, window.innerHeight - 8),
      });
    };
    measure();
    window.addEventListener("scroll", measure, true);
    window.addEventListener("resize", measure);
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => {
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
      observer.disconnect();
    };
  }, [step, section, suspended, language]);
  const finish = () => {
    if (data && !landing) save(seenKey, "seen");
    setStep(null);
    setWelcome(false);
  };
  const hide = () => {
    finish();
    setOpen(false);
    setTip(false);
    trigger.current?.querySelector<HTMLButtonElement>(".robot")?.focus();
  };
  function visit(s: string) {
    setOpen(false);
    setStep(null);
    if (s === "register") onRegister();
    else onNavigate(s);
  }
  function showStep(index: number) {
    save(seenKey, "seen");
    setWelcome(false);
    setOpen(true);
    setPosition(null);
    setStep(index);
    onNavigate(steps[index].section);
  }
  async function ask(q: string) {
    q = q.trim();
    if (!q || busy) return;
    setInput("");
    setWelcome(false);
    if (data && !landing) save(seenKey, "seen");
    setStep(null);
    if (data?.ai.enabled) {
      const id = ++request.current;
      setBusy(true);
      setPendingQuestion(q);
      try {
        const history = messages
          .filter((m) => !m.error)
          .slice(-8)
          .flatMap((m) => [
            { role: "user", text: m.question },
            { role: "assistant", text: m.text.slice(0, 8000) },
          ]);
        while (history.reduce((n, m) => n + m.text.length, 0) > 28000)
          history.splice(0, 2);
        const result = await api("aqyl", {
          question: q,
          language,
          days,
          section: landing ? "landing" : section,
          screen,
          focusedField,
          history,
        });
        if (id === request.current)
          setMessages((m) =>
            [
              ...m,
              {
                question: q,
                text: result.answer,
                action: isAqylAction(result.action) ? result.action : null,
                evidence: result.evidence || [],
              },
            ].slice(-24),
          );
      } catch (e) {
        if (id === request.current)
          setMessages((m) => [
            ...m,
            {
              question: q,
              error: true,
              text:
                e instanceof Error
                  ? e.message
                  : t(
                      "Не удалось получить ответ. Повторите запрос.",
                      "Жауап алу мүмкін болмады. Қайта көріңіз.",
                    ),
            },
          ]);
      } finally {
        if (id === request.current) {
          setBusy(false);
          setPendingQuestion("");
        }
      }
    } else {
      const local = answerGuide(q, language, data?.analytics);
      if (local) {
        setMessages((m) => [...m, { question: q, ...local }].slice(-24));
        return;
      }
      setMessages((m) =>
        [
          ...m,
          {
            question: q,
            text: t(
              "Пока я отвечаю на вопросы о кнопках, данных, продажах, расходах и плане. Свободный AI-диалог ещё не подключён. Попробуйте «Как добавить данные?» или «Что делать дальше?».",
              "Әзірге батырмалар, деректер, сату, шығындар мен жоспар туралы сұрақтарға жауап беремін. Еркін AI-диалог әлі қосылмаған. «Деректерді қалай қосамын?» немесе «Не істеу керек?» деп сұраңыз.",
            ),
          },
        ].slice(-24),
      );
    }
  }
  const contextual = landing
    ? t("Сәлем! С чего хотите начать?", "Сәлем! Неден бастағыңыз келеді?")
    : section === "connect"
      ? t(
          "У вас есть таблица или чек? Добавим и проверим вместе.",
          "Кесте немесе чек бар ма? Бірге қосып, тексерейік.",
        )
      : section === "growth"
        ? t(
            "Выберите одно дело. Проверим цель, срок и результат.",
            "Бір істі таңдаңыз. Мақсат, мерзім мен нәтижені тексерейік.",
          )
        : section === "settings"
          ? t(
              "Здесь можно дополнить сведения о бизнесе и команде.",
              "Мұнда бизнес пен команда туралы ақпаратты толықтыра аласыз.",
            )
          : data?.analytics.coverage.pending
            ? t(
                `Есть записи на проверке: ${data.analytics.coverage.pending}. Начнём с них?`,
                `Тексеруді күтетін жазбалар: ${data.analytics.coverage.pending}. Солардан бастаймыз ба?`,
              )
            : t(
                "Как идут дела? Помогу найти следующий шаг.",
                "Кәсібіңіз қалай? Келесі қадамды табуға көмектесемін.",
              );
  if (suspended || ((screen === "manual" || screen === "import") && !modalHost))
    return null;
  const content = (
    <>
      {current && highlight && (
        <div
          className="aqyl-spotlight"
          style={{
            left: highlight.x,
            top: highlight.y,
            width: highlight.width,
            height: highlight.height,
          }}
          aria-hidden="true"
        />
      )}
      <div
        className={`aqyl-dock ${paused ? "is-paused" : ""} ${open ? "is-talking" : ""}`}
        ref={dock}
        style={
          position
            ? {
                left: position.x,
                top: position.y,
                right: "auto",
                bottom: "auto",
              }
            : undefined
        }
      >
        {!open && tip && (
          <button className="aqyl-prompt" onClick={() => setOpen(true)}>
            {landing
              ? t("Я рядом. Спросите меня!", "Мен қасыңыздамын. Сұраңыз!")
              : contextual}
            <MessageCircle size={14} />
          </button>
        )}
        <div ref={trigger} className="aqyl-flyer">
          <Robot
            size={100}
            state={busy ? "thinking" : open ? "success" : "greeting"}
            onClick={() => (open ? hide() : setOpen(true))}
            label={
              open
                ? t("Свернуть AQYL", "AQYL-ды жинау")
                : t("Открыть помощника AQYL", "AQYL көмекшісін ашу")
            }
          />
        </div>
        <div className="aqyl-dock-caption">
          <span>AQYL</span>
          <button
            aria-label={t(
              "Переместить AQYL: перетащите или используйте стрелки",
              "AQYL-ды жылжыту: сүйреңіз немесе бағыттауыштарды қолданыңыз",
            )}
            title={t("Перетащите меня", "Мені жылжытыңыз")}
            onPointerDown={(e) => {
              const r = dock.current!.getBoundingClientRect();
              drag.current = {
                x: e.clientX,
                y: e.clientY,
                left: r.left,
                top: r.top,
              };
              e.currentTarget.setPointerCapture(e.pointerId);
            }}
            onPointerMove={(e) => {
              if (drag.current)
                setPosition(
                  clamp(
                    drag.current.left + e.clientX - drag.current.x,
                    drag.current.top + e.clientY - drag.current.y,
                  ),
                );
            }}
            onPointerUp={() => {
              drag.current = null;
            }}
            onPointerCancel={() => {
              drag.current = null;
            }}
            onKeyDown={(e) => {
              const moves: Record<string, number[]> = {
                ArrowLeft: [-24, 0],
                ArrowRight: [24, 0],
                ArrowUp: [0, -24],
                ArrowDown: [0, 24],
              };
              if (moves[e.key]) {
                e.preventDefault();
                const r = dock.current!.getBoundingClientRect();
                setPosition(
                  clamp(r.left + moves[e.key][0], r.top + moves[e.key][1]),
                );
              }
            }}
          >
            <Grip size={14} />
          </button>
        </div>
      </div>
      {open && (
        <section
          className="aqyl-window"
          role="dialog"
          aria-modal="false"
          aria-label={t("Разговор с AQYL", "AQYL-мен әңгіме")}
          tabIndex={-1}
          ref={panel}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.stopPropagation();
              hide();
            }
          }}
        >
          <header>
            <div>
              <span className="aqyl-live-dot" />
              <b>AQYL</b>
              <small>
                {busy
                  ? t("Думаю…", "Ойланып тұрмын…")
                  : data?.org.demo
                    ? t("Демо-данные", "Демо-деректер")
                    : data?.ai.enabled
                      ? "Gemini · AI"
                      : t("Я рядом", "Мен қасыңыздамын")}
              </small>
            </div>
            <div>
              <button
                className="icon-button"
                disabled={busy}
                aria-label={t("Начать новый разговор", "Жаңа әңгіме бастау")}
                onClick={() => {
                  setMessages([]);
                  finish();
                }}
              >
                <RotateCcw size={16} />
              </button>
              <button
                className="icon-button"
                aria-label={
                  paused
                    ? t("Включить движение AQYL", "AQYL қозғалысын қосу")
                    : t("Остановить движение AQYL", "AQYL қозғалысын тоқтату")
                }
                onClick={() => {
                  setPaused(!paused);
                  save("bagyt-aqyl-paused", String(!paused));
                }}
              >
                {paused ? <Play size={16} /> : <Pause size={16} />}
              </button>
              <button
                className="icon-button"
                aria-label={t("Свернуть окно AQYL", "AQYL терезесін жинау")}
                onClick={hide}
              >
                <X size={18} />
              </button>
            </div>
          </header>
          {current ? (
            <div className="aqyl-tour-body" aria-live="polite">
              <span className="aqyl-tour-count">
                {t("ЗНАКОМСТВО", "ТАНЫСУ")} · {step! + 1} / {steps.length}
              </span>
              <h3>{current.title}</h3>
              <p>{current.text}</p>
              <div className="aqyl-tour-progress">
                {steps.map((s, i) => (
                  <i key={s.section + i} className={i <= step! ? "done" : ""} />
                ))}
              </div>
              <div className="aqyl-tour-actions">
                <button
                  className="icon-button"
                  disabled={step === 0}
                  aria-label={t("Предыдущий шаг", "Алдыңғы қадам")}
                  onClick={() => showStep(step! - 1)}
                >
                  <ArrowLeft size={18} />
                </button>
                <button
                  className="primary"
                  onClick={() =>
                    step === steps.length - 1
                      ? (finish(), visit("connect"))
                      : showStep(step! + 1)
                  }
                >
                  {step === steps.length - 1
                    ? t("Начать работу", "Жұмысты бастау")
                    : t("Дальше", "Әрі қарай")}
                  <ArrowRight size={17} />
                </button>
              </div>
              <button className="aqyl-skip" onClick={finish}>
                {t("Завершить знакомство", "Танысуды аяқтау")}
              </button>
            </div>
          ) : (
            <>
              <div
                className="aqyl-conversation"
                role="log"
                aria-live="polite"
                aria-relevant="additions text"
              >
                <p className="aqyl-answer">
                  {welcome
                    ? t(
                        "Сәлем! Аккаунт готов. Я AQYL, ваш помощник. Давайте покажу основные кнопки — а потом начнём работать?",
                        "Сәлем! Аккаунт дайын. Мен AQYL — көмекшіңізбін. Негізгі батырмаларды көрсетейін, содан кейін жұмысқа кірісеміз бе?",
                      )
                    : contextual}
                </p>
                {welcome && (
                  <div className="aqyl-welcome-actions">
                    <button className="primary" onClick={() => showStep(0)}>
                      {t(
                        "Покажи, как всё работает",
                        "Қалай жұмыс істейтінін көрсет",
                      )}
                      <ArrowRight size={16} />
                    </button>
                    <button className="text-button" onClick={finish}>
                      {t("Разберусь позже", "Кейін қараймын")}
                    </button>
                  </div>
                )}
                {messages.map((m, i) => (
                  <div key={i}>
                    <p className="aqyl-question">{m.question}</p>
                    <div className="aqyl-answer">
                      <p>{m.text}</p>
                      {m.action && (
                        <button
                          onClick={() => {
                            finish();
                            setOpen(false);
                            onGuide(m.action!);
                          }}
                        >
                          {
                            aqylActions[m.action].title[
                              language === "ru" ? 0 : 1
                            ]
                          }{" "}
                          <ArrowRight size={15} />
                        </button>
                      )}
                      {!!m.evidence?.length && (
                        <div className="aqyl-evidence">
                          {m.evidence.map((id, n) => (
                            <button
                              key={id}
                              onClick={() => {
                                setOpen(false);
                                onEvidence(id);
                              }}
                            >
                              {t("Запись", "Жазба")} {n + 1}
                            </button>
                          ))}
                        </div>
                      )}
                      {m.error && (
                        <button disabled={busy} onClick={() => ask(m.question)}>
                          <RotateCcw size={14} />
                          {t("Повторить", "Қайталау")}
                        </button>
                      )}
                      {m.destination && (
                        <button onClick={() => visit(m.destination!)}>
                          {m.label}
                          <ArrowRight size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {busy && <p className="aqyl-question">{pendingQuestion}</p>}
                {busy && (
                  <p className="aqyl-answer">
                    {t(
                      "Смотрю на ваши данные…",
                      "Деректеріңізді қарап жатырмын…",
                    )}
                  </p>
                )}
                <div ref={end} />
              </div>
              <div className="aqyl-quick-replies">
                {[
                  t("С чего начать?", "Неден бастау керек?"),
                  t("Что с продажами?", "Сату қалай?"),
                  t("Что делать дальше?", "Не істеу керек?"),
                ].map((q) => (
                  <button key={q} disabled={busy} onClick={() => ask(q)}>
                    {q}
                  </button>
                ))}
              </div>
              {data && !landing && screen === "none" && (
                <button
                  className="aqyl-show-buttons"
                  onClick={() => showStep(0)}
                >
                  <BookOpen size={16} />
                  {t("Покажи основные кнопки", "Негізгі батырмаларды көрсет")}
                </button>
              )}
              <form
                className="aqyl-input"
                onSubmit={(e) => {
                  e.preventDefault();
                  ask(input);
                }}
              >
                <input
                  aria-label={t("Вопрос AQYL", "AQYL-ға сұрақ")}
                  placeholder={t("Напишите вопрос…", "Сұрағыңызды жазыңыз…")}
                  maxLength={1500}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <button
                  aria-label={t("Отправить вопрос", "Сұрақты жіберу")}
                  disabled={busy || !input.trim()}
                >
                  <Send size={18} />
                </button>
              </form>
              <p className="aqyl-method">
                {data?.ai.enabled
                  ? t(
                      "AI получает историю разговора, сводку бизнеса и проверенные записи. Ответы могут содержать ошибки.",
                      "AI әңгіме тарихын, бизнес шолуын және расталған жазбаларды алады. Жауапта қате болуы мүмкін.",
                    )
                  : t(
                      "Подсказки по сервису и вашим данным · без свободного AI-чата",
                      "Сервис пен деректеріңіз бойынша кеңестер · еркін AI-чатсыз",
                    )}
              </p>
            </>
          )}
        </section>
      )}
    </>
  );
  return modalHost ? createPortal(content, modalHost) : content;
}
