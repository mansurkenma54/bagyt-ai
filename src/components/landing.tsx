"use client";
import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  Heart,
  MapPin,
  Play,
  Store,
  GraduationCap,
  FileSpreadsheet,
  MessageCircle,
  Receipt,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { Logo, Robot } from "./ui";
import { demoPreview, type DemoIndustry } from "@/lib/demo-preview";
import { money } from "@/lib/types";
type Props = {
  language: "ru" | "kk";
  onLanguage: () => void;
  onRegister: () => void;
  onLogin: () => void;
  onDemo: (industry: DemoIndustry) => void;
  busy: boolean;
  hasAccount?: boolean;
};
export default function Landing({
  language,
  onLanguage,
  onRegister,
  onLogin,
  onDemo,
  busy,
  hasAccount = false,
}: Props) {
  const t = (r: string, k: string) => (language === "ru" ? r : k);
  const [industry, setIndustry] = useState<DemoIndustry>("retail");
  const [stage, setStage] = useState("analysis");
  const sample = demoPreview(industry);
  const retail = industry === "retail";
  return (
    <div className="story-site">
      <header className="story-nav">
        <a href="#start" aria-label="BAGYT AI">
          <Logo />
        </a>
        <nav>
          <a href="#example">{t("Пример бизнеса", "Бизнес мысалы")}</a>
          <a href="#path">{t("Как помогает AQYL", "AQYL қалай көмектеседі")}</a>
        </nav>
        <div>
          <button className="lang" onClick={onLanguage}>
            {language === "ru" ? "ҚАЗ" : "РУС"}
          </button>
          <button className="story-login" onClick={onLogin}>
            {hasAccount
              ? t("Мой бизнес", "Менің бизнесім")
              : t("Войти", "Кіру")}
            <ArrowUpRight size={16} />
          </button>
        </div>
      </header>
      <main>
        <section className="story-hero" id="start">
          <div className="hero-editorial">
            <span className="story-eyebrow">
              <span />
              AI FOR SME & LOCAL BUSINESS
            </span>
            <h1>
              {t("Вы растите дело.", "Кәсібіңізді дамытыңыз.")}
              <br />
              <span>{t("AQYL помогает", "AQYL бағыт")}</span>
              <br />
              <span className="hero-last">
                {t("найти путь.", "табуға көмектеседі.")}
                <svg viewBox="0 0 180 16" aria-hidden="true">
                  <path d="M4 12Q83-4 175 8" />
                </svg>
              </span>
            </h1>
            <p>
              {t(
                "Продажи в кассе. Клиенты в WhatsApp. Расходы в тетради. Соберите данные в BAGYT — и поймите, что делать дальше.",
                "Сату — кассада. Клиенттер — WhatsApp-та. Шығындар — дәптерде. Деректерді BAGYT-ке жинап, келесі қадамды анықтаңыз.",
              )}
            </p>
            <div className="story-cta">
              <button className="primary" onClick={onRegister}>
                {t("Начать со своего бизнеса", "Өз бизнесіммен бастау")}
                <ArrowRight size={18} />
              </button>
              <a className="story-play" href="#example">
                <span>
                  <Play size={14} fill="currentColor" />
                </span>
                {t("Сначала посмотреть пример", "Алдымен мысалды көру")}
              </a>
            </div>
            <div className="hero-promise">
              <Check size={16} />
              {t("3 шага для старта", "Бастауға 3 қадам")}
              <span>·</span>
              {t("На русском и қазақша", "Орысша және қазақша")}
            </div>
          </div>
          <div
            className="business-world"
            aria-label={t(
              "Иллюстрация: данные магазина собираются у AQYL",
              "Иллюстрация: дүкен деректері AQYL-да жиналады",
            )}
          >
            <div className="world-grid" />
            <span className="world-tag">
              <MapPin size={14} />
              Тараз · {t("своё дело", "өз ісің")}
            </span>
            <div className="little-shop">
              <div className="shop-sign">
                DALA<span>дүкен · store</span>
              </div>
              <div className="shop-awning">
                {Array.from({ length: 7 }, (_, i) => (
                  <i key={i} />
                ))}
              </div>
              <div className="shop-front">
                <div className="shop-window">
                  <div className="shop-plant">
                    <i />
                    <i />
                    <i />
                  </div>
                  <span>{t("Сәлем, сосед!", "Сәлем, көрші!")}</span>
                </div>
                <div className="shop-door">
                  <span />
                  <i />
                </div>
              </div>
              <div className="shop-step" />
            </div>
            <div className="world-slip slip-sales">
              <span className="slip-icon">
                <Receipt size={18} />
              </span>
              <div>
                <b>{t("Продажи", "Сату")}</b>
                <small>{t("Касса + сайт", "Касса + сайт")}</small>
              </div>
              <Check size={14} />
            </div>
            <div className="world-slip slip-clients">
              <span className="slip-icon">
                <MessageCircle size={18} />
              </span>
              <div>
                <b>{t("Клиенты", "Клиенттер")}</b>
                <small>
                  {t("Вопросы и заказы", "Сұрақтар мен тапсырыстар")}
                </small>
              </div>
            </div>
            <div className="world-aqyl">
              <Robot size={157} />
              <span>
                AQYL <Heart size={12} />
              </span>
            </div>
            <div className="world-note">
              <Sparkles size={16} />
              <span>
                {t(
                  "Соберём всё в понятный план.",
                  "Бәрін түсінікті жоспарға жинайық.",
                )}
              </span>
            </div>
            <span className="world-caption">
              {t(
                "У каждого большого дела — своё начало.",
                "Әр үлкен істің өз бастауы бар.",
              )}
            </span>
          </div>
        </section>
        <div className="story-track">
          <span>
            <MapPin size={18} />
            {t(
              "Для бизнеса Тараза и Жамбылской области",
              "Тараз және Жамбыл облысының бизнесі үшін",
            )}
          </span>
          <p>
            {t(
              "Не просто цифры. Основа для следующего решения.",
              "Жай сандар емес. Келесі шешімге негіз.",
            )}
          </p>
          <span className="track-mark">ДЕРЕК → БАҒЫТ → ӘРЕКЕТ</span>
        </div>
        <section className="story-example" id="example">
          <div className="example-heading">
            <div>
              <span className="story-eyebrow">
                01 / {t("ПОПРОБУЙТЕ НА ПРИМЕРЕ", "МЫСАЛМЕН ТАНЫСЫҢЫЗ")}
              </span>
              <h2>
                {t("Обычный бизнес.", "Күнделікті бизнес.")}
                <br />
                <em>
                  {t("Теперь — понятная картина.", "Енді — түсінікті көрініс.")}
                </em>
              </h2>
            </div>
            <p>
              {t(
                "Выберите историю и посмотрите, как из отдельных записей получается план развития.",
                "Бір мысалды таңдап, жеке жазбалардан даму жоспары қалай құрылатынын көріңіз.",
              )}
            </p>
          </div>
          <div
            className="example-selector"
            aria-label={t("Выберите пример", "Мысалды таңдаңыз")}
          >
            <button aria-pressed={retail} onClick={() => setIndustry("retail")}>
              <Store size={20} />
              <span>
                <b>Dala Store</b>
                <small>{t("Небольшой магазин", "Шағын дүкен")}</small>
              </span>
              <ChevronRight size={17} />
            </button>
            <button
              aria-pressed={!retail}
              onClick={() => setIndustry("education")}
            >
              <GraduationCap size={21} />
              <span>
                <b>Bilim Academy</b>
                <small>{t("Учебный центр", "Оқу орталығы")}</small>
              </span>
              <ChevronRight size={17} />
            </button>
            <div className="example-disclosure">
              <span />
              {t(
                "Учебный пример. Все компании, люди и данные вымышлены.",
                "Оқу мысалы. Компаниялар, адамдар және деректер ойдан құрастырылған.",
              )}
            </div>
          </div>
          <div className="example-workbook">
            <aside className="case-profile">
              <div className="case-monogram">
                {retail ? "D" : "B"}
                <span>↗</span>
              </div>
              <span className="case-place">
                ТАРАЗ · {t("МАЛЫЙ БИЗНЕС", "ШАҒЫН БИЗНЕС")}
              </span>
              <h3>{sample.name}</h3>
              <p>
                {retail
                  ? t(
                      "Айдана ведёт магазин с двумя сотрудниками. Продажи есть, но понять, куда уходит прибыль, непросто.",
                      "Айдана екі қызметкерімен дүкен жүргізеді. Сату бар, бірақ пайда қайда кететінін түсіну қиын.",
                    )
                  : t(
                      "Айдана развивает учебный центр. Оплаты, заявки на курсы и реклама хранятся в разных местах.",
                      "Айдана оқу орталығын дамытып жатыр. Төлемдер, курс өтінімдері және жарнама әр жерде сақталған.",
                    )}
              </p>
              <div className="case-goal">
                <small>{t("ЦЕЛЬ ВЛАДЕЛЬЦА", "КӘСІПКЕРДІҢ МАҚСАТЫ")}</small>
                <b>
                  {retail
                    ? t(
                        "Сохранить прибыль и не терять клиентов",
                        "Пайданы сақтап, клиенттерді жоғалтпау",
                      )
                    : t(
                        "Превращать заявки в оплаченные занятия",
                        "Өтінімдерді төленген сабақтарға айналдыру",
                      )}
                </b>
              </div>
              <div className="case-sources">
                <span>UMAG / POS</span>
                <span>WhatsApp</span>
                <span>2GIS</span>
                <span>CSV</span>
              </div>
              <small className="case-source-note">
                {t(
                  "Названия каналов в примере. Это не реальные подключения.",
                  "Мысалдағы арна атаулары. Нақты қосылымдар емес.",
                )}
              </small>
            </aside>
            <div className="case-content">
              <div
                className="case-tabs"
                aria-label={t("Этап примера", "Мысал кезеңі")}
              >
                {[
                  ["data", t("Данные", "Деректер")],
                  ["analysis", t("Разбор AQYL", "AQYL талдауы")],
                  ["plan", t("План развития", "Даму жоспары")],
                ].map(([id, label], i) => (
                  <button
                    key={id}
                    aria-pressed={stage === id}
                    onClick={() => setStage(id)}
                  >
                    <span>0{i + 1}</span>
                    {label}
                  </button>
                ))}
              </div>
              <div className="case-stage" aria-live="polite">
                {stage === "data" && (
                  <>
                    <span className="stage-overline">
                      {t(
                        "60 ДНЕЙ ИСТОРИИ · 97 ЗАПИСЕЙ",
                        "60 КҮН ТАРИХЫ · 97 ЖАЗБА",
                      )}
                    </span>
                    <h3>
                      {t("Всё начинается с фактов", "Бәрі деректен басталады")}
                    </h3>
                    <p>
                      {t(
                        "60 продаж, 12 расходов, 18 обращений, 5 отзывов и рекламная кампания. Ещё одна запись с сайта требует проверки на повтор.",
                        "60 сату, 12 шығын, 18 өтініш, 5 пікір және жарнама науқаны. Сайттан келген тағы бір жазбаның қайталануын тексеру керек.",
                      )}
                    </p>
                    <div className="case-data-table">
                      {[
                        [
                          "POS-1000",
                          t("Продажа", "Сату"),
                          money(sample.sales[0] * 100),
                        ],
                        ["EXP-0", t("Расход", "Шығын"), money(3400000)],
                        ["LEAD-12", "WhatsApp", t("Без ответа", "Жауапсыз")],
                        [
                          "WEB-1000",
                          t("Заказ с сайта", "Сайт тапсырысы"),
                          t("Возможный повтор", "Қайталануы мүмкін"),
                        ],
                      ].map(([id, title, value]) => (
                        <div key={id}>
                          <FileSpreadsheet size={17} />
                          <span>
                            <b>{title}</b>
                            <small>{id}</small>
                          </span>
                          <strong>{value}</strong>
                        </div>
                      ))}
                    </div>
                    <div className="case-assurance">
                      <ShieldCheck size={17} />
                      {t(
                        "96 проверенных записей. Повтор не завышает выручку.",
                        "96 тексерілген жазба. Қайталану түсімді арттырмайды.",
                      )}
                    </div>
                  </>
                )}
                {stage === "analysis" && (
                  <>
                    <span className="stage-overline">
                      {t(
                        "ПОСЛЕДНИЕ 30 ДНЕЙ · ДЕМО-ДАННЫЕ",
                        "СОҢҒЫ 30 КҮН · ДЕМО-ДЕРЕКТЕР",
                      )}
                    </span>
                    <div className="case-numbers">
                      <div>
                        <span>{t("Выручка", "Түсім")}</span>
                        <b>{money(sample.revenue * 100)}</b>
                      </div>
                      <div>
                        <span>{t("Расходы", "Шығындар")}</span>
                        <b>{money(sample.expenses * 100)}</b>
                      </div>
                      <div>
                        <span>{t("Без ответа", "Жауапсыз")}</span>
                        <b>
                          8 <small>/ 18</small>
                        </b>
                      </div>
                    </div>
                    <div className="case-aqyl-note">
                      <Robot size={67} state="curious" />
                      <div>
                        <b>
                          {t(
                            "Я бы начал с клиентов.",
                            "Клиенттерден бастар едім.",
                          )}
                        </b>
                        <p>
                          {t(
                            "В 8 обращениях нет ответа. Проверьте переписку — возможно, человек всё ещё ждёт вас.",
                            "8 өтініште жауап жоқ. Хаттарды тексеріңіз — адам әлі де жауабыңызды күтуі мүмкін.",
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="case-signals">
                      <div>
                        <span>↗</span>
                        <p>
                          <b>
                            {t(
                              "Расходы выросли на 48%",
                              "Шығындар 48%-ға өсті",
                            )}
                          </b>
                          <small>
                            {t(
                              "204 000 ₸ вместо 138 000 ₸ за предыдущие 30 дней",
                              "Алдыңғы 30 күндегі 138 000 ₸ орнына 204 000 ₸",
                            )}
                          </small>
                        </p>
                      </div>
                      <div>
                        <span>≈</span>
                        <p>
                          <b>{t("Валовая маржа — 14%", "Жалпы маржа — 14%")}</b>
                          <small>
                            {t(
                              "Стоит проверить закупочные цены и скидки",
                              "Сатып алу бағалары мен жеңілдіктерді тексерген жөн",
                            )}
                          </small>
                        </p>
                      </div>
                    </div>
                    <p className="case-limit">
                      {t(
                        "Это расчёт по примеру, не прогноз дохода и не доказательство потери клиентов.",
                        "Бұл — мысал бойынша есеп. Табыс болжамы немесе клиенттерді жоғалту дәлелі емес.",
                      )}
                    </p>
                  </>
                )}
                {stage === "plan" && (
                  <>
                    <span className="stage-overline">
                      {t(
                        "ЧЕРНОВИК · РЕШЕНИЕ ЗА ВЛАДЕЛЬЦЕМ",
                        "ЖОБА · ШЕШІМ КӘСІПКЕРДЕ",
                      )}
                    </span>
                    <h3>
                      {t(
                        "Меньше тревоги. Три понятных дела.",
                        "Аз алаңдау. Үш түсінікті іс.",
                      )}
                    </h3>
                    <div className="case-plan">
                      {[
                        [
                          t("Проверить 8 обращений", "8 өтінішті тексеру"),
                          t(
                            "Данияр · сверить переписку и ответы",
                            "Данияр · хаттар мен жауаптарды салыстыру",
                          ),
                        ],
                        [
                          t(
                            "Разобрать рост расходов",
                            "Шығындардың өсуін талдау",
                          ),
                          t(
                            "Айдана · проверить категории и лимиты",
                            "Айдана · санаттар мен лимиттерді тексеру",
                          ),
                        ],
                        [
                          t(
                            "Проверить цены и скидки",
                            "Бағалар мен жеңілдіктерді тексеру",
                          ),
                          t(
                            "Айдана · сравнить цену и себестоимость",
                            "Айдана · баға мен өзіндік құнды салыстыру",
                          ),
                        ],
                      ].map(([title, desc], i) => (
                        <div key={title}>
                          <span>{i + 1}</span>
                          <p>
                            <b>{title}</b>
                            <small>{desc}</small>
                          </p>
                          <span className="plan-check" />
                        </div>
                      ))}
                    </div>
                    <div className="case-assurance">
                      <ShieldCheck size={19} />
                      {t(
                        "После утверждения — задачи и проверка результата по новым данным. Рост не обещаем заранее.",
                        "Бекіткен соң — тапсырмалар және жаңа деректер бойынша нәтижені тексеру. Өсуге алдын ала уәде бермейміз.",
                      )}
                    </div>
                  </>
                )}
              </div>
              <div className="case-bottom">
                <span>
                  {t(
                    "Хотите пройти весь путь?",
                    "Бүкіл жолды байқап көресіз бе?",
                  )}
                </span>
                <button
                  className="primary"
                  disabled={busy}
                  onClick={() => onDemo(industry)}
                >
                  {busy
                    ? t("Готовим пример…", "Мысал дайындалуда…")
                    : t(`Открыть ${sample.name}`, `${sample.name} ашу`)}
                  <ArrowUpRight size={17} />
                </button>
              </div>
            </div>
          </div>
        </section>
        <section className="story-path" id="path">
          <div>
            <span className="story-eyebrow">
              02 / {t("ОТ ИНФОРМАЦИИ К ДЕЙСТВИЮ", "АҚПАРАТТАН ӘРЕКЕТКЕ")}
            </span>
            <h2>
              {t("Не нужно разбираться", "Бәрін бірден")}
              <br />
              {t("во всём сразу.", "түсіну міндет емес.")}
            </h2>
            <p>
              {t(
                "AQYL помогает на каждом шаге. Вы сохраняете контроль над данными и решениями.",
                "AQYL әр қадамда көмектеседі. Деректер мен шешімдер өз бақылауыңызда қалады.",
              )}
            </p>
            <Robot size={120} state="success" />
          </div>
          <ol>
            {[
              [
                t("Расскажите о своём деле", "Кәсібіңіз туралы айтыңыз"),
                t(
                  "Бизнес, цель, аккаунт. Три коротких шага — и можно работать.",
                  "Бизнес, мақсат, аккаунт. Үш қысқа қадам — жұмысқа кірісуге болады.",
                ),
              ],
              [
                t("Добавьте первый источник", "Алғашқы дереккөзді қосыңыз"),
                t(
                  "Загрузите Excel, CSV или чек. Подтвердите записи перед анализом.",
                  "Excel, CSV немесе чек жүктеңіз. Талдауға дейін жазбаларды растаңыз.",
                ),
              ],
              [
                t("Выберите, что улучшить", "Нені жақсартуды таңдаңыз"),
                t(
                  "Посмотрите факты, утвердите план и поручите задачи команде.",
                  "Деректерді қарап, жоспарды бекітіңіз және командаға тапсырма беріңіз.",
                ),
              ],
              [
                t("Проверьте, что изменилось", "Не өзгергенін тексеріңіз"),
                t(
                  "Добавьте свежие данные и сравните одинаковые периоды.",
                  "Жаңа деректер қосып, ұзақтығы бірдей кезеңдерді салыстырыңыз.",
                ),
              ],
            ].map(([title, desc], i) => (
              <li key={title}>
                <span>0{i + 1}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
        <section className="story-final">
          <span className="story-eyebrow">
            BAGYT — {t("НАПРАВЛЕНИЕ ДЛЯ ВАШЕГО ДЕЛА", "КӘСІБІҢІЗГЕ БАҒЫТ")}
          </span>
          <h2>{t("Следующая история — ваша.", "Келесі оқиға — сіздікі.")}</h2>
          <p>
            {t(
              "Начните с того, что уже есть. Остальное соберём по шагам.",
              "Қолыңызда бардан бастаңыз. Қалғанын қадамдап жинаймыз.",
            )}
          </p>
          <button className="primary" onClick={onRegister}>
            {t("Начать с трёх вопросов", "Үш сұрақтан бастау")}
            <ArrowRight size={18} />
          </button>
        </section>
      </main>
      <footer className="story-footer">
        <Logo />
        <span>
          {t(
            "С заботой о местном бизнесе.",
            "Жергілікті бизнеске қамқорлықпен.",
          )}
          <br />
          Тараз, Қазақстан
        </span>
        <a href="#example">
          {t("Посмотреть пример ещё раз", "Мысалды қайта көру")}
          <ArrowUpRight size={16} />
        </a>
      </footer>
    </div>
  );
}
