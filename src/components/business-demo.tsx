"use client";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowDownLeft,
  Compass,
  GitBranch,
  Truck,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  Box,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Database,
  Download,
  LayoutDashboard,
  Inbox,
  Star,
  Target,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Store,
  Users,
  Wallet,
} from "lucide-react";
import { Logo, Modal } from "./ui";
import BelgiAdvisor from "./agent-advisor";
import ThemeToggle from "./theme-toggle";
import BusinessHub from "./business-hub";
import BusinessOverview from "./business-overview";
import BusinessGoals from "./business-goals";
import BusinessOperations from "./business-operations";
import ChannelIcon from "./channel-icon";
import {
  DEFAULT_UI_LANGUAGE,
  readUiLanguage,
  saveUiLanguageChoice,
  type UiLanguage,
} from "@/lib/ui-language";
import {
  initialHub,
  demoReviews,
  parseHub,
  unanswered,
  type HubState,
} from "@/lib/business-hub-demo";
import {
  advancePurchase,
  demoDailySales,
  initialPurchase,
  parsePurchase,
  type DemoPurchase,
} from "@/lib/belgi-demo";

const money = (value: number) =>
  new Intl.NumberFormat("ru-RU").format(value) + " ₸";
const workspacePages = [
  "overview",
  "inbox",
  "customers",
  "reviews",
  "sales",
  "stock",
  "purchases",
  "suppliers",
  "growth",
  "analytics",
  "automation",
  "integrations",
  "settings",
];
const orders = [
  {
    id: "BG-0128",
    name: "Аружан С.",
    item: ["Кофе и чай", "Кофе және шай"],
    amount: 12500,
    time: "14:32",
    channel: "Kaspi",
  },
  {
    id: "BG-0127",
    name: "Данияр К.",
    item: ["Продуктовая корзина", "Азық-түлік себеті"],
    amount: 28400,
    time: "14:18",
    channel: "POS",
  },
  {
    id: "BG-0126",
    name: "Айгерім М.",
    item: ["Кофе, 250 г × 2", "Кофе, 250 г × 2"],
    amount: 6400,
    time: "13:56",
    channel: "Kaspi",
  },
  {
    id: "BG-0125",
    name: "Марат Б.",
    item: ["Сладости", "Тәттілер"],
    amount: 8700,
    time: "13:41",
    channel: "POS",
  },
  {
    id: "BG-0124",
    name: "Әсел Т.",
    item: ["Чай и печенье", "Шай және печенье"],
    amount: 5200,
    time: "13:25",
    channel: "POS",
  },
];
export default function BusinessDemo() {
  const [language, setLanguage] = useState<UiLanguage>(DEFAULT_UI_LANGUAGE);
  const [section, setSection] = useState("overview");
  const [guideRequest, setGuideRequest] = useState(0);
  const [conversationRequest, setConversationRequest] = useState<{
    id: string;
    sequence: number;
  } | null>(null);
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");
  const [period, setPeriod] = useState(14);
  const [query, setQuery] = useState("");
  const [mobile, setMobile] = useState(false);
  const [panel, setPanel] = useState<
    "purchase" | "assistant" | "notification" | "order" | null
  >(null);
  const [purchase, setPurchase] = useState<DemoPurchase>(initialPurchase);
  const [hub, setHub] = useState<HubState>(initialHub);
  const [ready, setReady] = useState(false);
  const [received, setReceived] = useState(25);
  const [selectedOrder, setSelectedOrder] = useState(orders[0]);
  const [storageNotice, setStorageNotice] = useState(false);
  const close = useCallback(() => setPanel(null), []);
  const t = (r: string, k: string) => (language === "ru" ? r : k);
  const chooseLanguage = (next: UiLanguage) => {
    setLanguage(next);
    if (!saveUiLanguageChoice(next)) setStorageNotice(true);
  };
  useEffect(() => {
    const restorePage = () => {
      const page = new URLSearchParams(window.location.search).get("page");
      setSection(page && workspacePages.includes(page) ? page : "overview");
      setMobile(false);
    };
    restorePage();
    window.addEventListener("popstate", restorePage);
    return () => window.removeEventListener("popstate", restorePage);
  }, []);
  useEffect(() => {
    setLanguage(readUiLanguage());
    try {
      setHub(
        parseHub(
          JSON.parse(localStorage.getItem("bagyt-business-hub-v1") || "null"),
        ),
      );
      setPurchase(
        parsePurchase(
          JSON.parse(localStorage.getItem("bagyt-belgi-demo-v1") || "null"),
        ),
      );
    } catch {
      setStorageNotice(true);
    }
    setReady(true);
  }, []);
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem("bagyt-business-hub-v1", JSON.stringify(hub));
      localStorage.setItem("bagyt-belgi-demo-v1", JSON.stringify(purchase));
    } catch {
      setStorageNotice(true);
    }
  }, [purchase, hub, ready]);
  const sales = demoDailySales.slice(-period);
  const revenue = sales.reduce((a, b) => a + b, 0);
  const expenses = Math.round(revenue * 0.47);
  const available = 10 + purchase.received;
  const stageName = {
    suggested: t("Рекомендация", "Ұсыныс"),
    draft: t("На проверке", "Тексеруде"),
    approved: t("Утверждено", "Бекітілді"),
    received: t("Приёмка записана", "Қабылдау тіркелді"),
  }[purchase.stage];
  const navItems = [
    {
      id: "overview",
      icon: LayoutDashboard,
      title: t("Обзор бизнеса", "Бизнеске шолу"),
    },
    { id: "assistant", icon: Sparkles, title: "Bagyt agents" },
    { id: "inbox", icon: Inbox, title: t("Входящие", "Хабарламалар") },
    { id: "customers", icon: Users, title: t("Клиенты", "Клиенттер") },
    { id: "reviews", icon: Star, title: t("Отзывы", "Пікірлер") },
    { id: "sales", icon: ShoppingBag, title: t("Продажи", "Сатылымдар") },
    { id: "stock", icon: Box, title: t("Склад", "Қойма") },
    { id: "purchases", icon: ShoppingCart, title: t("Закупки", "Сатып алу") },
    { id: "suppliers", icon: Truck, title: t("Поставщики", "Жеткізушілер") },
    {
      id: "growth",
      icon: Target,
      title: t("Цели и план", "Мақсаттар мен жоспар"),
    },
    {
      id: "analytics",
      icon: BarChart3,
      title: t("Финансы и отчёты", "Қаржы және есептер"),
    },
    {
      id: "automation",
      icon: GitBranch,
      title: t("Автоматизация", "Автоматтандыру"),
    },
    {
      id: "integrations",
      icon: Database,
      title: t("Центр данных", "Деректер орталығы"),
    },
  ];
  const groups = [
    {
      id: "overview",
      label: t("Сегодня", "Бүгін"),
      icon: LayoutDashboard,
      pages: ["overview"],
    },
    {
      id: "inbox",
      label: t("Клиенты", "Клиенттер"),
      icon: Users,
      pages: ["inbox", "customers", "reviews"],
    },
    {
      id: "stock",
      label: t("Товары и закупки", "Тауарлар"),
      icon: Box,
      pages: ["stock", "purchases", "suppliers"],
    },
    {
      id: "analytics",
      label: t("Финансы", "Қаржы"),
      icon: Wallet,
      pages: ["analytics", "sales"],
    },
    {
      id: "growth",
      label: t("Цели и план", "Мақсаттар мен жоспар"),
      icon: Target,
      pages: ["growth", "automation"],
    },
    {
      id: "integrations",
      label: t("Подключения", "Байланыстар"),
      icon: Database,
      pages: ["integrations"],
    },
  ];
  const currentGroup = groups.find((group) => group.pages.includes(section));
  const startGuide = () => {
    setPanel(null);
    setGuideRequest((n) => n + 1);
  };
  useEffect(() => {
    const command = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", command);
    return () => window.removeEventListener("keydown", command);
  }, []);
  const navigate = (id: string) => {
    setCommandOpen(false);
    setCommandQuery("");
    if (id === "assistant") setPanel("assistant");
    else {
      setSection(id);
      const url = new URL(window.location.href);
      url.searchParams.set("page", id);
      window.history.pushState({}, "", url);
      window.scrollTo({ top: 0, behavior: "instant" });
    }
    setMobile(false);
    setQuery("");
  };
  function exportReport() {
    const header = t("Дата;Выручка;Расходы;Режим", "Күні;Түсім;Шығын;Режим");
    const csv =
      "\uFEFF" +
      header +
      "\n" +
      sales
        .map(
          (v, i) =>
            `2026-10-${String(15 - period + i).padStart(2, "0")};${v};${Math.round(v * 0.47)};DEMO`,
        )
        .join("\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "BAGYT-demo-report.csv";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const shownOrders = orders.filter((o) =>
    `${o.name} ${o.id} ${o.channel}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <div className="business-demo studio-shell" data-section={section}>
      {mobile && (
        <button
          className="demo-scrim"
          aria-label={t("Закрыть меню", "Мәзірді жабу")}
          onClick={() => setMobile(false)}
        />
      )}
      <aside className={`demo-sidebar ${mobile ? "is-open" : ""}`}>
        <a href="/?view=about" className="demo-logo-link">
          <Logo />
        </a>
        <button className="demo-company" onClick={() => navigate("settings")}>
          <span>
            <Store size={19} />
          </span>
          <div>
            <b>Qazyna Store</b>
            <small>{t("Кофе и чай · Алматы", "Кофе мен шай · Алматы")}</small>
          </div>
          <ChevronDown size={15} />
        </button>
        <span className="demo-nav-label">
          {t("РАБОЧЕЕ ПРОСТРАНСТВО", "ЖҰМЫС КЕҢІСТІГІ")}
        </span>
        <nav aria-label={t("Основные разделы", "Негізгі бөлімдер")}>
          {groups.map(({ id, label, icon: Icon, pages }) => (
            <button
              key={id}
              className={pages.includes(section) ? "active" : ""}
              onClick={() => navigate(id)}
            >
              <Icon size={21} />
              <span>{label}</span>
              {id === "inbox" && unanswered(hub).length > 0 && (
                <em>{unanswered(hub).length}</em>
              )}
            </button>
          ))}
        </nav>
        <button
          className="simple-sidebar-help"
          onClick={() => navigate("assistant")}
        >
          <Sparkles size={22} />
          <span>
            <b>Bagyt agents</b>
            <small>{t("Ваша AI-команда", "Сіздің AI командаңыз")}</small>
          </span>
          <ArrowRight size={18} />
        </button>
        <div className="demo-sidebar-bottom">
          <div className="demo-safe">
            <ShieldCheck size={17} />
            <span>
              {t(
                "Вы управляете. AI помогает.",
                "Сіз басқарасыз. AI көмектеседі.",
              )}
            </span>
          </div>
          <button onClick={() => navigate("settings")}>
            <Settings size={17} />
            {t("Настройки", "Баптаулар")}
          </button>
          <a href="/?view=about">
            <CircleHelp size={17} />
            {t("О платформе", "Платформа туралы")}
          </a>
          <div className="demo-profile">
            <span>АС</span>
            <div>
              <b>{t("Айдана Сейіт", "Айдана Сейіт")}</b>
              <small>{t("Владелец", "Бизнес иесі")}</small>
            </div>
            <ChevronDown size={15} />
          </div>
        </div>
      </aside>
      <div className="demo-main">
        <header className="demo-topbar">
          <div>
            <button
              className="demo-menu"
              onClick={() => setMobile(true)}
              aria-label={t("Открыть меню", "Мәзірді ашу")}
            >
              <Menu size={21} />
            </button>
            <span>Qazyna Store</span>
            <ChevronRight size={13} />
            <b>
              {navItems.find((n) => n.id === section)?.title ||
                t("Настройки", "Баптаулар")}
            </b>
          </div>
          <div>
            <button
              className="studio-command-trigger"
              aria-label={t("Найти раздел", "Бөлімді іздеу")}
              onClick={() => setCommandOpen(true)}
            >
              <Search size={16} />
              <span>{t("Найти раздел…", "Бөлімді іздеу…")}</span>
              <kbd>⌘ K</kbd>
            </button>
            <ThemeToggle />
            <span className="demo-chip">
              <span className="tiny-dot" />
              {t("Рабочее пространство", "Жұмыс кеңістігі")}
            </span>
            <button
              onClick={() => chooseLanguage(language === "kk" ? "ru" : "kk")}
              className="demo-language"
            >
              {language === "kk" ? "KZ" : "RU"} ⌄
            </button>
            <button
              className="notification-button"
              onClick={() => setPanel("notification")}
              aria-label={t("Уведомления", "Хабарландырулар")}
            >
              <Bell size={18} />
              <i />
            </button>
            <span className="demo-avatar">А</span>
          </div>
        </header>
        <main className="demo-workspace" key={section}>
          <div className="demo-page-heading">
            <div>
              <span className="overline">
                {t(
                  "СРЕДА, 14 ОКТЯБРЯ 2026 · ДЕМО",
                  "СӘРСЕНБІ, 14 ҚАЗАН 2026 · ДЕМО",
                )}
              </span>
              <h1>
                {section === "overview"
                  ? t("Добрый день, Айдана", "Қайырлы күн, Айдана")
                  : navItems.find((n) => n.id === section)?.title ||
                    t("Настройки", "Баптаулар")}
                <span className="greeting-spark">✦</span>
              </h1>
              <p>
                {(
                  {
                    overview: t(
                      "Ваш бизнес в цифрах. Ваш следующий шаг — рядом.",
                      "Бизнесіңіз сандарда. Келесі қадамыңыз — осында.",
                    ),
                    inbox: t(
                      "Все обращения, история клиента и ответ — в одном окне.",
                      "Барлық өтініш, клиент тарихы және жауап — бір терезеде.",
                    ),
                    customers: t(
                      "Единая история отношений с каждым клиентом.",
                      "Әр клиентпен байланыстың бірыңғай тарихы.",
                    ),
                    reviews: t(
                      "Услышать клиента. Ответить. Улучшить сервис.",
                      "Клиентті тыңдау. Жауап беру. Қызметті жақсарту.",
                    ),
                    sales: t(
                      "Оплаченные заказы и детали каждой операции.",
                      "Төленген тапсырыстар және әр операцияның мәліметі.",
                    ),
                    stock: t(
                      "Остатки, резервы и своевременное пополнение.",
                      "Қор, резерв және уақтылы толықтыру.",
                    ),
                    purchases: t(
                      "От сигнала до приёмки — с вашим подтверждением.",
                      "Сигналдан қабылдауға дейін — сіздің бекітуіңізбен.",
                    ),
                    suppliers: t(
                      "Сравните цену, сроки и полную стоимость заказа.",
                      "Баға, мерзім және тапсырыстың толық құнын салыстырыңыз.",
                    ),
                    growth: t(
                      "Ваши цели, прогресс и конкретные шаги для бизнеса.",
                      "Мақсаттарыңыз, прогресс және бизнеске сай нақты қадамдар.",
                    ),
                    analytics: t(
                      "Понятные показатели с источником и периодом.",
                      "Дереккөзі мен кезеңі көрсетілген түсінікті көрсеткіштер.",
                    ),
                    automation: t(
                      "Меньше рутины, больше контроля над результатом.",
                      "Күнделікті жұмыс азайып, нәтиже бақылауда болады.",
                    ),
                    integrations: t(
                      "Источники данных и прозрачный статус каждого подключения.",
                      "Дереккөздер және әр байланыстың анық мәртебесі.",
                    ),
                  } as Record<string, string>
                )[section] ||
                  t(
                    "Настройки вашего рабочего пространства.",
                    "Жұмыс кеңістігіңіздің баптаулары.",
                  )}
              </p>
            </div>
            <div className="demo-heading-actions">
              <button
                className="studio-guide-button"
                onClick={startGuide}
                aria-label={t("Показать страницу", "Бетті таныстыру")}
              >
                <Compass size={17} />
                <span>{t("Показать страницу", "Бетті таныстыру")}</span>
              </button>
              {["analytics", "sales"].includes(section) && (
                <>
                  <select
                    aria-label={t("Период отчёта", "Есеп кезеңі")}
                    value={period}
                    onChange={(e) => setPeriod(Number(e.target.value))}
                  >
                    <option value={14}>
                      {t("1–14 октября", "1–14 қазан")}
                    </option>
                    <option value={7}>{t("8–14 октября", "8–14 қазан")}</option>
                  </select>
                  <button className="dark-button" onClick={exportReport}>
                    <Download size={16} />
                    {t("Отчёт", "Есеп")}
                  </button>
                </>
              )}
            </div>
          </div>
          {currentGroup && currentGroup.pages.length > 1 && (
            <nav
              className="simple-section-tabs"
              aria-label={t("Внутри раздела", "Бөлім ішіндегі беттер")}
            >
              {currentGroup.pages.map((id) => (
                <button
                  key={id}
                  aria-current={id === section ? "page" : undefined}
                  onClick={() => navigate(id)}
                >
                  {navItems.find((item) => item.id === id)?.title}
                </button>
              ))}
            </nav>
          )}
          {storageNotice && (
            <p role="status" className="demo-notice">
              {t(
                "Хранилище браузера недоступно. Прогресс сохранится только до обновления страницы.",
                "Браузер жады қолжетімсіз. Нәтиже тек бет жаңартылғанға дейін сақталады.",
              )}
            </p>
          )}
          {section === "overview" && (
            <BusinessOverview
              language={language}
              hub={hub}
              purchase={purchase}
              period={period}
              navigate={navigate}
              onPurchase={() => setPanel("purchase")}
              onOrder={(id) => {
                setSelectedOrder(orders.find((o) => o.id === id)!);
                setPanel("order");
              }}
              onGuide={startGuide}
              onAssistant={() => setPanel("assistant")}
              onConversation={(id) => {
                setConversationRequest((previous) => ({
                  id,
                  sequence: (previous?.sequence ?? 0) + 1,
                }));
                navigate("inbox");
              }}
            />
          )}
          {section !== "growth" && (
            <BusinessHub
              conversationRequest={conversationRequest}
              section={section}
              language={language}
              state={hub}
              setState={setHub}
              available={available}
              navigate={navigate}
            />
          )}
          {section === "growth" && (
            <BusinessGoals
              language={language}
              hub={hub}
              setHub={setHub}
              available={available}
              navigate={navigate}
            />
          )}
          <BusinessOperations
            section={section}
            language={language}
            hub={hub}
            setHub={setHub}
            purchase={purchase}
            onPurchase={() => setPanel("purchase")}
            navigate={navigate}
          />
          {section === "analytics" && (
            <>
              <div className="demo-stat-grid" data-guide="analytics">
                {[
                  {
                    name: t("Общая выручка", "Жалпы түсім"),
                    value: money(revenue),
                    icon: Wallet,
                    caption: t(
                      "Продажи · учебные данные",
                      "Сатылымдар · оқу деректері",
                    ),
                    tone: "mint",
                  },
                  {
                    name: t("Учтённые расходы", "Тіркелген шығындар"),
                    value: money(expenses),
                    icon: ArrowDownLeft,
                    caption: t("47% от выручки", "Түсімнің 47%-ы"),
                    tone: "blue",
                  },
                  {
                    name: t("Последние заказы", "Соңғы тапсырыстар"),
                    value: "5",
                    icon: ShoppingBag,
                    caption: t(
                      "Сегодня · пример операций",
                      "Бүгін · операциялар мысалы",
                    ),
                    tone: "purple",
                  },
                  {
                    name: t("Доступный запас кофе", "Қолжетімді кофе қоры"),
                    value: `${available} ` + t("шт.", "дана"),
                    icon: Box,
                    caption:
                      purchase.stage === "received"
                        ? t("Приёмка учтена", "Қабылдау тіркелді")
                        : t("Хватит на 2,5 дня", "2,5 күнге жетеді"),
                    tone: "lime",
                  },
                ].map(({ name, value, icon: Icon, caption, tone }) => (
                  <article className="demo-stat" key={name}>
                    <div>
                      <span>{name}</span>
                      <i className={tone}>
                        <Icon size={18} />
                      </i>
                    </div>
                    <strong>{value}</strong>
                    <small>
                      <span className="tiny-dot" />
                      {caption}
                    </small>
                  </article>
                ))}
              </div>
              <div className="demo-center-grid">
                <section className="demo-card revenue-card">
                  <div className="demo-card-heading">
                    <div>
                      <h2>{t("Движение бизнеса", "Бизнес динамикасы")}</h2>
                      <p>
                        {t(
                          "Выручка и расходы за выбранный период",
                          "Таңдалған кезеңдегі түсім мен шығын",
                        )}
                      </p>
                    </div>
                    <button
                      onClick={exportReport}
                      aria-label={t(
                        "Скачать данные графика",
                        "График деректерін жүктеу",
                      )}
                    >
                      <ArrowUpRight size={18} />
                    </button>
                  </div>
                  <div className="chart-legend">
                    <span>
                      <i />
                      {t("Выручка", "Түсім")}
                    </span>
                    <span>
                      <i />
                      {t("Расходы", "Шығын")}
                    </span>
                    <b>{money(revenue)}</b>
                  </div>
                  <div
                    className="demo-chart"
                    role="img"
                    aria-label={t(
                      "График выручки и расходов. Точные суммы доступны в отчёте.",
                      "Түсім мен шығын графигі. Нақты сомаларды есептен жүктеуге болады.",
                    )}
                  >
                    <div className="chart-y">
                      <span>250k</span>
                      <span>200k</span>
                      <span>150k</span>
                      <span>100k</span>
                      <span>50k</span>
                      <span>0</span>
                    </div>
                    <div className="chart-bars">
                      {sales.map((v, i) => (
                        <div
                          className="chart-bar-group"
                          key={i}
                          title={`${15 - period + i}.10: ${money(v)}`}
                        >
                          <div>
                            <i style={{ height: `${v / 2500}%` }} />
                            <i style={{ height: `${(v * 0.47) / 2500}%` }} />
                          </div>
                          <small>
                            {String(15 - period + i).padStart(2, "0")}
                          </small>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="chart-foot">
                    <ShieldCheck size={13} />
                    {t(
                      "Источник: Kaspi + POS · срез 14.10, 14:35",
                      "Дереккөз: Kaspi + POS · 14.10, 14:35 кесімі",
                    )}
                  </div>
                </section>
              </div>
              <section className="demo-attention">
                <span className="attention-symbol">
                  <Sparkles size={19} />
                </span>
                <div>
                  <b>
                    {purchase.stage === "received"
                      ? t(
                          "Приёмка отражена в остатках",
                          "Қабылданған тауар қорға қосылды",
                        )
                      : t(
                          "Сегодня стоит обратить внимание",
                          "Бүгін назар аудару керек",
                        )}
                  </b>
                  <p>
                    {purchase.stage === "received"
                      ? t(
                          `Кофе: принято ${purchase.received} шт. Доступно ${available} шт.`,
                          `Кофе: ${purchase.received} дана қабылданды. ${available} дана қолжетімді.`,
                        )
                      : t(
                          "Кофе закончится раньше поставки. Qor предлагает пополнить запас.",
                          "Кофе келесі жеткізілімнен бұрын таусылады. Qor қорды толықтыруды ұсынады.",
                        )}
                  </p>
                </div>
                <button onClick={() => setPanel("purchase")}>
                  {t("Посмотреть", "Қарап шығу")}
                  <ArrowRight size={16} />
                </button>
              </section>
            </>
          )}
          {section === "sales" && (
            <div className="demo-bottom-grid">
              <section className="demo-card orders-card" data-guide="sales">
                <div className="demo-card-heading">
                  <div>
                    <h2>{t("Последние продажи", "Соңғы сатылымдар")}</h2>
                    <p>
                      {t(
                        "14 октября · последние операции",
                        "14 қазан · соңғы операциялар",
                      )}
                    </p>
                  </div>
                  <div className="demo-search">
                    <Search size={15} />
                    <input
                      aria-label={t(
                        "Поиск клиента или заказа",
                        "Клиентті не тапсырысты іздеу",
                      )}
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder={t("Поиск…", "Іздеу…")}
                    />
                  </div>
                </div>
                <div className="demo-table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>{t("Клиент / заказ", "Клиент / тапсырыс")}</th>
                        <th>{t("Канал", "Арна")}</th>
                        <th>{t("Сумма", "Сома")}</th>
                        <th>{t("Статус", "Мәртебе")}</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {shownOrders.map((o, i) => (
                        <tr key={o.id}>
                          <td>
                            <button
                              className="order-client"
                              onClick={() => {
                                setSelectedOrder(o);
                                setPanel("order");
                              }}
                            >
                              <span className={`client-avatar avatar-${i % 3}`}>
                                {o.name.slice(0, 1)}
                              </span>
                              <span>
                                <b>{o.name}</b>
                                <small>
                                  {o.id} · {o.time}
                                </small>
                              </span>
                            </button>
                          </td>
                          <td>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 7,
                              }}
                            >
                              <ChannelIcon source={o.channel} size={20} />
                              {o.channel}
                            </span>
                          </td>
                          <td className="number">
                            <b>{money(o.amount)}</b>
                          </td>
                          <td>
                            <span className="paid-pill">
                              <Check size={11} />
                              {t("Оплачено", "Төленді")}
                            </span>
                          </td>
                          <td>
                            <button
                              aria-label={`${t("Открыть заказ", "Тапсырысты ашу")} ${o.id}`}
                              onClick={() => {
                                setSelectedOrder(o);
                                setPanel("order");
                              }}
                            >
                              <ArrowUpRight size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!shownOrders.length && (
                    <p className="demo-empty">
                      {t("Ничего не найдено", "Ештеңе табылмады")}
                    </p>
                  )}
                </div>
              </section>
            </div>
          )}
          {section === "settings" && (
            <section className="demo-card demo-settings">
              <h2>{t("Рабочее пространство", "Жұмыс кеңістігі")}</h2>
              <label>
                {t("Название бизнеса", "Бизнес атауы")}
                <input value="Qazyna Store" readOnly />
              </label>
              <label>
                {t("Язык интерфейса", "Интерфейс тілі")}
                <select
                  value={language}
                  onChange={(e) => chooseLanguage(e.target.value as UiLanguage)}
                >
                  <option value="kk">Қазақша</option>
                  <option value="ru">Русский</option>
                </select>
              </label>
              <p>
                {t(
                  "Это пример магазина с готовыми данными. Закупки, ответы и задачи сохраняются в этом браузере. Чтобы работать с реальными каналами, подключите свои аккаунты.",
                  "Бұл — дайын деректері бар дүкен үлгісі. Сатып алу, жауаптар мен тапсырмалар осы браузерде сақталады. Нақты арналармен жұмыс істеу үшін өз аккаунттарыңызды қосыңыз.",
                )}
              </p>
              <button
                className="dark-button"
                onClick={() => {
                  setPurchase(initialPurchase);
                  setHub(initialHub);
                  setReceived(25);
                  try {
                    localStorage.removeItem("bagyt-business-goals-v1");
                  } catch {}
                }}
              >
                {t("Восстановить пример", "Үлгіні қайта бастау")}
              </button>
            </section>
          )}
          <footer className="demo-workspace-footer">
            <span>
              Bagyt <i>·</i> Belgi / Sana / Qor
            </span>
            <span>
              {t(
                "Учебные данные. Внешние действия не выполняются.",
                "Оқу деректері. Сыртқы әрекеттер орындалмайды.",
              )}
            </span>
            <span>{t("Сделано в Казахстане", "Қазақстанда жасалған")} ♥</span>
          </footer>
        </main>
      </div>
      {commandOpen && (
        <Modal
          title={t("Быстрый переход", "Жылдам өту")}
          onClose={() => setCommandOpen(false)}
        >
          <div className="studio-command-menu">
            <label>
              <Search size={20} />
              <input
                autoFocus
                value={commandQuery}
                onChange={(e) => setCommandQuery(e.target.value)}
                placeholder={t("Название раздела…", "Бөлім атауы…")}
                aria-label={t("Поиск раздела", "Бөлімді іздеу")}
              />
            </label>
            <div>
              {navItems
                .filter((n) =>
                  n.title.toLowerCase().includes(commandQuery.toLowerCase()),
                )
                .map(({ id, title, icon: Icon }) => (
                  <button key={id} onClick={() => navigate(id)}>
                    <Icon size={18} />
                    <span>{title}</span>
                    <ArrowRight size={16} />
                  </button>
                ))}
              {!navItems.some((n) =>
                n.title.toLowerCase().includes(commandQuery.toLowerCase()),
              ) && <p>{t("Раздел не найден", "Бөлім табылмады")}</p>}
            </div>
          </div>
        </Modal>
      )}
      {panel === "purchase" && (
        <Modal title={t("Новая закупка", "Жаңа сатып алу")} onClose={close}>
          <div className="purchase-flow">
            <div className="flow-steps">
              {[
                t("Предложение", "Ұсыныс"),
                t("Проверка", "Тексеру"),
                t("Утверждение", "Бекіту"),
                t("Приёмка", "Қабылдау"),
              ].map((s, i) => (
                <span
                  className={
                    i <=
                    ["suggested", "draft", "approved", "received"].indexOf(
                      purchase.stage,
                    )
                      ? "done"
                      : ""
                  }
                  key={s}
                >
                  <i>{i + 1}</i>
                  {s}
                </span>
              ))}
            </div>
            <span className="demo-chip">{stageName}</span>
            <h3>{t("Кофе в зёрнах, 250 г", "Кофе дәндері, 250 г")}</h3>
            <p>
              {t(
                "Исходный сигнал: 10 доступных единиц ÷ 4 продажи в день = 2,5 дня запаса. Поставка занимает 5 дней: есть риск дефицита.",
                "Бастапқы ескерту: 10 қолжетімді дана ÷ күніне 4 сату = 2,5 күндік қор. Жеткізу 5 күн алады: тапшылық қаупі бар.",
              )}
            </p>
            <dl>
              <div>
                <dt>{t("Поставщик", "Жеткізуші")}</dt>
                <dd>Almaty Coffee</dd>
              </div>
              <div>
                <dt>{t("Количество", "Саны")}</dt>
                <dd>30 × 2 000 ₸</dd>
              </div>
              <div>
                <dt>{t("Подытог товаров", "Тауарлардың аралық сомасы")}</dt>
                <dd>60 000 ₸</dd>
              </div>
            </dl>
            <p className="demo-notice">
              {t(
                "Доставка и сборы не уточнены. Заказ сохраняется в этом пространстве и не отправляется поставщику.",
                "Жеткізу және қосымша төлемдер нақтыланбаған. Тапсырыс осы жұмыс кеңістігінде сақталады, жеткізушіге жіберілмейді.",
              )}
            </p>
            {purchase.stage === "suggested" && (
              <button
                className="dark-button"
                onClick={() =>
                  setPurchase((p) => advancePurchase(p, "prepare"))
                }
              >
                {t("Подготовить проект", "Жобаны дайындау")}
                <ArrowRight size={16} />
              </button>
            )}
            {purchase.stage === "draft" && (
              <button
                className="dark-button"
                onClick={() =>
                  setPurchase((p) => advancePurchase(p, "approve"))
                }
              >
                <ShieldCheck size={16} />
                {t("Утвердить закупку", "Сатып алуды бекіту")}
              </button>
            )}
            {purchase.stage === "approved" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setPurchase((p) => advancePurchase(p, "receive", received));
                }}
              >
                <label>
                  {t(
                    "Фактически принято, шт. (1–30)",
                    "Нақты қабылданды, дана (1–30)",
                  )}
                  <input
                    type="number"
                    min={1}
                    max={30}
                    step={1}
                    required
                    value={received}
                    onChange={(e) => setReceived(Number(e.target.value))}
                  />
                </label>
                <button className="dark-button">
                  <Check size={16} />
                  {t("Записать приёмку", "Қабылдауды тіркеу")}
                </button>
              </form>
            )}
            {purchase.stage === "received" && (
              <div className="receipt-success">
                <CheckCircle2 size={25} />
                <b>
                  {t(
                    `Принято ${purchase.received} шт. На складе: ${12 + purchase.received}.`,
                    `${purchase.received} дана қабылданды. Қоймада: ${12 + purchase.received}.`,
                  )}
                </b>
                <p>
                  {t(
                    `Осталось получить: ${30 - purchase.received} шт. Доступно: ${available}.`,
                    `Қалғаны: ${30 - purchase.received} дана. Қолжетімді: ${available}.`,
                  )}
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}
      <BelgiAdvisor
        language={language}
        guideRequest={guideRequest}
        section={section}
        hub={hub}
        onNavigate={navigate}
        period={period}
        revenue={revenue}
        expenses={expenses}
        available={available}
        received={purchase.received}
        open={panel === "assistant"}
        suspended={
          commandOpen || mobile || (panel !== null && panel !== "assistant")
        }
        onOpen={() => setPanel("assistant")}
        onClose={close}
        onPurchase={() => setPanel("purchase")}
      />
      {panel === "notification" && (
        <Modal title={t("Центр внимания", "Назар орталығы")} onClose={close}>
          <div className="studio-alert-list">
            <p>
              {t(
                "Сигналы по текущим данным. Откройте нужный раздел и завершите следующий шаг.",
                "Қазіргі деректер бойынша сигналдар. Қажетті бөлімді ашып, келесі қадамды орындаңыз.",
              )}
            </p>
            {[
              {
                id: "inbox",
                icon: Inbox,
                label: t("Ответы клиентам", "Клиенттерге жауап"),
                detail: t(
                  `${unanswered(hub).length} обращений без ответа`,
                  `${unanswered(hub).length} жауапсыз өтініш`,
                ),
              },
              {
                id: "purchases",
                icon: Box,
                label: t("Пополнение запасов", "Қорды толықтыру"),
                detail: purchase.received
                  ? t(
                      `Принято ${purchase.received} шт. кофе`,
                      `${purchase.received} дана кофе қабылданды`,
                    )
                  : t(
                      "Проверьте проект закупки кофе",
                      "Кофе сатып алу жобасын тексеріңіз",
                    ),
              },
              {
                id: "reviews",
                icon: Star,
                label: t("Обратная связь", "Кері байланыс"),
                detail: t(
                  `${demoReviews.filter((r) => !hub.reviewReplies[r.id]).length} отзыва без ответа`,
                  `${demoReviews.filter((r) => !hub.reviewReplies[r.id]).length} жауапсыз пікір`,
                ),
              },
              {
                id: "growth",
                icon: Target,
                label: t("План команды", "Команда жоспары"),
                detail: t(
                  `${hub.tasks.filter((id) => !hub.completed.includes(id)).length} задач в работе`,
                  `${hub.tasks.filter((id) => !hub.completed.includes(id)).length} белсенді тапсырма`,
                ),
              },
            ].map(({ id, icon: Icon, label, detail }) => (
              <button
                key={id}
                onClick={() => {
                  setPanel(null);
                  navigate(id);
                }}
              >
                <span>
                  <Icon size={21} />
                </span>
                <div>
                  <b>{label}</b>
                  <small>{detail}</small>
                </div>
                <ArrowRight size={16} />
              </button>
            ))}
          </div>
        </Modal>
      )}
      {panel === "order" && (
        <Modal title={selectedOrder.id} onClose={close}>
          <div className="demo-notification">
            <span className="paid-pill">
              <Check size={14} />
              {t("Оплачено", "Төленді")}
            </span>
            <h3>{selectedOrder.name}</h3>
            <p>{selectedOrder.item[language === "ru" ? 0 : 1]}</p>
            <strong>{money(selectedOrder.amount)}</strong>
            <p
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 7,
              }}
            >
              <ChannelIcon source={selectedOrder.channel} size={22} />
              {selectedOrder.channel} · 14.10.2026 · {selectedOrder.time}
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}
