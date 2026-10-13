"use client";
import { useCallback, useEffect, useState } from "react";
import {
  LayoutDashboard,
  Plug,
  Lightbulb,
  Route,
  BarChart3,
  Settings,
  ArrowUpRight,
  ArrowRight,
  Plus,
  ChevronDown,
  Wallet,
  TrendingUp,
  Target,
  MessageSquare,
  Check,
  CheckCircle2,
  ShieldCheck,
  Upload,
  FileText,
  CalendarDays,
  Download,
  Search,
  LogOut,
  Menu,
  X,
  Sparkles,
  Clock,
  AlertTriangle,
  Send,
  Copy,
  ExternalLink,
  RefreshCw,
  ChevronRight,
  Store,
  GraduationCap,
  Database,
  Users,
  Receipt,
  Activity,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { api, Logo, Robot, Badge, Modal, Stat, Empty, download } from "./ui";
import Importer from "./importer";
import Connector from "./connector";
import Onboarding from "./onboarding";
import BusinessBrief, { GuidedAssistant } from "./business-brief";
import { money, dayKey, Event, Task, Insight, cents } from "@/lib/types";
const icons = [LayoutDashboard, Plug, Lightbulb, Route, BarChart3, Settings];
const keys = [
  "overview",
  "connect",
  "insights",
  "growth",
  "results",
  "settings",
];
const ru = [
  "Главное",
  "Мои данные",
  "Разбор AQYL",
  "Мои дела",
  "Результаты",
  "Настройки",
];
const kk = [
  "Басты бет",
  "Деректерім",
  "AQYL талдауы",
  "Істерім",
  "Нәтижелер",
  "Баптаулар",
];
const statusRu: Record<string, string> = {
  draft: "Черновик",
  approved: "Утверждено",
  in_progress: "В работе",
  completed: "Выполнено",
  verified: "Проверено",
  cancelled: "Отменено",
  rejected: "Отклонено",
};
const statusKk: Record<string, string> = {
  draft: "Жоба",
  approved: "Бекітілді",
  in_progress: "Орындалуда",
  completed: "Орындалды",
  verified: "Тексерілді",
  cancelled: "Тоқтатылды",
  rejected: "Қабылданбады",
};
const kindNames: Record<string, string> = {
  sale: "Продажа",
  refund: "Возврат",
  expense: "Расход",
  lead: "Обращение",
  campaign: "Кампания",
  review: "Отзыв",
};
const kindKk: Record<string, string> = {
  sale: "Сату",
  refund: "Қайтару",
  expense: "Шығыс",
  lead: "Өтініш",
  campaign: "Науқан",
  review: "Пікір",
};
export default function Bagyt() {
  const [language, setLanguage] = useState<"ru" | "kk">("ru"),
    [data, setData] = useState<any>(null),
    [loading, setLoading] = useState(true),
    [section, setSection] = useState("overview"),
    [days, setDays] = useState(30),
    [modal, setModal] = useState<any>(null),
    [busy, setBusy] = useState(false),
    [toast, setToast] = useState(""),
    [error, setError] = useState(""),
    [mobile, setMobile] = useState(false),
    [query, setQuery] = useState(""),
    [filter, setFilter] = useState("all"),
    [chat, setChat] = useState<{ q: string; a: string }[]>([]),
    [chatInput, setChatInput] = useState(""),
    [webhook, setWebhook] = useState<any>(null),
    [ocr, setOcr] = useState<any>(null);
  const t = (r: string, k: string) => (language === "ru" ? r : k);
  const reload = useCallback(async () => {
    try {
      setData(await api("bootstrap?days=" + days + "&lang=" + language));
    } catch (e) {
      if (
        (e as Error).message.includes("Войдите") ||
        (e as Error).message.includes("Сессия")
      )
        setData(null);
      else setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [days, language]);
  useEffect(() => {
    const l = localStorage.getItem("bagyt-language");
    if (l === "kk") setLanguage(l);
  }, []);
  useEffect(() => {
    reload();
  }, [reload]);
  useEffect(() => {
    localStorage.setItem("bagyt-language", language);
    document.documentElement.lang = language;
  }, [language]);
  useEffect(() => {
    if (toast) {
      const id = setTimeout(() => setToast(""), 5500);
      return () => clearTimeout(id);
    }
  }, [toast]);
  const close = useCallback(() => {
    setModal(null);
    setError("");
    setOcr(null);
  }, []);
  async function action(
    fn: () => Promise<any>,
    message?: string,
    shouldClose = false,
  ) {
    setBusy(true);
    setError("");
    try {
      const r = await fn();
      await reload();
      if (shouldClose) close();
      if (message) setToast(message);
      return r;
    } catch (e) {
      setError((e as Error).message);
      return null;
    } finally {
      setBusy(false);
    }
  }
  function nav(k: string) {
    setSection(k);
    setMobile(false);
    setError("");
  }
  function form(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    return Object.fromEntries(new FormData(e.currentTarget).entries());
  }
  async function demo(industry: string) {
    await action(
      () => api("auth/demo", { industry }),
      t("Демо-компания готова", "Демо-компания дайын"),
      true,
    );
  }
  const open = (value: any) => {
    setError("");
    setModal(value);
  };
  const status = (s: string) =>
    (language === "ru" ? statusRu : statusKk)[s] || s;
  const kind = (s: string) => (language === "ru" ? kindNames : kindKk)[s] || s;
  const metricValue = (metric: string, value: any) =>
    value === null
      ? "—"
      : metric === "expenses"
        ? money(Number(value))
        : String(Number(value)) + (metric === "margin" ? "%" : "");
  const metricName = (metric: string) =>
    ({
      unanswered: t("Без ответа", "Жауапсыз"),
      expenses: t("Расходы", "Шығындар"),
      margin: t("Маржа", "Маржа"),
      overdue: t("Просрочено", "Мерзімі өтті"),
    })[metric] || metric;
  const fmtDate = (s: string) => {
    if (language === "ru")
      return new Date(s).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "short",
        timeZone: "Asia/Qyzylorda",
      });
    const p = dayKey(s).split("-");
    return (
      Number(p[2]) +
      " " +
      [
        "қаң.",
        "ақп.",
        "нау.",
        "сәу.",
        "мам.",
        "мау.",
        "шіл.",
        "там.",
        "қыр.",
        "қаз.",
        "қар.",
        "жел.",
      ][Number(p[1]) - 1]
    );
  };
  const a = data?.analytics,
    owner = data?.user.role === "owner";
  function insightTitle(i: Insight) {
    return language === "ru"
      ? i.title
      : {
          unanswered: "Өтініштер жауапсыз қалды",
          expenses: "Шығындар өсіп жатыр",
          margin: "Жалпы маржа төмен",
          overdue: "Тапсырмалар кешіктірілді",
        }[i.id] || i.title;
  }
  function insightFact(i: Insight) {
    if (language === "ru") return i.fact;
    return (
      {
        unanswered: `Алғашқы жауабы расталмаған өтініштер: ${i.value}.`,
        expenses: `Ағымдағы шығын: ${money(i.value)}. Алдыңғы кезең: ${money(i.target)}.`,
        margin: `Жалпы маржа: ${i.value}%. Өзіндік құн белгілі.`,
        overdue: `Мерзімі өткен тапсырмалар: ${i.value}.`,
      }[i.id] || i.fact
    );
  }
  const notices = (
    <>
      {toast && (
        <div className="toast" role="status">
          <CheckCircle2 size={18} />
          {toast}
          <button aria-label="Закрыть" onClick={() => setToast("")}>
            <X size={15} />
          </button>
        </div>
      )}
      {error && !modal && (
        <div className="global-error" role="alert">
          {error}
          <button onClick={() => setError("")}>
            <X size={16} />
          </button>
        </div>
      )}
    </>
  );
  if (loading)
    return (
      <div className="loading-screen">
        <Logo />
        <Robot state="loading" size={110} />
        <p>
          {t(
            "Открываем ваше рабочее пространство…",
            "Жұмыс кеңістігі ашылуда…",
          )}
        </p>
      </div>
    );
  return (
    <>
      {!data ? (
        <div className="landing">
          <header className="landing-nav">
            <Logo />
            <div className="nav-links">
              <a href="#how">{t("Как это работает", "Қалай жұмыс істейді")}</a>
              <a href="#features">{t("Возможности", "Мүмкіндіктер")}</a>
              <button
                className="lang"
                onClick={() => setLanguage(language === "ru" ? "kk" : "ru")}
              >
                {language === "ru" ? "ҚАЗ" : "РУС"}
              </button>
              <button
                className="secondary"
                onClick={() => open({ type: "login" })}
              >
                {t("Войти", "Кіру")}
                <ArrowUpRight size={15} />
              </button>
            </div>
          </header>
          <main className="landing-main">
            <div className="hero-copy">
              <span className="eyebrow">
                <span className="live-dot" />
                {t("СОЗДАН ДЛЯ ЛОКАЛЬНОГО БИЗНЕСА", "ЖЕРГІЛІКТІ БИЗНЕС ҮШІН")}
              </span>
              <h1>
                {t("Своё дело.", "Өз ісің.")}
                <br />
                {t("Своя опора.", "Өз тірегің.")}
                <br />
                <em>{t("AQYL рядом.", "AQYL қасыңда.")}</em>
              </h1>
              <p>
                {t(
                  "Объедините продажи, обращения и расходы. AQYL поможет увидеть главное, выбрать действие и проверить результат.",
                  "Сату, өтініштер мен шығындарды біріктіріңіз. AQYL маңыздысын көрсетіп, әрекет таңдауға және нәтижені тексеруге көмектеседі.",
                )}
              </p>
              <div className="hero-actions">
                <button
                  className="primary"
                  onClick={() => open({ type: "register" })}
                >
                  {t("Создать аккаунт", "Аккаунт ашу")}
                  <ArrowRight size={18} />
                </button>
                <button
                  className="secondary"
                  onClick={() => open({ type: "demo" })}
                >
                  {t("Посмотреть демо", "Демо көру")}
                </button>
              </div>
              <div className="hero-note">
                <ShieldCheck size={16} />
                {t(
                  "Меньше минуты на старт · Источники подключите позже",
                  "Бастауға бір минуттан аз · Дереккөздерді кейін қосасыз",
                )}
              </div>
            </div>
            <div className="hero-visual">
              <div className="orbit orbit-one" />
              <div className="orbit orbit-two" />
              <div className="visual-top">
                <span className="live-dot" />{" "}
                {t("AQYL / ВАШ БИЗНЕС-ПОМОЩНИК", "AQYL / БИЗНЕС КӨМЕКШІҢІЗ")}
              </div>
              <Robot size={235} />
              <h3>
                AQYL <span>Ақыл</span>
              </h3>
              <p>
                {t(
                  "С пониманием к цифрам. С заботой к вам.",
                  "Сандарды түсініп, сізге қамқор болады.",
                )}
              </p>
              <div className="float-card float-one">
                <MessageSquare size={20} />
                <div>
                  <b>{t("Обращения", "Өтініштер")}</b>
                  <small>WhatsApp · Instagram</small>
                </div>
                <CheckCircle2 size={16} />
              </div>
              <div className="float-card float-two">
                <BarChart3 size={20} />
                <div>
                  <b>{t("Продажи и расходы", "Сату мен шығындар")}</b>
                  <small>UMAG · сайт · Excel</small>
                </div>
                <CheckCircle2 size={16} />
              </div>
              <div className="visual-bottom">
                <span>{t("ПОДКЛЮЧИТЕ", "ҚОСЫҢЫЗ")}</span>
                <ArrowRight size={13} />
                <span>{t("ПОЙМИТЕ", "ТҮСІНІҢІЗ")}</span>
                <ArrowRight size={13} />
                <span>{t("РАСТИТЕ", "ӨСІҢІЗ")}</span>
              </div>
            </div>
          </main>
          <div className="trust-strip">
            <span>
              {t(
                "ВСЕ ИСТОЧНИКИ. ОДНА КАРТИНА.",
                "БАРЛЫҚ ДЕРЕККӨЗ. БІР КӨРІНІС.",
              )}
            </span>
            {[
              "UMAG / POS",
              "WhatsApp",
              "Instagram",
              "TikTok",
              "2GIS",
              "CSV / XLSX",
            ].map((s) => (
              <b key={s}>{s}</b>
            ))}
          </div>
          <section className="landing-features" id="how">
            <div>
              <span className="eyebrow">01 — 03</span>
              <h2>
                {t(
                  "Меньше догадок. Больше ясности.",
                  "Аз болжам. Көп айқындық.",
                )}
              </h2>
            </div>
            <div className="feature-grid" id="features">
              {[
                [
                  Database,
                  t("Соберите факты", "Деректерді жинаңыз"),
                  t(
                    "Начните с одного отчета. Проверьте суммы, исправьте ошибки и исключите дубли.",
                    "Бір есептен бастаңыз. Сомаларды тексеріп, қателер мен қайталануларды түзетіңіз.",
                  ),
                ],
                [
                  Lightbulb,
                  t("Поймите, что важно", "Маңыздысын түсініңіз"),
                  t(
                    "У каждого сигнала есть источник, расчет и понятное ограничение данных.",
                    "Әр белгіде дереккөз, есеп және деректер шектеуі бар.",
                  ),
                ],
                [
                  Route,
                  t("Перейдите к действиям", "Әрекетке көшіңіз"),
                  t(
                    "Утвердите план, назначьте ответственного и измерьте изменения по новым данным.",
                    "Жоспарды бекітіп, жауапты адамды тағайындаңыз және өзгерістерді өлшеңіз.",
                  ),
                ],
              ].map(([Icon, title, desc]: any, i) => (
                <article key={i}>
                  <span className="feature-number">0{i + 1}</span>
                  <Icon size={26} />
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </article>
              ))}
            </div>
          </section>
          <footer>
            <Logo />
            <span>
              {t(
                "Тараз, Казахстан · От данных к росту.",
                "Тараз, Қазақстан · Деректерден өсуге.",
              )}
            </span>
            <span>Hackathon MVP / 2026</span>
          </footer>
        </div>
      ) : (
        <div className="app-shell">
          <aside className={"sidebar " + (mobile ? "mobile-open" : "")}>
            <Logo />
            <button
              className="icon-button sidebar-close"
              aria-label="Закрыть меню / Мәзірді жабу"
              onClick={() => setMobile(false)}
            >
              <X size={18} />
            </button>
            <button className="organization" onClick={() => nav("settings")}>
              <span className="org-avatar">{data.org.name.slice(0, 1)}</span>
              <span>
                <b>{data.org.name}</b>
                <small>
                  {data.org.city} ·{" "}
                  {t("Рабочее пространство", "Жұмыс кеңістігі")}
                </small>
              </span>
              <ChevronDown size={15} />
            </button>
            <span className="sidebar-label">
              {t("УПРАВЛЕНИЕ БИЗНЕСОМ", "БИЗНЕСТІ БАСҚАРУ")}
            </span>
            <nav>
              {keys.map((key, i) => {
                if (key === "insights" || key === "results") return null;
                const Icon = icons[i];
                return (
                  <button
                    className={section === key ? "active" : ""}
                    key={key}
                    onClick={() => nav(key)}
                  >
                    <Icon size={19} />
                    <span>{(language === "ru" ? ru : kk)[i]}</span>
                    {key === "insights" && a.insights.length > 0 && (
                      <b className="nav-count">{a.insights.length}</b>
                    )}
                    {section === key && <span className="active-dot" />}
                  </button>
                );
              })}
            </nav>
            <div className="sidebar-bottom">
              <div className="sidebar-aqyl">
                <Robot size={45} />
                <b>AQYL {t("рядом", "қасыңызда")}</b>
                <p>
                  {t(
                    "Помогу разобраться в данных и выбрать следующий шаг.",
                    "Деректерді түсінуге және келесі қадамды таңдауға көмектесемін.",
                  )}
                </p>
                <button onClick={() => open({ type: "chat" })}>
                  {t("Открыть помощника", "Көмекшіні ашу")}
                  <ArrowUpRight size={16} />
                </button>
              </div>
              <div className="user-profile">
                <span className="avatar">{data.user.name.slice(0, 1)}</span>
                <div>
                  <b>{data.user.name}</b>
                  <small>
                    {data.user.role === "owner"
                      ? t("Владелец", "Иесі")
                      : data.user.role === "manager"
                        ? t("Менеджер", "Менеджер")
                        : t("Наблюдатель", "Бақылаушы")}
                  </small>
                </div>
                <button
                  className="icon-button"
                  aria-label={t("Выйти", "Шығу")}
                  onClick={() => action(() => api("auth/logout", {}))}
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          </aside>
          <div className="main-shell">
            <header className="topbar">
              <div className="breadcrumb">
                <button
                  className="icon-button menu-toggle"
                  aria-label="Меню"
                  onClick={() => setMobile(!mobile)}
                >
                  <Menu size={21} />
                </button>
                <span>{data.org.name}</span>
                <ChevronRight size={13} />
                <b>{(language === "ru" ? ru : kk)[keys.indexOf(section)]}</b>
              </div>
              <div className="top-actions">
                {data.org.demo && (
                  <Badge color="amber">
                    {t("Синтетическое демо", "Синтетикалық демо")}
                  </Badge>
                )}
                <span className="saved">
                  <span className="live-dot" />
                  {t("Данные сохранены", "Деректер сақталды")}
                </span>
                <button
                  className="lang"
                  onClick={() => setLanguage(language === "ru" ? "kk" : "ru")}
                >
                  {language === "ru" ? "RU" : "KZ"}
                  <ChevronDown size={12} />
                </button>
                <span className="avatar small">
                  {data.user.name.slice(0, 1)}
                </span>
              </div>
            </header>
            <main className="workspace">
              <div className="page-heading">
                <div>
                  <div className="eyebrow">
                    {t("ВАШ НАВИГАТОР РОСТА", "СІЗДІҢ ӨСУ БАҒЫТТАУШЫҢЫЗ")}
                  </div>
                  <h1>
                    {section === "overview"
                      ? t(
                          data.user.name === "Владелец"
                            ? "Сәлем! Как ваше дело?"
                            : `Сәлем, ${data.user.name}!`,
                          data.user.name === "Владелец"
                            ? "Сәлем! Кәсібіңіз қалай?"
                            : `Сәлем, ${data.user.name}!`,
                        )
                      : (language === "ru" ? ru : kk)[keys.indexOf(section)]}
                    <span className="title-dot">.</span>
                  </h1>
                  <p>
                    {section === "overview"
                      ? t(
                          "Главное о вашем бизнесе — простыми словами.",
                          "Бизнесіңіздегі маңызды ақпарат — қарапайым тілмен.",
                        )
                      : t(
                          "От проверенных фактов — к конкретным действиям.",
                          "Тексерілген деректерден — нақты әрекеттерге.",
                        )}
                  </p>
                </div>
                <div className="heading-actions">
                  <select
                    aria-label={t("Период", "Кезең")}
                    value={days}
                    onChange={(e) => setDays(Number(e.target.value))}
                  >
                    {[7, 30, 60].map((n) => (
                      <option value={n} key={n}>
                        {n} {t("дней", "күн")}
                      </option>
                    ))}
                  </select>
                  {owner && (
                    <button
                      className="primary"
                      onClick={() => open({ type: "manual" })}
                    >
                      <Plus size={17} />
                      {t("Добавить", "Қосу")}
                    </button>
                  )}
                </div>
              </div>
              {section === "overview" && (
                <>
                  <BusinessBrief
                    analytics={a}
                    language={language}
                    demo={data.org.demo}
                    owner={owner}
                    goal={data.org.goal}
                    onNavigate={nav}
                    onImport={() =>
                      open({ type: "import", source: "POS", kind: "sale" })
                    }
                    onChat={() => open({ type: "chat" })}
                    onEvidence={(insight) =>
                      open({ type: "evidence", insight })
                    }
                  />
                  <div className="overview-links">
                    <button
                      className="secondary"
                      onClick={() => nav("insights")}
                    >
                      <Lightbulb size={18} />
                      {t("Полный разбор", "Толық талдау")}
                    </button>
                    <button
                      className="secondary"
                      onClick={() => nav("results")}
                    >
                      <BarChart3 size={18} />
                      {t("Результаты моих действий", "Әрекеттерімнің нәтижесі")}
                    </button>
                  </div>
                  {a.coverage.verified > 0 && (
                    <details className="advanced-overview">
                      <summary>
                        {t(
                          "Показать графики и все показатели",
                          "Графиктер мен барлық көрсеткіштерді көрсету",
                        )}
                      </summary>
                      <div className="stats-grid">
                        <Stat
                          label={t("Выручка", "Түсім")}
                          value={money(a.revenue)}
                          icon={<Wallet size={18} />}
                          detail={t(
                            "оплаченные продажи − возвраты",
                            "төленген сату − қайтару",
                          )}
                          trend={
                            a.priorRevenue > 0
                              ? `${a.revenue >= a.priorRevenue ? "+" : ""}${Math.round((a.revenue / a.priorRevenue - 1) * 100)}%`
                              : undefined
                          }
                        />
                        <Stat
                          label={t("Валовая прибыль", "Жалпы пайда")}
                          value={a.gross === null ? "—" : money(a.gross)}
                          icon={<TrendingUp size={18} />}
                          detail={
                            a.margin === null
                              ? t(
                                  "себестоимость неизвестна",
                                  "өзіндік құн белгісіз",
                                )
                              : t(`Маржа ${a.margin}%`, `Маржа ${a.margin}%`)
                          }
                        />
                        <Stat
                          label={t("Расходы", "Шығындар")}
                          value={money(a.expenses)}
                          icon={<Receipt size={18} />}
                          detail={t(
                            "подтвержденные операции",
                            "расталған операциялар",
                          )}
                        />
                        <Stat
                          label={t("Без ответа", "Жауапсыз")}
                          value={String(a.unanswered).padStart(2, "0")}
                          icon={<MessageSquare size={18} />}
                          color="amber-text"
                          detail={t(
                            `из ${a.leads} обращений за период`,
                            `кезеңдегі ${a.leads} өтініштен`,
                          )}
                        />
                      </div>
                      <div className="dashboard-grid">
                        <section className="panel chart-panel">
                          <div className="panel-heading">
                            <div>
                              <h2>
                                {t("Динамика бизнеса", "Бизнес динамикасы")}
                              </h2>
                              <p>
                                {fmtDate(a.period.from)} —{" "}
                                {fmtDate(a.period.to)} · KZT
                              </p>
                            </div>
                            <div className="chart-legend">
                              <span>
                                <i /> {t("Выручка", "Түсім")}
                              </span>
                              <span>
                                <i /> {t("Расходы", "Шығындар")}
                              </span>
                            </div>
                          </div>
                          <div className="chart">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart
                                data={a.chart}
                                margin={{
                                  top: 20,
                                  right: 8,
                                  bottom: 0,
                                  left: -15,
                                }}
                              >
                                <defs>
                                  <linearGradient
                                    id="revenue"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                  >
                                    <stop
                                      offset="0%"
                                      stopColor="#222222"
                                      stopOpacity={0.24}
                                    />
                                    <stop
                                      offset="100%"
                                      stopColor="#222222"
                                      stopOpacity={0}
                                    />
                                  </linearGradient>
                                </defs>
                                <CartesianGrid
                                  stroke="#ececeb"
                                  strokeDasharray="3 5"
                                  vertical={false}
                                />
                                <XAxis
                                  dataKey="date"
                                  tickFormatter={(s) =>
                                    fmtDate(s + "T12:00:00+05:00")
                                  }
                                  tick={{ fill: "#888880", fontSize: 11 }}
                                  minTickGap={40}
                                  axisLine={false}
                                  tickLine={false}
                                />
                                <YAxis
                                  tickFormatter={(v) => `${v / 1000}k`}
                                  tick={{ fill: "#888880", fontSize: 11 }}
                                  axisLine={false}
                                  tickLine={false}
                                />
                                <Tooltip
                                  contentStyle={{
                                    background: "#ffffff",
                                    border: "1px solid #ddddda",
                                    borderRadius: 10,
                                    color: "#222222",
                                  }}
                                  formatter={(v: any, n: any) => [
                                    money(Number(v) * 100),
                                    n === "revenue"
                                      ? t("Выручка", "Түсім")
                                      : t("Расходы", "Шығындар"),
                                  ]}
                                />
                                <Area
                                  isAnimationActive={false}
                                  dataKey="revenue"
                                  type="monotone"
                                  stroke="#222222"
                                  strokeWidth={2.5}
                                  fill="url(#revenue)"
                                />
                                <Area
                                  isAnimationActive={false}
                                  dataKey="expenses"
                                  type="monotone"
                                  stroke="#aaaaa0"
                                  strokeWidth={1.5}
                                  strokeDasharray="4 5"
                                  fill="transparent"
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="chart-footer">
                            <ShieldCheck size={14} />
                            {t(
                              "Только подтвержденные записи. Период и формулы доступны в аналитике.",
                              "Тек расталған жазбалар. Кезең мен формулалар талдауда берілген.",
                            )}
                          </div>
                        </section>
                        <section className="panel focus-panel">
                          <div className="panel-heading">
                            <h2>{t("В фокусе", "Назарда")}</h2>
                            <Badge color="muted">
                              {t("ПРИОРИТЕТЫ", "БАСЫМДЫҚТАР")}
                            </Badge>
                          </div>
                          {a.insights
                            .slice(0, 3)
                            .map((i: Insight, n: number) => (
                              <button
                                className="focus-item"
                                key={i.id}
                                onClick={() =>
                                  open({ type: "evidence", insight: i })
                                }
                              >
                                <span
                                  className={
                                    "signal-icon " +
                                    (i.severity === "high" ? "amber" : "green")
                                  }
                                >
                                  {n === 0 ? (
                                    <MessageSquare size={17} />
                                  ) : n === 1 ? (
                                    <TrendingUp size={17} />
                                  ) : (
                                    <Activity size={17} />
                                  )}
                                </span>
                                <div>
                                  <h3>{insightTitle(i)}</h3>
                                  <p>{insightFact(i)}</p>
                                  <span>
                                    {t(
                                      "Открыть доказательства",
                                      "Дәлелдерді ашу",
                                    )}
                                    <ArrowRight size={12} />
                                  </span>
                                </div>
                              </button>
                            ))}
                          {!a.insights.length && (
                            <Empty>
                              {t(
                                "Нет сигналов. Подключите источники и подтвердите записи.",
                                "Белгілер жоқ. Дереккөздерді қосып, жазбаларды растаңыз.",
                              )}
                            </Empty>
                          )}
                          <button
                            className="panel-link"
                            onClick={() => nav("insights")}
                          >
                            {t("Вся аналитика", "Барлық талдау")}
                            <ArrowRight size={15} />
                          </button>
                        </section>
                      </div>
                      <div className="dashboard-bottom">
                        <section className="panel">
                          <div className="panel-heading">
                            <h2>{t("Источники на связи", "Дереккөздер")}</h2>
                            <button
                              className="text-button"
                              onClick={() => nav("connect")}
                            >
                              {t("Управлять", "Басқару")}
                              <ArrowUpRight size={15} />
                            </button>
                          </div>
                          <div className="source-mini-list">
                            {data.sources
                              .filter((s: any) => s.count)
                              .slice(0, 4)
                              .map((s: any) => (
                                <div className="source-mini" key={s.name}>
                                  <span
                                    className="source-icon"
                                    style={{ color: s.color }}
                                  >
                                    {s.letter}
                                  </span>
                                  <div>
                                    <b>{s.title}</b>
                                    <small>
                                      {s.count} {t("записей", "жазба")}
                                    </small>
                                  </div>
                                  <Badge
                                    color={
                                      s.mode === "Demo" ? "muted" : "green"
                                    }
                                  >
                                    {s.mode}
                                  </Badge>
                                </div>
                              ))}
                            {!a.coverage.total && (
                              <Empty>
                                {t(
                                  "Подключите первый источник",
                                  "Бірінші дереккөзді қосыңыз",
                                )}
                              </Empty>
                            )}
                          </div>
                        </section>
                        <section className="panel target-panel">
                          <div className="panel-heading">
                            <h2>{t("Цель по выручке", "Түсім мақсаты")}</h2>
                            <Target size={19} />
                          </div>
                          <div className="target-values">
                            <strong>{money(a.revenue)}</strong>
                            <span>
                              / {money(Number(data.org.revenue_target))}
                            </span>
                          </div>
                          <div className="progress">
                            <span
                              style={{
                                width:
                                  Math.min(
                                    100,
                                    Math.max(
                                      0,
                                      (a.revenue /
                                        Number(data.org.revenue_target)) *
                                        100,
                                    ),
                                  ) + "%",
                              }}
                            />
                          </div>
                          <div className="target-caption">
                            <span>
                              {Math.round(
                                (a.revenue / Number(data.org.revenue_target)) *
                                  100,
                              )}
                              % {t("от цели", "мақсаттан")}
                            </span>
                            <span>
                              {days} {t("дней", "күн")}
                            </span>
                          </div>
                          <p>
                            {t(
                              "Цель сравнивается с выбранным периодом. Это факт, а не прогноз.",
                              "Мақсат таңдалған кезеңмен салыстырылады. Бұл болжам емес, нақты дерек.",
                            )}
                          </p>
                          <button
                            className="text-button"
                            onClick={() => nav("growth")}
                          >
                            {t("Перейти к плану роста", "Өсу жоспарына өту")}
                            <ArrowRight size={15} />
                          </button>
                        </section>
                      </div>
                    </details>
                  )}
                </>
              )}
              {section === "connect" && (
                <>
                  <section className="connect-welcome">
                    <div>
                      <span className="pixel-kicker">
                        {t("ПЕРВЫЕ ШАГИ С AQYL", "AQYL-МЕН АЛҒАШҚЫ ҚАДАМДАР")}
                      </span>
                      <h2>
                        {t(
                          "Один отчёт — и начнём разбираться.",
                          "Бір есептен бастайық.",
                        )}
                      </h2>
                      <p>
                        {t(
                          "Загрузите данные, проверьте записи — AQYL автоматически обновит разбор.",
                          "Деректерді жүктеп, жазбаларды тексеріңіз — AQYL талдауды автоматты жаңартады.",
                        )}
                      </p>
                      <div className="setup-steps">
                        <span className="complete">
                          <CheckCircle2 size={16} />
                          {t("Аккаунт готов", "Аккаунт дайын")}
                        </span>
                        <span className="current">
                          <span>02</span>
                          {t("Подключите источник", "Дереккөзді қосыңыз")}
                        </span>
                        <button onClick={() => nav("overview")}>
                          {t("К обзору бизнеса", "Бизнеске шолу")}
                          <ArrowRight size={15} />
                        </button>
                      </div>
                    </div>
                    <Robot
                      size={132}
                      state={
                        busy
                          ? "thinking"
                          : data.sources.some((s: any) => s.connection)
                            ? "success"
                            : "greeting"
                      }
                    />
                  </section>
                  {owner && (
                    <div className="data-entry-options">
                      <button
                        onClick={() =>
                          open({ type: "import", source: "POS", kind: "sale" })
                        }
                      >
                        <Upload size={25} />
                        <b>{t("Загрузить таблицу", "Кестені жүктеу")}</b>
                        <span>
                          {t(
                            "Excel или CSV из кассы и других сервисов",
                            "Касса мен басқа сервистерден Excel немесе CSV",
                          )}
                        </span>
                        <ArrowRight size={18} />
                      </button>
                      <button onClick={() => open({ type: "manual" })}>
                        <Receipt size={25} />
                        <b>
                          {t(
                            "Добавить запись или чек",
                            "Жазба немесе чек қосу",
                          )}
                        </b>
                        <span>
                          {t(
                            "Продажа, расход или фото документа",
                            "Сату, шығын немесе құжат фотосы",
                          )}
                        </span>
                        <ArrowRight size={18} />
                      </button>
                    </div>
                  )}
                  <div className="section-intro">
                    <div>
                      <ShieldCheck size={21} />
                      <span>
                        {t(
                          "Сначала проверьте записи. Только подтверждённые данные участвуют в анализе.",
                          "Алдымен жазбаларды тексеріңіз. Талдауға тек расталған деректер қатысады.",
                        )}
                      </span>
                    </div>
                    <button
                      className="secondary"
                      onClick={() => {
                        setFilter("pending");
                        document
                          .getElementById("records")
                          ?.scrollIntoView({ behavior: "smooth" });
                      }}
                    >
                      {a.coverage.pending} {t("на проверке", "тексеруде")}
                      <ArrowRight size={15} />
                    </button>
                  </div>
                  <details className="source-options">
                    <summary>
                      {t("Сервисы и подключения", "Сервистер мен қосылымдар")}
                      <span>
                        {t(
                          "UMAG, WhatsApp, Instagram, TikTok, 2GIS, сайт",
                          "UMAG, WhatsApp, Instagram, TikTok, 2GIS, сайт",
                        )}
                      </span>
                    </summary>
                    <p className="source-explainer">
                      {t(
                        "Файлы и заказы сайта дают реальные данные. Подключения по номеру или ссылке показывают демо-сценарий; для автоматического доступа нужны официальные API сервисов.",
                        "Файлдар мен сайт тапсырыстары нақты деректер береді. Нөмір немесе сілтеме арқылы қосылу — демо-сценарий; автоматты қолжетімділік үшін сервистердің ресми API-лері қажет.",
                      )}
                    </p>
                    <div className="sources-grid">
                      {data.sources.map((s: any) => (
                        <article className="panel source-card" key={s.name}>
                          <div className="source-card-top">
                            <span
                              className="source-icon large"
                              style={{ color: s.color }}
                            >
                              {s.letter}
                            </span>
                            <Badge
                              color={
                                s.mode === "Disconnected"
                                  ? "muted"
                                  : s.mode === "Demo"
                                    ? "amber"
                                    : "green"
                              }
                            >
                              {s.mode === "Disconnected"
                                ? t("Не подключено", "Қосылмаған")
                                : s.mode === "Demo"
                                  ? t("Демо", "Демо")
                                  : s.mode === "File Import"
                                    ? t("Файл", "Файл")
                                    : s.mode === "Manual"
                                      ? t("Вручную", "Қолмен")
                                      : s.mode}
                            </Badge>
                          </div>
                          <h3>{s.title}</h3>
                          <p>{s.description}</p>
                          <div className="source-meta">
                            <span>
                              {s.count} {t("записей", "жазба")}
                            </span>
                            <span>
                              {s.last
                                ? fmtDate(s.last)
                                : t("Нет обновлений", "Жаңарту жоқ")}
                            </span>
                          </div>
                          {s.connection && (
                            <p className="connection-identity">
                              <CheckCircle2 size={13} />
                              {s.connection.identifier}
                            </p>
                          )}
                          {owner && s.name !== "Расходы" && (
                            <button
                              className="primary full"
                              onClick={() =>
                                open({ type: "connector", source: s })
                              }
                            >
                              <Plug size={15} />
                              {s.connection
                                ? t(
                                    "Демо подключено · управлять",
                                    "Демо қосылды · басқару",
                                  )
                                : t("Подключить демо", "Демоны қосу")}
                            </button>
                          )}
                          {owner && (
                            <button
                              className="secondary full"
                              onClick={() =>
                                s.name === "Сайт"
                                  ? action(async () => {
                                      setWebhook(await api("webhook/settings"));
                                      open({ type: "webhook" });
                                    })
                                  : open({
                                      type: "import",
                                      source: s.name,
                                      kind: s.kind,
                                    })
                              }
                            >
                              {s.name === "Сайт"
                                ? t("Настроить Webhook", "Webhook баптау")
                                : t("Импортировать файл", "Файл импорттау")}
                              {s.name === "Сайт" ? (
                                <Plug size={15} />
                              ) : (
                                <Upload size={15} />
                              )}
                            </button>
                          )}
                        </article>
                      ))}
                    </div>
                  </details>
                  <section className="panel records-panel" id="records">
                    <div className="panel-heading">
                      <div>
                        <h2>
                          {t(
                            "Проверка и история записей",
                            "Жазбаларды тексеру және тарихы",
                          )}
                        </h2>
                        <p>
                          {t(
                            "Неподтвержденные записи и дубликаты не участвуют в расчетах.",
                            "Расталмаған және қайталанған жазбалар есепке алынбайды.",
                          )}
                        </p>
                      </div>
                      {owner && a.coverage.pending > 0 && (
                        <button
                          className="secondary"
                          disabled={busy}
                          onClick={() => open({ type: "bulk" })}
                        >
                          <Check size={16} />
                          {t(
                            "Подтвердить без совпадений",
                            "Сәйкестігі жоқтарын растау",
                          )}
                        </button>
                      )}
                    </div>
                    <div className="table-toolbar">
                      <div className="search">
                        <Search size={16} />
                        <input
                          placeholder={t(
                            "Найти по ID, источнику или тексту",
                            "ID, дереккөз немесе мәтін бойынша іздеу",
                          )}
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                        />
                      </div>
                      <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                      >
                        <option value="all">
                          {t("Все записи", "Барлық жазба")}
                        </option>
                        <option value="pending">
                          {t("На проверке", "Тексеруде")}
                        </option>
                        <option value="verified">
                          {t("Подтвержденные", "Расталған")}
                        </option>
                        <option value="duplicate">
                          {t("Дубликаты", "Қайталанған")}
                        </option>
                      </select>
                    </div>
                    <div className="table-wrap">
                      <table>
                        <thead>
                          <tr>
                            {[
                              t("Запись / дата", "Жазба / күн"),
                              t("Источник", "Дереккөз"),
                              t("Тип", "Түрі"),
                              t("Сумма", "Сома"),
                              t("Статус", "Күйі"),
                              "",
                            ].map((h, i) => (
                              <th key={i}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {data.events
                            .filter(
                              (e: Event) =>
                                (filter === "all" ||
                                  (filter === "pending" &&
                                    !e.verified &&
                                    !e.duplicate_of) ||
                                  (filter === "verified" && e.verified) ||
                                  (filter === "duplicate" && e.duplicate_of)) &&
                                JSON.stringify(e)
                                  .toLowerCase()
                                  .includes(query.toLowerCase()),
                            )
                            .map((e: Event) => (
                              <tr key={e.id}>
                                <td>
                                  <b>{e.external_id}</b>
                                  <small>{fmtDate(e.occurred_at)}</small>
                                </td>
                                <td>{e.source}</td>
                                <td>{kind(e.kind)}</td>
                                <td className="number">
                                  {["lead", "review"].includes(e.kind)
                                    ? "—"
                                    : money(Number(e.amount))}
                                </td>
                                <td>
                                  <Badge
                                    color={
                                      e.duplicate_of
                                        ? "muted"
                                        : e.verified
                                          ? "green"
                                          : "amber"
                                    }
                                  >
                                    {e.duplicate_of
                                      ? t("Дубликат", "Қайталанған")
                                      : e.verified
                                        ? t("Проверено", "Тексерілді")
                                        : e.payload.candidates?.length
                                          ? t("Совпадение", "Сәйкестік")
                                          : t("На проверке", "Тексеруде")}
                                  </Badge>
                                </td>
                                <td>
                                  <button
                                    className="text-button"
                                    onClick={() =>
                                      open({ type: "record", event: e })
                                    }
                                  >
                                    {t("Открыть", "Ашу")}
                                    <ArrowUpRight size={14} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                      {!data.events.length && (
                        <Empty>
                          {t(
                            "Загрузите отчет или добавьте операцию вручную.",
                            "Есеп жүктеңіз немесе операцияны қолмен қосыңыз.",
                          )}
                        </Empty>
                      )}
                    </div>
                  </section>
                </>
              )}
              {section === "insights" && (
                <>
                  <div className="section-intro">
                    <div>
                      <Sparkles size={20} />
                      <span>
                        {t(
                          "AQYL · Проверяемые правила и точные расчеты",
                          "AQYL · Тексерілетін ережелер және дәл есептер",
                        )}
                      </span>
                    </div>
                    <Badge color={data.ai.enabled ? "green" : "muted"}>
                      {data.ai.enabled
                        ? "LLM enabled"
                        : t(
                            "Без LLM · аналитика работает",
                            "LLM жоқ · талдау жұмыс істейді",
                          )}
                    </Badge>
                  </div>
                  <div className="insights-grid">
                    {a.insights.map((i: Insight) => (
                      <article className="panel insight-card" key={i.id}>
                        <div className="source-card-top">
                          <span className="signal-icon amber">
                            <AlertTriangle size={20} />
                          </span>
                          <Badge
                            color={i.severity === "high" ? "amber" : "green"}
                          >
                            {i.severity === "high"
                              ? t("Высокий приоритет", "Жоғары басымдық")
                              : t("Средний приоритет", "Орташа басымдық")}
                          </Badge>
                        </div>
                        <h2>{insightTitle(i)}</h2>
                        <p>{insightFact(i)}</p>
                        <div className="insight-evidence">
                          <Database size={14} />
                          {i.evidence.length}{" "}
                          {t("исходных записей", "бастапқы жазба")} · {days}{" "}
                          {t("дней", "күн")}
                        </div>
                        <button
                          className="secondary full"
                          onClick={() => open({ type: "evidence", insight: i })}
                        >
                          {t(
                            "Почему AQYL так считает",
                            "AQYL неге бұлай есептейді",
                          )}
                          <ArrowRight size={16} />
                        </button>
                      </article>
                    ))}
                  </div>
                  {!a.insights.length && (
                    <Empty>
                      {t(
                        "Недостаточно подтвержденных данных для сигналов.",
                        "Белгілер үшін расталған деректер жеткіліксіз.",
                      )}
                    </Empty>
                  )}
                  <div className="dashboard-bottom">
                    <section className="panel padded">
                      <h2>
                        {t("Метрики и формулы", "Көрсеткіштер мен формулалар")}
                      </h2>
                      <dl className="metric-list">
                        <div>
                          <dt>{t("Средний чек", "Орташа чек")}</dt>
                          <dd>{money(a.average)}</dd>
                        </div>
                        <div>
                          <dt>
                            {t(
                              "Конверсия связанных обращений",
                              "Байланысқан өтініштер конверсиясы",
                            )}
                          </dt>
                          <dd>
                            {a.conversion === null ? "—" : a.conversion + "%"}
                          </dd>
                        </div>
                        <div>
                          <dt>
                            {t(
                              "Первый ответ, среднее",
                              "Алғашқы жауап, орташа",
                            )}
                          </dt>
                          <dd>
                            {a.responseMinutes === null
                              ? "—"
                              : a.responseMinutes + " мин"}
                          </dd>
                        </div>
                        <div>
                          <dt>
                            {t(
                              "Результат после расходов",
                              "Шығыннан кейінгі нәтиже",
                            )}
                          </dt>
                          <dd>{a.net === null ? "—" : money(a.net)}</dd>
                        </div>
                      </dl>
                      <div className="formula-list">
                        {Object.entries(a.formulas).map(([k, v]) => (
                          <p key={k}>
                            <code>{k}</code>
                            {String(v)}
                          </p>
                        ))}
                      </div>
                    </section>
                    <section className="panel padded">
                      <h2>
                        {t("Маркетинг и репутация", "Маркетинг және бедел")}
                      </h2>
                      {a.campaigns.map((c: any) => (
                        <div className="campaign" key={c.id}>
                          <b>{c.name}</b>
                          <p>
                            {c.orders}{" "}
                            {t("связанных оплат", "байланысқан төлем")} ·{" "}
                            {money(c.revenue)}
                          </p>
                          <small>
                            {t("Бюджет кампании", "Науқан бюджеті")}:{" "}
                            {money(c.spend)} · {c.views}{" "}
                            {t("просмотров", "қаралым")}
                          </small>
                        </div>
                      ))}
                      <p className="muted">
                        {t(
                          "Просмотры не считаются продажами. Расходы кампании не суммируются повторно с финансовыми операциями.",
                          "Қаралымдар сату болып саналмайды. Науқан шығыны қаржылық операцияларға қайта қосылмайды.",
                        )}
                      </p>
                      <div className="theme-tags">
                        {a.reviewThemes.map((r: any) => (
                          <Badge color="muted" key={r.name}>
                            {r.name} · {r.count}
                          </Badge>
                        ))}
                      </div>
                      <div className="hint">
                        {t(
                          "Темы отзывов определены по ключевым словам. Числовой прогноз: недостаточно истории и подтверждений полноты.",
                          "Пікір тақырыптары кілт сөздер арқылы анықталған. Сандық болжам үшін тарих пен толықтық растауы жеткіліксіз.",
                        )}
                      </div>
                    </section>
                  </div>
                </>
              )}
              {section === "growth" && (
                <>
                  <section className="plan-hero">
                    <Robot size={110} state={busy ? "thinking" : "greeting"} />
                    <div>
                      <span className="eyebrow">AQYL GROWTH PLANNER</span>
                      <h2>
                        {t(
                          "Понятный план. Ответственный за каждый шаг.",
                          "Түсінікті жоспар. Әр қадамға жауапты адам.",
                        )}
                      </h2>
                      <p>
                        {t(
                          "План строится по текущим сигналам. Отредактируйте задачи перед утверждением.",
                          "Жоспар ағымдағы белгілерге негізделеді. Бекітпес бұрын тапсырмаларды өңдеңіз.",
                        )}
                      </p>
                    </div>
                    {owner && (
                      <div className="plan-buttons">
                        {[7, 30].map((n) => (
                          <button
                            key={n}
                            className={n === 7 ? "primary" : "secondary"}
                            disabled={busy}
                            onClick={() =>
                              action(
                                () => api("plans", { days: n, language }),
                                t(
                                  "Черновик плана создан",
                                  "Жоспар жобасы жасалды",
                                ),
                              )
                            }
                          >
                            <Plus size={15} />
                            {n} {t("дней", "күн")}
                          </button>
                        ))}
                      </div>
                    )}
                  </section>
                  {data.plans.map((p: any) => (
                    <section className="panel plan-section" key={p.id}>
                      <div className="panel-heading">
                        <div>
                          <h2>
                            {t("Мои дела", "Өсу жоспары")} · {p.days}{" "}
                            {t("дней", "күн")}
                          </h2>
                          <p>
                            {fmtDate(p.created_at)} ·{" "}
                            {t(
                              "Правила AQYL, без генерации финансовых обещаний",
                              "AQYL ережелері, қаржылық уәделерсіз",
                            )}
                          </p>
                        </div>
                        <div className="inline-actions">
                          <Badge
                            color={p.status === "draft" ? "amber" : "green"}
                          >
                            {status(p.status)}
                          </Badge>
                          {owner && p.status === "draft" && (
                            <button
                              className="primary"
                              disabled={busy}
                              onClick={() => open({ type: "approve", plan: p })}
                            >
                              <Check size={16} />
                              {t("Утвердить план", "Жоспарды бекіту")}
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="tasks-list">
                        {data.tasks
                          .filter((task: Task) => task.plan_id === p.id)
                          .map((task: Task) => (
                            <article className="task-card" key={task.id}>
                              <div className="task-main">
                                <span
                                  className={"task-indicator " + task.status}
                                >
                                  {["completed", "verified"].includes(
                                    task.status,
                                  ) ? (
                                    <Check size={16} />
                                  ) : (
                                    <span />
                                  )}
                                </span>
                                <div>
                                  <h3>{task.title}</h3>
                                  <p>{task.description}</p>
                                  <div className="task-meta">
                                    <span>
                                      <Users size={13} />
                                      {
                                        data.members.find(
                                          (m: any) => m.id === task.assignee,
                                        )?.name
                                      }
                                    </span>
                                    <span>
                                      <CalendarDays size={13} />
                                      {fmtDate(task.due_at)}
                                    </span>
                                    <span>
                                      {metricName(task.metric)}:{" "}
                                      {metricValue(task.metric, task.baseline)}{" "}
                                      → {metricValue(task.metric, task.target)}
                                    </span>
                                  </div>
                                  <details>
                                    <summary>
                                      {t(
                                        "Ресурсы и способ измерения",
                                        "Ресурстар және өлшеу тәсілі",
                                      )}
                                    </summary>
                                    <p>{task.resources}</p>
                                    <p>{task.measurement}</p>
                                    <p>
                                      {t("Доказательств", "Дәлелдер")}:{" "}
                                      {task.evidence.length}
                                    </p>
                                  </details>
                                </div>
                              </div>
                              <div className="task-actions">
                                <Badge
                                  color={
                                    task.status === "draft" ? "muted" : "green"
                                  }
                                >
                                  {status(task.status)}
                                </Badge>
                                {owner && task.status === "draft" && (
                                  <button
                                    className="text-button"
                                    onClick={() => open({ type: "task", task })}
                                  >
                                    {t("Редактировать", "Өңдеу")}
                                  </button>
                                )}
                                {(owner ||
                                  (data.user.role === "manager" &&
                                    task.assignee === data.user.user_id)) &&
                                  ["approved", "in_progress"].includes(
                                    task.status,
                                  ) && (
                                    <button
                                      disabled={busy}
                                      className="secondary"
                                      onClick={() =>
                                        action(
                                          () =>
                                            api("tasks/status", {
                                              id: task.id,
                                              status:
                                                task.status === "approved"
                                                  ? "in_progress"
                                                  : "completed",
                                            }),
                                          t(
                                            "Статус обновлен",
                                            "Күй жаңартылды",
                                          ),
                                        )
                                      }
                                    >
                                      {task.status === "approved"
                                        ? t("Начать", "Бастау")
                                        : t("Завершить", "Аяқтау")}
                                    </button>
                                  )}
                                {owner && task.status === "completed" && (
                                  <button
                                    className="secondary"
                                    disabled={busy}
                                    onClick={() =>
                                      action(async () => {
                                        const r = await api("results/check", {
                                          id: task.id,
                                        });
                                        setToast(r.message);
                                        nav("results");
                                      })
                                    }
                                  >
                                    {t(
                                      "Проверить результат",
                                      "Нәтижені тексеру",
                                    )}
                                  </button>
                                )}
                                {owner &&
                                  ["draft", "approved", "in_progress"].includes(
                                    task.status,
                                  ) && (
                                    <button
                                      className="text-button subtle"
                                      disabled={busy}
                                      onClick={() =>
                                        action(
                                          () =>
                                            api("tasks/status", {
                                              id: task.id,
                                              status:
                                                task.status === "draft"
                                                  ? "rejected"
                                                  : "cancelled",
                                            }),
                                          t(
                                            "Задача отменена",
                                            "Тапсырма тоқтатылды",
                                          ),
                                        )
                                      }
                                    >
                                      {t("Отменить", "Болдырмау")}
                                    </button>
                                  )}
                              </div>
                            </article>
                          ))}
                      </div>
                    </section>
                  ))}
                  {!data.plans.length && (
                    <Empty>
                      {t(
                        "Сформируйте первый план на основе подтвержденных сигналов.",
                        "Расталған белгілер негізінде алғашқы жоспарды жасаңыз.",
                      )}
                    </Empty>
                  )}
                </>
              )}
              {section === "results" && (
                <>
                  <div className="stats-grid">
                    <Stat
                      label={t("Всего задач", "Барлық тапсырма")}
                      value={String(data.tasks.length)}
                      detail={t("в планах компании", "компания жоспарларында")}
                      icon={<Route size={18} />}
                    />
                    <Stat
                      label={t("Выполнено", "Орындалды")}
                      value={String(
                        data.tasks.filter((x: Task) =>
                          ["completed", "verified"].includes(x.status),
                        ).length,
                      )}
                      detail={t("выполнение ≠ эффект", "орындалу ≠ әсер")}
                      icon={<CheckCircle2 size={18} />}
                    />
                    <Stat
                      label={t("Проверок результата", "Нәтиже тексерулері")}
                      value={String(data.outcomes.length)}
                      detail={t(
                        "с историей доказательств",
                        "дәлелдер тарихымен",
                      )}
                      icon={<ShieldCheck size={18} />}
                    />
                    <Stat
                      label={t("Эффект от AI", "AI әсері")}
                      value="—"
                      detail={t(
                        "причинная связь не установлена",
                        "себептік байланыс анықталмаған",
                      )}
                      icon={<Sparkles size={18} />}
                    />
                  </div>
                  <div className="section-intro">
                    <div>
                      <ShieldCheck size={20} />
                      <span>
                        {t(
                          "Фактическое изменение показателя не доказывает влияние AI. Оценки и факты разделены.",
                          "Көрсеткіштің өзгеруі AI әсерін дәлелдемейді. Бағалау мен нақты дерек бөлек.",
                        )}
                      </span>
                    </div>
                    <button
                      className="secondary"
                      onClick={() =>
                        download("bagyt-results.json", {
                          period: a.period,
                          metrics: a,
                          outcomes: data.outcomes,
                        })
                      }
                    >
                      <Download size={16} />
                      {t("Скачать отчет", "Есепті жүктеу")}
                    </button>
                  </div>
                  <section className="panel padded">
                    <h2>{t("Измеренные результаты", "Өлшенген нәтижелер")}</h2>
                    {data.outcomes.map((o: any) => (
                      <div className="outcome" key={o.id}>
                        <div>
                          <b>
                            {
                              data.tasks.find((x: Task) => x.id === o.task_id)
                                ?.title
                            }
                          </b>
                          <p>
                            {fmtDate(o.created_at)} · {t("До", "Бұрын")}:{" "}
                            {metricValue(
                              data.tasks.find((x: Task) => x.id === o.task_id)
                                ?.metric,
                              o.baseline,
                            )}{" "}
                            → {t("После", "Кейін")}:{" "}
                            {metricValue(
                              data.tasks.find((x: Task) => x.id === o.task_id)
                                ?.metric,
                              o.actual,
                            )}{" "}
                            · {t("Цель", "Мақсат")}:{" "}
                            {metricValue(
                              data.tasks.find((x: Task) => x.id === o.task_id)
                                ?.metric,
                              o.target,
                            )}
                          </p>
                          <small>
                            {o.evidence.length}{" "}
                            {t("новых записей", "жаңа жазба")}
                          </small>
                        </div>
                        <Badge
                          color={o.verdict === "target_met" ? "green" : "amber"}
                        >
                          {o.verdict === "target_met"
                            ? t("Цель достигнута", "Мақсат орындалды")
                            : o.verdict === "target_not_met"
                              ? t("Цель не достигнута", "Мақсат орындалмады")
                              : t("Недостаточно данных", "Дерек жеткіліксіз")}
                        </Badge>
                      </div>
                    ))}
                    {!data.outcomes.length && (
                      <Empty>
                        {t(
                          "Завершите задачу и запустите проверку результата из плана роста.",
                          "Тапсырманы аяқтап, өсу жоспарынан нәтижені тексеріңіз.",
                        )}
                      </Empty>
                    )}
                  </section>
                  <div className="dashboard-bottom">
                    <div className="panel padded">
                      <h2>{t("Потенциальный эффект", "Ықтимал әсер")}</h2>
                      <p className="muted">
                        {t(
                          "Не рассчитан: нет достаточных оснований для денежной оценки.",
                          "Есептелмеген: ақшалай бағалау үшін негіз жеткіліксіз.",
                        )}
                      </p>
                    </div>
                    <div className="panel padded">
                      <h2>
                        {t(
                          "Экономия рабочего времени",
                          "Жұмыс уақытын үнемдеу",
                        )}
                      </h2>
                      <p className="muted">
                        {t(
                          "Не измерена: нужны подтвержденные замеры до и после.",
                          "Өлшенбеген: бұрынғы және кейінгі уақыт өлшемдері қажет.",
                        )}
                      </p>
                    </div>
                  </div>
                </>
              )}
              {section === "settings" && (
                <>
                  <div className="settings-grid">
                    <section className="panel padded">
                      <h2>{t("Ваша организация", "Сіздің ұйымыңыз")}</h2>
                      <form
                        onSubmit={(e) => {
                          const b = form(e);
                          action(
                            () => api("settings", b),
                            t("Настройки сохранены", "Баптаулар сақталды"),
                          );
                        }}
                      >
                        <label>
                          {t("Название", "Атауы")}
                          <input
                            name="name"
                            defaultValue={data.org.name}
                            required
                            disabled={!owner}
                          />
                        </label>
                        <label>
                          {t("Город", "Қала")}
                          <input
                            name="city"
                            defaultValue={data.org.city}
                            required
                            disabled={!owner}
                          />
                        </label>
                        <label>
                          {t(
                            "Цель по выручке за выбранный период, ₸",
                            "Таңдалған кезең түсімінің мақсаты, ₸",
                          )}
                          <input
                            name="revenue_target"
                            type="number"
                            min="1"
                            step="0.01"
                            defaultValue={Number(data.org.revenue_target) / 100}
                            required
                            disabled={!owner}
                          />
                        </label>
                        {owner && (
                          <button className="primary" disabled={busy}>
                            {t("Сохранить изменения", "Өзгерістерді сақтау")}
                          </button>
                        )}
                      </form>
                    </section>
                    <section className="panel padded">
                      <div className="panel-heading">
                        <h2>
                          {t("Команда и доступ", "Команда және қолжетімділік")}
                        </h2>
                        {owner && (
                          <button
                            className="icon-button"
                            aria-label={t(
                              "Добавить сотрудника",
                              "Қызметкер қосу",
                            )}
                            onClick={() => open({ type: "member" })}
                          >
                            <Plus size={19} />
                          </button>
                        )}
                      </div>
                      {data.members.map((m: any) => (
                        <div className="member-row" key={m.id}>
                          <span className="avatar">{m.name.slice(0, 1)}</span>
                          <div>
                            <b>{m.name}</b>
                            <small>{m.email}</small>
                          </div>
                          <Badge color="muted">{m.role}</Badge>
                        </div>
                      ))}
                      {data.org.demo && (
                        <div className="demo-role">
                          <label>
                            {t("Демо: проверить роль", "Демо: рөлді тексеру")}
                            <select
                              value={data.user.role}
                              onChange={(e) =>
                                action(
                                  () =>
                                    api("demo/role", { role: e.target.value }),
                                  t("Роль изменена", "Рөл өзгертілді"),
                                )
                              }
                            >
                              {["owner", "manager", "viewer"].map((r) => (
                                <option key={r}>{r}</option>
                              ))}
                            </select>
                          </label>
                          <small>
                            {t(
                              "Доступно только в синтетической компании.",
                              "Тек синтетикалық компанияда қолжетімді.",
                            )}
                          </small>
                        </div>
                      )}
                    </section>
                  </div>
                  <section className="panel padded runtime-panel">
                    <h2>
                      {t("Работающие подключения", "Жұмыс істейтін қосылымдар")}
                    </h2>
                    <div className="runtime-grid">
                      <div>
                        <Database size={20} />
                        <b>{t("Хранение данных", "Деректерді сақтау")}</b>
                        <Badge>
                          {data.storage === "cloud"
                            ? t("Облако подключено", "Бұлт қосылған")
                            : t("На компьютере", "Компьютерде")}
                        </Badge>
                      </div>
                      <div>
                        <FileText size={20} />
                        <b>{t("Распознавание чеков", "Чектерді тану")}</b>
                        <span>PNG · JPEG · RU / EN</span>
                      </div>
                      <div>
                        <Sparkles size={20} />
                        <b>{t("Диалог с AQYL", "AQYL-мен диалог")}</b>
                        <Badge color={data.ai.enabled ? "green" : "muted"}>
                          {data.ai.enabled
                            ? t("Подключено", "Қосылған")
                            : t("Не подключено", "Қосылмаған")}
                        </Badge>
                      </div>
                      <div>
                        <ShieldCheck size={20} />
                        <b>
                          {t("Изоляция компаний", "Компанияларды оқшаулау")}
                        </b>
                        <span>
                          {t(
                            "Доступ только вашей команде",
                            "Тек командаңызға қолжетімді",
                          )}
                        </span>
                      </div>
                    </div>
                    <p className="muted">
                      {t(
                        "Расчеты, сигналы и планы работают по проверенным данным. Диалог с AI подключается отдельно. Социальные сервисы доступны в демо-режиме и через импорт файлов.",
                        "Есептер, белгілер мен жоспарлар тексерілген деректерге сүйенеді. AI-мен диалог бөлек қосылады. Әлеуметтік сервистер демо режимінде және файл импорты арқылы қолжетімді.",
                      )}
                    </p>
                  </section>
                  {owner && (
                    <section className="panel records-panel">
                      <div className="panel-heading">
                        <h2>{t("Журнал действий", "Әрекеттер журналы")}</h2>
                        <button
                          className="text-button"
                          onClick={() =>
                            download("bagyt-audit.json", data.audit)
                          }
                        >
                          <Download size={15} />
                          {t("Экспорт", "Экспорт")}
                        </button>
                      </div>
                      <div className="table-wrap">
                        <table>
                          <thead>
                            <tr>
                              <th>{t("Время", "Уақыт")}</th>
                              <th>{t("Действие", "Әрекет")}</th>
                              <th>{t("Пользователь", "Пайдаланушы")}</th>
                              <th>ID</th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.audit.map((r: any) => (
                              <tr key={r.id}>
                                <td>
                                  {new Date(r.created_at).toLocaleString(
                                    "ru-RU",
                                    { timeZone: "Asia/Qyzylorda" },
                                  )}
                                </td>
                                <td>
                                  <code>{r.action}</code>
                                </td>
                                <td>
                                  {data.members.find(
                                    (m: any) => m.id === r.user_id,
                                  )?.name || r.user_id}
                                </td>
                                <td className="mono">
                                  {r.entity_id?.slice(0, 12) || "—"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </section>
                  )}
                </>
              )}
              <div className="workspace-footer">
                <span>
                  <ShieldCheck size={13} />
                  {t(
                    "Проверенные данные. Осознанные решения.",
                    "Тексерілген деректер. Саналы шешімдер.",
                  )}
                </span>
                <span>
                  BAGYT AI <span className="footer-dot">•</span> BUSINESS
                  WORKSPACE
                </span>
              </div>
            </main>
          </div>
        </div>
      )}
      {notices}
      {modal && (
        <Modal
          wide={["import", "evidence", "record", "register"].includes(
            modal.type,
          )}
          title={
            modal.type === "connector"
              ? t("Подключение источника", "Дереккөзді қосу")
              : modal.type === "login"
                ? t("С возвращением", "Қайта қош келдіңіз")
                : modal.type === "register"
                  ? t("Создать рабочее пространство", "Жұмыс кеңістігін құру")
                  : modal.type === "demo"
                    ? t("Выберите демо-бизнес", "Демо-бизнесті таңдаңыз")
                    : modal.type === "import"
                      ? t("Добавить отчёт", "Есеп қосу")
                      : modal.type === "manual"
                        ? t("Добавить операцию", "Операция қосу")
                        : modal.type === "chat"
                          ? "AQYL · " + t("Помощник", "Көмекші")
                          : modal.type === "evidence"
                            ? t(
                                "Факты и доказательства",
                                "Деректер мен дәлелдер",
                              )
                            : modal.type === "record"
                              ? t("Проверка записи", "Жазбаны тексеру")
                              : modal.type === "webhook"
                                ? "Website Webhook"
                                : modal.type === "task"
                                  ? t(
                                      "Редактировать задачу",
                                      "Тапсырманы өңдеу",
                                    )
                                  : modal.type === "member"
                                    ? t("Добавить сотрудника", "Қызметкер қосу")
                                    : t("Подтверждение", "Растау")
          }
          onClose={close}
        >
          {error && (
            <div className="form-error" role="alert">
              {error}
            </div>
          )}
          {modal.type === "register" && (
            <Onboarding
              language={language}
              onLogin={() => open({ type: "login" })}
              onComplete={async () => {
                setSection("connect");
                await reload();
                close();
                setToast(
                  t(
                    "Добро пожаловать! Подключим первый источник.",
                    "Қош келдіңіз! Бірінші дереккөзді қосайық.",
                  ),
                );
              }}
            />
          )}
          {modal.type === "login" && (
            <form
              onSubmit={(e) => {
                const b = form(e);
                action(
                  async () => {
                    await api("auth/" + modal.type, b);
                    if (modal.type === "register") setSection("connect");
                  },
                  undefined,
                  true,
                );
              }}
            >
              <div className="auth-welcome">
                <Robot size={74} />
                <p>
                  {modal.type === "register"
                    ? t(
                        "Три поля — и ваше рабочее пространство готово. Источники подключите позже.",
                        "Үш өріс — жұмыс кеңістігі дайын. Дереккөздерді кейін қосасыз.",
                      )
                    : t(
                        "С возвращением. Ваш бизнес уже здесь.",
                        "Қайта қош келдіңіз. Бизнесіңіз осында.",
                      )}
                </p>
              </div>
              {modal.type === "register" && (
                <label>
                  {t("Название бизнеса", "Бизнес атауы")}
                  <input
                    name="organization"
                    required
                    maxLength={100}
                    autoComplete="organization"
                    placeholder="Dala Store"
                  />
                </label>
              )}
              <label>
                Email
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@company.kz"
                />
              </label>
              <label>
                {t("Пароль", "Құпиясөз")}
                <input
                  name="password"
                  type="password"
                  autoComplete={
                    modal.type === "register"
                      ? "new-password"
                      : "current-password"
                  }
                  minLength={modal.type === "register" ? 10 : 1}
                  maxLength={128}
                  required
                  placeholder={
                    modal.type === "register"
                      ? t("Не менее 10 символов", "Кемінде 10 таңба")
                      : "••••••••••"
                  }
                />
              </label>
              <button disabled={busy} className="primary full">
                {busy
                  ? t("Подождите…", "Күтіңіз…")
                  : modal.type === "register"
                    ? t("Создать аккаунт", "Аккаунт құру")
                    : t("Войти", "Кіру")}
                <ArrowRight size={17} />
              </button>
              <button
                type="button"
                className="text-button auth-switch"
                onClick={() =>
                  open({
                    type: modal.type === "register" ? "login" : "register",
                  })
                }
              >
                {modal.type === "register"
                  ? t("Уже есть аккаунт? Войти", "Аккаунтыңыз бар ма? Кіру")
                  : t("Создать новый аккаунт", "Жаңа аккаунт құру")}
              </button>
            </form>
          )}
          {modal.type === "connector" && (
            <Connector
              source={modal.source}
              language={language}
              onDone={reload}
              onClose={close}
            />
          )}
          {modal.type === "demo" && (
            <div className="demo-choices">
              <p className="muted">
                {t(
                  "Создадим отдельную компанию с синтетическими данными. Можно безопасно импортировать, проверять и выполнять задачи.",
                  "Синтетикалық деректері бар жеке компания құрамыз. Импорттау, тексеру және тапсырмаларды орындауға болады.",
                )}
              </p>
              {[
                [
                  "retail",
                  Store,
                  "Dala Store",
                  t(
                    "Магазин · POS, сайт, обращения и расходы",
                    "Дүкен · POS, сайт, өтініштер мен шығындар",
                  ),
                ],
                [
                  "education",
                  GraduationCap,
                  "Bilim Academy",
                  t(
                    "Учебный центр · оплаты, заявки и кампании",
                    "Оқу орталығы · төлем, өтініш және науқандар",
                  ),
                ],
              ].map(([k, Icon, name, desc]: any) => (
                <button
                  className="demo-choice"
                  key={k}
                  disabled={busy}
                  onClick={() => demo(k)}
                >
                  <Icon size={28} />
                  <div>
                    <h3>{name}</h3>
                    <p>{desc}</p>
                  </div>
                  <ArrowRight size={20} />
                </button>
              ))}
              {busy && (
                <p className="muted">
                  {t(
                    "Готовим ваш демо-бизнес…",
                    "Демо-бизнесіңіз дайындалуда…",
                  )}
                </p>
              )}
            </div>
          )}
          {modal.type === "import" && (
            <Importer
              source={modal.source}
              kind={modal.kind}
              t={t}
              onDone={() => {
                close();
                reload();
                setFilter("pending");
                nav("connect");
              }}
            />
          )}
          {modal.type === "manual" && (
            <>
              <div className="manual-ocr">
                <label className="secondary">
                  <Upload size={16} />
                  {busy
                    ? t("Распознаю…", "Танылуда…")
                    : t("Распознать фото квитанции", "Түбіртек суретін тану")}
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    className="hidden-input"
                    disabled={busy}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f)
                        action(async () => {
                          const fd = new FormData();
                          fd.set("file", f);
                          setOcr(await api("ocr", fd));
                        });
                    }}
                  />
                </label>
                <small>PNG / JPEG · 5 MB · Tesseract</small>
              </div>
              {ocr && (
                <div className="ocr-preview">
                  <Badge color="amber">OCR {ocr.confidence}%</Badge>
                  <p>{ocr.warning}</p>
                  <textarea readOnly value={ocr.text} />
                  <a href={ocr.attachment} target="_blank" rel="noreferrer">
                    {t("Исходное фото", "Бастапқы сурет")}
                    <ExternalLink size={13} />
                  </a>
                </div>
              )}
              <form
                key={ocr?.documentId || "manual"}
                onSubmit={(e) => {
                  const b = form(e);
                  const row = {
                    ...b,
                    external_id: "MAN-" + crypto.randomUUID(),
                    text: ocr?.text || b.text || "",
                    ...(ocr?.attachment
                      ? { document_file: ocr.attachment.split("/").pop() }
                      : {}),
                  };
                  action(
                    () => api("manual", { row }),
                    t(
                      "Запись добавлена в очередь проверки",
                      "Жазба тексеру кезегіне қосылды",
                    ),
                    true,
                  );
                }}
              >
                <div className="form-grid">
                  <label>
                    {t("Тип операции", "Операция түрі")}
                    <select name="kind">
                      <option value="expense">{t("Расход", "Шығыс")}</option>
                      <option value="sale">{t("Продажа", "Сату")}</option>
                      <option value="refund">{t("Возврат", "Қайтару")}</option>
                    </select>
                  </label>
                  <label>
                    {t("Дата", "Күн")}
                    <input
                      name="date"
                      type="date"
                      defaultValue={dayKey(new Date())}
                      required
                    />
                  </label>
                </div>
                <div className="form-grid">
                  <label>
                    {t("Сумма, ₸", "Сома, ₸")}
                    <input
                      name="amount"
                      type="number"
                      min="0"
                      max="10000000000"
                      step="0.01"
                      defaultValue={ocr?.amount || ""}
                      required
                    />
                  </label>
                  <label>
                    {t("Себестоимость, ₸", "Өзіндік құн, ₸")}
                    <input
                      name="cost"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder={t("Если известна", "Белгілі болса")}
                    />
                  </label>
                </div>
                <label>
                  {t("Описание", "Сипаттама")}
                  <input
                    name="name"
                    placeholder={t(
                      "Например, доставка товара",
                      "Мысалы, тауар жеткізу",
                    )}
                    required
                  />
                </label>
                <input type="hidden" name="status" value="paid" />
                <label className="checkbox">
                  <input type="checkbox" required />
                  {t(
                    "Сумма, дата и тип операции проверены мной.",
                    "Соманы, күнін және түрін тексердім.",
                  )}
                </label>
                <button disabled={busy} className="primary full">
                  {t("Сохранить для подтверждения", "Растау үшін сақтау")}
                  <ArrowRight size={16} />
                </button>
              </form>
            </>
          )}
          {modal.type === "record" && (
            <>
              <div className="record-header">
                <div>
                  <Badge>{modal.event.source}</Badge>
                  <h3>{modal.event.external_id}</h3>
                </div>
                <strong>{money(Number(modal.event.amount))}</strong>
              </div>
              <div className="form-grid">
                <div className="info-cell">
                  <small>{t("Тип и статус", "Түрі және күйі")}</small>
                  <b>
                    {kind(modal.event.kind)} · {modal.event.status}
                  </b>
                </div>
                <div className="info-cell">
                  <small>{t("Дата", "Күн")}</small>
                  <b>
                    {new Date(modal.event.occurred_at).toLocaleString("ru-RU", {
                      timeZone: "Asia/Qyzylorda",
                    })}
                  </b>
                </div>
              </div>
              {modal.event.payload.document_file && (
                <a
                  className="text-button"
                  href={"/api/document/" + modal.event.payload.document_file}
                  target="_blank"
                  rel="noreferrer"
                >
                  {t("Исходный документ", "Бастапқы құжат")}
                  <ExternalLink size={14} />
                </a>
              )}
              <dl className="metric-list">
                {[
                  [t("Заказ", "Тапсырыс"), modal.event.payload.order_id],
                  [t("Платеж", "Төлем"), modal.event.payload.payment_id],
                  [t("Канал", "Арна"), modal.event.payload.channel],
                  [
                    t("Описание", "Сипаттама"),
                    modal.event.payload.name || modal.event.payload.text,
                  ],
                  [
                    t("Себестоимость", "Өзіндік құн"),
                    modal.event.cost === null
                      ? t("Неизвестна", "Белгісіз")
                      : money(Number(modal.event.cost)),
                  ],
                ]
                  .filter(([, v]) => v)
                  .map(([label, value]) => (
                    <div key={label}>
                      <dt>{label}</dt>
                      <dd
                        style={{
                          fontSize: 12,
                          maxWidth: "65%",
                          overflowWrap: "anywhere",
                        }}
                      >
                        {value}
                      </dd>
                    </div>
                  ))}
              </dl>
              <details style={{ margin: "18px 0" }}>
                <summary>
                  {t("Полная исходная запись", "Толық бастапқы жазба")}
                </summary>
                <pre className="record-json">
                  {JSON.stringify(modal.event.payload, null, 2)}
                </pre>
              </details>
              {modal.event.payload.candidates?.length > 0 &&
                !modal.event.verified &&
                !modal.event.duplicate_of && (
                  <div className="duplicate-warning">
                    <AlertTriangle size={19} />
                    <div>
                      <b>
                        {t(
                          "Найдено возможное совпадение",
                          "Ықтимал сәйкестік табылды",
                        )}
                      </b>
                      <p>
                        {t(
                          "Сравните ID заказа, платежа, сумму и время. Выберите исходную запись только если это одна операция.",
                          "Тапсырыс, төлем ID, сома және уақытты салыстырыңыз. Бір операция болса ғана бастапқы жазбаны таңдаңыз.",
                        )}
                      </p>
                      {modal.event.payload.candidates.map((c: any) => (
                        <div className="duplicate-option" key={c.id}>
                          <span>
                            {c.source} · {c.external_id} ·{" "}
                            {money(Number(c.amount))}
                            <small style={{ display: "block" }}>
                              {
                                data.events.find((e: Event) => e.id === c.id)
                                  ?.payload.payment_id
                              }{" "}
                              ·{" "}
                              {
                                data.events.find((e: Event) => e.id === c.id)
                                  ?.payload.order_id
                              }
                            </small>
                            <small style={{ display: "block" }}>
                              {new Date(
                                data.events.find((e: Event) => e.id === c.id)
                                  ?.occurred_at,
                              ).toLocaleString("ru-RU", {
                                timeZone: "Asia/Qyzylorda",
                              })}
                            </small>
                          </span>
                          {owner && (
                            <button
                              className="secondary"
                              disabled={busy}
                              onClick={() =>
                                action(
                                  () =>
                                    api("verify", {
                                      id: modal.event.id,
                                      decision: "duplicate",
                                      duplicateId: c.id,
                                    }),
                                  t(
                                    "Дубликат исключен из расчетов",
                                    "Қайталану есептен шығарылды",
                                  ),
                                  true,
                                )
                              }
                            >
                              {t("Это дубликат", "Бұл қайталану")}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              {owner && !modal.event.verified && !modal.event.duplicate_of && (
                <button
                  className="primary full"
                  disabled={busy}
                  onClick={() =>
                    action(
                      () =>
                        api("verify", {
                          id: modal.event.id,
                          decision: "confirm",
                        }),
                      t("Запись подтверждена", "Жазба расталды"),
                      true,
                    )
                  }
                >
                  <Check size={16} />
                  {t(
                    "Подтвердить как отдельную операцию",
                    "Бөлек операция ретінде растау",
                  )}
                </button>
              )}
            </>
          )}
          {modal.type === "bulk" && (
            <>
              <p>
                {t(
                  "Будут подтверждены все ожидающие записи без найденных совпадений. Они войдут в расчеты.",
                  "Сәйкестігі жоқ барлық күтілген жазбалар расталып, есепке қосылады.",
                )}
              </p>
              <div className="form-actions">
                <button className="secondary" onClick={close}>
                  {t("Отмена", "Болдырмау")}
                </button>
                <button
                  className="primary"
                  disabled={busy}
                  onClick={() =>
                    action(
                      () =>
                        api("verify/batch", {
                          ids: data.events
                            .filter(
                              (e: Event) =>
                                !e.verified &&
                                !e.duplicate_of &&
                                !e.payload.candidates?.length,
                            )
                            .map((e: Event) => e.id),
                        }),
                      t("Записи подтверждены", "Жазбалар расталды"),
                      true,
                    )
                  }
                >
                  {t("Подтвердить", "Растау")}
                </button>
              </div>
            </>
          )}
          {modal.type === "evidence" && (
            <>
              <Badge color="amber">
                {t("ПРОВЕРЕННЫЙ ФАКТ", "ТЕКСЕРІЛГЕН ДЕРЕК")}
              </Badge>
              <h2 className="evidence-title">{insightTitle(modal.insight)}</h2>
              <p className="evidence-fact">{insightFact(modal.insight)}</p>
              <div className="evidence-info">
                <div>
                  <small>{t("Период", "Кезең")}</small>
                  <b>
                    {fmtDate(a.period.from)} — {fmtDate(a.period.to)}
                  </b>
                </div>
                <div>
                  <small>
                    {t("Предлагаемое действие", "Ұсынылған әрекет")}
                  </small>
                  <b>{modal.insight.action}</b>
                </div>
                <div>
                  <small>{t("Ограничение данных", "Деректер шектеуі")}</small>
                  <p>{modal.insight.limitation}</p>
                </div>
              </div>
              <h3>{t("Исходные записи", "Бастапқы жазбалар")}</h3>
              <div className="evidence-records">
                {modal.insight.evidence.map((id: string) => {
                  const e = data.events.find((e: Event) => e.id === id);
                  return (
                    <button
                      key={id}
                      onClick={() => {
                        if (e) open({ type: "record", event: e });
                        else {
                          close();
                          nav("growth");
                        }
                      }}
                    >
                      <FileText size={15} />
                      <span>{e ? `${e.source} · ${e.external_id}` : id}</span>
                      <span>{e ? fmtDate(e.occurred_at) : ""}</span>
                      <ArrowUpRight size={14} />
                    </button>
                  );
                })}
              </div>
              <button
                className="primary"
                onClick={() => {
                  close();
                  nav("growth");
                }}
              >
                {t("Перейти к плану", "Жоспарға өту")}
                <ArrowRight size={16} />
              </button>
            </>
          )}
          {modal.type === "approve" && (
            <>
              <p>
                {t(
                  "Утверждение создаст активные задачи для выбранных исполнителей. Базовые KPI будут зафиксированы сейчас. Проверьте сроки и целевые значения.",
                  "Бекіту таңдалған орындаушыларға белсенді тапсырмалар жасайды. Бастапқы KPI қазір бекітіледі. Мерзімдер мен мақсаттарды тексеріңіз.",
                )}
              </p>
              <button
                className="primary full"
                disabled={busy}
                onClick={() =>
                  action(
                    () => api("plans/approve", { id: modal.plan.id }),
                    t(
                      "План утвержден. Можно начинать задачи.",
                      "Жоспар бекітілді. Тапсырмаларды бастауға болады.",
                    ),
                    true,
                  )
                }
              >
                <Check size={16} />
                {t("Подтверждаю план", "Жоспарды растаймын")}
              </button>
            </>
          )}
          {modal.type === "task" && (
            <form
              onSubmit={(e) => {
                const b = form(e);
                b.due_at = new Date(String(b.due_at)).toISOString();
                if (modal.task.metric === "expenses")
                  b.target = String(cents(b.target));
                action(
                  () => api("tasks/edit", { ...b, id: modal.task.id }),
                  t("Задача обновлена", "Тапсырма жаңартылды"),
                  true,
                );
              }}
            >
              <label>
                {t("Действие", "Әрекет")}
                <textarea
                  name="title"
                  defaultValue={modal.task.title}
                  required
                />
              </label>
              <div className="form-grid">
                <label>
                  {t("Ответственный", "Жауапты")}
                  <select name="assignee" defaultValue={modal.task.assignee}>
                    {data.members
                      .filter((m: any) => m.role !== "viewer")
                      .map((m: any) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                  </select>
                </label>
                <label>
                  {t("Срок", "Мерзім")}
                  <input
                    name="due_at"
                    type="date"
                    defaultValue={dayKey(modal.task.due_at)}
                    required
                  />
                </label>
              </div>
              <label>
                {t("Целевой KPI", "Мақсатты KPI")} ·{" "}
                {metricName(modal.task.metric)}
                {modal.task.metric === "expenses" ? " (₸)" : ""}
                <input
                  name="target"
                  type="number"
                  step="0.01"
                  defaultValue={
                    modal.task.metric === "expenses"
                      ? Number(modal.task.target) / 100
                      : modal.task.target
                  }
                  required
                />
              </label>
              <label>
                {t("Необходимые ресурсы", "Қажетті ресурстар")}
                <textarea
                  name="resources"
                  defaultValue={modal.task.resources}
                />
              </label>
              <button className="primary full" disabled={busy}>
                {t("Сохранить", "Сақтау")}
              </button>
            </form>
          )}
          {modal.type === "webhook" && webhook && (
            <>
              <p className="muted">
                {t(
                  "Реальный прием заказов с HMAC-подписью. Повторный event_id не создает дубль. Допуск времени — 5 минут.",
                  "HMAC қолтаңбасы бар тапсырыстарды қабылдау. Қайталанған event_id жаңа жазба жасамайды. Уақыт шегі — 5 минут.",
                )}
              </p>
              <label>
                URL
                <input readOnly value={webhook.url} />
              </label>
              <label>
                {t(
                  "Секрет подписи (только владелец)",
                  "Қолтаңба құпиясы (тек иесі)",
                )}
                <input readOnly type="password" value={webhook.secret} />
              </label>
              <button
                className="secondary"
                onClick={() =>
                  action(
                    async () => {
                      await navigator.clipboard.writeText(
                        JSON.stringify(webhook, null, 2),
                      );
                    },
                    t("Настройки скопированы", "Баптаулар көшірілді"),
                  )
                }
              >
                <Copy size={15} />
                {t("Скопировать настройки", "Баптауларды көшіру")}
              </button>
              <button
                className="text-button"
                style={{ marginLeft: 16 }}
                onClick={() =>
                  open({ type: "import", source: "Сайт", kind: "sale" })
                }
              >
                {t("Импорт файла заказов", "Тапсырыстар файлын импорттау")}
                <Upload size={14} />
              </button>
              <pre className="record-json">{`x-bagyt-timestamp: UNIX_SECONDS\nx-bagyt-signature: HMAC_SHA256(secret, timestamp + "." + rawBody)\n\n{\n  "event_id": "unique-event-id",\n  "order": {\n    "external_id": "ORDER-001",\n    "kind": "sale",\n    "date": "${new Date().toISOString()}",\n    "amount": "25000",\n    "cost": "15000",\n    "status": "paid"\n  }\n}`}</pre>
              {data.org.demo && (
                <button
                  className="primary full"
                  disabled={busy}
                  onClick={() =>
                    action(
                      () => api("webhook/test", {}),
                      t(
                        "Подписанный тестовый заказ принят",
                        "Қолтаңбалы тест тапсырысы қабылданды",
                      ),
                    )
                  }
                >
                  <Send size={16} />
                  {t("Отправить тестовый заказ", "Тест тапсырысын жіберу")}
                </button>
              )}
            </>
          )}
          {modal.type === "member" && (
            <form
              onSubmit={(e) => {
                const b = form(e);
                action(
                  () => api("members", b),
                  t("Аккаунт сотрудника создан", "Қызметкер аккаунты жасалды"),
                  true,
                );
              }}
            >
              <label>
                {t("Имя", "Аты")}
                <input name="name" required />
              </label>
              <label>
                Email
                <input name="email" type="email" required />
              </label>
              <label>
                {t(
                  "Начальный пароль (10+ символов)",
                  "Бастапқы құпиясөз (10+ таңба)",
                )}
                <input
                  name="password"
                  type="password"
                  minLength={10}
                  maxLength={128}
                  required
                />
              </label>
              <label>
                {t("Роль", "Рөл")}
                <select name="role">
                  <option value="manager">{t("Менеджер", "Менеджер")}</option>
                  <option value="viewer">
                    {t("Наблюдатель", "Бақылаушы")}
                  </option>
                </select>
              </label>
              <p className="muted">
                {t(
                  "Передайте доступ сотруднику самостоятельно. Приложение не отправляет приглашения.",
                  "Қолжетімділікті қызметкерге өзіңіз беріңіз. Қосымша шақыру жібермейді.",
                )}
              </p>
              <button className="primary full" disabled={busy}>
                {t("Создать аккаунт", "Аккаунт құру")}
              </button>
            </form>
          )}
          {modal.type === "chat" && (
            <>
              <div className="chat-intro">
                <Robot size={95} state={busy ? "thinking" : "greeting"} />
                <div>
                  <h3>
                    {t(
                      "С чем помочь вашему бизнесу?",
                      "Бизнесіңізге қалай көмектесемін?",
                    )}
                  </h3>
                  <Badge color={data.ai.enabled ? "green" : "muted"}>
                    {data.ai.enabled
                      ? "LLM"
                      : t("По вашим данным", "Деректеріңіз бойынша")}
                  </Badge>
                </div>
              </div>
              {!data.ai.enabled ? (
                <GuidedAssistant
                  analytics={a}
                  language={language}
                  onNavigate={(key) => {
                    close();
                    nav(key);
                  }}
                  onEvidence={(insight) => open({ type: "evidence", insight })}
                />
              ) : (
                <>
                  <p className="muted">
                    {t(
                      "В AI передаются вопрос и сводные метрики. Ответ — рекомендация; проверьте исходные данные.",
                      "AI-ге сұрақ пен жиынтық көрсеткіштер жіберіледі. Жауап — ұсыныс; бастапқы деректерді тексеріңіз.",
                    )}
                  </p>
                  <div className="chat-history">
                    {chat.map((m, i) => (
                      <div key={i}>
                        <p className="chat-q">{m.q}</p>
                        <p className="chat-a">{m.a}</p>
                      </div>
                    ))}
                  </div>
                  <form
                    className="chat-form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      action(async () => {
                        const q = chatInput;
                        const r = await api("aqyl", { question: q, language });
                        setChat([...chat, { q, a: r.answer }]);
                        setChatInput("");
                      });
                    }}
                  >
                    <input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder={t(
                        "Что сейчас важнее всего?",
                        "Қазір ең маңыздысы не?",
                      )}
                      required
                    />
                    <button
                      className="primary"
                      aria-label={t("Отправить", "Жіберу")}
                      disabled={busy}
                    >
                      <Send size={17} />
                    </button>
                  </form>
                </>
              )}
            </>
          )}
        </Modal>
      )}
    </>
  );
}
