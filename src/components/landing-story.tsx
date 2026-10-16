"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  Check,
  CheckCheck,
  Circle,
  Package,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import BelgiRobot, { type AgentVariant } from "./belgi-robot";
import ProductVisual from "./product-visual";
import ChannelIcon from "./channel-icon";

type Pose = { x: number; y: number; scale: number; rotate: number };
const order: AgentVariant[] = ["belgi", "sana", "qor"];
const initial: Pose[] = [
  { x: 0, y: -8, scale: 1, rotate: -3 },
  { x: -152, y: 24, scale: 1, rotate: -7 },
  { x: 152, y: 28, scale: 1, rotate: 6 },
];
const compositions: Pose[][] = [
  [
    { x: 0, y: -2, scale: 1.16, rotate: -3 },
    { x: -117, y: 76, scale: 0.72, rotate: -8 },
    { x: 117, y: 79, scale: 0.72, rotate: 8 },
  ],
  [
    { x: 116, y: 73, scale: 0.72, rotate: 8 },
    { x: 0, y: -5, scale: 1.32, rotate: -4 },
    { x: -116, y: 79, scale: 0.74, rotate: -7 },
  ],
  [
    { x: -115, y: 76, scale: 0.72, rotate: -7 },
    { x: 116, y: 78, scale: 0.75, rotate: 7 },
    { x: 0, y: -3, scale: 1.29, rotate: 3 },
  ],
];
const clamp = (value: number, min = 0, max = 1) =>
  Math.max(min, Math.min(max, value));
const mix = (a: number, b: number, progress: number) => a + (b - a) * progress;
const interpolate = (a: Pose, b: Pose, p: number): Pose => ({
  x: mix(a.x, b.x, p),
  y: mix(a.y, b.y, p),
  scale: mix(a.scale, b.scale, p),
  rotate: mix(a.rotate, b.rotate, p),
});

