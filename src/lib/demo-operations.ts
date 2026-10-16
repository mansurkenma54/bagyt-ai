import {
  addDemoTask,
  unanswered,
  createThreadOrder,
  demoContacts,
  runAutoReply,
  type DemoLanguage,
  type HubState,
  type LocalText,
} from "./business-hub-demo";
export const inventoryCatalog = [
  {
    sku: "COF-0250",
    name: ["Кофе в зёрнах, 250 г", "Кофе дәндері, 250 г"] as LocalText,
    category: "coffee",
    unit: 3200,
    cost: 2000,
    onHand: 12,
    reserved: 2,
    daily: 4,
    lead: 5,
    supplier: "Almaty Coffee",
    mark: "C",
    tone: "coffee",
  },
  {
    sku: "TEA-0100",
    name: ["Чёрный чай, 100 г", "Қара шай, 100 г"] as LocalText,
    category: "tea",
    unit: 1800,
    cost: 1100,
    onHand: 46,
    reserved: 4,
    daily: 3,
    lead: 4,
    supplier: "Green Leaf",
    mark: "T",
    tone: "tea",
  },
  {
    sku: "TEA-0200",
    name: ["Зелёный чай, 100 г", "Көк шай, 100 г"] as LocalText,
    category: "tea",
    unit: 2100,
    cost: 1300,
    onHand: 32,
    reserved: 2,
    daily: 2,
    lead: 4,
    supplier: "Green Leaf",
    mark: "T",
    tone: "mint",
  },
  {
    sku: "SWT-0300",
    name: ["Шоколад, 90 г", "Шоколад, 90 г"] as LocalText,
    category: "sweets",
    unit: 950,
    cost: 600,
    onHand: 64,
    reserved: 4,
    daily: 5,
    lead: 3,
    supplier: "Qazaq Supply",
    mark: "S",
    tone: "cocoa",
  },
  {
    sku: "SWT-0400",
    name: ["Овсяное печенье, 300 г", "Сұлы печеньесі, 300 г"] as LocalText,
    category: "sweets",
    unit: 1200,
    cost: 750,
    onHand: 28,
    reserved: 0,
    daily: 2,
    lead: 3,
    supplier: "Qazaq Supply",
    mark: "B",
    tone: "wheat",
  },
  {
    sku: "BOX-0001",
    name: ["Подарочная коробка", "Сыйлық қорабы"] as LocalText,
    category: "packaging",
    unit: 800,
    cost: 450,
    onHand: 18,
    reserved: 3,
    daily: 1,
    lead: 2,
    supplier: "Qazaq Supply",
    mark: "P",
    tone: "sage",
  },
];
export const supplierQuotes = [
  {
    id: "almaty",
    name: "Almaty Coffee",
    city: "Алматы",
    cost: 2000,
    delivery: null,
    days: 5,
    minimum: 20,
    terms: [
      "Оплата после согласования",
      "Төлем келісілгеннен кейін",
    ] as LocalText,
    current: true,
  },
  {
    id: "steppe",
    name: "Steppe Roasters",
    city: "Астана",
    cost: 2150,
    delivery: 2500,
    days: 3,
    minimum: 10,
    terms: ["Предоплата 50%", "Алдын ала төлем 50%"] as LocalText,
    current: false,
  },
  {
    id: "nomad",
    name: "Nomad Coffee",
    city: "Алматы",
    cost: 1900,
    delivery: 1500,
    days: 7,
    minimum: 40,
    terms: ["Предоплата 100%", "Алдын ала төлем 100%"] as LocalText,
    current: false,
  },
];
export function quoteTotal(id: string, desired = 30) {
  const quote = supplierQuotes.find((s) => s.id === id);
  if (!quote || !Number.isInteger(desired) || desired < 1) return null;
  const quantity = Math.max(desired, quote.minimum);
  return {
    quantity,
    subtotal: quantity * quote.cost,
    delivery: quote.delivery,
    total:
      quote.delivery === null ? null : quantity * quote.cost + quote.delivery,
  };
}
export function runDemoRules(state: HubState): HubState {
  let next = state;
  if (state.rules.includes("followup"))
    for (const c of unanswered(state).filter((c) => c.wait >= 30))
      next = addDemoTask(next, `follow-${c.contact}`);
  if (state.rules.includes("review") && !state.reviewReplies.r1)
    next = addDemoTask(next, "service");
  return { ...next, ruleRuns: Math.min(state.ruleRuns + 1, 10000) };
}

export type OperationRunEvent = {
  id: string;
  title: LocalText;
  detail: LocalText;
  section: string;
  agent: "Sana" | "Qor" | "Belgi";
  status: "created" | "skipped";
};

