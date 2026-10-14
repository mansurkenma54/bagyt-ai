"use client";
import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  MessageCircle,
  Heart,
  FileCheck2,
} from "lucide-react";
import { Robot } from "./ui";
import { money, Insight } from "@/lib/types";
import type { analyze } from "@/lib/analytics";

type Props = {
  analytics: ReturnType<typeof analyze>;
  language: "ru" | "kk";
  demo: boolean;
  owner: boolean;
  goal: string;
  onNavigate: (section: string) => void;
  onImport: () => void;
  onChat: () => void;
  onEvidence: (insight: Insight) => void;
};
export default function BusinessBrief({
  analytics: a,
  language,
  demo,
  owner,
  goal,
  onNavigate,
  onImport,
  onChat,
  onEvidence,
}: Props) {
  const t = (r: string, k: string) => (language === "ru" ? r : k);
  const ready = a.coverage.verified > 0;
  const first = a.insights[0];
  return (
    <div className="business-brief">
      <section className="welcome-note">
        <div className="welcome-message">
          <span className="note-label">
            <Heart size={15} />{" "}
            {t("AQYL · С ЗАБОТОЙ О ВАШЕМ ДЕЛЕ", "AQYL · КӘСІБІҢІЗГЕ ҚАМҚОР")}
          </span>
          <h2>
            {ready
              ? t("Давайте разберёмся вместе.", "Бірге түсініп алайық.")
              : t(
                  "Большое дело начинается с малого.",
                  "Үлкен іс шағын қадамнан басталады.",
                )}
          </h2>
          <p>
            {ready
              ? t(
                  `Оплаченных продаж за ${a.days} дней: ${a.orders}. ${a.insights.length ? "Есть вопросы, на которые стоит обратить внимание." : "В загруженных данных нет сигналов по настроенным правилам."}`,
                  `${a.days} күнде ${a.orders} төленген сату бар. ${a.insights.length ? "Назар аударуды қажет ететін мәселелер бар." : "Жүктелген деректерде белгіленген ережелер бойынша мәселе табылмады."}`,
                )
              : t(
                  "Добавьте один отчёт или продажу. Я соберу цифры в понятную картину и помогу выбрать следующий шаг.",
                  "Бір есеп немесе сату қосыңыз. Мен сандарды түсінікті етіп жинап, келесі қадамды таңдауға көмектесемін.",
                )}
          </p>
          <button
            className="primary"
            onClick={() =>
              document
                .getElementById("today-plan-slot")
                ?.scrollIntoView({ block: "start", behavior: "smooth" })
            }
          >
            {t("Мой план на сегодня", "Бүгінгі жоспарым")}
            <ArrowRight size={18} />
          </button>
        </div>
        <div className="companion-scene">
          <span className="scene-orbit" />
          <Robot
            size={210}
            state={ready ? "greeting" : "curious"}
            onClick={onChat}
            label={t("Поговорить с AQYL", "AQYL-мен сөйлесу")}
          />
          <span className="companion-speech">
            {t("Сәлем! Я рядом.", "Сәлем! Мен қасыңдамын.")}
          </span>
        </div>
      </section>
      <div className="brief-context">
        <span>
          <CheckCircle2 size={16} />
          {t(
            `Проверено записей: ${a.coverage.verified}`,
            `${a.coverage.verified} тексерілген жазба`,
          )}
          {demo ? t(" · учебные данные", " · оқу деректері") : ""}
        </span>
        <button onClick={() => onNavigate("connect")}>
          {t("Посмотреть источники", "Дереккөздерді көру")}
          <ArrowRight size={14} />
        </button>
      </div>
      {ready && (
        <section
          className="simple-metrics"
          aria-label={t("Главные цифры", "Негізгі сандар")}
        >
          {[
            {
              label: t("Получено от продаж", "Сатудан түскен сома"),
              value: money(a.revenue),
              hint: t("После возвратов", "Қайтарулар шегерілген"),
            },
            {
              label: t("Оплаченные расходы", "Төленген шығындар"),
              value: money(a.expenses),
              hint: t("Из загруженных записей", "Жүктелген жазбалар бойынша"),
            },
            {
              label: t("Клиенты ждут ответа", "Жауап күткен клиенттер"),
              value: String(a.unanswered),
              hint: t(`Из ${a.leads} обращений`, `${a.leads} өтініштен`),
            },
          ].map((m) => (
            <article key={m.label}>
              <span>{m.label}</span>
              <strong>{m.value}</strong>
              <small>{m.hint}</small>
            </article>
          ))}
        </section>
      )}
      <div id="today-plan-slot" />
      <div className="next-grid">
        <section className="next-step-card">
          <span className="note-label">
            01 · {t("ОДИН ПОЛЕЗНЫЙ ШАГ", "БІР ПАЙДАЛЫ ҚАДАМ")}
          </span>
          <h3>
            {!ready
              ? t("Дадим AQYL первые цифры", "AQYL-ға алғашқы сандарды берейік")
              : a.coverage.pending
                ? t("Проверим новые записи", "Жаңа жазбаларды тексерейік")
                : first
                  ? language === "ru"
                    ? first.title
                    : {
                        unanswered: "Клиенттердің жауабын тексерейік",
                        expenses: "Шығындарды қарастырайық",
                        margin: "Өзіндік құнды тексерейік",
                        overdue: "Кешіккен істерді аяқтайық",
                      }[first.id] || first.title
                  : t("Выберем, что улучшить", "Нені жақсартуды таңдайық")}
          </h3>
          <p>
            {!ready
              ? t(
                  "Подойдёт таблица из кассы, отчёт из сервиса или запись вручную.",
                  "Касса кестесі, сервис есебі немесе қолмен қосылған жазба жарайды.",
                )
              : a.coverage.pending
                ? t(
                    `Записей на проверке: ${a.coverage.pending}. Подтвердите их, чтобы обновить расчёты.`,
                    `${a.coverage.pending} жазба тексеруді күтуде. Есепті жаңарту үшін оларды растаңыз.`,
                  )
                : first
                  ? first.action
                  : t(
                      "Составим план из конкретных задач и будем отслеживать результат.",
                      "Нақты істерден жоспар құрып, нәтижесін бақылап отырайық.",
                    )}
          </p>
          <button
            className="secondary"
            onClick={() =>
              !ready
                ? owner
                  ? onImport()
                  : onNavigate("connect")
                : a.coverage.pending
                  ? onNavigate("connect")
                  : first
                    ? onEvidence(first)
                    : onNavigate("growth")
            }
          >
            {t("Давайте начнём", "Бастайық")}
            <ArrowRight size={16} />
          </button>
        </section>
        <section className="next-step-card soft">
          <span className="note-label">
            02 · {t("ВАША ЦЕЛЬ", "СІЗДІҢ МАҚСАТЫҢЫЗ")}
          </span>
          <h3>
            {(
              {
                "Сохранить прибыль и не терять клиентов": t(
                  "Сохранить прибыль и не терять клиентов",
                  "Пайданы сақтап, клиенттерді жоғалтпау",
                ),
                "Превращать заявки в оплаченные занятия": t(
                  "Превращать заявки в оплаченные занятия",
                  "Өтінімдерді төленген сабақтарға айналдыру",
                ),
                "Увеличить продажи": t("Увеличить продажи", "Сатуды арттыру"),
                "Сатуды арттыру": t("Увеличить продажи", "Сатуды арттыру"),
                "Сократить расходы": t(
                  "Сократить расходы",
                  "Шығындарды азайту",
                ),
                "Шығындарды азайту": t(
                  "Сократить расходы",
                  "Шығындарды азайту",
                ),
                "Не терять клиентов": t(
                  "Не терять клиентов",
                  "Клиенттерді жоғалтпау",
                ),
                "Клиенттерді жоғалтпау": t(
                  "Не терять клиентов",
                  "Клиенттерді жоғалтпау",
                ),
              } as Record<string, string>
            )[goal] ||
              goal ||
              t("Развивать своё дело", "Кәсібімді дамыту")}
          </h3>
          <p>
            {t(
              "AQYL предложит действия. Вы решаете, что делать, кому поручить и когда проверить результат.",
              "AQYL әрекеттерді ұсынады. Не істеу, кімге тапсыру және нәтижені қашан тексеру — өз шешіміңіз.",
            )}
          </p>
          <button className="text-button" onClick={() => onNavigate("growth")}>
            {t("Мои дела и план", "Істерім мен жоспарым")}
            <ArrowRight size={16} />
          </button>
        </section>
      </div>
    </div>
  );
}

