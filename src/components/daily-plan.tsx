"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  Copy,
  LoaderCircle,
  MessageCircle,
  RefreshCw,
  X,
} from "lucide-react";
import { api, Robot } from "./ui";
import { aqylActions, type AqylAction } from "@/lib/aqyl-actions";
import type { DailyPlan, DailyStep } from "@/lib/daily-plan";
import { dayKey, money } from "@/lib/types";

type Props = {
  data: any;
  language: "ru" | "kk";
  days: number;
  visible: boolean;
  modal: string;
  chatOpen: boolean;
  onGuide: (id: AqylAction) => void;
  onClear: () => void;
  onAsk: (question: string) => void;
  onEvidence: (id: string) => void;
  onActive: (active: boolean) => void;
};
export default function DailyPlanView({
  data,
  language,
  days,
  visible,
  modal,
  chatOpen,
  onGuide,
  onClear,
  onAsk,
  onEvidence,
  onActive,
}: Props) {
  const t = (ru: string, kk: string) => (language === "ru" ? ru : kk);
  const [plan, setPlan] = useState<DailyPlan | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [saving, setSaving] = useState(false);
  const [active, setActive] = useState<string | null>(null),
    [guideIndex, setGuideIndex] = useState(0),
    [folded, setFolded] = useState(false),
    [copied, setCopied] = useState(false);
  const [slot, setSlot] = useState<HTMLElement | null>(null),
    [coachSlot, setCoachSlot] = useState<HTMLElement | null>(null),
    [today, setToday] = useState(() => dayKey(new Date()));
  const request = useRef(0),
    last = useRef("");
  const identity = data ? data.org.id + ":" + data.user.user_id : "guest";
  const scope = [identity, data?.user.role, today, days, language].join(":");
  const currentScope = useRef(scope);
  currentScope.current = scope;
  const signature = JSON.stringify([
    scope,
    today,
    days,
    language,
    data?.org,
    data?.events,
    data?.tasks,
  ]);
  const step = plan?.steps.find((s) => s.id === active),
    guide = step?.guides[guideIndex];
  const formOpen = modal === "manual" || modal === "import";
  useEffect(() => {
    setSlot(visible ? document.getElementById("today-plan-slot") : null);
  }, [visible, data?.org.id]);
  useEffect(() => {
    setCoachSlot(formOpen ? document.getElementById("daily-guide-slot") : null);
  }, [modal, formOpen]);
  useEffect(() => {
    const id = setInterval(() => setToday(dayKey(new Date())), 60000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    request.current++;
    last.current = "";
    setPlan(null);
    setActive(null);
    setError("");
    setBusy(false);
    setSaving(false);
  }, [scope]);
  useEffect(() => {
    onActive(!!active);
  }, [active, onActive]);
  async function load(refresh = false) {
    const id = ++request.current;
    setBusy(true);
    setError("");
    try {
      const result = await api("aqyl/today", { days, language, refresh });
      if (id === request.current) {
        setPlan(result);
        setActive(null);
      }
    } catch (e) {
      if (id === request.current) setError((e as Error).message);
    } finally {
      if (id === request.current) setBusy(false);
    }
  }
  useEffect(() => {
    request.current++;
    setBusy(false);
  }, [signature]);
  useEffect(() => {
    if (!data || !visible || last.current === signature) return;
    last.current = signature;
    setActive(null);
    setPlan(null);
    void load();
  }, [signature, visible]);
  function point(s: DailyStep, index: number) {
    setActive(s.id);
    setGuideIndex(index);
    setFolded(false);
    setCopied(false);
    const action = s.guides[index].action;
    if (action) onGuide(action);
    else onClear();
  }
  async function mark(s: DailyStep, done: boolean) {
    if (!plan || saving) return;
    setSaving(true);
    setError("");
    try {
      await api("aqyl/today/progress", {
        id: plan.id,
        fingerprint: plan.fingerprint,
        stepId: s.id,
        done,
      });
      if (currentScope.current !== scope) return;
      setPlan((p) =>
        p && p.id === plan.id && p.fingerprint === plan.fingerprint
          ? {
              ...p,
              completed: done
                ? [...new Set([...p.completed, s.id])]
                : p.completed.filter((id) => id !== s.id),
            }
          : p,
      );
      if (done) {
        setActive(null);
        onClear();
      }
    } catch (e) {
      if (currentScope.current === scope) setError((e as Error).message);
    } finally {
      if (currentScope.current === scope) setSaving(false);
    }
  }
  const nextGuide = step?.guides[guideIndex + 1];
  const previousGuide = step?.guides[guideIndex - 1];
  const backLeavesForm =
    formOpen &&
    previousGuide &&
    (!previousGuide.action ||
      (aqylActions[previousGuide.action] as { modal?: string }).modal !==
        modal);
  const leavingForm =
    formOpen &&
    nextGuide &&
    (!nextGuide.action ||
      !("modal" in aqylActions[nextGuide.action]) ||
      (aqylActions[nextGuide.action] as { modal?: string }).modal !== modal);
  const card = (
    <section
      className="daily-plan"
      aria-label={t("План на сегодня", "Бүгінгі жоспар")}
    >
      <header>
        <div className="daily-title">
          <Robot size={62} state={busy ? "thinking" : "greeting"} />
          <div>
            <span className="note-label">
              BELGI AI · {t("ОДИН ДЕНЬ — ЯСНЫЕ ШАГИ", "БІР КҮН — НАҚТЫ ҚАДАМДАР")}
            </span>
            <h2>{t("Что сделать сегодня", "Бүгін не істеу керек")}</h2>
          </div>
        </div>
        <button
          className="icon-button"
          disabled={busy || saving}
          onClick={() => load(true)}
          aria-label={t("Обновить план на сегодня", "Бүгінгі жоспарды жаңарту")}
        >
          <RefreshCw size={18} />
        </button>
      </header>
      {busy ? (
        <div className="daily-loading" role="status">
          <LoaderCircle size={20} />
          <div>
            <b>
              {t(
                "Собираю план по вашим данным…",
                "Деректеріңіз бойынша жоспар құрып жатырмын…",
              )}
            </b>
            <p>
              {t(
                "Проверяю показатели, незавершённые дела и цель бизнеса.",
                "Көрсеткіштерді, аяқталмаған істерді және бизнес мақсатын тексеріп жатырмын.",
              )}
            </p>
          </div>
        </div>
      ) : (
        <>
          {error && (
            <div className="form-error" role="alert">
              {error}
              <button onClick={() => load(true)}>
                {t("Повторить", "Қайталау")}
              </button>
            </div>
          )}
          {plan && (
            <>
              <div className="daily-meta">
                <span>
                  {plan.day.split("-").reverse().join(".")} ·{" "}
                  {t(`${plan.days} дней данных`, `${plan.days} күн дерегі`)}
                </span>
                <span>
                  {plan.mode === "Gemini"
                    ? t("Приоритеты выбрал AI", "Басымдықтарды AI таңдады")
                    : t("План по правилам", "Ережелер бойынша жоспар")}
                </span>
                {plan.demo && (
                  <span>{t("Учебные данные", "Оқу деректері")}</span>
                )}
              </div>
              <p className="daily-summary">{plan.summary}</p>
              {plan.warning && <p className="daily-warning">{plan.warning}</p>}
              <div className="daily-facts">
                {plan.facts.verified
                  ? `${t("Выручка", "Түсім")}: ${money(plan.facts.revenue)} · ${t("Расходы", "Шығындар")}: ${money(plan.facts.expenses)}`
                  : t(
                      "Пока нет подтверждённых данных за этот период",
                      "Бұл кезеңде расталған дерек әлі жоқ",
                    )}
              </div>
              <div className="daily-progress">
                <span>
                  {t(
                    `Отмечено вами: ${plan.completed.length} из ${plan.steps.length}`,
                    `Өзіңіз белгілеген: ${plan.completed.length} / ${plan.steps.length}`,
                  )}
                </span>
                <progress
                  value={plan.completed.length}
                  max={plan.steps.length}
                />
              </div>
              <div className="daily-steps">
                {plan.steps.map((s, i) => {
                  const done = plan.completed.includes(s.id);
                  return (
                    <article key={s.id} className={done ? "is-done" : ""}>
                      <div className="daily-step-top">
                        <span className="daily-number">
                          {done ? (
                            <Check size={18} />
                          ) : (
                            String(i + 1).padStart(2, "0")
                          )}
                        </span>
                        <small>
                          ~{s.minutes} {t("мин", "мин")}
                        </small>
                      </div>
                      <h3>{s.title}</h3>
                      <p>{s.reason}</p>
                      {!!s.evidence.length && (
                        <button
                          className="daily-proof"
                          onClick={() => onEvidence(s.evidence[0])}
                        >
                          {t(
                            "Посмотреть исходную запись",
                            "Бастапқы жазбаны көру",
                          )}{" "}
                          <ArrowRight size={13} />
                        </button>
                      )}
                      <div className="daily-step-actions">
                        <button
                          className={done ? "secondary" : "primary"}
                          disabled={saving}
                          onClick={() => (done ? mark(s, false) : point(s, 0))}
                        >
                          {done
                            ? t("Вернуть в план", "Жоспарға қайтару")
                            : t("Сделаем вместе", "Бірге жасайық")}{" "}
                          {!done && <ArrowRight size={16} />}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
              {plan.completed.length === plan.steps.length && (
                <p className="daily-complete">
                  <Check size={18} />
                  {t(
                    "Вы отметили все шаги. Результаты проверим по новым данным.",
                    "Барлық қадамды белгіледіңіз. Нәтижесін жаңа дерекпен тексереміз.",
                  )}
                </p>
              )}
              <small className="daily-footnote">
                {t(
                  "План обновляется при новых данных. Отметка шага не изменяет записи и не подтверждает финансовый результат.",
                  "Жаңа дерек қосылса, жоспар жаңарады. Қадам белгісі жазбаларды өзгертпейді және қаржылық нәтижені растамайды.",
                )}
              </small>
            </>
          )}
        </>
      )}
    </section>
  );
  const coach =
    step && guide && !chatOpen && (!modal || formOpen) ? (
      <aside
        className={`daily-coach ${formOpen ? "in-form" : ""} ${folded ? "is-folded" : ""}`}
        aria-label={t("BELGI AI ведёт по шагам", "BELGI AI қадаммен жетелейді")}
      >
        <header>
          <b>
            BELGI AI · {t("Шаг", "Қадам")} {guideIndex + 1}/{step.guides.length}
          </b>
          <div>
            <button
              type="button"
              className="icon-button"
              aria-label={
                folded
                  ? t("Развернуть подсказку", "Кеңесті ашу")
                  : t("Свернуть подсказку", "Кеңесті жинау")
              }
              onClick={() => setFolded(!folded)}
            >
              {folded ? "+" : "−"}
            </button>
            <button
              type="button"
              className="icon-button"
              aria-label={t("Закончить сопровождение", "Жетелеуді аяқтау")}
              onClick={() => {
                setActive(null);
                onClear();
              }}
            >
              <X size={16} />
            </button>
          </div>
        </header>
        {!folded && (
          <>
            <h3>{step.title}</h3>
            <p>{guide.instruction}</p>
            {guide.example && (
              <div className="daily-example">
                <small>
                  {t(
                    "Образец — замените своими данными",
                    "Үлгі — өз дерегіңізбен ауыстырыңыз",
                  )}
                </small>
                <p>{guide.example}</p>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(guide.example!);
                      setCopied(true);
                    } catch {
                      setError(
                        t(
                          "Выделите и скопируйте текст образца.",
                          "Үлгі мәтінін белгілеп, көшіріңіз.",
                        ),
                      );
                    }
                  }}
                >
                  <Copy size={13} />
                  {copied
                    ? t("Скопировано", "Көшірілді")
                    : t("Копировать", "Көшіру")}
                </button>
              </div>
            )}
            {guide.action && (
              <button
                type="button"
                className="daily-proof"
                onClick={() => onGuide(guide.action!)}
              >
                {t("Показать: ", "Көрсету: ")}
                {
                  aqylActions[guide.action].title[language === "ru" ? 0 : 1]
                }{" "}
                <ArrowRight size={14} />
              </button>
            )}
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <div className="daily-coach-actions">
              <button
                type="button"
                className="icon-button"
                disabled={guideIndex === 0 || saving || !!backLeavesForm}
                aria-label={t("Предыдущая подсказка", "Алдыңғы кеңес")}
                onClick={() => point(step, guideIndex - 1)}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                className="secondary"
                onClick={() =>
                  onAsk(
                    `${t("Помоги с шагом", "Мына қадамға көмектес")}: ${step.title}. ${guide.instruction}`,
                  )
                }
              >
                <MessageCircle size={16} />
                {t("Спросить", "Сұрау")}
              </button>
              <button
                type="button"
                className="primary"
                disabled={saving || !!leavingForm}
                onClick={() =>
                  nextGuide ? point(step, guideIndex + 1) : mark(step, true)
                }
              >
                {nextGuide
                  ? t("Дальше", "Әрі қарай")
                  : t("Я выполнил шаг", "Қадамды орындадым")}{" "}
                <ArrowRight size={16} />
              </button>
            </div>
            {leavingForm && (
              <small>
                {t(
                  "Сначала завершите и сохраните форму. Затем продолжим — введённые данные не потеряются.",
                  "Алдымен форманы аяқтап, сақтаңыз. Содан кейін жалғастырамыз — енгізген деректер жоғалмайды.",
                )}
              </small>
            )}
          </>
        )}
      </aside>
    ) : null;
  return (
    <>
      {visible && slot && createPortal(card, slot)}
      {formOpen ? coachSlot && createPortal(coach, coachSlot) : coach}
    </>
  );
}
