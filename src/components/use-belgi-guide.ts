"use client";
import { useEffect, useState } from "react";
export const belgiGuideSteps = [
  {
    section: "overview",
    title: ["Обзор бизнеса", "Бизнеске шолу"],
    text: [
      "Здесь собраны цели, выручка и важные обращения. Нажмите «Ждут ответа», чтобы открыть диалоги.",
      "Мақсаттар, түсім және маңызды өтініштер осында. Диалогтарды ашу үшін «Жауап күтуде» карточкасын басыңыз.",
    ],
  },
  {
    section: "inbox",
    title: ["Ни один диалог не потеряется", "Әр диалог назарда"],
    text: [
      "Выберите клиента, подготовьте и отредактируйте ответ. Справа назначьте ответственного и следующий контакт.",
      "Клиентті таңдап, жауап дайындаңыз. Клиент карточкасынан жауапты қызметкер мен келесі байланысты белгілеңіз.",
    ],
  },
  {
    section: "customers",
    title: ["Вся история клиента", "Клиенттің толық тарихы"],
    text: [
      "Выберите карточку: покупки, сообщения из разных каналов и напоминания собраны по одному ID клиента.",
      "Карточканы таңдаңыз: сатып алу, әр арнадағы хабарлама және еске салу бір клиент ID-і бойынша жиналған.",
    ],
  },
  {
    section: "reviews",
    title: ["Понять обратную связь", "Кері байланысты түсіну"],
    text: [
      "Подготовьте ответ на отзыв и проверьте текст. Замечание по сервису можно сразу превратить в задачу.",
      "Пікірге жауап дайындап, мәтінін тексеріңіз. Қызметке қатысты ескертуді бірден тапсырмаға айналдыруға болады.",
    ],
  },
  {
    section: "sales",
    title: ["Проверить операцию", "Операцияны тексеру"],
    text: [
      "Найдите покупку по имени, номеру или каналу. Откройте строку, чтобы увидеть детали заказа.",
      "Сатып алуды есім, нөмір не арна бойынша табыңыз. Тапсырыс мәліметін көру үшін жолын ашыңыз.",
    ],
  },
  {
    section: "stock",
    title: ["Запас на несколько дней", "Қор қанша күнге жетеді"],
    text: [
      "Сопоставьте доступный остаток с продажами в день и сроком поставки. Затем откройте закупку.",
      "Қолжетімді қорды күндік сатылым және жеткізу мерзімімен салыстырыңыз. Содан кейін сатып алуды ашыңыз.",
    ],
  },
  {
    section: "purchases",
    title: ["Закупка под вашим контролем", "Сатып алу сіздің бақылауыңызда"],
    text: [
      "Откройте закупку: подготовьте проект, проверьте условия, утвердите и запишите фактически полученное количество.",
      "Сатып алуды ашыңыз: жоба дайындап, шарттарды тексеріңіз, бекітіңіз және нақты келген санын енгізіңіз.",
    ],
  },
  {
    section: "suppliers",
    title: ["Сравнить условия", "Шарттарды салыстыру"],
    text: [
      "Сравните срок, минимальный заказ и полную стоимость. Подготовьте запрос условий; он останется проектом в демо.",
      "Мерзім, ең аз тапсырыс пен толық құнын салыстырыңыз. Шарттарды сұрау жобасын дайындаңыз; демода ол жоба күйінде қалады.",
    ],
  },
  {
    section: "analytics",
    title: ["Цифры с объяснением", "Түсіндірмесі бар сандар"],
    text: [
      "Смените период и сравните выручку с учтёнными расходами. Кнопка «Отчёт» выгрузит CSV. Это ещё не чистая прибыль.",
      "Кезеңді өзгертіп, түсім мен тіркелген шығынды салыстырыңыз. «Есеп» CSV жүктейді. Бұл әлі таза пайда емес.",
    ],
  },
  {
    section: "growth",
    title: ["От наблюдения к результату", "Бақылаудан нәтижеге"],
    text: [
      "Задайте месячные цели. Прогресс и ежедневный темп пересчитаются. Ниже — три шага по данным вашего магазина.",
      "Айлық мақсаттарды белгілеңіз. Прогресс пен күндік қарқын қайта есептеледі. Төменде дүкен деректеріне сай үш қадам бар.",
    ],
  },
  {
    section: "automation",
    title: ["Проверить правило", "Ережені тексеру"],
    text: [
      "Включите нужные правила и проверьте результат: ответы, проекты заказов и запросы поставщику. Всё сохраняется здесь, без внешней отправки.",
      "Керек ережелерді қосып, нәтижесін көріңіз: жауаптар, тапсырыс жобалары және жеткізушіге сұраулар. Барлығы осында сақталады, сыртқа жіберілмейді.",
    ],
  },
  {
    section: "integrations",
    title: ["Попробовать поток данных", "Дерек ағынын байқап көру"],
    text: [
      "Нажмите «Добавить сообщение». WhatsApp-диалог Данияра появится в его существующей карточке. Повтор не создаёт дубль.",
      "«Хабарлама қосу» батырмасын басыңыз. Даниярдың WhatsApp диалогы өз карточкасына қосылады. Қайталау көшірме жасамайды.",
    ],
  },
  {
    section: "settings",
    title: ["Ваше рабочее пространство", "Сіздің жұмыс кеңістігіңіз"],
    text: [
      "Здесь можно изменить язык и восстановить исходный пример. Восстановление очищает только локальный прогресс.",
      "Мұнда тілді өзгертіп, бастапқы үлгіні қалпына келтіруге болады. Қалпына келтіру тек жергілікті нәтижені тазартады.",
    ],
  },
];
export function useBelgiGuide(section: string, active: boolean) {
  const [rect, setRect] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);
  useEffect(() => {
    if (!active) return;
    const root = document.querySelector(`[data-guide="${section}"]`);
    const targets: Record<string, string> = {
      overview: ".b-metrics, .b-focus, .studio-kpis",
      inbox: ".hub-compose, .hub-sent-message, .hub-thread",
      customers: ".hub-client-detail .hub-mini-stats",
      reviews: ".hub-review",
      growth: ".goals-revenue-card, .goals-action-plan",
      integrations: ".hub-sync",
      stock: ".studio-inventory",
      purchases: ".studio-purchase-order",
      suppliers: ".studio-supplier",
      automation: ".studio-rule",
    };
    const resolveTarget = () => {
      const candidates = targets[section]
        ? targets[section]
            .split(",")
            .flatMap((selector) =>
              Array.from(document.querySelectorAll(selector.trim())),
            )
        : [root];
      return (
        candidates.find((element) => {
          const bounds = element?.getBoundingClientRect();
          return bounds && bounds.width > 0 && bounds.height > 0;
        }) || document.querySelector(".demo-page-heading")
      );
    };
    const element = resolveTarget();
    element?.scrollIntoView({ behavior: "instant", block: "center" });
    const update = () => {
      const target = resolveTarget();
      if (!target) return;
      const r = target.getBoundingClientRect();
      const top = Math.max(8, r.top - 6),
        left = Math.max(8, r.left - 6);
      setRect({
        left,
        top,
        width: Math.max(0, Math.min(r.right + 6, window.innerWidth - 8) - left),
        height: Math.max(
          0,
          Math.min(r.bottom + 6, window.innerHeight - 8) - top,
        ),
      });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    const observer = new ResizeObserver(update);
    if (element) observer.observe(element);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
      observer.disconnect();
    };
  }, [section, active]);
  return active ? rect : null;
}
