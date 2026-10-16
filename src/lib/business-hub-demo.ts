// All records are synthetic. Stable source IDs make replaying the demo idempotent.
export type DemoLanguage = "kk" | "ru";
export type LocalText = [string, string]; // Russian, Kazakh
export const localText = (value: LocalText, language: DemoLanguage) =>
  value[language === "ru" ? 0 : 1];
export const demoContacts = [
  {
    id: "c5",
    name: "Әлия Н.",
    initials: "ӘН",
    orders: 1,
    total: 3200,
    segment: ["Пришла из TikTok", "TikTok арқылы келген"] as LocalText,
    channels: ["TikTok", "Kaspi"],
  },
  {
    id: "c1",
    name: "Аружан С.",
    initials: "АС",
    orders: 8,
    total: 86400,
    segment: ["Постоянный клиент", "Тұрақты клиент"] as LocalText,
    channels: ["WhatsApp", "Kaspi"],
  },
  {
    id: "c2",
    name: "Данияр К.",
    initials: "ДК",
    orders: 3,
    total: 56200,
    segment: ["Повторная покупка", "Қайта сатып алу"] as LocalText,
    channels: ["Instagram", "POS"],
  },
  {
    id: "c3",
    name: "Айгерім М.",
    initials: "АМ",
    orders: 5,
    total: 43800,
    segment: ["Нужна забота", "Назар аудару керек"] as LocalText,
    channels: ["WhatsApp", "Kaspi"],
  },
  {
    id: "c4",
    name: "Марат Б.",
    initials: "МБ",
    orders: 2,
    total: 17400,
    segment: ["Новый клиент", "Жаңа клиент"] as LocalText,
    channels: ["Сайт", "POS"],
  },
];
export const demoConversations = [
  {
    id: "tt-106",
    contact: "c5",
    source: "TikTok",
    time: "14:28",
    wait: 7,
    text: [
      "Увидела ваше видео про кофе. Можно одну пачку на пробу?",
      "Кофе туралы видеоларыңызды көрдім. Бір қаптама алып көрсем бола ма?",
    ] as LocalText,
    intent: ["Заказ из видео", "Видеодан келген тапсырыс"] as LocalText,
  },
  {
    id: "wa-101",
    contact: "c1",
    source: "WhatsApp",
    time: "14:20",
    wait: 15,
    text: [
      "Здравствуйте! Можно заказать ещё 2 пачки кофе?",
      "Сәлеметсіз бе! Тағы 2 қаптама кофе алуға бола ма?",
    ] as LocalText,
    intent: ["Повторный заказ", "Қайта тапсырыс"] as LocalText,
  },
  {
    id: "ig-102",
    contact: "c2",
    source: "Instagram",
    time: "13:50",
    wait: 45,
    text: [
      "Добрый день! Есть подарочные наборы с чаем?",
      "Қайырлы күн! Шайы бар сыйлық жиынтықтары бар ма?",
    ] as LocalText,
    intent: ["Вопрос о товаре", "Тауар туралы сұрақ"] as LocalText,
  },
  {
    id: "wa-103",
    contact: "c3",
    source: "WhatsApp",
    time: "12:35",
    wait: 120,
    text: [
      "Вчера долго ждала выдачу. Подскажите, как забрать быстрее?",
      "Кеше тапсырысты ұзақ күттім. Тезірек қалай алуға болады?",
    ] as LocalText,
    intent: ["Сервис и удержание", "Қызмет және клиентті сақтау"] as LocalText,
  },
  {
    id: "web-104",
    contact: "c4",
    source: "Сайт",
    time: "14:05",
    wait: 30,
    text: [
      "Можно уточнить состав подарочной корзины?",
      "Сыйлық себетінің құрамын білуге бола ма?",
    ] as LocalText,
    intent: ["Консультация", "Кеңес алу"] as LocalText,
  },
];
export const incomingDemo = {
  id: "wa-105",
  contact: "c2",
  source: "WhatsApp",
  time: "14:36",
  wait: 0,
  text: [
    "Это Данияр, писал в Instagram. Можно получить список наборов здесь?",
    "Бұл Данияр, Instagram-да жазған едім. Жиынтықтар тізімін осында алсам бола ма?",
  ] as LocalText,
  intent: ["Продолжение диалога", "Әңгімені жалғастыру"] as LocalText,
};
export const demoReviews = [
  {
    id: "r4",
    name: "Әлия Н.",
    source: "2GIS",
    stars: 4,
    text: [
      "Нашла магазин по карте, кофе понравился. Добавьте, пожалуйста, информацию о парковке.",
      "Дүкенді картадан таптым, кофесі ұнады. Тұрақ туралы ақпарат қоссаңыздар жақсы болар еді.",
    ] as LocalText,
    theme: ["Как добраться", "Қалай жетуге болады"] as LocalText,
  },
  {
    id: "r1",
    name: "Айгерім М.",
    source: "Google Maps",
    stars: 3,
    text: [
      "Кофе хороший, но долго ждала выдачу заказа.",
      "Кофесі жақсы, бірақ тапсырысты ұзақ күттім.",
    ] as LocalText,
    theme: ["Скорость обслуживания", "Қызмет көрсету жылдамдығы"] as LocalText,
  },
  {
    id: "r2",
    name: "Аружан С.",
    source: "Google Maps",
    stars: 5,
    text: [
      "Свежий кофе и внимательный персонал. Приду ещё!",
      "Жаңа кофе, қызметкерлері ілтипатты. Тағы келемін!",
    ] as LocalText,
    theme: ["Качество продукта", "Өнім сапасы"] as LocalText,
  },
  {
    id: "r3",
    name: "Гость · 041",
    source: "Сайт",
    stars: 4,
    text: [
      "Хороший выбор чая. Хотелось бы больше подарочных наборов.",
      "Шай түрлері жақсы. Сыйлық жиынтықтары көбірек болса екен.",
    ] as LocalText,
    theme: ["Ассортимент", "Ассортимент"] as LocalText,
  },
];
export const growthIdeas = [
  {
    id: "service",
    title: ["Ускорить выдачу заказов", "Тапсырысты тезірек беру"] as LocalText,
    evidence: [
      "1 обращение WhatsApp + 1 отзыв о долгом ожидании. Возможно, это один случай; связь не подтверждена.",
      "WhatsApp-та 1 өтініш + ұзақ күту туралы 1 пікір. Бір жағдай болуы мүмкін; байланысы расталмаған.",
    ] as LocalText,
    action: [
      "Проверить время выдачи 10 следующих заказов. Назначить ответственного за выдачу.",
      "Келесі 10 тапсырыстың берілу уақытын тексеру. Жауапты қызметкерді белгілеу.",
    ] as LocalText,
    metric: [
      "Цель: выдача до 5 минут",
      "Мақсат: 5 минут ішінде беру",
    ] as LocalText,
    source: "WhatsApp · Google Maps",
  },
  {
    id: "assortment",
    title: [
      "Проверить спрос на наборы",
      "Жиынтықтарға сұранысты тексеру",
    ] as LocalText,
    evidence: [
      "Вопрос в Instagram и пожелание в отзыве сайта. Это гипотеза спроса, не прогноз продаж.",
      "Instagram-дағы сұрақ және сайттағы пікір. Бұл — сұраныс болжамы, расталған сатылым емес.",
    ] as LocalText,
    action: [
      "Собрать 2 варианта набора из текущего ассортимента. Уточнить интерес у 5 клиентов.",
      "Қазіргі тауарлардан 2 жиынтық құрастыру. 5 клиенттің қызығушылығын анықтау.",
    ] as LocalText,
    metric: [
      "Цель: 5 ответов, затем решение",
      "Мақсат: 5 жауап, содан кейін шешім",
    ] as LocalText,
    source: "Instagram · Сайт",
  },
  {
    id: "retention",
    title: [
      "Не терять повторные заказы",
      "Қайталама тапсырысты жоғалтпау",
    ] as LocalText,
    evidence: [
      "Аружан уже сделала 8 покупок и снова спрашивает о кофе.",
      "Аружан 8 рет сатып алған және кофе туралы қайта сұрап отыр.",
    ] as LocalText,
    action: [
      "Ответить на запрос, согласовать количество и самовывоз. Проверить результат завтра.",
      "Сұраққа жауап беру, санын және алып кетуді келісу. Ертең нәтижесін тексеру.",
    ] as LocalText,
    metric: [
      "Цель: закрыть запрос клиента",
      "Мақсат: клиент өтінішін шешу",
    ] as LocalText,
    source: "WhatsApp · CRM",
  },
];
export const hubProducts = [
  {
    id: "COF-0250",
    name: ["Кофе в зёрнах, 250 г", "Кофе дәндері, 250 г"] as LocalText,
    price: 3200,
  },
  {
    id: "TEA-0100",
    name: ["Чёрный чай, 100 г", "Қара шай, 100 г"] as LocalText,
    price: 1800,
  },
  {
    id: "BOX-0001",
    name: ["Подарочная коробка", "Сыйлық қорабы"] as LocalText,
    price: 800,
  },
];
export type HubMessage = {
  id: string;
  text: string;
  time: string;
  kind: "manual" | "auto";
};
export type HubOrder = {
  id: string;
  conversationId: string;
  contactId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  status: "draft";
};
export const demoThreadHistory: Record<
  string,
  { from: "customer" | "team"; time: string; text: LocalText }[]
