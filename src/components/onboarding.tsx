"use client";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Store,
  GraduationCap,
  Scissors,
  Coffee,
  BriefcaseBusiness,
  TrendingUp,
  Wallet,
  MessagesSquare,
  Eye,
  EyeOff,
  LockKeyhole,
} from "lucide-react";
import { api, Robot } from "./ui";
export default function Onboarding({
  language,
  onComplete,
  onLogin,
}: {
  language: "ru" | "kk";
  onComplete: () => Promise<void>;
  onLogin: () => void;
}) {
  const t = (r: string, k: string) => (language === "ru" ? r : k);
  const [step, setStep] = useState(0),
    [industry, setIndustry] = useState(""),
    [goal, setGoal] = useState(""),
    [organization, setOrganization] = useState(""),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [show, setShow] = useState(false),
    [busy, setBusy] = useState(false),
    [created, setCreated] = useState(false),
    [error, setError] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus();
  }, [step]);
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
      title: t("Кафе / ресторан", "Кафе / мейрамхана"),
      hint: t("Гости и заказы", "Қонақтар мен тапсырыстар"),
    },
    {
      id: "salon",
      icon: Scissors,
      title: t("Красота и здоровье", "Сұлулық пен денсаулық"),
      hint: t("Записи и услуги", "Жазылу мен қызметтер"),
    },
    {
      id: "education",
      icon: GraduationCap,
      title: t("Учебный центр", "Оқу орталығы"),
      hint: t("Ученики и оплаты", "Оқушылар мен төлемдер"),
    },
    {
      id: "services",
      icon: BriefcaseBusiness,
      title: t("Другой бизнес", "Басқа бизнес"),
      hint: t("Любые услуги и проекты", "Кез келген қызмет пен жоба"),
    },
  ];
  const goals = [
    {
      id: "sales",
      icon: TrendingUp,
      title: t("Увеличить продажи", "Сатуды арттыру"),
      hint: t("Понять, что приносит доход", "Табыс көздерін түсіну"),
    },
    {
      id: "expenses",
      icon: Wallet,
      title: t("Сократить расходы", "Шығындарды азайту"),
      hint: t("Увидеть, куда уходят деньги", "Ақша қайда кететінін көру"),
    },
    {
      id: "responses",
      icon: MessagesSquare,
      title: t("Не терять клиентов", "Клиенттерді жоғалтпау"),
      hint: t(
        "Быстрее отвечать на обращения",
        "Өтініштерге тезірек жауап беру",
      ),
    },
  ];
  const selectedIndustry = industries.find((x) => x.id === industry),
    selectedGoal = goals.find((x) => x.id === goal);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (!created) {
        await api("auth/register", {
          organization: organization.trim(),
          email: email.trim(),
          password,
          industry,
          goal: selectedGoal?.title,
        });
        setCreated(true);
      }
      await onComplete();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="onboarding-layout">
      <aside className="onboarding-companion">
        <span className="pixel-kicker">
          AQYL · {t("НАЧНЁМ ЗНАКОМСТВО", "ТАНЫСАЙЫҚ")}
        </span>
        <Robot
          size={176}
          state={busy ? "thinking" : step === 2 ? "success" : "greeting"}
        />
        <h3>
          {step === 0
            ? t("Сәлем! Я — AQYL.", "Сәлем! Мен — AQYL.")
            : step === 1
              ? t("Какую цель выберем?", "Қандай мақсат таңдаймыз?")
              : t("Уже почти готовы!", "Дайын болуға аз қалды!")}
        </h3>
        <p>
          {step === 0
            ? t(
                "Пара ответов — и я подготовлю место для вашего бизнеса.",
                "Бір-екі жауап беріңіз — бизнесіңізге орын дайындаймын.",
              )
            : step === 1
              ? t(
                  "Начнём с главного. Остальное можно настроить позже.",
                  "Маңыздысынан бастайық. Қалғанын кейін баптауға болады.",
                )
              : t(
                  "Сохраните свой профиль. Затем подключим источники и начнём работу.",
                  "Профиліңізді сақтаңыз. Кейін дереккөздерді қосып, жұмысқа кірісеміз.",
                )}
        </p>
        <div className="business-preview">
          <small>{t("ВАШЕ ПРОСТРАНСТВО", "СІЗДІҢ КЕҢІСТІГІҢІЗ")}</small>
          <b>
            {organization ||
              selectedIndustry?.title ||
              t("Ваш бизнес", "Сіздің бизнесіңіз")}
          </b>
          <span>
            {selectedGoal?.title ||
              t("Давайте зададим направление", "Бағытымызды белгілейік")}
          </span>
          {selectedIndustry && (
            <div>
              <Check size={13} />
              {selectedIndustry.title}
            </div>
          )}
        </div>
        <span className="companion-caption">
          <span className="live-dot" />
          {busy
            ? t("AQYL готовит пространство…", "AQYL кеңістікті дайындауда…")
            : t("Я рядом на каждом шаге", "Әр қадамда қасыңыздамын")}
        </span>
      </aside>
      <div className="onboarding-questions">
        <div
          className="onboarding-progress"
          aria-label={t(
            `Шаг ${step + 1} из 3`,
            `3 қадамның ${step + 1}-қадамы`,
          )}
        >
          {[0, 1, 2].map((i) => (
            <span key={i} className={i <= step ? "done" : ""} />
          ))}
        </div>
        <div className="question-step">
          <span>0{step + 1} / 03</span>
          <span>{t("Меньше минуты", "Бір минуттан аз")}</span>
        </div>
        <h2 ref={heading} tabIndex={-1}>
          {step === 0
            ? t("Какой у вас бизнес?", "Сізде қандай бизнес?")
            : step === 1
              ? t("Что сейчас важнее?", "Қазір не маңыздырақ?")
              : t("Как назовём ваш бизнес?", "Бизнесіңізді қалай атаймыз?")}
        </h2>
        <p className="question-hint">
          {step === 2
            ? t(
                "Последний шаг. Сервисы подключите уже внутри.",
                "Соңғы қадам. Сервистерді ішке кірген соң қосасыз.",
              )
            : t(
                "Выберите один вариант — и идём дальше.",
                "Бір нұсқаны таңдаңыз — әрі қарай өтеміз.",
              )}
        </p>
        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}
        {step < 2 ? (
          <div
            className={
              "survey-options " + (step === 0 ? "industries" : "goals")
            }
          >
            {(step === 0 ? industries : goals).map((item) => (
              <button
                type="button"
                key={item.id}
                className={
                  "survey-choice " +
                  ((step === 0 ? industry : goal) === item.id ? "selected" : "")
                }
                onClick={() => {
                  step === 0 ? setIndustry(item.id) : setGoal(item.id);
                  setStep(step + 1);
                }}
              >
                <item.icon size={22} />
                <span>
                  <b>{item.title}</b>
                  <small>{item.hint}</small>
                </span>
                <ArrowRight size={15} />
              </button>
            ))}
          </div>
        ) : (
          <form onSubmit={submit} className="signup-fields">
            <label>
              {t("Название бизнеса", "Бизнес атауы")}
              <input
                required
                autoComplete="organization"
                maxLength={100}
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder={
                  industry === "education" ? "Bilim Academy" : "Dala Store"
                }
                disabled={created || busy}
              />
            </label>
            <label>
              Email
              <input
                required
                type="email"
                autoComplete="email"
                maxLength={200}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.kz"
                disabled={created || busy}
              />
            </label>
            <label>
              {t("Придумайте пароль", "Құпиясөз ойлап табыңыз")}
              <span className="password-input">
                <input
                  required
                  type={show ? "text" : "password"}
                  autoComplete="new-password"
                  aria-label={t("Пароль", "Құпиясөз")}
                  minLength={10}
                  maxLength={128}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("От 10 символов", "10 таңбадан бастап")}
                  disabled={created || busy}
                />
                <button
                  type="button"
                  aria-label={
                    show
                      ? t("Скрыть пароль", "Құпиясөзді жасыру")
                      : t("Показать пароль", "Құпиясөзді көрсету")
                  }
                  onClick={() => setShow(!show)}
                >
                  {show ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </span>
            </label>
            <button className="primary full" disabled={busy}>
              {busy
                ? t("Готовим пространство…", "Кеңістік дайындалуда…")
                : created
                  ? t("Открыть мой бизнес", "Бизнесімді ашу")
                  : t(
                      "Создать аккаунт и продолжить",
                      "Аккаунт ашып, жалғастыру",
                    )}
              <ArrowRight size={17} />
            </button>
            <div className="signup-note">
              <LockKeyhole size={13} />
              {t(
                "Данные доступны только вашей команде",
                "Деректер тек командаңызға қолжетімді",
              )}
            </div>
          </form>
        )}
        <div className="survey-footer">
          {step > 0 && !created ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setStep(step - 1);
                setError("");
              }}
            >
              <ArrowLeft size={14} />
              {t("Назад", "Артқа")}
            </button>
          ) : (
            <span />
          )}
          <button type="button" disabled={busy} onClick={onLogin}>
            {t("Уже есть аккаунт? Войти", "Аккаунтыңыз бар ма? Кіру")}
          </button>
        </div>
      </div>
    </div>
  );
}
