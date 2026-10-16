"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  ArrowRight,
  Compass,
  GripVertical,
  ChevronRight,
  FileCheck2,
  MessageSquare,
  Pause,
  Play,
  Send,
  ShieldCheck,
  X,
} from "lucide-react";
import BelgiRobot from "./belgi-robot";
import { belgiGuideSteps, useBelgiGuide } from "./use-belgi-guide";
import {
  unanswered,
  demoReviews,
  type HubState,
} from "@/lib/business-hub-demo";

type Topic =
  | "stock"
  | "sales"
  | "approval"
  | "general"
  | "clients"
  | "reviews"
  | "growth"
  | "suppliers"
  | "automation";
type Exchange = {
  waiting: number;
  reviewCount: number;
  taskCount: number;
  question: string;
  topic: Topic;
  language: "kk" | "ru";
  revenue: number;
  expenses: number;
  period: number;
  available: number;
  received: number;
};
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

export default function BelgiAdvisor(props: Props) {
  const {
    language,
    section,
    open,
    suspended,
    onOpen,
    onClose,
    onPurchase,
    available,
    received,
    revenue,
    expenses,
    period,
  } = props;
  const t = (ru: string, kk: string) => (language === "ru" ? ru : kk);
  const [tour, setTour] = useState(false);
  const [dragPosition, setDragPosition] = useState<{
    left: number;
    top: number;
  } | null>(null);
  const drag = useRef<{
    x: number;
    y: number;
    left: number;
    top: number;
  } | null>(null);
  const guideIndex = Math.max(
    0,
    belgiGuideSteps.findIndex((g) => g.section === section),
  );
  const guide = belgiGuideSteps[guideIndex];
  const guideRect = useBelgiGuide(section, tour && !suspended && !open);
  const [step, setStep] = useState(0);
  const [routeStep, setRouteStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [tipHidden, setTipHidden] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState<Exchange[]>([]);
  const input = useRef<HTMLInputElement>(null);
  const launcher = useRef<HTMLDivElement>(null);
  const conversation = useRef<HTMLDivElement>(null);
  const previousOpen = useRef(false);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(preference.matches);
    sync();
    preference.addEventListener("change", sync);
    return () => preference.removeEventListener("change", sync);
  }, []);
  useEffect(() => {
    if (
      paused ||
      interacting ||
      open ||
      suspended ||
      reducedMotion ||
      tour ||
      dragPosition
    )
      return;
    const timer = window.setInterval(() => {
      if (!document.hidden) {
        setStep((value) => value + 1);
        setRouteStep((value) => value + 1);
      }
    }, 14000);
    return () => window.clearInterval(timer);
  }, [paused, interacting, open, suspended, reducedMotion, tour, dragPosition]);
  useEffect(() => {
    setTipHidden(!tour);
    setStep(0);
    setDragPosition(null);
  }, [section, tour]);
  useEffect(() => {
    if (!props.guideRequest) return;
    setTour(true);
    setTipHidden(false);
    setDragPosition(null);
  }, [props.guideRequest]);
  useEffect(() => {
    if (tipHidden || tour || interacting) return;
    const timer = window.setTimeout(() => setTipHidden(true), 12000);
    return () => window.clearTimeout(timer);
  }, [tipHidden, tour, interacting]);
  useEffect(() => {
    const reset = () => setDragPosition(null);
    window.addEventListener("resize", reset);
    return () => window.removeEventListener("resize", reset);
  }, []);
  useEffect(() => {
    if (open && !suspended) input.current?.focus({ preventScroll: true });
    else if (previousOpen.current && !suspended)
      launcher.current
        ?.querySelector<HTMLButtonElement>(".robot")
        ?.focus({ preventScroll: true });
    previousOpen.current = open;
  }, [open, suspended]);
  useEffect(() => {
    if (open && conversation.current)
      conversation.current.scrollTop = conversation.current.scrollHeight;
  }, [history, open]);

  const stockContext = section === "stock" || section === "purchases";
  const topics: Topic[] =
    section === "suppliers"
      ? ["suppliers", "stock", "approval"]
      : section === "automation"
        ? ["automation", "clients", "growth"]
        : section === "inbox" ||
            section === "customers" ||
            section === "integrations"
          ? ["clients", "growth", "reviews"]
          : section === "reviews"
            ? ["reviews", "clients", "growth"]
            : section === "growth"
              ? ["growth", "clients", "stock"]
              : stockContext
                ? ["stock", "approval", "sales"]
                : section === "analytics" || section === "sales"
                  ? ["sales", "approval", "stock"]
                  : ["stock", "sales", "approval"];
  const topic = topics[step % topics.length];
  const title =
    topic === "stock"
      ? t("Контроль запасов", "Қорды бақылау")
      : topic === "sales"
        ? t("Финансовый обзор", "Қаржы шолуы")
        : t("Контроль действий", "Әрекетті бақылау");
  const suggestion =
    topic === "stock"
      ? received > 0
        ? t(
            `Приёмка учтена. Доступно ${available} шт. кофе.`,
            `Қабылдау тіркелді. ${available} дана кофе қолжетімді.`,
          )
        : t(
            "Запаса кофе на 2,5 дня. Поставка — 5 дней. Проверьте закупку.",
            "Кофе қоры — 2,5 күнге. Жеткізу — 5 күн. Сатып алуды тексеріңіз.",
          )
      : topic === "sales"
        ? t(
            "Выручка не равна прибыли. Для расчёта нужны себестоимость и налоги.",
            "Түсім — пайда емес. Есепке өзіндік құн мен салық деректері қажет.",
          )
        : t(
            "Сначала проверка условий. Затем ваше подтверждение.",
            "Алдымен шарттарды тексеру. Одан кейін сіздің бекітуіңіз.",
          );
  const prompt = (value: Topic) =>
    value === "suppliers"
      ? t("Как сравнить поставщиков?", "Жеткізушілерді қалай салыстырамын?")
      : value === "automation"
        ? t("Как работают правила?", "Ережелер қалай жұмыс істейді?")
        : value === "clients"
          ? t("Кто ждёт ответа?", "Кім жауап күтуде?")
          : value === "reviews"
            ? t("Что говорят клиенты?", "Клиенттер не дейді?")
            : value === "growth"
              ? t("Как развивать бизнес?", "Бизнесті қалай дамытуға болады?")
              : value === "stock"
                ? t("Проверить запасы", "Қорды тексеру")
                : value === "sales"
                  ? t("Разобрать финансы", "Қаржыны талдау")
                  : t("Как утверждать действия?", "Әрекетті қалай бекітемін?");
  function ask(text: string, selected?: Topic) {
    const cleaned = text.trim();
    if (!cleaned) return;
    const topic =
      selected ||
      (/жеткізуш|поставщик/i.test(cleaned)
        ? "suppliers"
        : /автомат|ереже|правил/i.test(cleaned)
          ? "automation"
          : /пікір|отзыв/i.test(cleaned)
            ? "reviews"
            : /клиент|хабар|жауап|whatsapp|вацап|диалог|ответ/i.test(cleaned)
              ? "clients"
              : /даму|дамыт|рост|развит|жоспар|план/i.test(cleaned)
                ? "growth"
                : /қор|қойма|кофе|запас|склад|закуп/i.test(cleaned)
                  ? "stock"
                  : /сат|түсім|шығын|қаржы|прод|выруч|расход|прибыл|финанс/i.test(
                        cleaned,
                      )
                    ? "sales"
                    : /бекіт|утвер|одобр|подтвер/i.test(cleaned)
                      ? "approval"
                      : "general");
    setHistory((items) =>
      [
        ...items,
        {
          waiting: unanswered(props.hub).length,
          reviewCount: demoReviews.filter((r) => !props.hub.reviewReplies[r.id])
            .length,
          taskCount: props.hub.tasks.filter(
            (id) => !props.hub.completed.includes(id),
          ).length,
          question: cleaned.slice(0, 500),
          topic,
          language,
          revenue,
          expenses,
          period,
          available,
          received,
        },
      ].slice(-12),
    );
    setQuestion("");
    input.current?.focus({ preventScroll: true });
  }
  function answer(item: Exchange) {
    const tx = (ru: string, kk: string) => (item.language === "ru" ? ru : kk);
    const number = (n: number) => new Intl.NumberFormat("ru-RU").format(n);
    if (item.topic === "suppliers")
      return tx(
        "В демо три предложения. Almaty Coffee: 2 000 ₸ за пачку, 5 дней, доставка уточняется. Steppe Roasters: 3 дня, 30 пачек с доставкой — 67 000 ₸ до дополнительных сборов. Nomad дешевле за единицу, но требует минимум 40 пачек и 7 дней. Сначала подтвердите полные условия; минимальная цена не всегда означает лучший выбор.",
        "Демода үш ұсыныс бар. Almaty Coffee: қаптамасы 2 000 ₸, 5 күн, жеткізу ақысы нақтылануда. Steppe Roasters: 3 күн, жеткізумен 30 қаптама — қосымша алымдарға дейін 67 000 ₸. Nomad бірлік бағасы төмен, бірақ кемінде 40 қаптама және 7 күн талап етеді. Алдымен толық шарттарды растаңыз; ең төмен баға әрқашан ең тиімді таңдау емес.",
      );
    if (item.topic === "automation")
      return tx(
        "Включите нужное правило и запустите демо вручную. Неотвеченные обращения старше 30 минут получат задачу на следующий контакт. Замечание о сервисе — задачу на проверку выдачи. Повторный запуск не дублирует задачи. Это локальная симуляция без отправки сообщений.",
        "Қажетті ережені қосып, демоны қолмен іске қосыңыз. 30 минуттан ұзақ жауапсыз өтінішке келесі байланыс тапсырмасы құрылады. Қызмет туралы ескерту тапсырыс беруді тексеруге айналады. Қайта іске қосу тапсырмаларды қайталамайды. Бұл — хабарлама жібермейтін жергілікті симуляция.",
      );
    if (item.topic === "clients")
      return tx(
        `Сейчас ${item.waiting} обращений ждут ответа. Во «Входящих» выберите диалог, подготовьте ответ, назначьте ответственного и запланируйте следующий контакт. Все каналы связаны с карточкой клиента по ID.`,
        `Қазір ${item.waiting} өтініш жауап күтуде. «Клиенттер → Хабарламалар» бөлімінен диалогты таңдап, жауап дайындаңыз, жауапты қызметкерді және келесі байланысты белгілеңіз. Арналар клиент карточкасына ID бойынша байланысқан.`,
      );
    if (item.topic === "reviews")
      return tx(
        `В демо 3 отзыва со средней оценкой 4,0. Без ответа: ${item.reviewCount}. Есть сигнал о долгом ожидании и пожелание подарочных наборов. В «Отзывах» подготовьте ответ, а проблему превратите в задачу.`,
        `Демода орташа бағасы 4,0 болатын 3 пікір бар. Жауапсыз: ${item.reviewCount}. Ұзақ күту және сыйлық жиынтығына сұраныс туралы сигнал бар. «Пікірлерде» жауап дайындап, мәселені тапсырмаға айналдырыңыз.`,
      );
    if (item.topic === "growth")
      return tx(
        `В работе ${item.taskCount} задач. Три направления: скорость выдачи, спрос на подарочные наборы и повторные покупки. В плане развития у каждой гипотезы есть источник и измеримый следующий шаг. Рост не гарантирован — сначала небольшой эксперимент.`,
        `Қазір ${item.taskCount} белсенді тапсырма бар. Үш бағыт: тапсырыс беру жылдамдығы, сыйлық жиынтығына сұраныс және қайталама сатып алу. Даму жоспарында әр болжамның дереккөзі және өлшенетін келесі қадамы бар. Өсуге кепілдік жоқ — алдымен шағын тәжірибе.`,
      );
    if (item.topic === "stock")
      return tx(
        `Доступно ${item.available} шт. кофе. При продажах 4 шт. в день запаса хватит на ${number(item.available / 4)} дня. ${item.received > 0 ? `Учтена приёмка ${item.received} шт.; по исходному заказу осталось ${30 - item.received} шт.` : "Поставка занимает 5 дней. Рекомендация: подготовить проект на 30 шт. по 2 000 ₸. Подытог — 60 000 ₸ без доставки и сборов."}`,
        `${item.available} дана кофе қолжетімді. Күніне 4 дана сатылғанда қор ${number(item.available / 4)} күнге жетеді. ${item.received > 0 ? `${item.received} дана қабылданды; бастапқы тапсырыстың ${30 - item.received} данасы қалды.` : "Жеткізу 5 күн алады. Ұсыныс: 2 000 ₸ бағамен 30 данаға жоба дайындау. Аралық сома — жеткізу мен алымдарсыз 60 000 ₸."}`,
      );
    if (item.topic === "sales")
      return tx(
        `За ${item.period} дней выручка — ${number(item.revenue)} ₸. Учтённые расходы — ${number(item.expenses)} ₸. Чистую прибыль пока рассчитать нельзя: нет полного учёта себестоимости и налогов. Данные демонстрационные.`,
        `${item.period} күндегі түсім — ${number(item.revenue)} ₸. Тіркелген шығын — ${number(item.expenses)} ₸. Таза пайданы есептеу мүмкін емес: өзіндік құн мен салықтар толық есепке алынбаған. Бұл — демо деректер.`,
      );
    if (item.topic === "approval")
      return tx(
        "Я готовлю предложение. Вы проверяете количество, цену и условия, затем утверждаете. При приёмке введите фактически полученное количество. В демо заказ поставщику не отправляется.",
        "Мен ұсынысты дайындаймын. Сіз санын, бағасын, шарттарын тексеріп, бекітесіз. Қабылдауда нақты келген санын енгізіңіз. Демода тапсырыс жеткізушіге жіберілмейді.",
      );
    return tx(
      "Я BELGI AI, бизнес-аналитик платформы BAGYT AI. В этом демо могу объяснить выручку, запасы, закупки, обращения клиентов, отзывы и план развития. Для остальных вопросов пока нет подключённого свободного AI-диалога. Выберите тему ниже.",
      "Мен BELGI AI — BAGYT AI платформасының бизнес талдаушысымын. Бұл демода түсім, қор, сатып алу, клиент өтініштері, пікірлер және даму жоспарын түсіндіремін. Басқа сұрақтарға еркін AI-диалог әлі қосылмаған. Төменнен тақырып таңдаңыз.",
    );
  }
  const stop = open || reducedMotion ? 1 : [1, 0.5, 0, 0.5][routeStep % 4];
  const contextTitle =
    topic === "suppliers"
      ? t("Сравним предложения", "Ұсыныстарды салыстырайық")
      : topic === "automation"
        ? t("Меньше ручной работы", "Қол жұмысын азайтайық")
        : topic === "clients"
          ? t("Клиенты под вниманием", "Клиенттер назарда")
          : topic === "reviews"
            ? t("Голос клиента", "Клиент үні")
            : topic === "growth"
              ? t("Следующий шаг", "Келесі қадам")
              : title;
  const contextTip =
    topic === "suppliers"
      ? t(
          "Цена, срок и минимальный заказ влияют на выбор. Проверим их вместе.",
          "Баға, мерзім және ең аз тапсырыс таңдауға әсер етеді. Бірге тексерейік.",
        )
      : topic === "automation"
        ? t(
            "Включите правило, а затем проверьте созданные задачи в плане.",
            "Ережені қосып, жоспарда құрылған тапсырмаларды тексеріңіз.",
          )
        : topic === "clients"
          ? t(
              `${unanswered(props.hub).length} обращений ждут ответа. Помогу подготовить ответ и следующий шаг.`,
              `${unanswered(props.hub).length} өтініш жауап күтуде. Жауап пен келесі қадамды дайындауға көмектесемін.`,
            )
          : topic === "reviews"
            ? t(
                "Превратим отзыв в ответ и конкретное улучшение сервиса.",
                "Пікірден жауап пен қызметті жақсартатын нақты қадам жасайық.",
              )
            : topic === "growth"
              ? t(
                  "Сверим сигналы из разных источников и составим план.",
                  "Әртүрлі дереккөз сигналдарын салыстырып, жоспар құрайық.",
                )
              : suggestion;
  function moveGuide(offset: number) {
    const next = guideIndex + offset;
    if (next >= belgiGuideSteps.length) {
      setTour(false);
      return;
    }
    props.onNavigate(belgiGuideSteps[Math.max(0, next)].section);
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
      <div
        className="belgi-roaming-lane"
        aria-label={t("Помощник BELGI AI", "BELGI AI көмекшісі")}
      >
        <div
          ref={launcher}
          className={`belgi-rover ${open ? "chat-active" : ""} ${tour ? "guide-active" : ""} ${dragPosition && !open ? "is-dragged" : ""}`}
          style={
            {
              "--stop": tour ? 1 : stop,
              "--lift":
                open || tour || reducedMotion
                  ? "0px"
                  : ["0px", "12px", "0px", "8px"][routeStep % 4],
              ...(dragPosition && !open && !tour
                ? {
                    position: "fixed",
                    left: dragPosition.left,
                    top: dragPosition.top,
                    bottom: "auto",
                  }
                : {}),
            } as CSSProperties
          }
          onPointerEnter={() => setInteracting(true)}
          onPointerLeave={() => setInteracting(false)}
          onFocusCapture={() => setInteracting(true)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget))
              setInteracting(false);
          }}
        >
          {!open && !tipHidden && (
            <div className="belgi-advice">
              <div>
                <span>
                  {tour
                    ? `${guideIndex + 1}/${belgiGuideSteps.length} · ${guide.title[language === "ru" ? 0 : 1]}`
                    : contextTitle}
                </span>
                <button
                  onClick={() => {
                    setTipHidden(true);
                    setTour(false);
                  }}
                  aria-label={t("Скрыть совет", "Кеңесті жасыру")}
                >
                  <X size={12} />
                </button>
              </div>
              <button
                className="belgi-advice-text"
                onClick={() => {
                  if (tour) return;
                  ask(prompt(topic), topic);
                  onOpen();
                }}
              >
                {tour ? guide.text[language === "ru" ? 0 : 1] : contextTip}
                <ChevronRight size={14} />
              </button>
              {tour ? (
                <div className="belgi-tour-actions">
                  <button
                    onClick={() => moveGuide(-1)}
                    disabled={guideIndex === 0}
                  >
                    {t("Назад", "Артқа")}
                  </button>
                  <button onClick={() => setTour(false)}>
                    {t("Завершить", "Аяқтау")}
                  </button>
                  <button onClick={() => moveGuide(1)}>
                    {guideIndex === belgiGuideSteps.length - 1
                      ? t("Готово", "Дайын")
                      : t("Далее", "Келесі")}
                    <ArrowRight size={14} />
                  </button>
                </div>
              ) : (
                <button
                  className="belgi-guide-start"
                  onClick={() => {
                    setTour(true);
                    setDragPosition(null);
                  }}
                >
                  <Compass size={15} />
                  {t(
                    "Покажи, что делать на этой странице",
                    "Осы бетте не істеу керегін көрсет",
                  )}
                </button>
              )}
            </div>
          )}
          <div className="belgi-rover-controls">
            <button
              className="belgi-drag-handle"
              aria-label={t(
                "Переместить помощника стрелками или перетаскиванием",
                "Көмекшіні көрсеткімен не сүйреп жылжыту",
              )}
              title={t("Перетащите меня", "Мені сүйреп жылжытыңыз")}
              onKeyDown={(e) => {
                if (
                  !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(
                    e.key,
                  ) ||
                  tour ||
                  open
                )
                  return;
                e.preventDefault();
                const r = launcher.current!.getBoundingClientRect();
                setDragPosition({
                  left: Math.max(
                    8,
                    Math.min(
                      window.innerWidth - r.width - 8,
                      r.left +
                        (e.key === "ArrowLeft"
                          ? -40
                          : e.key === "ArrowRight"
                            ? 40
                            : 0),
                    ),
                  ),
                  top: Math.max(
                    8,
                    Math.min(
                      window.innerHeight - r.height - 8,
                      r.top +
                        (e.key === "ArrowUp"
                          ? -40
                          : e.key === "ArrowDown"
                            ? 40
                            : 0),
                    ),
                  ),
                });
              }}
              onPointerDown={(e) => {
                if (tour || open) return;
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
                if (!drag.current) return;
                const r = launcher.current!.getBoundingClientRect();
                setDragPosition({
                  left: Math.max(
                    8,
                    Math.min(
                      window.innerWidth - r.width - 8,
                      drag.current.left + e.clientX - drag.current.x,
                    ),
                  ),
                  top: Math.max(
                    8,
                    Math.min(
                      window.innerHeight - r.height - 8,
                      drag.current.top + e.clientY - drag.current.y,
                    ),
                  ),
                });
              }}
              onPointerUp={() => {
                drag.current = null;
              }}
              onPointerCancel={() => {
                drag.current = null;
              }}
            >
              <GripVertical size={16} />
            </button>
            <BelgiRobot
              size={96}
              onClick={onOpen}
              label={t("Открыть мини-чат BELGI AI", "BELGI AI шағын чатын ашу")}
            />
            <button className="belgi-rover-name" onClick={onOpen}>
              <b>
                BELGI <span>AI</span>
              </b>
              <small>
                {t("Нажмите, чтобы спросить", "Сұрағыңызды қойыңыз")}
              </small>
            </button>
            <div>
              <button
                aria-pressed={paused}
                title={
                  paused
                    ? t("Продолжить движение", "Қозғалысты жалғастыру")
                    : t("Остановить движение", "Қозғалысты тоқтату")
                }
                aria-label={
                  paused
                    ? t("Продолжить движение", "Қозғалысты жалғастыру")
                    : t("Остановить движение", "Қозғалысты тоқтату")
                }
                onClick={() => {
                  setPaused((value) => !value);
                  setDragPosition(null);
                }}
              >
                {paused ? <Play size={13} /> : <Pause size={13} />}
              </button>
              <button
                aria-label={t("Следующий совет", "Келесі кеңес")}
                title={t("Следующий совет", "Келесі кеңес")}
                onClick={() => {
                  setStep((value) => value + 1);
                  setDragPosition(null);
                  if (!paused && !reducedMotion)
                    setRouteStep((value) => value + 1);
                  setTipHidden(false);
                }}
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
      {open && (
        <section
          className="belgi-mini-chat"
          role="dialog"
          aria-modal="false"
          aria-labelledby="belgi-mini-title"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.stopPropagation();
              onClose();
            }
          }}
        >
          <header>
            <span className="belgi-mini-symbol">
              <BelgiRobot
                size={62}
                onClick={() => input.current?.focus()}
                label={t("Задать вопрос", "Сұрақ қою")}
              />
            </span>
            <div>
              <h2 id="belgi-mini-title">BELGI AI</h2>
              <span>
                {t("Бизнес-аналитик · демо", "Бизнес талдаушысы · демо")}
              </span>
            </div>
            <button
              onClick={onClose}
              aria-label={t("Свернуть чат", "Чатты жинау")}
            >
              <X size={18} />
            </button>
          </header>
          <div className="belgi-chat-context">
            <ShieldCheck size={13} />
            <span>Qazyna Store</span>
            <span>{t("Решение за вами", "Шешім өзіңізде")}</span>
          </div>
          <div
            className="belgi-mini-messages"
            ref={conversation}
            role="log"
            aria-live="polite"
            aria-relevant="additions"
            aria-label={t("Переписка с BELGI AI", "BELGI AI-мен хат алмасу")}
          >
            <div className="belgi-mini-intro">
              <span>
                01 / {t("АНАЛИТИКА И ДЕЙСТВИЯ", "ТАЛДАУ ЖӘНЕ ӘРЕКЕТ")}
              </span>
              <h3>{t("Разберём ваш бизнес.", "Бизнесіңізді талдайық.")}</h3>
              <p>
                {t(
                  "Объясню показатели и подготовлю следующий шаг. Каждый вывод опирается на доступные данные.",
                  "Көрсеткіштерді түсіндіріп, келесі қадамды дайындаймын. Әр тұжырым қолжетімді деректерге сүйенеді.",
                )}
              </p>
            </div>
            {history.map((item, index) => (
              <div className="belgi-exchange" key={index}>
                <p className="belgi-user-message">{item.question}</p>
                <div className="belgi-analyst-message">
                  <span>
                    <FileCheck2 size={12} /> BELGI AI
                  </span>
                  <p>{answer(item)}</p>
                  <small>
                    {t(
                      "Источник: Qazyna Store · демо",
                      "Дереккөз: Qazyna Store · демо",
                    )}
                  </small>
                  {[
                    "clients",
                    "reviews",
                    "growth",
                    "suppliers",
                    "automation",
                  ].includes(item.topic) && (
                    <button
                      onClick={() => {
                        onClose();
                        props.onNavigate(
                          item.topic === "suppliers"
                            ? "suppliers"
                            : item.topic === "automation"
                              ? "automation"
                              : item.topic === "clients"
                                ? "inbox"
                                : item.topic === "reviews"
                                  ? "reviews"
                                  : "growth",
                        );
                      }}
                    >
                      {t("Перейти к действиям", "Әрекетке өту")}
                      <ArrowRight size={14} />
                    </button>
                  )}
                  {(item.topic === "stock" || item.topic === "approval") && (
                    <button onClick={onPurchase}>
                      {t("Проверить закупку", "Сатып алуды тексеру")}
                      <ArrowRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="belgi-mini-prompts">
            {(["clients", "sales", "stock"] as const).map((value) => (
              <button key={value} onClick={() => ask(prompt(value), value)}>
                {value === "clients"
                  ? t("Кому ответить?", "Кімге жауап беру керек?")
                  : value === "sales"
                    ? t("Как идут продажи?", "Сатылым қалай?")
                    : value === "stock"
                      ? t("Что закупить?", "Не сатып алу керек?")
                      : t("Действия", "Әрекеттер")}
              </button>
            ))}
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              ask(question);
            }}
          >
            <input
              ref={input}
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              maxLength={500}
              placeholder={t("Задайте вопрос…", "Сұрағыңызды жазыңыз…")}
              aria-label={t("Вопрос BELGI AI", "BELGI AI-ға сұрақ")}
            />
            <button
              disabled={!question.trim()}
              aria-label={t("Отправить вопрос", "Сұрақты жіберу")}
            >
              <Send size={16} />
            </button>
          </form>
          <p className="belgi-mini-disclaimer">
            {t(
              "Демо-ответы по сценариям · без внешних действий",
              "Дайын демо жауаптар · сыртқы әрекеттерсіз",
            )}
          </p>
        </section>
      )}
    </>
  );
}