> = {
  "wa-101": [
    {
      from: "customer",
      time: "14:12",
      text: [
        "Добрый день! В прошлый раз брала кофе для кофемашины.",
        "Қайырлы күн! Өткенде кофемашинаға кофе алған едім.",
      ],
    },
    {
      from: "team",
      time: "14:14",
      text: [
        "Аружан, здравствуйте! Да, помним ваш заказ. Как вам вкус?",
        "Сәлеметсіз бе, Аружан! Иә, тапсырысыңыз есімізде. Дәмі қалай екен?",
      ],
    },
    {
      from: "customer",
      time: "14:16",
      text: [
        "Очень понравился, дома быстро закончился 😊",
        "Өте ұнады, үйде тез бітіп қалды 😊",
      ],
    },
  ],
  "ig-102": [
    {
      from: "customer",
      time: "13:42",
      text: [
        "Здравствуйте, выбираю подарок коллеге.",
        "Сәлеметсіз бе, әріптесіме сыйлық іздеп жүрмін.",
      ],
    },
    {
      from: "team",
      time: "13:44",
      text: [
        "Здравствуйте! Подскажите, что он предпочитает — чай или кофе?",
        "Сәлеметсіз бе! Шайды ма, кофені ме көбірек ұнатады?",
      ],
    },
  ],
  "wa-103": [
    {
      from: "team",
      time: "Вчера 18:10",
      text: [
        "Ваш заказ готов. Будем ждать вас до 20:00.",
        "Тапсырысыңыз дайын. 20:00-ге дейін күтеміз.",
      ],
    },
    {
      from: "customer",
      time: "Вчера 18:26",
      text: [
        "Я подошла к выдаче, здесь очередь.",
        "Алып кетуге келдім, мұнда кезек екен.",
      ],
    },
  ],
  "web-104": [
    {
      from: "team",
      time: "14:03",
      text: [
        "Добро пожаловать в Qazyna Store! Чем можем помочь?",
        "Qazyna Store-ға қош келдіңіз! Қалай көмектесе аламыз?",
      ],
    },
  ],
  "tt-106": [
    {
      from: "customer",
      time: "14:23",
      text: [
        "Какой ароматный обзор ☕ Вы в Алматы?",
        "Керемет шолу екен ☕ Алматыдасыздар ма?",
      ],
    },
    {
      from: "team",
      time: "14:25",
      text: [
        "Да, мы в Алматы. Кофе можно забрать в магазине.",
        "Иә, біз Алматыдамыз. Кофені дүкеннен алып кетуге болады.",
      ],
    },
  ],
};
export type HubState = {
  version: 1;
  incoming: boolean;
  replies: Record<string, string>;
  drafts: Record<string, string>;
  reviewReplies: Record<string, string>;
  reviewDrafts: Record<string, string>;
  owners: Record<string, string>;
  tasks: string[];
  completed: string[];
  rules: string[];
  ruleRuns: number;
  quoteRequests: string[];
  autoReplyEnabled: boolean;
  sentMessages: Record<string, HubMessage[]>;
  threadOrders: HubOrder[];
};
export const initialHub: HubState = {
  version: 1,
  incoming: false,
  replies: {},
  drafts: {},
  reviewReplies: {},
  reviewDrafts: {},
  owners: {},
  tasks: [],
  completed: [],
  rules: [],
  ruleRuns: 0,
  quoteRequests: [],
  autoReplyEnabled: false,
  sentMessages: {},
  threadOrders: [],
};
export const allConversations = (s: HubState) =>
  s.incoming ? [...demoConversations, incomingDemo] : demoConversations;
