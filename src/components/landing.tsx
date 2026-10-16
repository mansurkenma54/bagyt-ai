"use client";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, Check, Code2, Palette } from "lucide-react";
import { Logo } from "./ui";
import ThemeToggle from "./theme-toggle";
import LandingStory from "./landing-story";

export default function Landing({
  language,
  onLanguage,
  onRegister,
  onLogin,
  hasAccount = false,
}: {
  language: "ru" | "kk";
  onLanguage: () => void;
  onRegister: (industry?: string) => void;
  onLogin: () => void;
  onAssistant: () => void;
  hasAccount?: boolean;
}) {
  const t = (ru: string, kk: string) => (language === "ru" ? ru : kk);
  return (
    <div className="bagyt-landing">
      <a className="bl-skip" href="#platform">
        {t("Перейти к возможностям", "Мүмкіндіктерге өту")}
      </a>
      <header className="bl-header">
        <a href="#bagyt-intro" className="bl-brand-link" aria-label="Bagyt">
          <Logo />
        </a>
        <nav aria-label={t("Разделы сайта", "Сайт бөлімдері")}>
          <a href="#platform">{t("Возможности", "Мүмкіндіктер")}</a>
          <a href="#agents">{t("Команда", "Команда")}</a>
          <a href="#plans">{t("Планы", "Жоспарлар")}</a>
        </nav>
        <div className="bl-header-actions">
          <ThemeToggle />
          <button
            className="bl-language"
            onClick={onLanguage}
            aria-label={t("Қазақ тіліне ауыстыру", "Переключить на русский")}
          >
            {language === "kk" ? "KZ" : "RU"}
          </button>
          <button className="bl-login" onClick={onLogin}>
            {hasAccount ? t("Мой бизнес", "Бизнесім") : t("Войти", "Кіру")}
          </button>
          <a className="bl-header-open" href="/demo">
            {t("Открыть Bagyt", "Bagyt ашу")}
            <ArrowUpRight size={15} />
          </a>
        </div>
      </header>
      <main id="bagyt">
        <LandingStory language={language} />
        <section className="bl-plans" id="plans" aria-labelledby="plans-title">
          <div className="bl-plans-intro">
            <span className="bl-eyebrow">BIRGE ÓSEYIK</span>
            <h2 id="plans-title">{t("В своём темпе.", "Өз қарқыныңызбен.")}</h2>
            <p>
              {t(
                "Начните с Belgi. Когда задач станет больше — подключите команду.",
                "Belgi-ден бастаңыз. Іс көбейгенде — команда қосыңыз.",
              )}
            </p>
          </div>
          <div className="bl-plan-grid">
            <article className="bl-plan">
              <div className="bl-plan-heading">
                <span>Free</span>
                <small>{t("Один помощник", "Бір көмекші")}</small>
              </div>
              <h3>
                Belgi<span>.</span>
              </h3>
              <p>
                {t(
                  "Общая картина бизнеса и понятный следующий шаг.",
                  "Бизнестің жалпы көрінісі және түсінікті келесі қадам.",
                )}
              </p>
              <ul>
                <li>
                  <Check size={16} />
                  {t(
                    "Показатели и план на день",
                    "Көрсеткіштер мен күндік жоспар",
                  )}
                </li>
                <li>
                  <Check size={16} />
                  {t("Подсказки в нужном разделе", "Керек бөлімдегі кеңестер")}
                </li>
                <li>
                  <Check size={16} />
                  {t("Мини-чат рядом с работой", "Жұмыс жанындағы шағын чат")}
                </li>
              </ul>
              <a className="bl-plan-link" href="/demo?plan=free">
                {t("Начать с одного", "Бір көмекшіден бастау")}
                <ArrowRight size={17} />
              </a>
            </article>
            <article className="bl-plan bl-plan-pro">
              <div className="bl-plan-heading">
                <span>Pro</span>
                <small>
                  {t("Три роли, одна команда", "Үш рөл, бір команда")}
                </small>
              </div>
              <h3>
                Belgi. Sana. Qor<span>.</span>
              </h3>
              <p>
                {t(
                  "Каждый берёт своё: направление, клиенты, товары.",
                  "Әрқайсысының өз ісі: бағыт, клиенттер, тауарлар.",
                )}
              </p>
              <ul>
                <li>
                  <Check size={16} />
                  {t(
                    "Sana — диалоги и отзывы",
                    "Sana — диалогтар мен пікірлер",
                  )}
                </li>
                <li>
                  <Check size={16} />
                  {t(
                    "Qor — остатки и закупки",
                    "Qor — қалдықтар мен сатып алу",
                  )}
                </li>
                <li>
                  <Check size={16} />
                  {t("Смена помощника под задачу", "Тапсырмаға сай көмекші")}
                </li>
              </ul>
              <a className="bl-plan-link" href="/demo?plan=pro">
                {t("Попробовать команду", "Команданы байқап көру")}
                <ArrowRight size={17} />
              </a>
            </article>
          </div>
          <p className="bl-example-note">
            {t(
              "Можно попробовать оба режима без оплаты. В примере используются учебные данные; внешние сообщения и заказы не отправляются.",
              "Екі режимді де төлемсіз көріңіз. Мысалда оқу деректері қолданылады; сыртқа хабарламалар мен тапсырыстар жіберілмейді.",
            )}
          </p>
        </section>
        <section className="bl-team" aria-labelledby="team-title">
          <div className="bl-team-intro">
            <span className="bl-eyebrow">BAGYT TEAM · QAZAQSTAN</span>
            <h2 id="team-title">{t("Авторы проекта", "Жоба авторлары")}</h2>
            <p>
              {t(
                "Концепция, дизайн и технология BAGYT AI созданы нашей командой.",
                "BAGYT AI тұжырымдамасын, дизайнын және технологиясын біздің команда жасады.",
              )}
            </p>
          </div>
          <div className="bl-team-grid">
            <article>
              <div className="bl-team-photo">
                <Image
                  src="/team/karakat.png"
                  alt="Ақбаева Қарақат"
                  fill
                  sizes="(max-width: 640px) 112px, 136px"
                />
                <span className="bl-team-role-icon" aria-hidden="true">
                  <Palette size={17} />
                </span>
              </div>
              <div className="bl-team-person">
                <span>01 · UI/UX</span>
                <h3>Ақбаева Қарақат</h3>
                <p>
                  {t(
                    "Дизайн и пользовательский опыт",
                    "Дизайн және пайдаланушы тәжірибесі",
                  )}
                </p>
              </div>
            </article>
            <article>
              <div className="bl-team-photo bl-team-photo-dev">
                <Image
                  src="/team/abilmansur.png"
                  alt="Арыстанбай Әбілмансұр"
                  fill
                  sizes="(max-width: 640px) 112px, 136px"
                />
                <span className="bl-team-role-icon" aria-hidden="true">
                  <Code2 size={17} />
                </span>
              </div>
              <div className="bl-team-person">
                <span>02 · FULL-STACK &amp; AI</span>
                <h3>Арыстанбай Әбілмансұр</h3>
                <p>
                  {t(
                    "Разработка продукта и AI",
                    "Өнімді және AI жүйесін әзірлеу",
                  )}
                </p>
              </div>
            </article>
          </div>
          <p className="bl-rights">
            © 2026 BAGYT AI ·{" "}
            {t("Все права защищены", "Барлық құқықтар қорғалған")}
          </p>
        </section>
        <section className="bl-final">
          <span className="bl-eyebrow">BAGYT · BIZNESKE ANYQ BAǴYT</span>
          <h2>
            {t("Хорошие решения.", "Жақсы шешімдер.")}
            <br />
            <span>{t("Каждый день.", "Күн сайын.")}</span>
          </h2>
          <div className="bl-final-actions">
            <a className="bl-start" href="/demo">
              {t("Зайти в пространство", "Жұмыс кеңістігін ашу")}
              <ArrowRight size={18} />
            </a>
            <button onClick={() => (hasAccount ? onLogin() : onRegister())}>
              {hasAccount
                ? t("Мой бизнес", "Бизнесім")
                : t("Создать аккаунт", "Аккаунт құру")}
              <ArrowUpRight size={16} />
            </button>
          </div>
        </section>
      </main>
      <footer className="bl-footer">
        <Logo />
        <span>
          © 2026 BAGYT AI · Qazaqstanda jasalǵan ·{" "}
          {t("С заботой о вашем деле", "Ісіңізге қамқорлықпен")}
        </span>
        <a href="#bagyt-intro">
          {t("Наверх", "Жоғарыға")}
          <ArrowUpRight size={15} />
        </a>
      </footer>
    </div>
  );
}