export default function LandingStory({ language }: { language: "ru" | "kk" }) {
  const t = (ru: string, kk: string) => (language === "ru" ? ru : kk);
  const track = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const chapters = useRef<(HTMLElement | null)[]>([]);
  const [motion, setMotion] = useState({
    intro: 0,
    chapter: 0,
    reduced: false,
  });

  useEffect(() => {
    let raf = 0;
    const media = window.matchMedia(
      "(prefers-reduced-motion: reduce), (max-height: 500px)",
    );
    const measure = () => {
      raf = 0;
      if (!track.current || !chapters.current[0] || !chapters.current[2])
        return;
      const narrow = window.innerWidth <= 760;
      const top = track.current.getBoundingClientRect().top;
      const intro = clamp((220 - top) / 340);
      // Mobile chapters have different heights. Follow each visible heading,
      // so the speaking agent always introduces the content being read.
      const readingLine = narrow
        ? (stage.current?.getBoundingClientRect().bottom ?? 337) + 40
        : window.innerHeight * 0.4;
      const transitionDistance = narrow ? 180 : 260;
      let chapter = 0;
      for (let index = 1; index < chapters.current.length; index++) {
        const heading =
          chapters.current[index]?.querySelector(".ls-chapter-copy");
        if (!heading) continue;
        const headingTop = heading.getBoundingClientRect().top;
        if (headingTop < readingLine + transitionDistance) {
          chapter =
            index -
            1 +
            clamp(
              (readingLine + transitionDistance - headingTop) /
                transitionDistance,
            );
        }
      }
      setMotion((previous) =>
        Math.abs(previous.intro - intro) < 0.001 &&
        Math.abs(previous.chapter - chapter) < 0.001 &&
        previous.reduced === media.matches
          ? previous
          : { intro, chapter, reduced: media.matches },
      );
    };
    const schedule = () => {
      if (!raf) raf = window.requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    media.addEventListener("change", schedule);
    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      media.removeEventListener("change", schedule);
    };
  }, []);

  const foreground = Math.round(motion.chapter);
  const from = Math.floor(motion.chapter);
  const to = Math.min(2, from + 1);
  const blend = motion.chapter - from;
  const names = ["Belgi", "Sana", "Qor"];
  const speeches = [
    t(
      "Большая цель? Начнём с ясного шага.",
      "Үлкен мақсат па? Нақты қадамнан бастайық.",
    ),
    t(
      "Клиент ждёт. Я помогу с ответом.",
      "Клиент күтіп отыр. Жауапқа көмектесейін.",
    ),
    t(
      "Запас на исходе. Подготовим закупку.",
      "Қор азайып келеді. Сатып алуды дайындайық.",
    ),
  ];

  return (
    <div className="ls-story">
      <section className="ls-hero" id="bagyt-intro" aria-labelledby="ls-title">
        <span className="ls-eyebrow">
          Bagyt <i /> Bizneske anyq baǵyt
        </span>
        <h1 id="ls-title">
          {t("Бизнесу — направление.", "Бизнеске — анық бағыт.")}
          <br />
          <span>{t("Вам — спокойствие.", "Өзіңізге — сенімділік.")}</span>
        </h1>
        <p>
          {t(
            "Клиенты, цели и товары складываются в одну картину. А рядом — команда, которая помогает действовать.",
            "Клиенттер, мақсаттар мен тауарлар бір көрініске жиналады. Ал жаныңызда — іске көмектесетін команда.",
          )}
        </p>
      </section>

      <div
        className="ls-track"
        ref={track}
        style={{ "--ls-intro": motion.intro } as CSSProperties}
      >
        <div
          className="ls-stage"
          ref={stage}
          aria-label={t(
            "Команда Bagyt: Belgi, Sana и Qor",
            "Bagyt командасы: Belgi, Sana және Qor",
          )}
        >
          <div
            className="ls-stage-inner"
            style={{ transform: `translateX(${(1 - motion.intro) * 50}%)` }}
          >
            <div className="ls-stage-glow" aria-hidden="true" />
            <div className="ls-orbit ls-orbit-one" aria-hidden="true" />
            <div className="ls-orbit ls-orbit-two" aria-hidden="true" />
            <div className="ls-speech" key={foreground}>
              <Sparkles size={13} />
              <span>
                {motion.intro < 0.3
                  ? t("Вместе — к следующему шагу.", "Бірге — келесі қадамға.")
                  : speeches[foreground]}
              </span>
            </div>
            {order.map((id, index) => {
              const storyPose = interpolate(
                compositions[from][index],
                compositions[to][index],
                blend,
              );
              const pose = motion.reduced
                ? initial[index]
                : interpolate(initial[index], storyPose, motion.intro);
              return (
                <div
                  className={`ls-traveller ls-traveller-${id} ${foreground === index ? "is-foreground" : ""}`}
                  key={id}
                  style={
                    {
                      "--ls-x": pose.x,
                      "--ls-y": pose.y,
                      "--ls-scale": pose.scale,
                      "--ls-rotate": `${pose.rotate}deg`,
                      zIndex: foreground === index ? 4 : 2,
                    } as CSSProperties
                  }
                >
                  <BelgiRobot
                    variant={id}
                    size={index === 0 ? 170 : index === 1 ? 140 : 145}
                    state={
                      motion.intro < 0.3
                        ? "greeting"
                        : foreground === index
                          ? "talking"
                          : "idle"
                    }
                  />
                  <span>{names[index]}</span>
                </div>
              );
            })}
            <div className="ls-stage-caption" style={{ opacity: motion.intro }}>
              <span className="ls-active-dot" />
              {names[foreground]}
              <i />
              {
                [
                  t("Видит общую картину", "Жалпы көріністі көреді"),
                  t("Заботится о клиентах", "Клиенттерге қамқорлық"),
                  t("Следит за запасами", "Қорды қадағалайды"),
                ][foreground]
              }
            </div>
            <span
              className="ls-scroll-cue"
              style={{ opacity: 1 - motion.intro }}
            >
              <ArrowDown size={15} />
              {t(
                "Листайте вниз — мы покажем",
                "Төмен айналдырыңыз — көрсетеміз",
              )}
            </span>
          </div>
        </div>

        <div className="ls-chapters">
          <section
            className={`ls-chapter ${foreground === 0 ? "is-current" : ""}`}
            id="platform"
            ref={(node) => {
              chapters.current[0] = node;
            }}
            aria-labelledby="ls-goal-title"
          >
            <div className="ls-chapter-copy">
              <span className="ls-chapter-number">
                01 <i /> {t("СНАЧАЛА — ГЛАВНОЕ", "АЛДЫМЕН — МАҢЫЗДЫСЫ")}
              </span>
              <h2 id="ls-goal-title">
                {t("Не просто цифры.", "Жай сандар емес.")}
                <br />
                <span>
                  {t("Понятный путь к цели.", "Мақсатқа түсінікті жол.")}
                </span>
              </h2>
              <p>
                {t(
                  "Belgi связывает показатели с вашей целью. Видно, что уже сделано, чему уделить внимание и какой шаг выбрать сегодня.",
                  "Belgi көрсеткіштерді мақсатыңызбен байланыстырады. Не орындалғанын, неге назар аудару және бүгін қандай қадам жасау керегін көресіз.",
                )}
              </p>
            </div>
            <div className="ls-goal-ui ls-product-window">
              <header>
                <span className="ls-workspace-mark">Bb</span>
                <b>Qazyna Store</b>
                <span>{t("Цель месяца", "Ай мақсаты")}</span>
              </header>
              <div className="ls-goal-main">
                <div className="ls-goal-label">
                  <TrendingUp size={18} />
                  {t("Рост выручки", "Түсімді өсіру")}
                  <span>82%</span>
                </div>
                <div className="ls-goal-value">
                  <strong>2 450 000 ₸</strong>
                  <span>/ 3 000 000 ₸</span>
                </div>
                <div
                  className="ls-goal-meter"
                  aria-label={t(
                    "Цель выполнена на 82%",
                    "Мақсаттың 82 пайызы орындалды",
                  )}
                >
                  <i />
                </div>
                <span className="ls-goal-remaining">
                  {t(
                    "До цели осталось 550 000 ₸",
                    "Мақсатқа дейін 550 000 ₸ қалды",
                  )}
                </span>
              </div>
              <div className="ls-goal-steps">
                <div>
                  <Check size={15} />
                  <span>{t("Собрать показатели", "Көрсеткіштерді жинау")}</span>
                  <small>{t("Готово", "Дайын")}</small>
                </div>
                <div className="is-next">
                  <Circle size={15} />
                  <span>
                    {t("Вернуться к 4 клиентам", "4 клиентке қайта жазу")}
                  </span>
                  <small>{t("Сегодня", "Бүгін")}</small>
                </div>
                <div>
                  <Circle size={15} />
                  <span>
                    {t(
                      "Проверить остатки бестселлера",
                      "Хит тауардың қалдығын тексеру",
                    )}
                  </span>
                  <ArrowUpRight size={14} />
                </div>
              </div>
              <div className="ls-source-note">
                <ChannelIcon source="Kaspi" size={20} />
                <span>
                  {t(
                    "Продажи Kaspi и POS — в одном отчёте",
                    "Kaspi және POS сатылымдары — бір есепте",
                  )}
                </span>
              </div>
            </div>
            <a className="ls-text-link" href="/demo?page=growth&agent=belgi">
              {t("Посмотреть план роста", "Өсу жоспарын қарау")}
              <ArrowUpRight size={16} />
            </a>
          </section>

          <section
            className={`ls-chapter ${foreground === 1 ? "is-current" : ""}`}
            id="agents"
            ref={(node) => {
              chapters.current[1] = node;
            }}
            aria-labelledby="ls-clients-title"
          >
            <div className="ls-chapter-copy">
              <span className="ls-chapter-number">
                02 <i /> {t("КАЖДЫЙ КЛИЕНТ ВАЖЕН", "ӘР КЛИЕНТ МАҢЫЗДЫ")}
              </span>
              <h2 id="ls-clients-title">
                {t("Разные каналы.", "Әртүрлі арналар.")}
                <br />
                <span>{t("Один разговор.", "Біртұтас әңгіме.")}</span>
              </h2>
              <p>
                {t(
                  "Sana помогает продолжить диалог. История обращения, контекст и проект ответа — рядом. Клиент не теряется между чатами.",
                  "Sana диалогты жалғастыруға көмектеседі. Өтініш тарихы, мән-жайы және жауап жобасы қатар тұрады. Клиент чаттар арасында жоғалмайды.",
                )}
              </p>
            </div>
            <div className="ls-inbox-ui ls-product-window">
              <div className="ls-channel-row">
                <span>
                  <ChannelIcon source="WhatsApp" size={18} />
                  WhatsApp
                </span>
                <span>
                  <ChannelIcon source="Instagram" size={18} />
                  Instagram
                </span>
                <span>
                  <ChannelIcon source="TikTok" size={18} />
                  TikTok
                </span>
                <span>
                  <ChannelIcon source="2GIS" size={18} />
                  2GIS
                </span>
              </div>
              <div className="ls-client-title">
                <span className="ls-client-avatar">A</span>
                <div>
                  <b>Аружан</b>
                  <small>
                    {t("Вся история клиента", "Клиенттің толық тарихы")}
                  </small>
                </div>
                <span className="ls-waiting">
                  {t("Ждёт ответа", "Жауап күтуде")}
                </span>
              </div>
              <div className="ls-client-message">
                {t(
                  "Здравствуйте! Кофе ещё есть? Хотела бы заказать с доставкой.",
                  "Сәлеметсіз бе! Кофе әлі бар ма? Жеткізумен тапсырыс бергім келеді.",
                )}
                <small>10:24</small>
              </div>
              <div className="ls-sana-draft">
                <div>
                  <Sparkles size={14} />
                  <b>Sana</b>
                  <span>{t("проект ответа", "жауап жобасы")}</span>
                </div>
                <p>
                  {t(
                    "Аружан, здравствуйте! Да, кофе есть. Подскажите ваш адрес — уточним время доставки.",
                    "Аружан, сәлеметсіз бе! Иә, кофе бар. Мекенжайыңызды жазыңыз — жеткізу уақытын нақтылаймыз.",
                  )}
                </p>
                <span>
                  <CheckCheck size={14} />
                  {t(
                    "Вы проверяете перед отправкой",
                    "Жіберер алдында өзіңіз тексересіз",
                  )}
                </span>
              </div>
            </div>
            <a
              className="ls-text-link"
              href="/demo?page=inbox&plan=pro&agent=sana"
            >
              {t("Открыть сообщения", "Хабарламаларды ашу")}
              <ArrowUpRight size={16} />
            </a>
          </section>

          <section
            className={`ls-chapter ${foreground === 2 ? "is-current" : ""}`}
            ref={(node) => {
              chapters.current[2] = node;
            }}
            aria-labelledby="ls-stock-title"
          >
            <div className="ls-chapter-copy">
              <span className="ls-chapter-number">
                03 <i /> {t("НА ШАГ ВПЕРЕДИ", "БІР ҚАДАМ АЛДА")}
              </span>
              <h2 id="ls-stock-title">
                {t("Нужный товар.", "Керек тауар.")}
                <br />
                <span>{t("В нужный момент.", "Керек уақытында.")}</span>
              </h2>
              <p>
                {t(
                  "Qor замечает, когда запас подходит к концу. Сравнивает варианты и готовит закупку — вы выбираете условия и подтверждаете решение.",
                  "Qor қордың азайғанын байқайды. Нұсқаларды салыстырып, сатып алуды дайындайды — шарттарды таңдап, шешімді өзіңіз бекітесіз.",
                )}
              </p>
            </div>
            <div className="ls-stock-ui ls-product-window">
              <header>
                <Package size={17} />
                <b>{t("Запасы и закупки", "Қор және сатып алу")}</b>
                <span>Qazyna Store</span>
              </header>
              <div className="ls-coffee-row">
                <ProductVisual
                  sku="COF-1000"
                  size={100}
                  label={t("Пакет кофе в зёрнах", "Дәнді кофе қаптамасы")}
                />
                <div>
                  <small>{t("Бестселлер", "Хит тауар")}</small>
                  <h3>{t("Кофе в зёрнах · 1 кг", "Дәнді кофе · 1 кг")}</h3>
                  <div>
                    <b>10 {t("шт.", "дана")}</b>
                    <span>{t("≈ на 2,5 дня", "≈ 2,5 күнге")}</span>
                  </div>
                </div>
              </div>
              <div className="ls-supply-comparison">
                <div>
                  <span>{t("Поставщик", "Жеткізуші")}</span>
                  <span>{t("Доставка", "Жеткізу")}</span>
                  <span>{t("За 1 кг", "1 кг үшін")}</span>
                </div>
                <div className="is-recommended">
                  <b>Coffee Partner</b>
                  <span>{t("Завтра", "Ертең")}</span>
                  <strong>4 200 ₸</strong>
                </div>
                <div>
                  <b>Roast Market</b>
                  <span>{t("Через 3 дня", "3 күннен кейін")}</span>
                  <strong>4 050 ₸</strong>
                </div>
              </div>
              <div className="ls-qor-note">
                <Sparkles size={15} />
                <span>
                  {t(
                    "Qor: первый вариант приедет до окончания запаса.",
                    "Qor: бірінші нұсқа қор таусылғанша келеді.",
                  )}
                </span>
              </div>
            </div>
            <a
              className="ls-text-link"
              href="/demo?page=purchases&plan=pro&agent=qor"
            >
              {t("Посмотреть закупку", "Сатып алуды қарау")}
              <ArrowUpRight size={16} />
            </a>
          </section>
        </div>
      </div>
      <div className="ls-story-end">
        <span />
        <p>
          {t(
            "Одна картина бизнеса. Три роли. Решение — за вами.",
            "Бизнестің бір көрінісі. Үш рөл. Шешім — сізден.",
          )}
        </p>
        <span />
      </div>
    </div>
  );
}