export function GuidedAssistant({
  analytics: a,
  language,
  onNavigate,
  onEvidence,
}: Pick<Props, "analytics" | "language" | "onNavigate" | "onEvidence">) {
  const [topic, setTopic] = useState("summary");
  const t = (r: string, k: string) => (language === "ru" ? r : k);
  const ready = a.coverage.verified > 0;
  return (
    <div className="guided-assistant">
      <div
        className="assistant-topics"
        aria-label={t("Выберите вопрос", "Сұрақты таңдаңыз")}
      >
        {[
          ["summary", t("Как идут дела?", "Жағдай қалай?")],
          ["attention", t("Что сделать первым?", "Алдымен не істеймін?")],
          ["data", t("Откуда эти цифры?", "Бұл сандар қайдан?")],
        ].map(([id, title]) => (
          <button
            key={id}
            aria-pressed={topic === id}
            onClick={() => setTopic(id)}
          >
            {title}
          </button>
        ))}
      </div>
      <div className="assistant-answer" aria-live="polite">
        {topic === "summary" && (
          <>
            <h3>
              {t(
                "Вот что видно по вашим записям",
                "Жазбаларыңыздан көрінетін жағдай",
              )}
            </h3>
            <p>
              {ready
                ? t(
                    `За ${a.days} дней выручка после возвратов — ${money(a.revenue)}, оплаченные расходы — ${money(a.expenses)}.`,
                    `${a.days} күндегі қайтарулар шегерілген түсім — ${money(a.revenue)}, төленген шығындар — ${money(a.expenses)}.`,
                  )
                : t(
                    "Пока недостаточно проверенных данных. Загрузите отчёт и подтвердите записи — я сразу пересчитаю показатели.",
                    "Тексерілген деректер әзірше жеткіліксіз. Есепті жүктеп, жазбаларды растаңыз — көрсеткіштерді бірден қайта есептеймін.",
                  )}
            </p>
            {ready && (
              <p>
                {a.gross === null
                  ? t(
                      "Прибыль пока не считаю: в записях не хватает себестоимости.",
                      "Пайданы әзірше есептемеймін: жазбаларда өзіндік құн жетіспейді.",
                    )
                  : t(
                      `Валовая прибыль — ${money(a.gross)}. Это ещё не чистая прибыль: налоги и другие обязательства могут отсутствовать.`,
                      `Жалпы пайда — ${money(a.gross)}. Бұл таза пайда емес: салықтар мен басқа міндеттемелер есепке кірмеуі мүмкін.`,
                    )}
              </p>
            )}
            <button
              className="text-button"
              onClick={() => onNavigate(ready ? "insights" : "connect")}
            >
              {t("Посмотреть подробнее", "Толығырақ көру")}
              <ArrowRight size={16} />
            </button>
          </>
        )}
        {topic === "attention" && (
          <>
            <h3>{t("Начнём с одного действия", "Бір әрекеттен бастайық")}</h3>
            {a.insights.length ? (
              a.insights.slice(0, 3).map((i) => (
                <button
                  className="assistant-fact"
                  key={i.id}
                  onClick={() => onEvidence(i)}
                >
                  <MessageCircle size={19} />
                  <span>
                    <b>{i.title}</b>
                    <small>{i.fact}</small>
                  </span>
                  <ArrowRight size={16} />
                </button>
              ))
            ) : (
              <p>
                {t(
                  "Сейчас нет сигналов по настроенным правилам. Проверьте полноту данных и выберите цель в плане.",
                  "Белгіленген ережелер бойынша мәселе жоқ. Деректердің толықтығын тексеріп, жоспардағы мақсатты таңдаңыз.",
                )}
              </p>
            )}
            <button
              className="text-button"
              onClick={() => onNavigate("growth")}
            >
              {t("Перейти к делам", "Істерге өту")}
              <ArrowRight size={16} />
            </button>
          </>
        )}
        {topic === "data" && (
          <>
            <h3>
              {t("У каждой цифры есть источник", "Әр санның дереккөзі бар")}
            </h3>
            <p>
              {t(
                `Всего загружено ${a.coverage.total} записей. Проверено: ${a.coverage.verified}. Ждут подтверждения: ${a.coverage.pending}. Дубликаты и неподтверждённые суммы не попадают в расчёт.`,
                `Барлығы ${a.coverage.total} жазба жүктелді. Тексерілгені: ${a.coverage.verified}. Растауды күтуде: ${a.coverage.pending}. Қайталанған және расталмаған сомалар есепке кірмейді.`,
              )}
            </p>
            <p>
              {t(
                "Анализ охватывает только добавленные данные. Демо-подключения соцсетей сами ничего не загружают.",
                "Талдау тек қосылған деректерді қамтиды. Әлеуметтік желілердің демо-қосылымдары деректерді өздігінен жүктемейді.",
              )}
            </p>
            <button
              className="text-button"
              onClick={() => onNavigate("connect")}
            >
              <FileCheck2 size={17} />
              {t("Открыть мои данные", "Деректерімді ашу")}
            </button>
          </>
        )}
      </div>
      <p className="assistant-method">
        {t(
          "Ответы рассчитаны по вашим данным и правилам анализа. Свободный AI-диалог пока не подключён.",
          "Жауаптар деректеріңіз бен талдау ережелері бойынша есептелді. Еркін AI-диалог әзірше қосылмаған.",
        )}
      </p>
    </div>
  );
}