export const syncDemoMessage = (s: HubState): HubState =>
  s.incoming ? s : { ...s, incoming: true };
export const unanswered = (s: HubState) =>
  allConversations(s).filter((c) => !s.replies[c.id]);
const taskIds = [
  "restock-coffee",
  ...demoContacts.map((c) => `follow-${c.id}`),
  ...growthIdeas.map((i) => i.id),
];
export function addDemoTask(s: HubState, id: string): HubState {
  return !taskIds.includes(id) || s.tasks.includes(id)
    ? s
    : { ...s, tasks: [...s.tasks, id] };
}
export function simulateReply(
  s: HubState,
  id: string,
  review = false,
): HubState {
  const valid = review
    ? demoReviews.some((r) => r.id === id)
    : allConversations(s).some((c) => c.id === id);
  const text = (review ? s.reviewDrafts : s.drafts)[id]?.trim();
  if (!valid || !text || (review ? s.reviewReplies : s.replies)[id]) return s;
  return review
    ? { ...s, reviewReplies: { ...s.reviewReplies, [id]: text } }
    : { ...s, replies: { ...s.replies, [id]: text } };
}
export function parseHub(value: unknown): HubState {
  if (!value || typeof value !== "object") return initialHub;
  const v = value as Record<string, unknown>;
  if (v.version !== 1 || typeof v.incoming !== "boolean") return initialHub;
  const messageIds = [...demoConversations, incomingDemo].map((c) => c.id);
  const pick = (key: string, ids: string[]) => {
    const obj = v[key];
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) return {};
    return Object.fromEntries(
      Object.entries(obj).filter(
        ([id, text]) =>
          ids.includes(id) && typeof text === "string" && text.length <= 2000,
      ),
    );
  };
  const tasks = Array.isArray(v.tasks)
    ? [
        ...new Set(
          v.tasks.filter(
            (id): id is string =>
              typeof id === "string" && taskIds.includes(id),
          ),
        ),
      ]
    : [];
  const sentMessages: Record<string, HubMessage[]> = {};
  if (
    v.sentMessages &&
    typeof v.sentMessages === "object" &&
    !Array.isArray(v.sentMessages)
  ) {
    for (const [id, messages] of Object.entries(v.sentMessages)) {
      if (
        !messageIds.includes(id) ||
        !Array.isArray(messages) ||
        (id === incomingDemo.id && !v.incoming)
      )
        continue;
      const seen = new Set<string>();
      const valid = messages
        .filter((m): m is HubMessage => {
          if (
            !m ||
            typeof m !== "object" ||
            typeof m.id !== "string" ||
            !new RegExp(`^${id}-reply-\\d{1,8}$`).test(m.id) ||
            seen.has(m.id) ||
            typeof m.text !== "string" ||
            !m.text.trim() ||
            m.text.length > 2000 ||
            typeof m.time !== "string" ||
            (m.time !== "" && !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(m.time)) ||
            !["manual", "auto"].includes(m.kind)
          )
            return false;
          seen.add(m.id);
          return true;
        })
        .slice(-50)
        .map((m) => ({ id: m.id, text: m.text, time: m.time, kind: m.kind }));
      if (valid.length) sentMessages[id] = valid;
    }
  }
  const orderIds = new Set<string>();
  const threadOrders: HubOrder[] = [];
  if (Array.isArray(v.threadOrders))
    for (const o of v.threadOrders) {
      if (!o || typeof o !== "object") continue;
      const conversation = [
        ...demoConversations,
        ...(v.incoming ? [incomingDemo] : []),
      ].find((c) => c.id === o.conversationId);
      const product = hubProducts.find((p) => p.id === o.productId);
      if (
        !conversation ||
        !product ||
        o.id !== `order-${conversation.id}` ||
        orderIds.has(o.id) ||
        o.contactId !== conversation.contact ||
        o.status !== "draft" ||
        !Number.isInteger(o.quantity) ||
        o.quantity < 1 ||
        o.quantity > 100
      )
        continue;
      orderIds.add(o.id);
      threadOrders.push({
        id: o.id,
        conversationId: conversation.id,
        contactId: conversation.contact,
        productId: product.id,
        quantity: o.quantity,
        unitPrice: product.price,
        status: "draft",
      });
    }
  return {
    version: 1,
    incoming: v.incoming,
    replies: {
      ...pick("replies", messageIds),
      ...Object.fromEntries(
        Object.entries(sentMessages).map(([id, messages]) => [
          id,
          messages[messages.length - 1].text,
        ]),
      ),
    },
    drafts: pick("drafts", messageIds),
    reviewReplies: pick(
      "reviewReplies",
      demoReviews.map((r) => r.id),
    ),
    reviewDrafts: pick(
      "reviewDrafts",
      demoReviews.map((r) => r.id),
    ),
    owners: Object.fromEntries(
      Object.entries(pick("owners", messageIds)).filter(([, owner]) =>
        ["Айдана", "Алина"].includes(owner),
      ),
    ),
    tasks,
    rules: Array.isArray(v.rules)
      ? [
          ...new Set(
            v.rules.filter(
              (x): x is string =>
                typeof x === "string" &&
                ["followup", "review", "orders", "stock"].includes(x),
            ),
          ),
        ]
      : [],
    ruleRuns:
      Number.isInteger(v.ruleRuns) &&
      Number(v.ruleRuns) >= 0 &&
      Number(v.ruleRuns) <= 10000
        ? Number(v.ruleRuns)
        : 0,
    quoteRequests: Array.isArray(v.quoteRequests)
      ? [
          ...new Set(
            v.quoteRequests.filter(
              (x): x is string =>
                typeof x === "string" &&
                ["almaty", "steppe", "nomad"].includes(x),
            ),
          ),
        ]
      : [],
    completed: Array.isArray(v.completed)
      ? [
          ...new Set(
            v.completed.filter(
              (id): id is string =>
                typeof id === "string" && tasks.includes(id),
            ),
          ),
        ]
      : [],
    autoReplyEnabled: v.autoReplyEnabled === true,
    sentMessages,
    threadOrders,
  };
}
export function sendThreadReply(
  s: HubState,
  id: string,
  kind: "manual" | "auto" = "manual",
): HubState {
  const text = s.drafts[id]?.trim();
  if (
    !text ||
    text.length > 2000 ||
    !allConversations(s).some((c) => c.id === id)
  )
    return s;
  const previous: HubMessage[] = s.sentMessages[id]?.length
    ? s.sentMessages[id]
    : s.replies[id]
      ? [{ id: `${id}-reply-0`, text: s.replies[id], time: "", kind: "manual" }]
      : [];
  const sequence =
    Math.max(0, ...previous.map((m) => Number(m.id.split("-reply-")[1]) || 0)) +
    1;
  const message: HubMessage = {
    id: `${id}-reply-${sequence}`,
    text,
    time: new Intl.DateTimeFormat("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Qyzylorda",
    }).format(new Date()),
    kind,
  };
  return {
    ...s,
    drafts: { ...s.drafts, [id]: "" },
    replies: { ...s.replies, [id]: text },
    sentMessages: {
      ...s.sentMessages,
      [id]: [...previous, message].slice(-50),
    },
  };
}
export function runAutoReply(
  s: HubState,
  id: string,
  language: DemoLanguage,
  available: number,
): HubState {
  if (
    !s.autoReplyEnabled ||
    s.replies[id] ||
    s.drafts[id]?.trim() ||
    !allConversations(s).some((c) => c.id === id)
  )
    return s;
  return sendThreadReply(
    {
      ...s,
      drafts: { ...s.drafts, [id]: replyDraft(id, language, available) },
    },
    id,
    "auto",
  );
}
export function createThreadOrder(
  s: HubState,
  conversationId: string,
  productId = "COF-0250",
  quantity = 1,
): HubState {
  const conversation = allConversations(s).find((c) => c.id === conversationId);
  const product = hubProducts.find((p) => p.id === productId);
  if (
    !conversation ||
    !product ||
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > 100 ||
    s.threadOrders.some((o) => o.conversationId === conversationId)
  )
    return s;
  return {
    ...s,
    threadOrders: [
      ...s.threadOrders,
      {
        id: `order-${conversationId}`,
        conversationId,
        contactId: conversation.contact,
        productId,
        quantity,
        unitPrice: product.price,
        status: "draft",
      },
    ],
  };
}
export function replyDraft(
  id: string,
  language: DemoLanguage,
  available: number,
): string {
  const drafts: Record<string, LocalText> = {
    "tt-106": [
      `Здравствуйте, Әлия! Да, кофе в зёрнах 250 г стоит 3 200 ₸, сейчас в наличии ${available} пачек. Для какого способа заваривания выбираете? Поможем подобрать помол и согласуем самовывоз.`,
      `Сәлеметсіз бе, Әлия! Иә, 250 г кофе дәндері — 3 200 ₸, қазір ${available} қаптама бар. Қалай дайындайсыз? Ұнтақтау түрін таңдап, алып кету уақытын келісеміз.`,
    ],
    "wa-101": [
      `Здравствуйте, Аружан! В наличии ${available} пачек кофе, 250 г по 3 200 ₸. Две пачки — 6 400 ₸. Уточните, пожалуйста, удобное время самовывоза.`,
      `Сәлеметсіз бе, Аружан! Қазір ${available} қаптама кофе бар, 250 г — 3 200 ₸. Екі қаптама — 6 400 ₸. Қай уақытта алып кету ыңғайлы?`,
    ],
    "ig-102": [
      "Здравствуйте, Данияр! Поможем подобрать подарок. Какой бюджет и какой чай предпочитает получатель? Уточним состав и наличие перед подтверждением.",
      "Сәлеметсіз бе, Данияр! Сыйлық таңдауға көмектесеміз. Бюджетіңіз қандай, алушы қандай шай ұнатады? Растамас бұрын құрамы мен қорын нақтылаймыз.",
    ],
    "wa-103": [
      "Айгерім, спасибо, что сообщили. Извините за ожидание. Уточните номер заказа и удобное время — проверим, как организовать выдачу без лишнего ожидания.",
      "Айгерім, хабарлағаныңызға рақмет. Күткеніңіз үшін кешірім сұраймыз. Тапсырыс нөмірі мен ыңғайлы уақытты айтыңызшы — тезірек беру жолын тексереміз.",
    ],
    "web-104": [
      "Здравствуйте, Марат! Поможем уточнить состав. Какой набор вас заинтересовал? Есть ли пожелания по продуктам или ограничения?",
      "Сәлеметсіз бе, Марат! Құрамын нақтылауға көмектесеміз. Қай жиынтық қызықтырды? Өнімдерге қатысты тілектеріңіз немесе шектеулеріңіз бар ма?",
    ],
    "wa-105": [
      "Данияр, здравствуйте! Продолжим здесь. Уточните бюджет и пожелания к чаю — подготовим варианты с подтверждённым наличием.",
      "Сәлеметсіз бе, Данияр! Осы жерде жалғастырайық. Бюджет пен шайға қатысты тілектеріңізді айтыңызшы — қоры расталған нұсқаларды дайындаймыз.",
    ],
  };
  return drafts[id] ? localText(drafts[id], language) : "";
}
export function reviewDraft(id: string, language: DemoLanguage): string {
  if (id === "r4")
    return localText(
      [
        "Спасибо, Әлия! Рады, что кофе понравился. Проверим информацию о парковке и добавим понятную схему проезда в карточку магазина.",
        "Рақмет, Әлия! Кофеміз ұнағанына қуаныштымыз. Тұрақ туралы ақпаратты тексеріп, дүкен карточкасына түсінікті бағыт сызбасын қосамыз.",
      ],
      language,
    );
  return localText(
    id === "r1"
      ? [
          "Спасибо за обратную связь. Приносим извинения за ожидание. Проверим процесс выдачи. Напишите нам номер заказа в личном сообщении, чтобы мы разобрались в ситуации.",
          "Пікіріңізге рақмет. Күткеніңіз үшін кешірім сұраймыз. Тапсырыс беру процесін тексереміз. Жағдайды анықтау үшін тапсырыс нөмірін жеке хабарламада жіберіңізші.",
        ]
      : id === "r2"
        ? [
            "Спасибо за тёплый отзыв! Рады, что вам понравились кофе и обслуживание. Будем рады новой встрече.",
            "Жылы пікіріңізге рақмет! Кофе мен қызметіміз ұнағанына қуаныштымыз. Сізді қайта күтеміз.",
          ]
        : [
            "Спасибо за предложение! Изучим спрос на подарочные наборы. Ваше пожелание передали команде.",
            "Ұсынысыңызға рақмет! Сыйлық жиынтықтарына сұранысты зерттейміз. Тілегіңізді командамызға жеткіздік.",
          ],
    language,
  );
}
