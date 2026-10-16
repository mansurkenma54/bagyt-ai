"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Compass,
  Grip,
  LockKeyhole,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import BelgiRobot from "./belgi-robot";
import { belgiGuideSteps, useBelgiGuide } from "./use-belgi-guide";
import {
  unanswered,
  demoReviews,
  type HubState,
} from "@/lib/business-hub-demo";
import { answer, type Exchange, type Topic } from "@/lib/demo-agent-answer";
import {
  agentTeam,
  agentForSection,
  availableAgent,
  AGENT_PLAN_KEY,
  AGENT_ID_KEY,
  type AgentId,
  type AgentPlan,
} from "@/lib/agent-team";

type Props = {
  guideRequest: number;
  language: "kk" | "ru";
  section: string;
  period: number;
  revenue: number;
  expenses: number;
  available: number;
  received: number;
  open: boolean;
  suspended: boolean;
  onOpen: () => void;
  onClose: () => void;
  onPurchase: () => void;
  hub: HubState;
  onNavigate: (section: string) => void;
};
type ChatItem = Exchange & { agent: AgentId };
function answerForAgent(item: ChatItem) {
  const response = answer(item);
  if (item.topic !== "general") return response;
  const name = agentTeam.find((agent) => agent.id === item.agent)!.name;
  return response.replace(
    /^(Я |Мен )Belgi/,
    (_, introduction: string) => `${introduction}${name}`,
  );
}
export default function AgentAdvisor(props: Props) {
  const { language, section, open, suspended, onOpen, onClose } = props;
  const t = (ru: string, kk: string) => (language === "ru" ? ru : kk);
  const [plan, setPlan] = useState<AgentPlan>("free");
  const [selected, setSelected] = useState<AgentId>("belgi");
  const [expanded, setExpanded] = useState(false);
  const [showPlans, setShowPlans] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [hover, setHover] = useState(false);
  const [tour, setTour] = useState(false);
  const [step, setStep] = useState(0);
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState("");
  const [history, setHistory] = useState<ChatItem[]>([]);
  const [position, setPosition] = useState<{
    left: number;
    top: number;
  } | null>(null);
  const [ready, setReady] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const log = useRef<HTMLDivElement>(null);
  const launcher = useRef<HTMLDivElement>(null);
  const replyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const drag = useRef<{
    x: number;
    y: number;
    left: number;
    top: number;
  } | null>(null);
  const active = agentTeam.find((a) => a.id === selected)!;
  const guideIndex = Math.max(
    0,
    belgiGuideSteps.findIndex((g) => g.section === section),
  );
  const guide = belgiGuideSteps[guideIndex];
  const guideRect = useBelgiGuide(section, tour && !suspended && !open);
  const waiting = unanswered(props.hub).length;
  const reviewCount = demoReviews.filter(
    (r) => !props.hub.reviewReplies[r.id],
  ).length;
  const taskCount = props.hub.tasks.filter(
    (id) => !props.hub.completed.includes(id),
  ).length;
  useEffect(() => {
    const sync = () => {
      try {
        const saved: AgentPlan =
          localStorage.getItem(AGENT_PLAN_KEY) === "pro" ? "pro" : "free";
        setPlan(saved);
        setSelected(availableAgent(localStorage.getItem(AGENT_ID_KEY), saved));
      } catch {}
    };
    sync();
    const params = new URLSearchParams(window.location.search);
    const requestedPlan = params.get("plan");
    if (requestedPlan === "pro" || requestedPlan === "free") {
      setPlan(requestedPlan);
      try {
        localStorage.setItem(AGENT_PLAN_KEY, requestedPlan);
        if (requestedPlan === "free")
          localStorage.setItem(AGENT_ID_KEY, "belgi");
      } catch {}
      window.dispatchEvent(new Event("bagyt-agents-change"));
    }
    const requestedAgent = params.get("agent");
    if (requestedAgent && ["belgi", "sana", "qor"].includes(requestedAgent)) {
      let savedPlan: AgentPlan = "free";
      try {
        savedPlan =
          localStorage.getItem(AGENT_PLAN_KEY) === "pro" ? "pro" : "free";
      } catch {}
      setSelected(
        availableAgent(
          requestedAgent,
          params.get("plan") === "pro" ? "pro" : savedPlan,
        ),
      );
      if (!params.has("page")) onOpen();
    }
    setReady(true);
    window.addEventListener("bagyt-agents-change", sync);
    return () => {
      window.removeEventListener("bagyt-agents-change", sync);
      if (replyTimer.current) clearTimeout(replyTimer.current);
    };
  }, []);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  useEffect(() => {
    document.body.dataset.agentPanel =
      open && expanded && !suspended ? "demo" : "";
    return () => {
      delete document.body.dataset.agentPanel;
    };
  }, [open, expanded, suspended]);
  useEffect(() => {
    if (!ready || open || busy) return;
    setSelected(plan === "pro" ? agentForSection(section) : "belgi");
    setPosition(null);
  }, [section, plan, ready]);
  useEffect(() => {
    if (
      open ||
      suspended ||
      paused ||
      reducedMotion ||
      hover ||
      tour ||
      position
    )
      return;
    const timer = setInterval(() => {
      if (document.hidden) return;
      setStep((v) => v + 1);
      if (plan === "pro")
        setSelected(
          (v) => agentTeam[(agentTeam.findIndex((a) => a.id === v) + 1) % 3].id,
        );
    }, 20000);
    return () => clearInterval(timer);
  }, [open, suspended, paused, reducedMotion, hover, tour, plan, position]);
  useEffect(() => {
    if (props.guideRequest) {
      setTour(true);
      setPosition(null);
      setExpanded(false);
    }
  }, [props.guideRequest]);
  useEffect(() => {
    if (open && !suspended) {
      setTour(false);
      input.current?.focus({ preventScroll: true });
    }
  }, [open, suspended]);
  useEffect(() => {
    if (log.current) log.current.scrollTop = log.current.scrollHeight;
  }, [history, busy, open, selected]);
  useEffect(() => {
    const reset = () => setPosition(null);
    window.addEventListener("resize", reset);
    return () => window.removeEventListener("resize", reset);
  }, []);
  function chooseAgent(id: AgentId) {
    if (busy) return;
    if (plan === "free" && id !== "belgi") {
      setShowPlans(true);
      return;
    }
    setSelected(id);
    setShowPlans(false);
    try {
      localStorage.setItem(AGENT_ID_KEY, id);
    } catch {}
  }
  useEffect(() => {
    const select = (event: Event) => {
      const id = (event as CustomEvent).detail;
      if (["belgi", "sana", "qor"].includes(id)) chooseAgent(id);
    };
    window.addEventListener("bagyt-select-agent", select);
    return () => window.removeEventListener("bagyt-select-agent", select);
  }, [plan, busy]);
  function changePlan(next: AgentPlan) {
    if (busy) return;
    setPlan(next);
    setSelected(next === "free" ? "belgi" : agentForSection(section));
    setShowPlans(false);
    try {
      localStorage.setItem(AGENT_PLAN_KEY, next);
      localStorage.setItem(
        AGENT_ID_KEY,
        next === "free" ? "belgi" : agentForSection(section),
      );
    } catch {}
    window.dispatchEvent(new Event("bagyt-agents-change"));
  }
  function closeChat() {
    onClose();
    setExpanded(false);
    setShowPlans(false);
    requestAnimationFrame(() =>
      launcher.current?.querySelector<HTMLButtonElement>(".robot")?.focus(),
    );
  }
  function ask(value: string, explicit?: Topic) {
    const cleaned = value.trim().slice(0, 500);
    if (!cleaned || busy) return;
    const topic: Topic =
      explicit ||
      (/жеткізуш|поставщик/i.test(cleaned)
        ? "suppliers"
        : /ереже|правил|автомат/i.test(cleaned)
          ? "automation"
          : /пікір|отзыв/i.test(cleaned)
            ? "reviews"
            : /клиент|хабар|жауап|whatsapp|вацап|диалог|ответ/i.test(cleaned)
              ? "clients"
              : /даму|дамыт|рост|развит|жоспар|план/i.test(cleaned)
                ? "growth"
                : /қор|қойма|кофе|запас|склад|закуп|сатып/i.test(cleaned)
                  ? "stock"
                  : /сат|түсім|шығын|қаржы|прод|выруч|расход|прибыл|финанс/i.test(
                        cleaned,
                      )
                    ? "sales"
                    : "general");
    const item: ChatItem = {
      question: cleaned,
      topic,
      agent: selected,
      language,
      waiting,
      reviewCount,
      taskCount,
      revenue: props.revenue,
      expenses: props.expenses,
      period: props.period,
      available: props.available,
      received: props.received,
    };
    setQuestion("");
    setPending(cleaned);
    setBusy(true);
    replyTimer.current = setTimeout(
      () => {
        setHistory((items) => [...items, item].slice(-30));
        setPending("");
        setBusy(false);
        input.current?.focus({ preventScroll: true });
      },
      reducedMotion ? 120 : 650,
    );
  }
  const prompts: { topic: Topic; text: string }[] =
    selected === "sana"
      ? [
          {
            topic: "clients",
            text: t("Кто ждёт ответа?", "Кім жауап күтуде?"),
          },
          {
            topic: "reviews",
            text: t("Что пишут в отзывах?", "Пікірлерде не жазылған?"),
          },
        ]
      : selected === "qor"
        ? [
            {
              topic: "stock",
              text: t("Что нужно закупить?", "Нені сатып алу керек?"),
            },
            {
              topic: "suppliers",
              text: t("Сравнить поставщиков", "Жеткізушілерді салыстыр"),
            },
          ]
        : [
            { topic: "growth", text: t("План на сегодня", "Бүгінгі жоспар") },
            { topic: "sales", text: t("Как идут продажи?", "Сатылым қалай?") },
            {
              topic: "clients",
              text: t("Кто ждёт ответа?", "Кім жауап күтуде?"),
            },
          ];
  const tips =
    selected === "sana"
      ? [
          t(
            `${waiting} клиента ждут. Помочь с ответом?`,
            `${waiting} клиент жауап күтуде. Көмектесейін бе?`,
          ),
          t(
            `${reviewCount} отзыва без ответа. Давайте посмотрим.`,
            `${reviewCount} пікір жауапсыз. Бірге қарайық.`,
          ),
        ]
      : selected === "qor"
        ? [
            t(
              `Кофе: запас на ${props.available / 4} дня.`,
              `Кофе қоры ${props.available / 4} күнге жетеді.`,
            ),
            t(
              "Сравним сроки и цену поставщиков?",
              "Жеткізушілерді салыстырайық па?",
            ),
          ]
        : [
            t("Я рядом. С чего начнём?", "Мен осындамын. Неден бастаймыз?"),
            t(
              `${taskCount} дела в плане. Покажу следующий шаг.`,
              `Жоспарда ${taskCount} іс бар. Келесі қадамды көрсетемін.`,
            ),
          ];
  function nextGuide(offset: number) {
    const next = guideIndex + offset;
    if (next >= belgiGuideSteps.length) setTour(false);
    else props.onNavigate(belgiGuideSteps[Math.max(0, next)].section);
  }
  function move(left: number, top: number) {
    const r = launcher.current?.getBoundingClientRect();
    if (r)
      setPosition({
        left: Math.max(8, Math.min(window.innerWidth - r.width - 8, left)),
        top: Math.max(100, Math.min(window.innerHeight - r.height - 8, top)),
      });
  }
  function act(topic: Topic) {
    if (topic === "stock" || topic === "approval") {
      setExpanded(false);
      props.onPurchase();
      return;
    }
    closeChat();
    props.onNavigate(
      (
        {
          clients: "inbox",
          reviews: "reviews",
          growth: "growth",
          suppliers: "suppliers",
          automation: "automation",
          sales: "analytics",
        } as Record<string, string>
      )[topic] || "overview",
    );
  }
  if (suspended) return null;
  return (
    <>
      {guideRect && (
        <div
          className="belgi-guide-ring"
          style={guideRect}
          aria-hidden="true"
        />
      )}
      {!open && (
        <div
          ref={launcher}
          className={`agent-float ${paused ? "agent-is-paused" : ""}`}
          data-agent={selected}
          style={
            (position
              ? {
                  left: position.left,
                  top: position.top,
                  bottom: "auto",
                  right: "auto",
                }
              : {
                  "--roam":
                    reducedMotion || paused || hover || tour
                      ? "0px"
                      : `${[0, 34, 12, 54][step % 4]}px`,
                }) as CSSProperties
          }
          onPointerEnter={() => setHover(true)}
          onPointerLeave={() => setHover(false)}
          onFocusCapture={() => setHover(true)}
          onBlurCapture={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) setHover(false);
          }}
        >
          {tour ? (
            <div className="agent-guide-bubble">
              <header>
                <span>
                  {guideIndex + 1}/{belgiGuideSteps.length} ·{" "}
                  {guide.title[language === "ru" ? 0 : 1]}
                </span>
                <button
                  onClick={() => setTour(false)}
                  aria-label={t("Закрыть подсказку", "Нұсқауды жабу")}
                >
                  <X size={16} />
                </button>
              </header>
              <p>{guide.text[language === "ru" ? 0 : 1]}</p>
              <footer>
                <button disabled={!guideIndex} onClick={() => nextGuide(-1)}>
                  <ChevronLeft size={16} />
                  {t("Назад", "Артқа")}
                </button>
                <button onClick={() => nextGuide(1)}>
                  {guideIndex === belgiGuideSteps.length - 1
                    ? t("Готово", "Дайын")
                    : t("Дальше", "Келесі")}
                  <ArrowRight size={16} />
                </button>
              </footer>
            </div>
          ) : (
            <button className="agent-speech" onClick={onOpen}>
              <span className="agent-speech-name">
                {active.name}
                <i />
              </span>
              <span>{tips[step % tips.length]}</span>
            </button>
          )}
          <div className="agent-float-body">
            <BelgiRobot
              size={128}
              variant={selected}
              state={tour ? "working" : step % 3 === 0 ? "greeting" : "happy"}
              onClick={onOpen}
              label={t(
                `Открыть чат с ${active.name}`,
                `${active.name} чатын ашу`,
              )}
            />
            <div className="agent-float-tools">
              <button
                aria-label={
                  paused
                    ? t("Продолжить движение", "Қозғалысты жалғастыру")
                    : t("Остановить движение", "Қозғалысты тоқтату")
                }
                aria-pressed={paused}
                onClick={() => setPaused(!paused)}
              >
                {paused ? <Play size={14} /> : <Pause size={14} />}
              </button>
              <button
                aria-label={t("Перетащить помощника", "Көмекшіні жылжыту")}
                onPointerDown={(e) => {
                  const r = launcher.current!.getBoundingClientRect();
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
                    move(
                      drag.current.left + e.clientX - drag.current.x,
                      drag.current.top + e.clientY - drag.current.y,
                    );
                }}
                onPointerUp={() => {
                  drag.current = null;
                }}
                onPointerCancel={() => {
                  drag.current = null;
                }}
                onKeyDown={(e) => {
                  if (
                    ![
                      "ArrowLeft",
                      "ArrowRight",
                      "ArrowUp",
                      "ArrowDown",
                    ].includes(e.key)
                  )
                    return;
                  e.preventDefault();
                  const r = launcher.current!.getBoundingClientRect();
                  move(
                    r.left +
                      (e.key === "ArrowLeft"
                        ? -32
                        : e.key === "ArrowRight"
                          ? 32
                          : 0),
                    r.top +
                      (e.key === "ArrowUp"
                        ? -32
                        : e.key === "ArrowDown"
                          ? 32
                          : 0),
                  );
                }}
              >
                <Grip size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
      {open && (
        <section
          className={`agent-chat ${expanded ? "agent-chat-expanded" : ""}`}
          role="dialog"
          aria-modal="false"
          aria-labelledby="agent-chat-title"
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.stopPropagation();
              closeChat();
            }
          }}
        >
          <header className="agent-chat-header">
            <BelgiRobot
              size={48}
              variant={selected}
              state={busy ? "thinking" : "happy"}
            />
            <div>
              <h2 id="agent-chat-title">
                {active.name}
                <span className="agent-online" />
              </h2>
              <p>{active.role[language]}</p>
            </div>
            <button
              onClick={() => setExpanded(!expanded)}
              aria-label={
                expanded
                  ? t("Уменьшить чат", "Чатты кішірейту")
                  : t("Раскрыть справа", "Оң жаққа үлкейту")
              }
            >
              {expanded ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
            </button>
            <button
              onClick={closeChat}
              aria-label={t("Закрыть чат", "Чатты жабу")}
            >
              <X size={19} />
            </button>
          </header>
          <div
            className="agent-team-picker"
            aria-label={t("Выбрать помощника", "Көмекшіні таңдау")}
          >
            {agentTeam.map((a) => (
              <button
                key={a.id}
                className={selected === a.id ? "selected" : ""}
                aria-pressed={selected === a.id}
                disabled={busy}
                onClick={() => chooseAgent(a.id)}
              >
                <BelgiRobot size={36} variant={a.id} />
                <span>{a.name}</span>
                {plan === "free" && a.id !== "belgi" && (
                  <LockKeyhole size={12} />
                )}
              </button>
            ))}
          </div>
          <div className="agent-plan-line">
            <span>
              <i />
              {plan === "pro" ? "Pro · 3 agents" : "Free · 1 agent"}
            </span>
            <button
              disabled={busy}
              onClick={() => {
                if (!busy) setShowPlans(!showPlans);
              }}
            >
              {plan === "free"
                ? t("Попробовать Pro", "Pro байқап көру")
                : t("Сменить план", "Жоспарды өзгерту")}
              <ChevronRight size={13} />
            </button>
          </div>
          {showPlans ? (
            <div className="agent-plan-view">
              <span className="agent-eyebrow">BAGYT AGENTS</span>
              <h3>
                {t("Ваша маленькая команда.", "Сіздің шағын командаңыз.")}
              </h3>
              <p>
                {t(
                  "Один помощник для начала. Три специалиста — когда задач становится больше.",
                  "Бастауға бір көмекші. Іс көбейгенде — үш маман.",
                )}
              </p>
              <button
                className={`agent-plan-card ${plan === "free" ? "current" : ""}`}
                disabled={busy}
                onClick={() => changePlan("free")}
              >
                <div>
                  <b>Free</b>
                  <span>{t("Бесплатно", "Тегін")}</span>
                </div>
                <p>Belgi · {t("универсальный помощник", "әмбебап көмекші")}</p>
                <small>
                  <Check size={14} />
                  {t("Бизнес, клиенты и запасы", "Бизнес, клиенттер және қор")}
                </small>
              </button>
              <button
                className={`agent-plan-card pro ${plan === "pro" ? "current" : ""}`}
                disabled={busy}
                onClick={() => changePlan("pro")}
              >
                <div>
                  <b>
                    Pro <Sparkles size={15} />
                  </b>
                  <span>
                    {t("Попробовать команду", "Команданы байқап көру")}
                  </span>
                </div>
                <p>Belgi + Sana + Qor</p>
                <small>
                  <Check size={14} />
                  {t(
                    "Три роли, советы по очереди",
                    "Үш рөл, кезекпен кеңес беру",
                  )}
                </small>
              </button>
              <p className="agent-plan-note">
                {t(
                  "Можно попробовать оба плана. Оплата не взимается.",
                  "Екі жоспарды да байқап көріңіз. Төлем алынбайды.",
                )}
              </p>
            </div>
          ) : (
            <>
              <div
                ref={log}
                className="agent-messages"
                role="log"
                aria-live="polite"
                aria-relevant="additions"
                aria-label={t(`Чат с ${active.name}`, `${active.name} чаты`)}
              >
                {history.filter((item) => item.agent === selected).length ===
                  0 && (
                  <div className="agent-intro">
                    <BelgiRobot
                      size={116}
                      variant={selected}
                      state="greeting"
                    />
                    <h3>{active.greeting[language]}</h3>
                    <p>
                      {selected === "sana"
                        ? t(
                            "Сообщения, история клиента и отзывы. Помогу подготовить ответ и не потерять следующий контакт.",
                            "Хабарламалар, клиент тарихы мен пікірлер. Жауап дайындап, келесі байланысты ұмытпауға көмектесемін.",
                          )
                        : selected === "qor"
                          ? t(
                              "Остатки, поставщики и закупки. Сравним условия и подготовим заказ.",
                              "Қор, жеткізушілер және сатып алу. Шарттарды салыстырып, тапсырыс дайындаймыз.",
                            )
                          : t(
                              "Соберу картину бизнеса и помогу выбрать следующий шаг. Решение всегда за вами.",
                              "Бизнес жағдайын түсіндіріп, келесі қадамды таңдауға көмектесемін. Шешімді сіз қабылдайсыз.",
                            )}
                    </p>
                    <button
                      onClick={() => {
                        closeChat();
                        setTour(true);
                        setPosition(null);
                      }}
                    >
                      <Compass size={16} />
                      {t("Покажи эту страницу", "Осы бетті таныстыр")}
                    </button>
                  </div>
                )}
                {history
                  .filter((item) => item.agent === selected)
                  .map((item, index) => (
                    <div className="agent-exchange" key={index}>
                      <p className="agent-user-text">{item.question}</p>
                      <div className="agent-reply">
                        <span>
                          {active.name} <i>AI</i>
                        </span>
                        <p>{answerForAgent(item)}</p>
                        {item.topic !== "general" && (
                          <button onClick={() => act(item.topic)}>
                            {t("Перейти к делу", "Іске көшу")}
                            <ArrowRight size={15} />
                          </button>
                        )}
                        <small>
                          {t(
                            "По данным Qazyna Store",
                            "Qazyna Store деректері",
                          )}
                        </small>
                      </div>
                    </div>
                  ))}
                {busy && (
                  <div className="agent-exchange">
                    <p className="agent-user-text">{pending}</p>
                    <div className="agent-typing">
                      <span />
                      <span />
                      <span />
                      <small>
                        {t("Смотрю данные…", "Деректерді қарап жатырмын…")}
                      </small>
                    </div>
                  </div>
                )}
              </div>
              <div className="agent-prompts">
                {prompts.map((p) => (
                  <button
                    key={p.topic}
                    onClick={() => ask(p.text, p.topic)}
                    disabled={busy}
                  >
                    {p.text}
                    <ArrowRight size={13} />
                  </button>
                ))}
              </div>
              <form
                className="agent-chat-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  ask(question);
                }}
              >
                <input
                  ref={input}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  maxLength={500}
                  placeholder={t(
                    "Спросите о бизнесе…",
                    "Бизнес туралы сұраңыз…",
                  )}
                  aria-label={t("Ваш вопрос", "Сұрағыңыз")}
                />
                <button
                  disabled={busy || !question.trim()}
                  aria-label={t("Отправить", "Жіберу")}
                >
                  <Send size={17} />
                </button>
              </form>
              <p className="agent-demo-note">
                {t(
                  "Ответы по данным рабочего пространства",
                  "Жұмыс кеңістігінің деректеріне негізделген жауап",
                )}
              </p>
            </>
          )}
        </section>
      )}
    </>
  );
}
