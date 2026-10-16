"use client";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  MessageSquare,
  Package,
  Plus,
  Star,
  Wallet,
} from "lucide-react";
import BelgiRobot from "./belgi-robot";
import { GoalsSummary } from "./business-goals";
import {
  demoReviews,
  unanswered,
  type DemoLanguage,
  type HubState,
} from "@/lib/business-hub-demo";
import { demoDailySales, type DemoPurchase } from "@/lib/belgi-demo";
import { agentTeam, AGENT_PLAN_KEY, type AgentId } from "@/lib/agent-team";
type Props = {
  language: DemoLanguage;
  hub: HubState;
  purchase: DemoPurchase;
  period: number;
  navigate: (id: string) => void;
  onPurchase: () => void;
  onOrder: (id: string) => void;
  onConversation: (id: string) => void;
  onGuide: () => void;
  onAssistant: () => void;
};
export default function BusinessOverview({
  language,
  hub,
  purchase,
  period,
  navigate,
  onConversation,
  onGuide,
  onAssistant,
}: Props) {
  const t = (ru: string, kk: string) => (language === "ru" ? ru : kk);
  const [pro, setPro] = useState(false);
  useEffect(() => {
    const sync = () => {
      try {
        setPro(localStorage.getItem(AGENT_PLAN_KEY) === "pro");
      } catch {}
    };
    sync();
    window.addEventListener("bagyt-agents-change", sync);
    return () => window.removeEventListener("bagyt-agents-change", sync);
  }, []);
  const pending = unanswered(hub),
    reviews = demoReviews.filter((r) => !hub.reviewReplies[r.id]);
  const available = 10 + purchase.received;
  const sales = demoDailySales.slice(-period),
    revenue = sales.reduce((a, b) => a + b, 0);
  const points = sales
    .map(
      (v, i) =>
        `${16 + (i * 628) / (sales.length - 1)},${154 - (v / Math.max(...sales)) * 110}`,
    )
    .join(" ");
  const tasks = hub.tasks.filter((id) => !hub.completed.includes(id)).length;
  const steps = [
    {
      icon: MessageSquare,
      title: t("Ответить клиентам", "Клиенттерге жауап беру"),
      text: t(
        `${pending.length} обращения · WhatsApp, Instagram, сайт`,
        `${pending.length} өтініш · WhatsApp, Instagram, сайт`,
      ),
      label: t("Клиенты", "Клиенттер"),
      done: pending.length === 0,
      run: () =>
        pending[0] ? onConversation(pending[0].id) : navigate("inbox"),
    },
    {
      icon: Package,
      title: t("Пополнить запас кофе", "Кофе қорын толықтыру"),
      text: t(
        `${available} шт. · запас на ${available / 4} дня`,
        `${available} дана · ${available / 4} күнге жетеді`,
      ),
      label: t("Запасы", "Қойма"),
      done: available >= 20,
      run: () => navigate("purchases"),
    },
    {
      icon: Star,
      title: t("Разобрать отзывы", "Пікірлерді қарау"),
      text: t(
        `${reviews.length} без ответа · начните с ожидания заказа`,
        `${reviews.length} жауапсыз · тапсырысты күту мәселесі`,
      ),
      label: t("Отзывы", "Пікірлер"),
      done: reviews.length === 0,
      run: () => navigate("reviews"),
    },
  ];
  function talk(id: AgentId) {
    onAssistant();
    window.dispatchEvent(new CustomEvent("bagyt-select-agent", { detail: id }));
  }
  return (
    <div className="b-overview">
      <div className="b-workspace-status">
        <span>
          <i />
          {t("Рабочее пространство в порядке", "Жұмыс кеңістігі дайын")}
        </span>
        <button onClick={onGuide}>
          {t("Как всё устроено", "Қалай жұмыс істейді")}
          <ArrowUpRight size={15} />
        </button>
      </div>
      <GoalsSummary language={language} navigate={navigate} />
      <section
        className="b-metrics studio-kpis"
        aria-label={t("Главное в цифрах", "Негізгі көрсеткіштер")}
      >
        <button onClick={() => navigate("analytics")}>
          <span>
            <Wallet size={17} />
            {t("Выручка", "Түсім")}
          </span>
          <strong>
            {revenue.toLocaleString("ru-RU")} <em>₸</em>
          </strong>
          <small>
            {period === 14 ? "1–14" : "8–14"} {t("октября", "қазан")}
            <ArrowUpRight size={16} />
          </small>
        </button>
        <button onClick={() => navigate("inbox")}>
          <span>
            <MessageSquare size={17} />
            {t("Ждут ответа", "Жауап күтуде")}
          </span>
          <strong>
            {pending.length}
            <em>{t("обращения", "өтініш")}</em>
          </strong>
          <small>
            <i className={pending.length ? "amber" : ""} />
            {t("Все каналы в одном месте", "Барлық арна бір жерде")}
            <ArrowUpRight size={16} />
          </small>
        </button>
        <button onClick={() => navigate("growth")}>
          <span>
            <CheckCircle2 size={17} />
            {t("В работе", "Жұмыста")}
          </span>
          <strong>
            {tasks}
            <em>{t("задачи", "тапсырма")}</em>
          </strong>
          <small>
            {t("Понятный следующий шаг", "Келесі қадам түсінікті")}
            <ArrowUpRight size={16} />
          </small>
        </button>
      </section>
      <div className="b-work-grid">
        <section className="b-chart-card">
          <header>
            <div>
              <span className="b-eyebrow">OVERVIEW</span>
              <h2>{t("Динамика бизнеса", "Бизнес динамикасы")}</h2>
            </div>
            <button onClick={() => navigate("analytics")}>
              {t("Аналитика", "Талдау")}
              <ArrowUpRight size={16} />
            </button>
          </header>
          <div className="b-chart-summary">
            <span>
              <i />
              {t("Выручка за день", "Күндік түсім")}
            </span>
            <small>{t("За выбранный период", "Таңдалған кезең")}</small>
          </div>
          <svg
            viewBox="0 0 660 190"
            role="img"
            aria-label={t(
              `График выручки за ${period} дней. Всего ${revenue} тенге.`,
              `Түсімнің ${period} күндік графигі. Барлығы ${revenue} теңге.`,
            )}
          >
            <defs>
              <linearGradient id="revenue-fill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity=".23" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[44, 81, 118, 155].map((y) => (
              <line
                key={y}
                x1="16"
                x2="644"
                y1={y}
                y2={y}
                stroke="currentColor"
                strokeOpacity=".1"
                strokeDasharray="3 5"
              />
            ))}
            <polygon
              points={`16,155 ${points} 644,155`}
              fill="url(#revenue-fill)"
            />
            <polyline
              points={points}
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              cx="644"
              cy={154 - (sales[sales.length - 1] / Math.max(...sales)) * 110}
              r="4"
              fill="#10b981"
            />
            <text x="16" y="181">
              {period === 14 ? "01" : "08"} Oct
            </text>
            <text x="306" y="181">
              {period === 14 ? "07" : "11"} Oct
            </text>
            <text x="608" y="181">
              14 Oct
            </text>
          </svg>
          <footer>
            <span>
              <Check size={14} />
              {t(
                "Продажи собраны из Kaspi и POS",
                "Kaspi және POS сатылымдары",
              )}
            </span>
            <button onClick={() => navigate("integrations")}>
              {t("Источники", "Дереккөздер")}
              <ChevronRight size={14} />
            </button>
          </footer>
        </section>
        <section className="b-team-card">
          <header>
            <div>
              <span className="b-eyebrow">YOUR TEAM</span>
              <h2>{t("Ваши AI-агенты", "AI командаңыз")}</h2>
            </div>
            <span className="b-plan-badge">{pro ? "PRO" : "FREE"}</span>
          </header>
          <p>
            {t(
              "Нажмите на агента. Остальное обсудим в чате.",
              "Агентті басыңыз. Қалғанын чатта талқылаймыз.",
            )}
          </p>
          <div className="b-team-list">
            {agentTeam.map((a, i) => (
              <button key={a.id} onClick={() => talk(a.id)}>
                <BelgiRobot
                  size={54}
                  variant={a.id}
                  state={i === 0 ? "happy" : "greeting"}
                />
                <span>
                  <b>{a.name}</b>
                  <small>{a.role[language]}</small>
                </span>
                {pro || i === 0 ? (
                  <i className="b-agent-ready" />
                ) : (
                  <span className="b-pro-label">
                    Pro <Plus size={12} />
                  </span>
                )}
              </button>
            ))}
          </div>
          <button className="b-team-more" onClick={() => talk("sana")}>
            {pro
              ? t("Открыть команду", "Команданы ашу")
              : t("Попробовать команду Pro", "Pro командасын байқап көру")}
            <ArrowRight size={16} />
          </button>
        </section>
      </div>
      <section className="b-focus">
        <header>
          <div>
            <span className="b-eyebrow">NEXT UP</span>
            <h2>{t("На чём сосредоточиться", "Бүгінгі маңызды істер")}</h2>
          </div>
          <button onClick={() => navigate("growth")}>
            {t("Весь план", "Толық жоспар")}
            <ArrowUpRight size={16} />
          </button>
        </header>
        <div>
          {steps.map(({ icon: Icon, title, text, label, done, run }, i) => (
            <button className="b-focus-row" key={title} onClick={run}>
              <span className="b-focus-index">
                {done ? <CheckCircle2 size={18} /> : <Circle size={18} />}
              </span>
              <span className="b-focus-icon">
                <Icon size={19} />
              </span>
              <span className="b-focus-text">
                <b>{title}</b>
                <small>{text}</small>
              </span>
              <span className={`b-focus-tag tag-${i}`}>
                {done ? t("Готово", "Дайын") : label}
              </span>
              <ArrowUpRight size={17} />
            </button>
          ))}
        </div>
      </section>
      <footer className="b-overview-footer">
        <span>
          <i />
          {t("Qazyna Store · пример бизнеса", "Qazyna Store · бизнес үлгісі")}
        </span>
        <button onClick={() => navigate("integrations")}>
          {t(
            "Сообщения и цифры — примеры. Подключить свои данные",
            "Хабарламалар мен сандар — үлгі. Өз деректерімді қосу",
          )}
          <ArrowRight size={14} />
        </button>
      </footer>
    </div>
  );
}
