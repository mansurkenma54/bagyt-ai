import type { ImportRow } from "./events";
export type ConnectorMode =
  "Live API" | "File Import" | "Manual" | "Demo" | "Disconnected";
export interface SourceAdapter {
  provider: string;
  mode: ConnectorMode;
  capabilities: string[];
  pull?(cursor?: string): Promise<{ events: ImportRow[]; cursor?: string }>;
}
export const sourceCatalog = [
  {
    name: "POS",
    title: "UMAG / POS",
    description: "Продажи, возвраты и себестоимость",
    letter: "U",
    color: "#46cd92",
    kind: "sale",
  },
  {
    name: "WhatsApp",
    title: "WhatsApp Business",
    description: "Обращения и время первого ответа",
    letter: "W",
    color: "#4cd77f",
    kind: "lead",
  },
  {
    name: "Сайт",
    title: "Ваш интернет-магазин",
    description: "Заказы через подписанный Webhook",
    letter: "↗",
    color: "#83a8ff",
    kind: "sale",
  },
  {
    name: "TikTok",
    title: "TikTok",
    description: "Кампании и связанные заказы",
    letter: "T",
    color: "#ee7ba1",
    kind: "campaign",
  },
  {
    name: "Instagram",
    title: "Instagram",
    description: "Разрешенная выгрузка кампаний",
    letter: "◎",
    color: "#d694df",
    kind: "campaign",
  },
  {
    name: "2GIS",
    title: "2GIS / отзывы",
    description: "Оценки и темы обратной связи",
    letter: "2",
    color: "#a4d576",
    kind: "review",
  },
  {
    name: "Расходы",
    title: "Документы и расходы",
    description: "Квитанции, фото и ручные записи",
    letter: "₸",
    color: "#e5c680",
    kind: "expense",
  },
];
