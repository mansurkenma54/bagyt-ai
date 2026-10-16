"use client";

import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  Check,
  CheckCircle2,
  Circle,
  Flag,
  MessageCircle,
  PackageCheck,
  Pencil,
  Plus,
  ShoppingBag,
  Target,
  TrendingUp,
  X,
} from "lucide-react";
import {
  addDemoTask,
  demoContacts,
  unanswered,
  type HubState,
} from "@/lib/business-hub-demo";
import { demoDailySales } from "@/lib/belgi-demo";
import {
  defaultGoalTargets,
  GOAL_STORAGE_KEY,
  goalMetrics,
  goalPeriod,
  goalStepStatus,
  parseGoalPreferences,
  toggleGoalStep,
  validateGoalTargets,
  type GoalStepId,
  type GoalTargets,
} from "@/lib/business-goals";
import ProductVisual from "./product-visual";

type Props = {
  language: "kk" | "ru";
  hub: HubState;
  setHub: Dispatch<SetStateAction<HubState>>;
  available: number;
  navigate: (section: string) => void;
};
const money = (value: number) => value.toLocaleString("ru-RU") + " ₸";

export default function BusinessGoals({
  language,
  hub,
  setHub,
  available,
  navigate,
}: Props) {
  const t = (ru: string, kk: string) => (language === "ru" ? ru : kk);
  const [targets, setTargets] = useState<GoalTargets>(defaultGoalTargets);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(defaultGoalTargets);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  useEffect(() => {
    try {
      const raw = localStorage.getItem(GOAL_STORAGE_KEY);
      const next = parseGoalPreferences(raw ? JSON.parse(raw) : null);
      setTargets(next);
      setDraft(next);
    } catch {
      /* A private or unavailable store still supports this session. */
    }
  }, []);
  const metrics = goalMetrics(hub, targets);
  const pending = unanswered(hub);
  const pendingNames = [
    ...new Set(
      pending
        .map(
          (thread) =>
            demoContacts.find((contact) => contact.id === thread.contact)?.name,
        )
        .filter(Boolean),
    ),
  ]
    .slice(0, 3)
    .join(", ");
  const status = goalStepStatus(hub, available);
  const completedCount = Object.values(status).filter(Boolean).length;
  const cover = available / 4;
  const steps: {
    id: GoalStepId;
    agent: string;
    title: string;
    evidence: string;
    action: string;
    section: string;
    icon: typeof MessageCircle;
    sku?: string;
  }[] = [
    {
      id: "retention",
      agent: "Sana",
      icon: MessageCircle,
      title: pending.length
        ? t(
            `Ответить ${pending.length} клиентам`,
            `${pending.length} клиентке жауап беру`,
          )
        : t("Все клиенты получили ответ", "Барлық клиентке жауап берілді"),
      evidence: pending.length
        ? t(
            `Ждут ответа: ${pendingNames}. Помогите выбрать кофе или чай, уточните количество и удобное время получения.`,
            `Жауап күтуде: ${pendingNames}. Кофе не шай таңдауға көмектесіп, саны мен алып кету уақытын нақтылаңыз.`,
          )
        : t(
            "В текущих обращениях нет ответов в ожидании. Новые сообщения снова появятся в общем списке.",
            "Қазіргі өтініштердің бәріне жауап бар. Жаңа хабарламалар ортақ тізімге түседі.",
          ),
      action: t("Открыть диалоги", "Диалогтарды ашу"),
      section: "inbox",
    },
    {
      id: "restock-coffee",
      agent: "Qor",
      icon: PackageCheck,
      sku: "COF-0250",
      title:
        cover < 5
          ? t("Пополнить запас кофе", "Кофе қорын толықтыру")
          : t("Проверить новый запас кофе", "Кофенің жаңа қорын тексеру"),
      evidence: t(
        `В продаже ${available} пачек: примерно на ${cover.toLocaleString("ru-RU", { maximumFractionDigits: 1 })} дня при 4 продажах в день. Поставка занимает 5 дней.`,
        `Сатуға ${available} қаптама бар: күніне 4 сатылса, шамамен ${cover.toLocaleString("ru-RU", { maximumFractionDigits: 1 })} күнге жетеді. Жеткізу — 5 күн.`,
      ),
      action: t("Проверить закупку", "Сатып алуды тексеру"),
      section: "purchases",
    },
    {
      id: "assortment",
      agent: "Belgi",
      icon: ShoppingBag,
      sku: "TEA-0100",
      title: t(
        "Проверить спрос на чайные наборы",
        "Шай жиынтықтарына сұранысты тексеру",
      ),
      evidence: t(
        "Два сигнала: вопрос в Instagram и пожелание в отзыве. Соберите 2 варианта и уточните интерес у 5 клиентов — до закупки упаковки.",
        "Екі белгі бар: Instagram-дағы сұрақ және пікірдегі ұсыныс. 2 нұсқа жасап, қаптама сатып алмас бұрын 5 клиенттің қызығушылығын анықтаңыз.",
      ),
      action: t("Посмотреть клиентов", "Клиенттерді қарау"),
      section: "customers",
    },
  ];
  const maxChart = Math.max(targets.revenue, metrics.revenue * 1.1);
  const chartY = (value: number) => 180 - (value / maxChart) * 145;
  const chartX = (day: number) => 26 + (day / goalPeriod.daysInMonth) * 480;
  let cumulative = 0;
  const chartPoints = demoDailySales.map((value, index) => {
    cumulative += value;
    return `${chartX(index + 1)},${chartY(cumulative)}`;
  });

  function saveGoals(event: React.FormEvent) {
    event.preventDefault();
    const validated = validateGoalTargets(draft);
    if (!validated) {
      setError(
        t(
          "Укажите целые значения: выручка от 100 000 до 1 млрд ₸, заказы от 1 до 100 000, ответы от 1 до 100%.",
          "Бүтін мәндерді енгізіңіз: түсім 100 000–1 млрд ₸, тапсырыс 1–100 000, жауап 1–100%.",
        ),
      );
      return;
    }
    setTargets(validated);
    let persisted = true;
    try {
      localStorage.setItem(
        GOAL_STORAGE_KEY,
        JSON.stringify({
          version: 1,
          month: goalPeriod.month,
          targets: validated,
        }),
      );
      window.dispatchEvent(new Event("bagyt-goals-changed"));
    } catch {
      persisted = false;
    }
    setSaved(
      persisted
        ? t(
            "Цели сохранены на этом устройстве",
            "Мақсаттар осы құрылғыда сақталды",
          )
        : t(
            "Цели изменены для текущего сеанса",
            "Мақсаттар осы сеанс үшін өзгертілді",
          ),
    );
    setEditing(false);
    setError("");
  }

  return (
    <div className="goals-page" data-guide="growth">
      <div className="goals-period">
        <span>
          <span className="goals-live-dot" />
          {t(
            "Октябрь 2026 · итоги на 14 октября",
            "Қазан 2026 · 14 қазандағы нәтиже",
          )}
        </span>
        <button
          onClick={() => {
            setDraft(targets);
            setError("");
            setEditing(!editing);
          }}
        >
          <Pencil size={14} />
          {t("Изменить цели", "Мақсаттарды өзгерту")}
        </button>
      </div>
      {saved && !editing && (
        <div className="goals-saved" role="status">
          <CheckCircle2 size={15} />
          {saved}
          <button
            aria-label={t("Закрыть уведомление", "Хабарламаны жабу")}
            onClick={() => setSaved("")}
          >
            <X size={14} />
          </button>
        </div>
      )}
      {editing && (
        <form className="goals-editor" onSubmit={saveGoals}>
          <header>
            <div>
              <b>
                {t(
                  "Каким должен быть этот месяц?",
                  "Осы айда қандай нәтижеге жетеміз?",
                )}
              </b>
              <p>
                {t(
                  "Ваши ориентиры. Меняйте их по мере развития магазина.",
                  "Өзіңіздің межелеріңіз. Дүкен дамыған сайын өзгерте аласыз.",
                )}
              </p>
            </div>
            <button
              type="button"
              aria-label={t("Закрыть редактор целей", "Мақсат өңдеуін жабу")}
              onClick={() => setEditing(false)}
            >
              <X size={18} />
            </button>
          </header>
          <div className="goals-edit-fields">
            <label>
              {t("Выручка за месяц, ₸", "Айлық түсім, ₸")}
              <input
                type="number"
                min={100000}
                max={1000000000}
                step={1}
                required
                value={Number.isNaN(draft.revenue) ? "" : draft.revenue}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    revenue:
                      e.target.value === "" ? NaN : Number(e.target.value),
                  })
                }
              />
            </label>
            <label>
              {t("Оплаченные заказы, шт.", "Төленген тапсырыстар, дана")}
              <input
                type="number"
                min={1}
                max={100000}
                step={1}
                required
                value={Number.isNaN(draft.orders) ? "" : draft.orders}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    orders:
                      e.target.value === "" ? NaN : Number(e.target.value),
                  })
                }
              />
            </label>
            <label>
              {t("Обращения с ответом, %", "Жауап берілген өтініштер, %")}
              <input
                type="number"
                min={1}
                max={100}
                step={1}
                required
                value={Number.isNaN(draft.replyRate) ? "" : draft.replyRate}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    replyRate:
                      e.target.value === "" ? NaN : Number(e.target.value),
                  })
                }
              />
            </label>
          </div>
          {error && (
            <p role="alert" className="goals-form-error">
              {error}
            </p>
          )}
          <footer>
            <span>
              {t(
                "Изменение цели не меняет ваши продажи.",
                "Мақсатты өзгерту сатылымды өзгертпейді.",
              )}
            </span>
            <button className="dark-button" type="submit">
              <Check size={16} />
              {t("Сохранить цели", "Мақсаттарды сақтау")}
            </button>
          </footer>
        </form>
      )}
      <section className="goals-revenue-card">
        <div className="goals-revenue-summary">
          <span className="goals-label">
            <Target size={16} />
            {t("Главная цель · выручка", "Негізгі мақсат · түсім")}
          </span>
          <h2>{money(metrics.revenue)}</h2>
          <p>
            {t("из", "/")} <b>{money(targets.revenue)}</b>
          </p>
          <div
            className="goals-progress-track"
            role="progressbar"
            aria-valuenow={metrics.revenuePercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={t(
              "Прогресс цели по выручке",
              "Түсім мақсатының орындалуы",
            )}
          >
            <span style={{ width: `${metrics.revenuePercent}%` }} />
          </div>
          <div className="goals-progress-caption">
            <b>
              {metrics.revenuePercent}% {t("выполнено", "орындалды")}
            </b>
            <span>
              {t(
                `Ещё ${metrics.remainingDays} дней`,
                `Тағы ${metrics.remainingDays} күн`,
              )}
            </span>
          </div>
          <div className="goals-pace">
            <TrendingUp size={20} />
            <div>
              <span>
                {metrics.revenueGap
                  ? t(
                      "Нужный темп до конца месяца",
                      "Ай соңына дейін қажет қарқын",
                    )
                  : t("Цель по выручке достигнута", "Түсім мақсаты орындалды")}
              </span>
              <strong>
                {money(metrics.revenueDaily)}
                <small> / {t("день", "күн")}</small>
              </strong>
            </div>
          </div>
        </div>
        <div className="goals-chart">
          <div className="goals-chart-key">
            <span>
              <i />
              {t("Получено", "Түскен түсім")}
            </span>
            <span>
              <i />
              {t("Равномерный путь к цели", "Мақсатқа біркелкі қарқын")}
            </span>
          </div>
          <svg
            viewBox="0 0 532 218"
            role="img"
            aria-label={t(
              "Накопленная выручка за 14 дней и ориентир до конца месяца",
              "14 күндегі жиналған түсім және ай соңына дейінгі меже",
            )}
          >
            {[0, 0.5, 1].map((fraction) => (
              <g key={fraction}>
                <line
                  x1="26"
                  y1={chartY(maxChart * fraction)}
                  x2="506"
                  y2={chartY(maxChart * fraction)}
                  stroke="var(--b-line)"
                />
                <text x="26" y={chartY(maxChart * fraction) - 7}>
                  {((maxChart * fraction) / 1000000).toLocaleString("ru-RU", {
                    maximumFractionDigits: 1,
                  })}{" "}
                  {t("млн", "млн")}
                </text>
              </g>
            ))}
            <path
              d={`M26,180 L506,${chartY(targets.revenue)}`}
              stroke="var(--b-muted)"
              strokeDasharray="5 5"
              opacity=".5"
            />
            <path
              d={`M26,180 L${chartPoints.join(" L")} L${chartX(14)},180 Z`}
              fill="var(--b-tint)"
            />
            <polyline
              points={`26,180 ${chartPoints.join(" ")}`}
              fill="none"
              stroke="var(--b-green)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              cx={chartX(14)}
              cy={chartY(metrics.revenue)}
              r="5"
              fill="var(--b-green)"
              stroke="var(--b-surface)"
              strokeWidth="3"
            />
            {[1, 7, 14, 21, 31].map((day) => (
              <text key={day} x={chartX(day)} y="206" textAnchor="middle">
                {day} {day === 31 ? t("окт", "қаз") : ""}
              </text>
            ))}
          </svg>
          <p>
            {t(
              `Осталось ${money(metrics.revenueGap)}. Пунктир — ориентир, а не прогноз продаж.`,
              `${money(metrics.revenueGap)} қалды. Үзік сызық — меже, сатылым болжамы емес.`,
            )}
          </p>
        </div>
      </section>
      <div className="goals-secondary-grid">
        <article>
          <span className="goals-label">
            <ShoppingBag size={16} />
            {t("Оплаченные заказы", "Төленген тапсырыстар")}
          </span>
          <div>
            <strong>{metrics.orders}</strong>
            <span> / {targets.orders}</span>
            <em>{metrics.orderPercent}%</em>
          </div>
          <progress
            value={metrics.orderPercent}
            max={100}
            aria-label={t("Цель по заказам", "Тапсырыс мақсаты")}
          />
          <p>
            {metrics.orderGap
              ? t(
                  `Ещё ${metrics.orderGap} заказов · нужно ${metrics.orderDaily} в день`,
                  `Тағы ${metrics.orderGap} тапсырыс · күніне ${metrics.orderDaily} қажет`,
                )
              : t("Цель выполнена", "Мақсат орындалды")}
          </p>
        </article>
        <article>
          <span className="goals-label">
            <MessageCircle size={16} />
            {t("Клиенты получили ответ", "Клиенттер жауап алды")}
          </span>
          <div>
            <strong>{metrics.replyRate}%</strong>
            <span> / {targets.replyRate}%</span>
            <em>
              {metrics.answered} / {metrics.threads}
            </em>
          </div>
          <progress
            value={metrics.replyPercent}
            max={100}
            aria-label={t("Цель по ответам", "Жауап беру мақсаты")}
          />
          <p>
            {metrics.repliesNeeded
              ? t(
                  `Для цели ответьте ещё на ${metrics.repliesNeeded} обращения`,
                  `Мақсатқа жету үшін тағы ${metrics.repliesNeeded} өтінішке жауап беріңіз`,
                )
              : t(
                  "Ответы соответствуют вашей цели",
                  "Жауаптар мақсатыңызға сай",
                )}
          </p>
        </article>
      </div>
      <section className="goals-action-plan">
        <header>
          <div>
            <span className="goals-label">
              <Flag size={15} />
              {t("План для Qazyna Store", "Qazyna Store жоспары")}
            </span>
            <h2>
              {t(
                "Три шага, которые имеют смысл сейчас",
                "Қазір жасауға болатын үш қадам",
              )}
            </h2>
          </div>
          <div className="goals-task-count">
            <span>{completedCount} / 3</span>
            <progress
              max={3}
              value={completedCount}
              aria-label={t(
                "Выполненные шаги плана",
                "Жоспардың орындалған қадамдары",
              )}
            />
          </div>
        </header>
        {steps.map((step, index) => (
          <article
            key={step.id}
            className={status[step.id] ? "is-complete" : ""}
          >
            <button
              className="goals-check-step"
              aria-label={
                status[step.id]
                  ? t(
                      `Отменить выполнение: ${step.title}`,
                      `Орындалуын өзгерту: ${step.title}`,
                    )
                  : t(
                      `Отметить выполненным: ${step.title}`,
                      `Орындалды деп белгілеу: ${step.title}`,
                    )
              }
              aria-pressed={status[step.id]}
              disabled={
                (step.id === "retention" && !pending.length) ||
                (step.id === "restock-coffee" && available >= 20)
              }
              onClick={() => setHub((state) => toggleGoalStep(state, step.id))}
            >
              {status[step.id] ? (
                <CheckCircle2 size={24} />
              ) : (
                <Circle size={24} />
              )}
            </button>
            {step.sku ? (
              <ProductVisual sku={step.sku} size={68} />
            ) : (
              <span className="goals-step-icon">
                <step.icon size={25} />
              </span>
            )}
            <div className="goals-step-copy">
              <span className="goals-step-agent">
                0{index + 1} / {step.agent}
              </span>
              <h3>{step.title}</h3>
              <p>{step.evidence}</p>
              <div className="goals-step-actions">
                <button onClick={() => navigate(step.section)}>
                  {step.action}
                  <ArrowRight size={14} />
                </button>
                <button
                  className="goals-add-task"
                  disabled={hub.tasks.includes(step.id)}
                  onClick={() => setHub((state) => addDemoTask(state, step.id))}
                >
                  {hub.tasks.includes(step.id) ? (
                    <Check size={13} />
                  ) : (
                    <Plus size={13} />
                  )}
                  {hub.tasks.includes(step.id)
                    ? t("В плане", "Жоспарда")
                    : t("Добавить в план", "Жоспарға қосу")}
                </button>
              </div>
            </div>
          </article>
        ))}
        <footer>
          <ArrowDownRight size={15} />
          {t(
            "Отмечайте выполненные шаги. Финансовые показатели меняются только от продаж, а не от галочек.",
            "Орындалған қадамдарды белгілеңіз. Қаржы көрсеткіштері белгіден емес, сатылымнан өзгереді.",
          )}
        </footer>
      </section>
      <p className="goals-source-note">
        {t(
          "Учебный срез Qazyna: продажи и оплаченные заказы за 1–14 октября; ответы — по текущим диалогам. Цели сохраняются в этом браузере.",
          "Qazyna үлгісі: 1–14 қазандағы сатылым мен төленген тапсырыстар; жауаптар — қазіргі диалогтар бойынша. Мақсаттар осы браузерде сақталады.",
        )}
      </p>
    </div>
  );
}

