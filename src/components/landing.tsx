"use client";
import {
  ArrowRight,
  MessageCircle,
  FileSpreadsheet,
  Check,
  Heart,
  MousePointer2,
} from "lucide-react";
import { Logo, Robot } from "./ui";
export default function Landing({
  language,
  onLanguage,
  onRegister,
  onLogin,
  onAssistant,
  hasAccount = false,
}: {
  language: "ru" | "kk";
  onLanguage: () => void;
  onRegister: (industry?: string) => void;
  onLogin: () => void;
  onAssistant: () => void;
  hasAccount?: boolean;
}) {
  const t = (r: string, k: string) => (language === "ru" ? r : k);
  return (
    <div className="hello-page">
      <header className="hello-header">
        <Logo />
        <div>
          <button className="lang" onClick={onLanguage}>
            {language === "ru" ? "Қазақша" : "Русский"}
          </button>
          <button className="hello-login" onClick={onLogin}>
            {hasAccount ? t("Мой бизнес", "Бизнесім") : t("Войти", "Кіру")}
            <ArrowRight size={17} />
          </button>
        </div>
      </header>
      <main>
        <section className="hello-hero">
          <div className="hello-copy">
            <span className="hello-eyebrow">
              <span />{" "}
              {t("ВАШ БИЗНЕС. ВАШ ПОМОЩНИК.", "СІЗДІҢ БИЗНЕС. СІЗДІҢ КӨМЕКШІ.")}
            </span>
            <h1>
              {t("Сәлем, я AQYL.", "Сәлем, мен AQYL.")}
              <br />
              <span>{t("Давайте вместе?", "Бірге бастайық?")}</span>
            </h1>
            <p>
              {t(
                "Помогу понять, как идут дела, что требует внимания и что делать дальше. Покажу всё по шагам.",
                "Кәсібіңіздің жағдайын түсініп, маңыздысын анықтауға және келесі қадамды таңдауға көмектесемін. Бәрін ретімен көрсетемін.",
              )}
            </p>
            <button
              className="hello-start"
              onClick={() => (hasAccount ? onLogin() : onRegister())}
            >
              {hasAccount
                ? t("Продолжить с AQYL", "AQYL-мен жалғастыру")
                : t("Начать с AQYL", "AQYL-мен бастау")}
              <ArrowRight size={20} />
            </button>
            <span className="hello-note">
              {t(
                "Три простых шага — и ваш бизнес здесь.",
                "Үш қарапайым қадам — бизнесіңіз осында.",
              )}
            </span>
          </div>
          <div className="hello-scene">
            <div className="hello-orbit orbit-one" />
            <div className="hello-orbit orbit-two" />
            <span className="hello-star star-one">✦</span>
            <span className="hello-star star-two">+</span>
            <div className="hello-speech">
              <Heart size={16} />
              {t(
                "Не знаете, с чего начать? Я рядом.",
                "Неден бастарыңызды білмейсіз бе? Мен қасыңыздамын.",
              )}
            </div>
            <div className="hello-character">
              <Robot
                size={290}
                onClick={onAssistant}
                label={t("Поговорить с AQYL", "AQYL-мен сөйлесу")}
              />
            </div>
            <button className="hello-touch" onClick={onAssistant}>
              <MousePointer2 size={17} />
              {t("Нажмите на меня. Поговорим?", "Мені басыңыз. Сөйлесейік?")}
            </button>
            <span className="hello-satellite satellite-data">
              <FileSpreadsheet size={17} />
              {t("Ваши данные", "Деректеріңіз")}
            </span>
            <span className="hello-satellite satellite-step">
              <Check size={17} />
              {t("Понятный шаг", "Түсінікті қадам")}
            </span>
          </div>
        </section>
        <section
          className="hello-route"
          aria-label={t("Как начать", "Қалай бастауға болады")}
        >
          <div className="hello-route-intro">
            <span>BAGYT + AQYL</span>
            <h2>
              {t(
                "Сложное — разберём. Начнём с простого.",
                "Күрделісін түсінеміз. Қарапайымнан бастаймыз.",
              )}
            </h2>
          </div>
          <ol>
            {[
              [
                t("Познакомимся", "Танысамыз"),
                t(
                  "Какой у вас бизнес и что хотите улучшить?",
                  "Қандай бизнесіңіз бар, нені жақсартқыңыз келеді?",
                ),
              ],
              [
                t("Добавим данные", "Деректерді қосамыз"),
                t(
                  "Загрузите таблицу или чек. Я покажу, где и как.",
                  "Кесте немесе чек жүктеңіз. Қайда, қалай екенін көрсетемін.",
                ),
              ],
              [
                t("Выберем действие", "Әрекетті таңдаймыз"),
                t(
                  "Посмотрим на цифры и решим, с чего начать.",
                  "Сандарды қарап, неден бастау керегін анықтаймыз.",
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
        <div className="hello-question">
          <MessageCircle size={22} />
          <p>
            <b>{t("Можно просто спросить.", "Жай ғана сұрауға болады.")}</b>{" "}
            {t(
              "AQYL остаётся рядом на каждом экране.",
              "AQYL әр бетте қасыңызда болады.",
            )}
          </p>
          <button onClick={onAssistant}>
            {t("Спросить AQYL", "AQYL-дан сұрау")}
            <ArrowRight size={16} />
          </button>
        </div>
      </main>
      <footer className="hello-footer">
        <span>
          BAGYT AI · {t("С заботой о вашем деле", "Кәсібіңізге қамқор")}
        </span>
        <span>Қазақстан · RU / KZ</span>
      </footer>
    </div>
  );
}