/** Runs only local demo state transitions; it does not call a messaging or order service. */
export function runOperationsAutomation(
  state: HubState,
  language: DemoLanguage,
  available: number,
) {
  let next = state;
  const events: OperationRunEvent[] = [];
  const addEvent = (event: OperationRunEvent) => events.push(event);
  if (state.autoReplyEnabled) {
    for (const thread of unanswered(state)) {
      const name =
        demoContacts.find((person) => person.id === thread.contact)?.name ||
        thread.contact;
      const before = next;
      next = runAutoReply(next, thread.id, language, available);
      const created =
        !before.replies[thread.id] && Boolean(next.replies[thread.id]);
      addEvent({
        id: `reply-${thread.id}`,
        agent: "Sana",
        status: created ? "created" : "skipped",
        section: "inbox",
        title: created
          ? [`Ответ для ${name} записан`, `${name} үшін жауап тіркелді`]
          : [`Черновик для ${name} сохранён`, `${name} үшін жоба сақталды`],
        detail: created
          ? [
              `${thread.source} · ответ в истории диалога`,
              `${thread.source} · жауап диалог тарихында`,
            ]
          : [
              "Ваш отредактированный ответ не перезаписан",
              "Өңделген жауабыңыз қайта жазылған жоқ",
            ],
      });
    }
  }
  if (state.rules.includes("orders")) {
    const before = next.threadOrders.length;
    if (next.replies["wa-101"])
      next = createThreadOrder(next, "wa-101", "COF-0250", 2);
    const created = next.threadOrders.length > before;
    addEvent({
      id: "order-wa-101",
      agent: "Sana",
      status: created ? "created" : "skipped",
      section: "inbox",
      title: created
        ? ["Заказ Аружан подготовлен", "Аружанның тапсырысы дайын"]
        : next.replies["wa-101"]
          ? ["Заказ уже есть", "Тапсырыс бұрын дайындалған"]
          : ["Сначала нужен ответ Аружан", "Алдымен Аружанға жауап қажет"],
      detail: created
        ? [
            "2 пачки кофе · 6 400 ₸ · ожидает подтверждения",
            "2 қаптама кофе · 6 400 ₸ · растауды күтуде",
          ]
        : [
            "Повторная обработка не создаёт второй заказ",
            "Қайта өңдеу екінші тапсырысты құрмайды",
          ],
    });
  }
  if (state.rules.includes("stock")) {
    const stockKnown = Number.isFinite(available) && available >= 0;
    const needsPurchase = stockKnown && available / 4 < 5;
    const created = needsPurchase && !next.quoteRequests.includes("almaty");
    if (created)
      next = {
        ...addDemoTask(next, "restock-coffee"),
        quoteRequests: [...next.quoteRequests, "almaty"],
      };
    addEvent({
      id: "stock-coffee",
      agent: "Qor",
      status: created ? "created" : "skipped",
      section: "purchases",
      title: created
        ? ["Запрос условий закупки готов", "Сатып алу шарттарына сұрау дайын"]
        : needsPurchase
          ? ["Закупка уже на проверке", "Сатып алу тексеруде"]
          : stockKnown
            ? ["Запаса кофе достаточно", "Кофе қоры жеткілікті"]
            : ["Проверьте остаток кофе", "Кофе қорын тексеріңіз"],
      detail: needsPurchase
        ? [
            "30 пачек · Almaty Coffee · сначала проверка и ваше подтверждение",
            "30 қаптама · Almaty Coffee · алдымен тексеру және сіздің растауыңыз",
          ]
        : !stockKnown
          ? [
              "Остаток неизвестен — запрос не создаётся",
              "Қор белгісіз — сұрау құрылмайды",
            ]
          : [
              "При текущем темпе запас покрывает срок поставки",
              "Қазіргі қарқында қор жеткізу мерзіміне жетеді",
            ],
    });
  }
  const beforeFollowupTasks = next.tasks.length;
  next = runDemoRules(next);
  const addedTasks = next.tasks.length - beforeFollowupTasks;
  if (
    addedTasks &&
    state.rules.some((rule) => rule === "followup" || rule === "review")
  ) {
    addEvent({
      id: "tasks",
      agent: "Belgi",
      status: "created",
      section: "growth",
      title: [
        `В плане ${addedTasks} новых задач`,
        `Жоспарда ${addedTasks} жаңа тапсырма`,
      ],
      detail: [
        "Повторные задачи пропущены",
        "Қайталанған тапсырмалар өткізілді",
      ],
    });
  }
  return { state: next, events };
}
