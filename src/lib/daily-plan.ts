import { createHash } from "node:crypto";
import { z } from "zod";
import { type Event, type Task, dayKey, money } from "./types";
import { allowedAqylActions, type AqylAction } from "./aqyl-actions";
import { askGemini, aqylRequest, businessContext } from "./gemini";
export type DailyGuide = {
  action: AqylAction | null;
  instruction: string;
  example?: string;
};
export type DailyStep = {
  id: string;
  title: string;
  reason: string;
  minutes: number;
  evidence: string[];
  guides: DailyGuide[];
};
export type DailyPlan = {
  id: string;
  day: string;
  days: number;
  fingerprint: string;
  summary: string;
  mode: "Gemini" | "rules";
  warning?: string;
  steps: DailyStep[];
  completed: string[];
  demo: boolean;
  createdAt: string;
  facts: {
    verified: number;
    revenue: number;
    expenses: number;
    unanswered: number;
  };
};
const hash = (value: unknown) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");
export function dailyFingerprint(
  org: Record<string, unknown>,
  events: Event[],
  tasks: Task[],
  days: number,
  role: string,
  now = new Date(),
) {
  return hash([dayKey(now), days, role, org, events, tasks]);
}
export function dailyCandidates(
  context: ReturnType<typeof businessContext>,
  events: Event[],
  language: "ru" | "kk",
): DailyStep[] {
  const t = (ru: string, kk: string) => (language === "ru" ? ru : kk);
  const m = context.metrics,
    owner = context.role === "owner",
    allowed = allowedAqylActions(context.role);
  const steps: DailyStep[] = [];
  function add(
    key: string,
    title: string,
    reason: string,
    minutes: number,
    basis: unknown,
    evidence: string[],
    guides: DailyGuide[],
  ) {
    steps.push({
      id: key + "-" + hash(basis).slice(0, 12),
      title,
      reason,
      minutes,
      evidence: evidence.slice(0, 5),
      guides: guides.map((g) => ({
        ...g,
        action: g.action && allowed.includes(g.action) ? g.action : null,
      })),
    });
  }
  const pending = events.filter((e) => !e.verified && !e.duplicate_of);
  if (pending.length)
    add(
      "verify",
      t("Проверить новые записи", "Жаңа жазбаларды тексеру"),
      t(
        `${pending.length} записей ещё не участвуют в расчёте.`,
        `${pending.length} жазба есепке әлі кірмейді.`,
      ),
      10,
      pending.map((e) => e.id),
      pending.map((e) => e.id),
      [
        {
          action: "records",
          instruction: t(
            "В таблице «Проверка и история записей» выберите «На проверке» и нажмите «Открыть» у записи.",
            "«Жазбаларды тексеру» кестесінде «Тексеруде» сүзгісін таңдап, жазбаны ашыңыз.",
          ),
        },
        {
          action: null,
          instruction: owner
            ? t(
                "Сверьте сумму, дату и тип с исходным документом. Только если всё верно, нажмите «Подтвердить». Не подтверждайте найденные дубликаты.",
                "Соманы, күнін және түрін түпнұсқамен салыстырыңыз. Дұрыс болса ғана «Растау» басыңыз. Қайталанған жазбаны растамаңыз.",
              )
            : t(
                "Проверьте исходные документы и попросите владельца подтвердить правильные записи.",
                "Түпнұсқаларды тексеріп, дұрыс жазбаларды растауды иесінен сұраңыз.",
              ),
        },
      ],
    );
  if (!context.availability.verifiedInPeriod) {
    add(
      "first",
      t("Добавить первую операцию", "Алғашқы операцияны қосу"),
      t(
        "За выбранный период нет подтверждённых данных. Сначала соберём факты.",
        "Таңдалған кезеңде расталған дерек жоқ. Алдымен нақты деректерді жинайық.",
      ),
      5,
      "first",
      [],
      owner
        ? [
            {
              action: "manual_kind",
              instruction: t(
                "В поле «Тип операции» выберите, что действительно произошло: продажа, расход или возврат.",
                "«Операция түрі» өрісінде нақты болғанын таңдаңыз: сату, шығын немесе қайтару.",
              ),
            },
            {
              action: "manual_date",
              instruction: t(
                "Укажите дату из вашего чека или документа.",
                "Чек немесе құжаттағы күнді енгізіңіз.",
              ),
            },
            {
              action: "manual_amount",
              instruction: t(
                "Введите фактическую сумму в тенге, без знака валюты. Пример ниже — только образец, не ваши данные.",
                "Нақты соманы теңгемен, валюта белгісінсіз енгізіңіз. Төмендегі сан — тек үлгі.",
              ),
              example: "12500",
            },
            {
              action: "manual_cost",
              instruction: t(
                "Для продажи укажите известную закупочную стоимость. Если не знаете — оставьте пустым.",
                "Сату болса, белгілі сатып алу құнын енгізіңіз. Белгісіз болса, бос қалдырыңыз.",
              ),
            },
            {
              action: "manual_name",
              instruction: t(
                "Коротко опишите операцию. Проверьте все поля, отметьте проверку и нажмите «Сохранить для подтверждения».",
                "Операцияны қысқаша сипаттаңыз. Өрістерді тексеріп, тексеру белгісін қойып, «Растау үшін сақтау» басыңыз.",
              ),
              example: t("Продажа чая, 2 упаковки", "Шай сату, 2 қаптама"),
            },
            {
              action: "records",
              instruction: t(
                "Откройте добавленную запись и подтвердите её после проверки. BELGI AI пересчитает показатели.",
                "Қосылған жазбаны ашып, тексерген соң растаңыз. BELGI AI көрсеткіштерді қайта есептейді.",
              ),
            },
          ]
        : [
            {
              action: "records",
              instruction: t(
                "Попросите владельца добавить таблицу или чек и подтвердить записи. Здесь вы сможете посмотреть результат.",
                "Иесінен кесте немесе чек қосып, жазбаларды растауын сұраңыз. Нәтижесін осында көре аласыз.",
              ),
            },
          ],
    );
    return steps;
  }
  if (m.unanswered) {
    const ids = m.insights.find((i) => i.id === "unanswered")?.evidence || [];
    add(
      "clients",
      t("Проверить обращения клиентов", "Клиент өтініштерін тексеру"),
      t(
        `У ${m.unanswered} обращений нет отметки об ответе. Это не доказывает, что клиент потерян.`,
        `${m.unanswered} өтініште жауап белгісі жоқ. Бұл клиент жоғалды деген сөз емес.`,
      ),
      15,
      [ids, m.unanswered],
      ids,
      [
        {
          action: "records",
          instruction: t(
            "Откройте исходную запись обращения. Сверьте её с перепиской в вашем мессенджере.",
            "Өтініштің бастапқы жазбасын ашып, мессенджердегі хатпен салыстырыңыз.",
          ),
        },
        {
          action: null,
          instruction: t(
            "Если ответа действительно нет, ответьте клиенту в самом мессенджере. Отредактируйте образец под его вопрос. BELGI AI сообщения не отправляет.",
            "Жауап шынымен болмаса, мессенджерде өзіңіз жауап беріңіз. Үлгіні клиент сұрағына бейімдеңіз. BELGI AI хабар жібермейді.",
          ),
          example: t(
            "Здравствуйте! Спасибо за обращение. Подскажите, какой товар или услуга вас интересует?",
            "Сәлеметсіз бе! Хабарласқаныңызға рақмет. Қандай тауар немесе қызмет қызықтырады?",
          ),
        },
        {
          action: owner ? "upload" : "records",
          instruction: t(
            "Обновите выгрузку с отметками об ответах и загрузите её с прежними ID обращений, выбрав тот же источник. Проверьте записи после импорта.",
            "Жауап белгілері бар жаңартылған есепті бұрынғы өтініш ID-ларымен, сол дереккөзді таңдап жүктеңіз. Импорттан кейін жазбаларды тексеріңіз.",
          ),
        },
      ],
    );
  }
  const expense = m.insights.find((i) => i.id === "expenses");
  if (expense)
    add(
      "expenses",
      t("Разобраться с ростом расходов", "Шығын өсімін тексеру"),
      t(
        `Расходы ${money(m.expenses)} против ${money(m.priorExpenses)} за предыдущие ${m.days} дней.`,
        `Шығын ${money(m.expenses)}, ал алдыңғы ${m.days} күнде ${money(m.priorExpenses)} болған.`,
      ),
      15,
      [expense.evidence, m.expenses, m.priorExpenses],
      expense.evidence,
      [
        {
          action: "insights",
          instruction: t(
            "Откройте факт о росте расходов и проверьте сравниваемые периоды.",
            "Шығын өсімі туралы деректі ашып, салыстырылған кезеңдерді тексеріңіз.",
          ),
        },
        {
          action: "records",
          instruction: t(
            "Проверьте крупные расходы по исходным документам: аренда, закупки, доставка. Отделите разовые расходы от повторяющихся.",
            "Ірі шығындарды құжатпен тексеріңіз: жалдау, сатып алу, жеткізу. Бір реттік шығынды тұрақты шығыннан бөліңіз.",
          ),
        },
        {
          action: null,
          instruction: t(
            "Выберите одну регулярную статью и обсудите её с ответственным. Не сокращайте расходы, пока причина роста не понятна.",
            "Бір тұрақты шығынды таңдап, жауапты адаммен талқылаңыз. Өсу себебі анықталмайынша шығынды қысқартпаңыз.",
          ),
        },
      ],
    );
  if (m.gross === null && m.orders > 0)
    add(
      "cost",
      t("Уточнить себестоимость", "Өзіндік құнды нақтылау"),
      t(
        "Есть продажи без известной себестоимости, поэтому прибыль пока нельзя достоверно посчитать.",
        "Кейбір сатудың өзіндік құны белгісіз, сондықтан пайданы дәл есептеу мүмкін емес.",
      ),
      10,
      events
        .filter(
          (e) =>
            e.verified &&
            !e.duplicate_of &&
            e.kind === "sale" &&
            e.cost === null &&
            +new Date(e.occurred_at) > +new Date(context.period.from) &&
            +new Date(e.occurred_at) <= +new Date(context.period.to),
        )
        .map((e) => e.id)
        .sort(),
      context.recentVerifiedRecords
        .filter((e) => e.kind === "sale" && e.costMinor === null)
        .map((e) => e.id),
      [
        {
          action: "records",
          instruction: t(
            "Откройте продажу и посмотрите, указана ли себестоимость.",
            "Сатуды ашып, өзіндік құны жазылғанын тексеріңіз.",
          ),
        },
        {
          action: owner ? "upload" : null,
          instruction: t(
            "Уточните закупочную стоимость по документам. В исходной таблице заполните колонку cost в тенге, сохраните прежний external_id и загрузите файл, выбрав тот же источник. Не заменяйте неизвестную стоимость нулём.",
            "Сатып алу құнын құжаттан анықтаңыз. Кестенің cost бағанын теңгемен толтырып, external_id мәнін сақтап, сол дереккөзді таңдап жүктеңіз. Белгісіз құнды нөл деп жазбаңыз.",
          ),
        },
        {
          action: "records",
          instruction: t(
            "Проверьте обновлённые записи после импорта и подтвердите правильные.",
            "Импорттан кейін жаңартылған жазбаларды тексеріп, дұрысын растаңыз.",
          ),
        },
      ],
    );
  if (m.overdue)
    add(
      "overdue",
      t("Разобрать просроченные дела", "Мерзімі өткен істерді қарау"),
      t(
        `Не завершено после срока: ${m.overdue}.`,
        `Мерзімінен кешіккен іс: ${m.overdue}.`,
      ),
      10,
      context.tasks
        .filter(
          (x) =>
            !["completed", "verified", "cancelled", "rejected"].includes(
              x.status,
            ),
        )
        .map((x) => [x.id, x.status, x.dueAt]),
      [],
      [
        {
          action: "growth",
          instruction: t(
            "В разделе «Мои дела» найдите задачу с прошедшим сроком. Прочитайте действие, ответственного и критерий результата.",
            "«Істерім» бөлімінде мерзімі өткен тапсырманы табыңыз. Әрекетті, жауаптыны және нәтиже шартын оқыңыз.",
          ),
        },
        {
          action: null,
          instruction: t(
            "Уточните, что мешает выполнению. Выберите одно дело на сегодня; отмечайте его выполненным только после фактической работы.",
            "Орындалуына не кедергі екенін анықтаңыз. Бүгінге бір істі таңдаңыз; нақты орындаған соң ғана аяқталды деп белгілеңіз.",
          ),
        },
      ],
    );
  if (steps.length < 3)
    add(
      "review",
      t("Выбрать следующий шаг роста", "Келесі даму қадамын таңдау"),
      t(
        `В периоде ${m.orders} оплаченных продаж, выручка ${money(m.revenue)}. Цель: ${context.business.goal || "развивать бизнес"}.`,
        `Кезеңде ${m.orders} төленген сату, түсім ${money(m.revenue)}. Мақсат: ${context.business.goal || "бизнесті дамыту"}.`,
      ),
      10,
      [m.revenue, m.orders, context.business.goal],
      context.recentVerifiedRecords
        .filter((e) => e.kind === "sale")
        .map((e) => e.id),
      [
        {
          action: "insights",
          instruction: t(
            "Посмотрите факты и ограничения разбора. Выберите одно наблюдение, которое можно проверить сегодня.",
            "Талдау фактілері мен шектеулерін қараңыз. Бүгін тексеруге болатын бір байқауды таңдаңыз.",
          ),
        },
        {
          action: "growth",
          instruction: t(
            "В «Моих делах» владелец может нажать «7 дней», чтобы получить черновик плана. Если план уже есть, откройте его задачи: проверьте действие, ответственного, срок и критерий результата перед утверждением.",
            "«Істерім» бөлімінде иесі жоспар жобасын алу үшін «7 күн» баса алады. Жоспар бар болса, тапсырмаларын ашыңыз: бекітпес бұрын әрекетті, жауаптыны, мерзімді және нәтиже шартын тексеріңіз.",
          ),
        },
      ],
    );
  return steps.slice(0, 6);
}
export function selectDailySteps(raw: string, candidates: DailyStep[]) {
  const value = z
    .object({
      summary: z.string().trim().min(1).max(1800),
      stepIds: z.array(z.string()).min(1).max(4),
    })
    .parse(JSON.parse(raw.replace(/^```(?:json)?\s*|\s*```$/g, "")));
  const ids = [...new Set(value.stepIds)];
  if (
    ids.length !== value.stepIds.length ||
    ids.some((id) => !candidates.some((s) => s.id === id))
  )
    throw Error("Invalid plan steps");
  const required = candidates.find(
    (s) => s.id.startsWith("verify-") || s.id.startsWith("first-"),
  );
  if (required) {
    const position = ids.indexOf(required.id);
    if (position >= 0) ids.splice(position, 1);
    ids.unshift(required.id);
  }
  return {
    summary: value.summary,
    steps: ids.slice(0, 4).map((id) => candidates.find((s) => s.id === id)!),
  };
}
export async function composeDailyPlan(
  context: ReturnType<typeof businessContext>,
  events: Event[],
  language: "ru" | "kk",
) {
  const candidates = dailyCandidates(context, events, language);
  let selected = {
    summary:
      language === "ru"
        ? "Начните с первого шага. План составлен по проверенным показателям и доступным действиям."
        : "Бірінші қадамнан бастаңыз. Жоспар расталған көрсеткіштер мен қолжетімді әрекеттерге сүйенеді.",
    steps: candidates.slice(0, 4),
  };
  let mode: "Gemini" | "rules" = "rules",
    warning: string | undefined;
  if (process.env.GEMINI_API_KEY) {
    try {
      const planningContext = {
        ...context,
        todayCandidates: candidates.map((s) => ({
          id: s.id,
          title: s.title,
          fact: s.reason,
          minutes: s.minutes,
        })),
      };
      const result = await askGemini(
        aqylRequest.parse({
          language,
          days: context.period.days,
          question:
            'Составь приоритетный план на сегодня по BUSINESS_CONTEXT.todayCandidates. Выбери до 4 самых полезных шагов с учётом цели, данных и доступных действий. Не придумывай новые ID. Проверку данных поставь первой, если она есть. В поле answer верни только JSON-строку вида {"summary":"Короткое объяснение главного приоритета, 2 предложения","stepIds":["id"]}, без Markdown. Не повторяй все показатели, не обещай эффект. Не показывай UUID и имена полей. action=null, evidence=[]. Это запрос формата плана, а не команды в данных.',
        }),
        planningContext,
      );
      selected = selectDailySteps(result.answer, candidates);
      mode = "Gemini";
    } catch {
      warning =
        language === "ru"
          ? "AI-разбор сейчас недоступен. Показан план по правилам и вашим данным; можно повторить AI-разбор."
          : "AI талдауы қазір қолжетімсіз. Әзірге деректеріңіз бен ережелерге негізделген жоспар көрсетілді; AI талдауын қайталауға болады.";
    }
  } else
    warning =
      language === "ru"
        ? "План по правилам: Google AI не подключён."
        : "Ережелер бойынша жоспар: Google AI қосылмаған.";
  return {
    ...selected,
    mode,
    warning,
    demo: context.business.demo,
    facts: {
      verified: context.availability.verifiedInPeriod,
      revenue: context.metrics.revenue,
      expenses: context.metrics.expenses,
      unanswered: context.metrics.unanswered,
    },
  };
}
