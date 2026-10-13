"use client";
import { useState } from "react";
import {
  Upload,
  ArrowRight,
  Check,
  FileSpreadsheet,
  AlertCircle,
} from "lucide-react";
import { api, Badge } from "./ui";
import { sourceCatalog } from "@/lib/adapters";
type T = (ru: string, kk: string) => string;
const fields = [
  "external_id",
  "date",
  "amount",
  "cost",
  "status",
  "name",
  "order_id",
  "payment_id",
  "lead_id",
  "campaign_id",
  "channel",
  "responded_at",
  "text",
  "rating",
  "views",
];
const aliases: Record<string, string[]> = {
  external_id: [
    "id",
    "order_id",
    "номер",
    "номер заказа",
    "номер чека",
    "нөмір",
    "чек нөмірі",
  ],
  date: ["дата", "дата продажи", "datetime", "күн", "күні"],
  amount: ["сумма", "итого", "выручка", "total", "сома", "барлығы"],
  cost: ["себестоимость", "затраты", "өзіндік құн"],
  status: ["статус"],
  name: ["название", "товар", "категория"],
  text: ["текст", "отзыв"],
  responded_at: ["ответ", "время ответа"],
};
const labels: Record<string, string> = {
  external_id: "ID записи",
  date: "Дата",
  amount: "Сумма, ₸",
  cost: "Себестоимость, ₸",
  status: "Статус",
  name: "Название",
  order_id: "ID заказа",
  payment_id: "ID платежа",
  lead_id: "ID обращения",
  campaign_id: "ID кампании",
  channel: "Канал",
  responded_at: "Время ответа",
  text: "Текст",
  rating: "Рейтинг",
  views: "Просмотры",
};
const kkLabels: Record<string, string> = {
  external_id: "Жазба ID",
  date: "Күн",
  amount: "Сома, ₸",
  cost: "Өзіндік құн, ₸",
  status: "Күйі",
  name: "Атауы",
  order_id: "Тапсырыс ID",
  payment_id: "Төлем ID",
  lead_id: "Өтініш ID",
  campaign_id: "Науқан ID",
  channel: "Арна",
  responded_at: "Жауап уақыты",
  text: "Мәтін",
  rating: "Баға",
  views: "Қаралым",
};
const defaults: Record<string, string> = {
  sale: "paid",
  refund: "paid",
  expense: "paid",
  lead: "open",
  campaign: "active",
  review: "published",
};
export default function Importer({
  source,
  kind,
  t,
  onDone,
}: {
  source: string;
  kind: string;
  t: T;
  onDone: () => void;
}) {
  const [file, setFile] = useState<any>(null),
    [mapping, setMapping] = useState<Record<string, string>>({}),
    [rows, setRows] = useState<any[] | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [errors, setErrors] = useState<any[]>([]),
    [consent, setConsent] = useState(false),
    [selectedKind, setKind] = useState(kind),
    [selectedSource, setSource] = useState(source),
    [showExtra, setShowExtra] = useState(false),
    [result, setResult] = useState<any>(null);
  async function upload(f: File) {
    setBusy(true);
    setError("");
    try {
      const form = new FormData();
      form.set("file", f);
      const d = await api("upload", form);
      setFile(d);
      setMapping(
        Object.fromEntries(
          fields.map((key) => [
            key,
            d.headers.find(
              (h: string) =>
                h.toLowerCase().trim() === key ||
                (aliases[key] || []).includes(h.toLowerCase().trim()),
            ) || "",
          ]),
        ),
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  function preview() {
    setRows(
      file.rows.map((r: any, i: number) => {
        const out: any = {
          kind: selectedKind,
          status: defaults[selectedKind],
          amount: "0",
        };
        fields.forEach((k) => {
          if (mapping[k] && r[mapping[k]] !== "") out[k] = r[mapping[k]];
        });
        return out;
      }),
    );
  }
  async function save() {
    setBusy(true);
    setError("");
    setErrors([]);
    try {
      setResult(
        await api("imports", {
          source: selectedSource,
          filename: file.filename,
          rows,
        }),
      );
    } catch (e) {
      setError((e as Error).message);
      setErrors((e as any).rows || []);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="importer">
      <div className="step-line">
        <Badge>1 · {t("Файл", "Файл")}</Badge>
        <ArrowRight size={14} />
        <Badge color={file ? "green" : "muted"}>
          2 · {t("Колонки", "Бағандар")}
        </Badge>
        <ArrowRight size={14} />
        <Badge color={rows ? "green" : "muted"}>
          3 · {t("Проверка", "Тексеру")}
        </Badge>
      </div>
      {!rows && !result && (
        <label>
          {t("Откуда ваш отчёт?", "Есебіңіз қайдан?")}
          <select
            value={selectedSource}
            onChange={(e) => {
              setSource(e.target.value);
              setKind(
                sourceCatalog.find((x) => x.name === e.target.value)?.kind ||
                  "sale",
              );
            }}
          >
            {sourceCatalog.map((x) => (
              <option value={x.name} key={x.name}>
                {x.title}
              </option>
            ))}
          </select>
        </label>
      )}
      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}
      {result ? (
        <div className="success-box">
          <Check size={36} />
          <h3>{t("Файл импортирован", "Файл импортталды")}</h3>
          <p>
            {t(
              "Новых или обновленных записей",
              "Жаңа немесе жаңартылған жазбалар",
            )}
            : {result.imported}.{" "}
            {t("Повторов пропущено", "Қайталанғаны өткізілді")}:{" "}
            {result.skipped}.
          </p>
          <p>
            {t(
              "Подтвердите записи в очереди проверки, чтобы включить их в расчеты.",
              "Есептеуге қосу үшін жазбаларды тексеру кезегінде растаңыз.",
            )}
          </p>
          <button className="primary" onClick={onDone}>
            {t("Перейти к проверке", "Тексеруге өту")}
            <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        <>
          {!file ? (
            <label className="dropzone">
              <Upload size={32} />
              <b>
                {busy
                  ? t("Читаю файл…", "Файл оқылуда…")
                  : t(
                      "Выберите отчет CSV или XLSX",
                      "CSV немесе XLSX есебін таңдаңыз",
                    )}
              </b>
              <span>
                {t(
                  "До 5 МБ · 1000 строк · суммы в тенге",
                  "5 МБ дейін · 1000 жол · сомалар теңгемен",
                )}
              </span>
              <input
                type="file"
                accept=".csv,.xlsx"
                disabled={busy}
                onChange={(e) => {
                  if (e.target.files?.[0]) upload(e.target.files[0]);
                }}
              />
            </label>
          ) : (
            <>
              <div className="file-summary">
                <FileSpreadsheet size={24} />
                <div>
                  <b>{file.filename}</b>
                  <small>
                    {file.rows.length} {t("строк", "жол")} · {selectedSource}
                  </small>
                </div>
                <button
                  className="text-button"
                  onClick={() => {
                    setFile(null);
                    setRows(null);
                  }}
                >
                  {t("Другой файл", "Басқа файл")}
                </button>
              </div>
              {!rows ? (
                <>
                  <label>
                    {t("Тип записей", "Жазба түрі")}
                    <select
                      value={selectedKind}
                      onChange={(e) => setKind(e.target.value)}
                    >
                      {Object.keys(defaults).map((k) => (
                        <option key={k} value={k}>
                          {t(
                            (
                              {
                                sale: "Продажи",
                                refund: "Возвраты",
                                expense: "Расходы",
                                lead: "Обращения",
                                campaign: "Кампании",
                                review: "Отзывы",
                              } as Record<string, string>
                            )[k],
                            (
                              {
                                sale: "Сату",
                                refund: "Қайтару",
                                expense: "Шығындар",
                                lead: "Өтініштер",
                                campaign: "Науқандар",
                                review: "Пікірлер",
                              } as Record<string, string>
                            )[k],
                          )}
                        </option>
                      ))}
                    </select>
                  </label>
                  <p className="muted">
                    {t(
                      "Сопоставьте колонки. ID и дата обязательны; суммы — в тенге. Пустая себестоимость означает «неизвестно».",
                      "Бағандарды сәйкестендіріңіз. ID және күн міндетті; сомалар теңгемен. Бос өзіндік құн «белгісіз» дегенді білдіреді.",
                    )}
                  </p>
                  <div className="mapping-grid">
                    {fields
                      .filter(
                        (key) =>
                          showExtra ||
                          mapping[key] ||
                          [
                            "external_id",
                            "date",
                            "amount",
                            "cost",
                            "status",
                            "name",
                          ].includes(key),
                      )
                      .map((key) => (
                        <label key={key}>
                          {t(labels[key], kkLabels[key])}
                          <select
                            value={mapping[key] || ""}
                            onChange={(e) =>
                              setMapping({ ...mapping, [key]: e.target.value })
                            }
                          >
                            <option value="">—</option>
                            {file.headers.map((h: string) => (
                              <option key={h}>{h}</option>
                            ))}
                          </select>
                        </label>
                      ))}
                  </div>
                  <button
                    className="text-button"
                    aria-expanded={showExtra}
                    onClick={() => setShowExtra(!showExtra)}
                  >
                    {showExtra
                      ? t(
                          "Скрыть дополнительные поля",
                          "Қосымша өрістерді жасыру",
                        )
                      : t(
                          "Дополнительные поля: отзывы, обращения, реклама",
                          "Қосымша өрістер: пікірлер, өтініштер, жарнама",
                        )}
                  </button>
                  <button
                    className="primary"
                    disabled={!mapping.external_id || !mapping.date}
                    onClick={preview}
                  >
                    {t("Проверить строки", "Жолдарды тексеру")}
                    <ArrowRight size={16} />
                  </button>
                </>
              ) : (
                <>
                  <p className="muted">
                    {t(
                      "Все ячейки редактируются. Данные попадут в базу только после импорта.",
                      "Барлық ұяшықтарды өңдеуге болады. Деректер импорттан кейін базаға түседі.",
                    )}
                  </p>
                  <div className="table-wrap import-table">
                    <table>
                      <thead>
                        <tr>
                          <th>#</th>
                          {fields
                            .filter(
                              (k) =>
                                mapping[k] ||
                                [
                                  "external_id",
                                  "date",
                                  "amount",
                                  "status",
                                ].includes(k),
                            )
                            .map((k) => (
                              <th key={k}>{t(labels[k], kkLabels[k])}</th>
                            ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((r, i) => (
                          <tr
                            key={i}
                            className={
                              errors.some((e) => e.row === i + 1)
                                ? "invalid"
                                : ""
                            }
                          >
                            <td>{i + 1}</td>
                            {fields
                              .filter(
                                (k) =>
                                  mapping[k] ||
                                  [
                                    "external_id",
                                    "date",
                                    "amount",
                                    "status",
                                  ].includes(k),
                              )
                              .map((k) => (
                                <td key={k}>
                                  <input
                                    aria-label={`${t(labels[k], kkLabels[k])} ${i + 1}`}
                                    value={r[k] ?? ""}
                                    onChange={(e) =>
                                      setRows(
                                        rows.map((x, j) =>
                                          j === i
                                            ? { ...x, [k]: e.target.value }
                                            : x,
                                        ),
                                      )
                                    }
                                  />
                                </td>
                              ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {errors.map((e) => (
                    <p key={e.row} className="error-line">
                      <AlertCircle size={14} /> {e.row}: {e.message}
                    </p>
                  ))}
                  <label className="checkbox">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                    />
                    {t(
                      "У меня есть право импортировать эти данные; суммы и типы проверены.",
                      "Бұл деректерді импорттауға құқығым бар; сомалар мен түрлер тексерілді.",
                    )}
                  </label>
                  <div className="form-actions">
                    <button className="secondary" onClick={() => setRows(null)}>
                      {t("Назад", "Артқа")}
                    </button>
                    <button
                      className="primary"
                      disabled={!consent || busy}
                      onClick={save}
                    >
                      {busy
                        ? t("Импорт…", "Импорт…")
                        : t("Импортировать", "Импорттау")}
                    </button>
                  </div>
                </>
              )}
            </>
          )}
          {!file && (
            <a
              className="template-download"
              href="/report-template.csv"
              download
            >
              {t(
                "Нет отчёта? Скачать пустой шаблон",
                "Есеп жоқ па? Бос үлгіні жүктеу",
              )}
            </a>
          )}
          <div className="hint">
            {t(
              "AQYL узнаёт названия колонок автоматически. Проверьте соответствия и суммы перед сохранением.",
              "AQYL баған атауларын автоматты таниды. Сақтау алдында сәйкестіктер мен сомаларды тексеріңіз.",
            )}
          </div>
        </>
      )}
    </div>
  );
}
