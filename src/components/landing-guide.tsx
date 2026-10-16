"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Play,
  Square,
  X,
} from "lucide-react";
import { Robot } from "./ui";
import type { AgentVariant } from "./belgi-robot";

const sections = ["bagyt-intro", "platform", "agents", "plans"] as const;

export default function LandingGuide({
  language,
  request,
  variant,
  onAssistant,
}: {
  language: "ru" | "kk";
  request: number;
  variant: AgentVariant;
  onAssistant: () => void;
}) {
  const t = (ru: string, kk: string) => (language === "ru" ? ru : kk);
  const [running, setRunning] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [question, setQuestion] = useState<number | null>(null);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const ignoreScrollUntil = useRef(0);
  const startedRequest = useRef(0);
  const guideRoot = useRef<HTMLDivElement>(null);
  const name =
    variant === "sana" ? "Sana" : variant === "qor" ? "Qor" : "Belgi";
  const tour = [
    {
      title: t("Сначала — общая картина", "Алдымен — жалпы көрініс"),
      text: t(
        "Здесь видно, для чего нужен Bagyt. Справа — пример вашего дня: деньги, клиенты и запасы. Дальше покажу задачи подробнее.",
        "Бұл жерден Bagyt не үшін керек екенін көресіз. Оң жақта күн көрінісінің мысалы: қаржы, клиенттер мен қор. Енді тапсырмаларға өтейік.",
      ),
    },
    {
      title: t("Выберите свою задачу", "Өз тапсырмаңызды таңдаңыз"),
      text: t(
        "Нажмите «Клиенты», «Товары» или «Финансы». Внутри меняется пример: ответ клиенту, закупка или объяснение показателей.",
        "«Клиенттер», «Тауарлар» немесе «Қаржы» бөлімін басыңыз. Ішіндегі мысал өзгереді: клиентке жауап, сатып алу немесе көрсеткіштер түсіндірмесі.",
      ),
    },
    {
      title: t("У каждой роли — своё дело", "Әр рөлдің өз ісі бар"),
      text: t(
        "Belgi помогает с общим планом. Sana — с клиентами. Qor — с товарами. Выберите имя, чтобы увидеть задачу и пример ответа.",
        "Belgi жалпы жоспарға көмектеседі. Sana — клиенттерге, Qor — тауарларға жауапты. Тапсырма мен жауап мысалын көру үшін атын таңдаңыз.",
      ),
    },
    {
      title: t("Начните с удобного режима", "Ыңғайлы режимнен бастаңыз"),
      text: t(
        "В Free один помощник, в Pro — три роли. Здесь можно открыть любой режим, а затем попробовать мини-чат и правую панель в пространстве.",
        "Free-де бір көмекші, Pro-да үш рөл бар. Кез келген режимді ашып, жұмыс кеңістігінде шағын чат пен оң жақ панельді байқап көріңіз.",
      ),
    },
  ];
  const questions = [
    {
      label: t("С чего начать?", "Неден бастаймын?"),
      answer: t(
        "Откройте пространство. Начните с одного ожидающего клиента или проверки товара. Помощник объяснит следующий шаг.",
        "Жұмыс кеңістігін ашыңыз. Жауап күтіп отырған бір клиенттен немесе тауарды тексеруден бастаңыз. Көмекші келесі қадамды түсіндіреді.",
      ),
    },
    {
      label: t("Чем отличаются агенты?", "Агенттердің айырмасы қандай?"),
      answer: t(
        "Belgi — план и показатели, Sana — клиенты и ответы, Qor — остатки и закупки. В Pro можно переключать все три роли.",
        "Belgi — жоспар мен көрсеткіштер, Sana — клиенттер мен жауаптар, Qor — қалдықтар мен сатып алу. Pro-да үш рөлді де ауыстыруға болады.",
      ),
    },
    {
      label: t("Как открыть чат?", "Чатты қалай ашамын?"),
      answer: t(
        "В рабочем пространстве нажмите на голову помощника. Откроется мини-чат. Кнопка расширения закрепит его справа.",
        "Жұмыс кеңістігінде көмекшінің басын басыңыз. Шағын чат ашылады. Үлкейту батырмасы оны оң жаққа бекітеді.",
      ),
    },
  ];

  function go(index: number) {
    const next = Math.max(0, Math.min(sections.length - 1, index));
    setStep(next);
    ignoreScrollUntil.current = Date.now() + 1400;
    const target = document.getElementById(sections[next]);
    if (target)
      window.scrollTo({
        top: Math.max(
          0,
          target.getBoundingClientRect().top + window.scrollY - 92,
        ),
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
  }
  function start() {
    setRunning(true);
    setPanelOpen(true);
    setQuestion(null);
    go(0);
    window.requestAnimationFrame(() =>
      guideRoot.current
        ?.querySelector<HTMLButtonElement>(".bl-guide-next")
        ?.focus({ preventScroll: true }),
    );
  }
  function stop() {
    setRunning(false);
    setPanelOpen(false);
    setQuestion(null);
    window.requestAnimationFrame(() =>
      guideRoot.current
        ?.querySelector<HTMLButtonElement>(".agent-character")
        ?.focus({ preventScroll: true }),
    );
  }

  useEffect(() => {
    const resize = () => setViewportWidth(window.innerWidth);
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const motion = () => setReduceMotion(media.matches);
    resize();
    motion();
    window.addEventListener("resize", resize);
    media.addEventListener("change", motion);
    return () => {
      window.removeEventListener("resize", resize);
      media.removeEventListener("change", motion);
    };
  }, []);
  useEffect(() => {
    if (request && request !== startedRequest.current) {
      startedRequest.current = request;
      start();
    }
  }, [request]);
  useEffect(() => {
    for (const id of sections) {
      const section = document.getElementById(id);
      if (section) {
        if (running && id === sections[step])
          section.dataset.landingCurrent = "true";
        else delete section.dataset.landingCurrent;
      }
    }
    return () => {
      for (const id of sections) {
        const section = document.getElementById(id);
        if (section) delete section.dataset.landingCurrent;
      }
    };
  }, [running, step]);
  useEffect(() => {
    if (!running) return;
    const sync = () => {
      if (Date.now() < ignoreScrollUntil.current) return;
      let nearest = 0;
      for (let i = 0; i < sections.length; i++) {
        const node = document.getElementById(sections[i]);
        if (node && node.getBoundingClientRect().top < window.innerHeight * 0.4)
          nearest = i;
      }
      setStep(nearest);
    };
    window.addEventListener("scroll", sync, { passive: true });
    return () => window.removeEventListener("scroll", sync);
  }, [running]);

  const travel =
    running && step === 1 && viewportWidth > 900 && !reduceMotion
      ? Math.max(0, viewportWidth - 382)
      : 0;
  return (
    <div
      ref={guideRoot}
      className={`bl-guide ${panelOpen ? "is-open" : ""} ${running ? "is-guiding" : ""}`}
      style={{ "--guide-travel": `${travel}px` } as CSSProperties}
      data-motion={reduceMotion ? "paused" : "active"}
      data-step={running ? step : undefined}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          stop();
          guideRoot.current
            ?.querySelector<HTMLButtonElement>(".agent-character")
            ?.focus();
        }
      }}
    >
      {panelOpen ? (
        <aside
          className="bl-guide-panel"
          id="landing-guide-panel"
          aria-label={t(
            `${name}: знакомство с Bagyt`,
            `${name}: Bagyt-пен танысу`,
          )}
        >
          <header>
            <div>
              <i className="bl-live-dot" />
              <b>{name}</b>
              <span>
                {running
                  ? `${step + 1} / ${sections.length}`
                  : t("Навигатор", "Бағыттаушы")}
              </span>
            </div>
            <button
              onClick={stop}
              aria-label={t("Закрыть помощника", "Көмекшіні жабу")}
            >
              <X size={17} />
            </button>
          </header>
          {running ? (
            <>
              <div className="bl-guide-copy" aria-live="polite">
                <b>{tour[step].title}</b>
                <p>{tour[step].text}</p>
              </div>
              <div className="bl-guide-progress" aria-hidden="true">
                {sections.map((id, index) => (
                  <i key={id} className={index <= step ? "is-past" : ""} />
                ))}
              </div>
              <footer className="bl-guide-controls">
                <button
                  disabled={step === 0}
                  onClick={() => go(step - 1)}
                  aria-label={t("Предыдущий раздел", "Алдыңғы бөлім")}
                >
                  <ChevronLeft size={16} />
                </button>
                <button className="bl-guide-stop" onClick={stop}>
                  <Square size={11} />
                  {t("Стоп", "Тоқтату")}
                </button>
                <button
                  className="bl-guide-next"
                  onClick={() =>
                    step === sections.length - 1 ? stop() : go(step + 1)
                  }
                >
                  {step === sections.length - 1
                    ? t("Готово", "Дайын")
                    : t("Дальше", "Келесі")}
                  <ChevronRight size={16} />
                </button>
              </footer>
            </>
          ) : (
            <>
              <div className="bl-guide-copy">
                <b>
                  {t(
                    "Покажу, как здесь всё устроено.",
                    "Мұнда бәрі қалай құрылғанын көрсетемін.",
                  )}
                </b>
                <p>
                  {question === null
                    ? t(
                        "Пройдём страницу за четыре шага или начнём с вашего вопроса.",
                        "Бетті төрт қадаммен қарап шығайық немесе сұрағыңыздан бастайық.",
                      )
                    : questions[question].answer}
                </p>
              </div>
              <div className="bl-guide-questions">
                {questions.map((item, index) => (
                  <button
                    key={index}
                    className={question === index ? "is-selected" : ""}
                    onClick={() => setQuestion(index)}
                  >
                    {item.label}
                    <ChevronRight size={13} />
                  </button>
                ))}
              </div>
              <footer className="bl-guide-welcome-actions">
                <button className="bl-guide-next" onClick={start}>
                  <Play size={13} />
                  {t("Начать обзор", "Шолуды бастау")}
                </button>
                <button
                  onClick={() => {
                    stop();
                    onAssistant();
                  }}
                  aria-label={t(
                    "Открыть чат в рабочем пространстве",
                    "Жұмыс кеңістігінде чат ашу",
                  )}
                >
                  <MessageCircle size={16} />
                  <ArrowUpRight size={12} />
                </button>
              </footer>
            </>
          )}
        </aside>
      ) : (
        <button className="bl-guide-invite" onClick={() => setPanelOpen(true)}>
          <b>{t("Я рядом.", "Мен жаныңыздамын.")}</b>
          <span>
            {t(
              "Показать, с чего начать?",
              "Неден бастау керегін көрсетейін бе?",
            )}
          </span>
          <ArrowRight size={14} />
        </button>
      )}
      <div className="bl-guide-character">
        <Robot
          size={114}
          variant={variant}
          state={running ? "curious" : "greeting"}
          onClick={() => setPanelOpen(!panelOpen)}
          label={
            panelOpen
              ? t("Свернуть подсказку", "Кеңесті жинау")
              : t("Открыть подсказки по сайту", "Сайт бойынша кеңестерді ашу")
          }
        />
        <span>{name}</span>
      </div>
    </div>
  );
}
