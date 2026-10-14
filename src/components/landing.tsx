"use client";
import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  LayoutDashboard,
  Plug,
  Route,
  Menu,
  X,
  Store,
  Coffee,
  Scissors,
  GraduationCap,
  BriefcaseBusiness,
  ShieldCheck,
  FileSpreadsheet,
  Receipt,
  MessageCircle,
  Heart,
  Plus,
} from "lucide-react";
import { Logo, Robot } from "./ui";
type Props = {
  language: "ru" | "kk";
  onLanguage: () => void;
  onRegister: (industry?: string) => void;
  onLogin: () => void;
  hasAccount?: boolean;
};
export default function Landing({
  language,
  onLanguage,
  onRegister,
  onLogin,
  hasAccount = false,
}: Props) {
  const t = (r: string, k: string) => (language === "ru" ? r : k);
  const [menu, setMenu] = useState(false);
  const [tab, setTab] = useState("start");
  const go = (id: string) => {
    setTab(id);
    setMenu(false);
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const industries = [
    {
      id: "retail",
      icon: Store,
      title: t("Магазин", "Дүкен"),
      hint: t("Товары и продажи", "Тауарлар мен сату"),
    },
    {
      id: "cafe",
      icon: Coffee,
      title: t("Кафе и ресторан", "Кафе мен мейрамхана"),
      hint: t("Гости и заказы", "Қонақтар мен тапсырыстар"),
    },
    {
      id: "salon",
      icon: Scissors,
      title: t("Услуги и красота", "Қызметтер мен сұлулық"),
      hint: t("Клиенты и записи", "Клиенттер мен жазылу"),
    },
    {
      id: "education",
      icon: GraduationCap,
      title: t("Обучение", "Білім беру"),
      hint: t("Ученики и оплаты", "Оқушылар мен төлемдер"),
    },
    {
      id: "services",
      icon: BriefcaseBusiness,
      title: t("Другой бизнес", "Басқа бизнес"),
      hint: t("Подстроимся под ваше дело", "Кәсібіңізге бейімделеміз"),
    },
  ];
  return (
    <div className="entry-shell">
      <aside className={"entry-sidebar " + (menu ? "is-open" : "")}>
        <Logo />
        <button
          className="entry-close icon-button"
          aria-label={t("Закрыть меню", "Мәзірді жабу")}
          onClick={() => setMenu(false)}
        >
          <X size={20} />
        </button>
        <div className="entry-nav-label">
          {t("ВАШ БИЗНЕС-ПОМОЩНИК", "БИЗНЕС КӨМЕКШІҢІЗ")}
        </div>
        <nav>
          {[
            ["start", LayoutDashboard, t("Начать с AQYL", "AQYL-мен бастау")],
            ["sources", Plug, t("Подключить данные", "Деректерді қосу")],
            ["how", Route, t("Как это работает", "Қалай жұмыс істейді")],
          ].map(([id, Icon, label]: any) => (
            <button
              key={id}
              className={tab === id ? "active" : ""}
              onClick={() => go(id)}
            >
              <Icon size={19} />
              <span>{label}</span>
              {tab === id && <i />}
            </button>
          ))}
        </nav>
        <div className="entry-side-bottom">
          <div className="entry-help">
            <Heart size={18} />
            <b>{t("С заботой о вашем деле", "Кәсібіңізге қамқор")}</b>
            <p>
              {t(
                "Понятные цифры. Спокойные решения. AQYL рядом.",
                "Түсінікті сандар. Сенімді шешімдер. AQYL қасыңызда.",
              )}
            </p>
          </div>
          <button className="secondary full" onClick={onLogin}>
            {hasAccount
              ? t("Вернуться в мой бизнес", "Бизнесіме оралу")
              : t("Уже есть аккаунт? Войти", "Аккаунтыңыз бар ма? Кіру")}
            <ArrowUpRight size={16} />
          </button>
        </div>
      </aside>
      {menu && (
        <button
          className="entry-backdrop"
          aria-label={t("Закрыть меню", "Мәзірді жабу")}
          onClick={() => setMenu(false)}
        />
      )}
      <div className="entry-main">
        <header className="entry-topbar">
          <div>
            <button
              className="icon-button entry-menu"
              aria-label={t("Открыть меню", "Мәзірді ашу")}
              onClick={() => setMenu(true)}
            >
              <Menu size={21} />
            </button>
            <span>BAGYT</span>
            <ChevronRight size={14} />
            <b>{t("Знакомство", "Танысу")}</b>
          </div>
          <div>
            <button className="lang" onClick={onLanguage}>
              {language === "ru" ? "Қазақша" : "Русский"}
            </button>
            <button className="text-button" onClick={onLogin}>
              {hasAccount ? t("Мой бизнес", "Бизнесім") : t("Войти", "Кіру")}
              <ArrowUpRight size={16} />
            </button>
          </div>
        </header>
        <main className="entry-content">
          <section className="entry-hero" id="start">
            <div>
              <span className="entry-kicker">
                <i />
                BAGYT ·{" "}
                {t("AQYL ДЛЯ ВАШЕГО БИЗНЕСА", "БИЗНЕСІҢІЗГЕ АРНАЛҒАН AQYL")}
              </span>
              <h1>
                {t("Понять свой бизнес.", "Бизнесіңізді түсініңіз.")}
                <br />
                <em>
                  {t("Знать, что делать дальше.", "Келесі қадамды біліңіз.")}
                </em>
              </h1>
              <p>
                {t(
                  "Продажи, расходы и клиенты — в одном месте. AQYL поможет увидеть главное и составить понятный план.",
                  "Сату, шығындар және клиенттер — бір жерде. AQYL маңыздысын көрсетіп, түсінікті жоспар құруға көмектеседі.",
                )}
              </p>
            </div>
            <div className="entry-hero-mascot">
              <div className="entry-orbit" />
              <Robot size={177} />
              <span>
                AQYL <i /> {t("рядом", "қасыңызда")}
              </span>
            </div>
          </section>
          <div className="entry-steps">
            <span className="active">
              <b>01</b>
              {t("Расскажите о бизнесе", "Бизнес туралы айтыңыз")}
            </span>
            <span>
              <b>02</b>
              {t("Добавьте данные", "Деректерді қосыңыз")}
            </span>
            <span>
              <b>03</b>
              {t("Получите ясный план", "Түсінікті жоспар алыңыз")}
            </span>
          </div>
          <div className="entry-workspace">
            <section className="entry-question">
              <div className="entry-panel-heading">
                <span className="entry-panel-icon">
                  <MessageCircle size={20} />
                </span>
                <div>
                  <span className="entry-overline">
                    {t("НАЧНЁМ С ВАШЕГО ДЕЛА", "КӘСІБІҢІЗДЕН БАСТАЙЫҚ")}
                  </span>
                  <h2>{t("Познакомимся?", "Танысайық?")}</h2>
                </div>
                <span className="entry-counter">1 / 3</span>
              </div>
              <div className="entry-question-body">
                <div className="entry-greeting">
                  <Robot size={55} state="success" />
                  <p>
                    {t(
                      "Сәлем! Я AQYL. Помогу разобраться в цифрах и выбрать следующий шаг. Какой у вас бизнес?",
                      "Сәлем! Мен AQYL-мын. Сандарды түсініп, келесі қадамды таңдауға көмектесемін. Сізде қандай бизнес?",
                    )}
                  </p>
                </div>
                <div className="entry-choices">
                  {industries.map(({ id, icon: Icon, title, hint }) => (
                    <button key={id} onClick={() => onRegister(id)}>
                      <Icon size={23} />
                      <span>
                        <b>{title}</b>
                        <small>{hint}</small>
                      </span>
                      <ArrowRight size={17} />
                    </button>
                  ))}
                </div>
                <div className="entry-question-note">
                  <ShieldCheck size={15} />
                  {t(
                    "Выберите вариант. Следом — цель и аккаунт.",
                    "Нұсқаны таңдаңыз. Келесіде — мақсат пен аккаунт.",
                  )}
                </div>
              </div>
            </section>
            <section className="entry-preview">
              <div className="entry-panel-heading">
                <div>
                  <span className="entry-overline">
                    {t("ВАША КАРТИНА БИЗНЕСА", "БИЗНЕСІҢІЗДІҢ КӨРІНІСІ")}
                  </span>
                  <h2>
                    {t("Главное — перед глазами", "Маңыздысы — көз алдыңызда")}
                  </h2>
                </div>
                <span className="entry-preview-label">
                  {t("После подключения", "Қосқаннан кейін")}
                </span>
              </div>
              <div className="entry-preview-body">
                <div className="entry-preview-mascot">
                  <Robot size={150} />
                  <div>
                    <b>
                      {t(
                        "Всё по делу. Ничего лишнего.",
                        "Тек керегі. Артық ештеңе жоқ.",
                      )}
                    </b>
                    <p>
                      {t(
                        "Здесь появятся ваши цифры, вопросы, требующие внимания, и следующие действия.",
                        "Мұнда сандарыңыз, назар аударатын мәселелер және келесі әрекеттер пайда болады.",
                      )}
                    </p>
                  </div>
                </div>
                <div className="entry-empty-metrics">
                  {[
                    t("Продажи", "Сату"),
                    t("Расходы", "Шығындар"),
                    t("Клиенты", "Клиенттер"),
                  ].map((title) => (
                    <div key={title}>
                      <span>{title}</span>
                      <b>—</b>
                      <small>
                        {t("Ждём ваши данные", "Деректеріңізді күтеміз")}
                      </small>
                    </div>
                  ))}
                </div>
                <div className="entry-next-preview">
                  <span>
                    <Check size={16} />
                  </span>
                  <div>
                    <b>
                      {t(
                        "Один понятный следующий шаг",
                        "Бір түсінікті келесі қадам",
                      )}
                    </b>
                    <p>
                      {t(
                        "С объяснением и ссылкой на исходные записи.",
                        "Түсіндірмесі және бастапқы жазбалары бар.",
                      )}
                    </p>
                  </div>
                  <ArrowRight size={17} />
                </div>
                <div className="entry-privacy">
                  <ShieldCheck size={15} />
                  {t(
                    "Решения за вами. Данные доступны вашей команде.",
                    "Шешім өзіңізде. Деректер командаңызға қолжетімді.",
                  )}
                </div>
              </div>
            </section>
          </div>
          <section className="entry-sources" id="sources">
            <div className="entry-section-title">
              <div>
                <span className="entry-overline">
                  {t("ДАННЫЕ В ОДНОМ МЕСТЕ", "ДЕРЕКТЕР БІР ЖЕРДЕ")}
                </span>
                <h2>
                  {t("Начните с одного источника", "Бір дереккөзден бастаңыз")}
                </h2>
                <p>
                  {t(
                    "Не нужно подключать всё сразу. Отчёта или одного чека достаточно для первого шага.",
                    "Бәрін бірден қосу міндет емес. Алғашқы қадамға бір есеп немесе чек жеткілікті.",
                  )}
                </p>
              </div>
              <button className="secondary" onClick={() => onRegister()}>
                {t("Добавить свой источник", "Дереккөзімді қосу")}
                <Plus size={17} />
              </button>
            </div>
            <div className="entry-source-list">
              {[
                [
                  "Excel / CSV",
                  t("Загрузить отчёт", "Есепті жүктеу"),
                  FileSpreadsheet,
                  Receipt,
                ],
                [
                  t("Фото чека", "Чек фотосы"),
                  t("Распознать и проверить", "Танып, тексеру"),
                  Receipt,
                ],
                [
                  t("Ваш сайт", "Сайтыңыз"),
                  t("Получать заказы", "Тапсырыстарды алу"),
                  Plug,
                ],
              ].map(([title, desc, Icon]: any) => (
                <button key={title} onClick={() => onRegister()}>
                  <span>
                    <Icon size={22} />
                  </span>
                  <div>
                    <b>{title}</b>
                    <small>{desc}</small>
                  </div>
                  <ArrowUpRight size={16} />
                </button>
              ))}
            </div>
            <details className="entry-integrations">
              <summary>
                {t(
                  "WhatsApp, Instagram, TikTok, 2GIS и UMAG",
                  "WhatsApp, Instagram, TikTok, 2GIS және UMAG",
                )}
                <span>{t("Что можно подключить", "Қосу мүмкіндіктері")}</span>
              </summary>
              <p>
                {t(
                  "Сейчас можно загрузить разрешённые выгрузки этих сервисов. Подключение по номеру или ссылке — демонстрация настройки; оно не получает данные из аккаунта. Для автоматической синхронизации нужны официальные API и доступ владельца.",
                  "Қазір осы сервистердің рұқсат етілген экспорттарын жүктеуге болады. Нөмір немесе сілтемемен қосу — баптау көрсетілімі; ол аккаунт деректерін алмайды. Автоматты синхрондау үшін ресми API мен иесінің қолжетімділігі қажет.",
                )}
              </p>
            </details>
          </section>
          <section className="entry-how" id="how">
            <div>
              <span className="entry-overline">
                {t("ПРОСТОЙ ПОРЯДОК ДЕЙСТВИЙ", "ҚАРАПАЙЫМ ӘРЕКЕТ РЕТІ")}
              </span>
              <h2>
                {t(
                  "AQYL помогает. Вы управляете.",
                  "AQYL көмектеседі. Сіз басқарасыз.",
                )}
              </h2>
            </div>
            <div className="entry-how-grid">
              {[
                [
                  "01",
                  t("Отвечаете на три вопроса", "Үш сұраққа жауап бересіз"),
                  t(
                    "Бизнес, цель, аккаунт. Остальное заполните по ходу работы.",
                    "Бизнес, мақсат, аккаунт. Қалғанын жұмыс барысында толтырасыз.",
                  ),
                ],
                [
                  "02",
                  t(
                    "Добавляете и проверяете данные",
                    "Деректерді қосып, тексересіз",
                  ),
                  t(
                    "AQYL собирает записи и пересчитывает показатели после подтверждения.",
                    "AQYL жазбаларды жинап, растағаннан кейін көрсеткіштерді қайта есептейді.",
                  ),
                ],
                [
                  "03",
                  t("Выбираете действие", "Әрекетті таңдайсыз"),
                  t(
                    "Смотрите объяснения, утверждаете план и проверяете изменения.",
                    "Түсіндірмелерді қарап, жоспарды бекітесіз және өзгерістерді тексересіз.",
                  ),
                ],
              ].map(([num, title, desc]) => (
                <article key={num}>
                  <span>{num}</span>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </article>
              ))}
            </div>
          </section>
          <footer className="entry-footer">
            <span>BAGYT AI · {t("Для вашего дела", "Кәсібіңіз үшін")}</span>
            <span>Тараз, Қазақстан</span>
            <button onClick={() => go("start")}>
              {t("Начать с AQYL", "AQYL-мен бастау")}
              <ArrowUpRight size={15} />
            </button>
          </footer>
        </main>
      </div>
    </div>
  );
}