export function GoalsSummary({
  language,
  navigate,
}: {
  language: "kk" | "ru";
  navigate: (section: string) => void;
}) {
  const t = (ru: string, kk: string) => (language === "ru" ? ru : kk);
  const [target, setTarget] = useState(defaultGoalTargets.revenue);
  useEffect(() => {
    const read = () => {
      try {
        const raw = localStorage.getItem(GOAL_STORAGE_KEY);
        setTarget(parseGoalPreferences(raw ? JSON.parse(raw) : null).revenue);
      } catch {
        /* Default remains usable. */
      }
    };
    read();
    window.addEventListener("storage", read);
    window.addEventListener("bagyt-goals-changed", read);
    return () => {
      window.removeEventListener("storage", read);
      window.removeEventListener("bagyt-goals-changed", read);
    };
  }, []);
  const revenue = demoDailySales.reduce((sum, value) => sum + value, 0);
  const percent = Math.min(100, Math.floor((revenue / target) * 100));
  return (
    <section className="goals-summary-card">
      <span className="goals-summary-icon">
        <Target size={21} />
      </span>
      <div className="goals-summary-title">
        <b>{t("Цель на октябрь", "Қазан айының мақсаты")}</b>
        <span>
          {money(revenue)} <small>/ {money(target)}</small>
        </span>
      </div>
      <div className="goals-summary-progress">
        <span>
          <b>{percent}%</b>
          {t("до конца месяца 17 дней", "ай соңына дейін 17 күн")}
        </span>
        <progress
          value={percent}
          max={100}
          aria-label={t(
            "Выполнение цели по выручке",
            "Түсім мақсатының орындалуы",
          )}
        />
      </div>
      <button onClick={() => navigate("growth")}>
        {t("Мой план", "Менің жоспарым")}
        <ArrowRight size={15} />
      </button>
    </section>
  );
}
