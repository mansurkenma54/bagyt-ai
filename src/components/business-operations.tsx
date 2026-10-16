"use client";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Box,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  GitBranch,
  Info,
  MessageSquare,
  PackageCheck,
  Play,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
  X,
} from "lucide-react";
import {
  inventoryCatalog,
  quoteTotal,
  runOperationsAutomation,
  type OperationRunEvent,
  supplierQuotes,
} from "@/lib/demo-operations";
import {
  localText,
  type DemoLanguage,
  type HubState,
} from "@/lib/business-hub-demo";
import { type DemoPurchase } from "@/lib/belgi-demo";
import ProductVisual from "./product-visual";
type Props = {
  section: string;
  language: DemoLanguage;
  hub: HubState;
  setHub: Dispatch<SetStateAction<HubState>>;
  purchase: DemoPurchase;
  onPurchase: () => void;
  navigate: (id: string) => void;
};
const money = (n: number) => n.toLocaleString("ru-RU") + " ₸";
export default function BusinessOperations({
  section,
  language,
  hub,
  setHub,
  purchase,
  onPurchase,
  navigate,
}: Props) {
  const t = (r: string, k: string) => (language === "ru" ? r : k);
  const tx = (text: [string, string]) => localText(text, language);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [selected, setSelected] = useState<string | null>(null);
  const [runResult, setRunResult] = useState<number | null>(null);
  const [operationEvents, setOperationEvents] = useState<OperationRunEvent[]>(
    [],
  );
  useEffect(() => {
    if (selected)
      document
        .getElementById("ops-product-detail")
        ?.scrollIntoView({
          block: "nearest",
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches
            ? "instant"
            : "smooth",
        });
  }, [selected]);
  const catalog = inventoryCatalog.map((p) => ({
    ...p,
    onHand: p.onHand + (p.sku === "COF-0250" ? purchase.received : 0),
  }));
  const visible = catalog.filter(
    (p) =>
      (category === "all" ||
        (category === "risk"
          ? (p.onHand - p.reserved) / p.daily < p.lead
          : p.category === category)) &&
      `${tx(p.name)} ${p.sku}`.toLowerCase().includes(search.toLowerCase()),
  );
  const product = catalog.find((p) => p.sku === selected);
  const available = 10 + purchase.received;
  if (section === "stock")
    return (
      <div className="studio-operations" data-guide="stock">
        <div className="studio-metrics-row">
          <div>
            <span>{t("Товарных позиций", "Тауар түрі")}</span>
            <strong>
              {catalog.length}
              <small>SKU</small>
            </strong>
          </div>
          <div>
            <span>{t("Доступно к продаже", "Сатуға қолжетімді")}</span>
            <strong>
              {catalog.reduce((a, p) => a + p.onHand - p.reserved, 0)}
              <small>{t("шт.", "дана")}</small>
            </strong>
          </div>
          <div>
            <span>{t("Требуют пополнения", "Толықтыру қажет")}</span>
            <strong className="warning-text">
              {
                catalog.filter(
                  (p) => (p.onHand - p.reserved) / p.daily < p.lead,
                ).length
              }
              <small>{t("позиция", "тауар")}</small>
            </strong>
          </div>
          <div>
            <span>{t("Резерв", "Резерв")}</span>
            <strong>
              {catalog.reduce((a, p) => a + p.reserved, 0)}
              <small>{t("шт.", "дана")}</small>
            </strong>
          </div>
        </div>
        {available / 4 < 5 && (
          <div className="studio-inline-insight">
            <span>
              <Sparkles size={19} />
            </span>
            <div>
              <b>
                {t(
                  "Qor: есть риск дефицита кофе",
                  "Qor: кофе тапшылығы қаупі бар",
                )}
              </b>
              <p>
                {t(
                  `Запаса на ${(available / 4).toLocaleString("ru-RU", { maximumFractionDigits: 1 })} дня, поставка — 5 дней. Сравните условия поставщиков перед заказом.`,
                  `Қор ${(available / 4).toLocaleString("ru-RU", { maximumFractionDigits: 1 })} күнге жетеді, жеткізу — 5 күн. Тапсырыс алдында жеткізуші шарттарын салыстырыңыз.`,
                )}
              </p>
            </div>
            <button onClick={() => navigate("suppliers")}>
              {t("Сравнить поставщиков", "Жеткізушілерді салыстыру")}
              <ArrowRight size={16} />
            </button>
          </div>
        )}
        <section className="studio-card studio-inventory">
          <header className="studio-table-toolbar">
            <div className="studio-tab-list">
              {[
                ["all", t("Все товары", "Барлық тауар")],
                ["risk", t("Нужна закупка", "Сатып алу қажет")],
                ["tea", t("Чай", "Шай")],
              ].map(([id, label]) => (
                <button
                  key={id}
                  aria-pressed={category === id}
                  onClick={() => setCategory(id)}
                >
                  {label}
                </button>
              ))}
            </div>
            <label className="studio-search-field">
              <Search size={17} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label={t("Поиск товара", "Тауарды іздеу")}
                placeholder={t("Название или SKU…", "Атауы немесе SKU…")}
              />
            </label>
          </header>
          <div className="studio-table-wrap">
            <table className="studio-data-table">
              <thead>
                <tr>
                  <th>{t("Товар / SKU", "Тауар / SKU")}</th>
                  <th>{t("Доступно", "Қолжетімді")}</th>
                  <th>{t("Запас на", "Қор жетеді")}</th>
                  <th>{t("Цена продажи", "Сату бағасы")}</th>
                  <th>{t("Состояние", "Күйі")}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {visible.map((p) => {
                  const days = (p.onHand - p.reserved) / p.daily,
                    risk = days < p.lead;
                  return (
                    <tr key={p.sku}>
                      <td>
                        <button
                          className="studio-product-link"
                          onClick={() => setSelected(p.sku)}
                        >
                          <ProductVisual sku={p.sku} size={56} />
                          <span>
                            <b>{tx(p.name)}</b>
                            <small>
                              {p.sku} · {p.supplier}
                            </small>
                          </span>
                        </button>
                      </td>
                      <td>
                        <strong>{p.onHand - p.reserved}</strong>
                        <small>
                          {t(`резерв ${p.reserved}`, `резерв ${p.reserved}`)}
                        </small>
                      </td>
                      <td>
                        {days.toLocaleString("ru-RU", {
                          maximumFractionDigits: 1,
                        })}{" "}
                        {t("дн.", "күн")}
                        <div
                          className={`studio-stock-track ${risk ? "low" : ""}`}
                        >
                          <i
                            style={{
                              width: `${Math.min(100, (days / 20) * 100)}%`,
                            }}
                          />
                        </div>
                      </td>
                      <td>{money(p.unit)}</td>
                      <td>
                        <span
                          className={`studio-pill ${risk ? "amber" : "green"}`}
                        >
                          {risk ? <Clock3 size={12} /> : <Check size={12} />}{" "}
                          {risk
                            ? t("Пополнить", "Толықтыру")
                            : t("В наличии", "Бар")}
                        </span>
                      </td>
                      <td>
                        <button
                          className="studio-icon-button"
                          onClick={() => setSelected(p.sku)}
                          aria-label={t("Открыть ", "Ашу: ") + tx(p.name)}
                        >
                          <ArrowUpRight size={17} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!visible.length && (
              <p className="studio-empty">
                {t(
                  "Товары не найдены. Измените фильтр или запрос.",
                  "Тауар табылмады. Сүзгіні не сұрауды өзгертіңіз.",
                )}
              </p>
            )}
          </div>
          <footer className="studio-card-footer">
            <span>
              {visible.length} / {catalog.length} {t("товаров", "тауар")}
            </span>
            <span>
              <ShieldCheck size={14} />
              {t(
                "Остаток меняется после приёмки",
                "Қор қабылдаудан кейін өзгереді",
              )}
            </span>
          </footer>
        </section>
        {product && (
          <section
            className="studio-card studio-product-detail"
            id="ops-product-detail"
            aria-label={t("Детали товара", "Тауар мәліметтері")}
          >
            <header className="studio-card-header">
              <ProductVisual sku={product.sku} size={88} />
              <div>
                <span className="studio-eyebrow">{product.sku}</span>
                <h2>{tx(product.name)}</h2>
              </div>
              <button
                className="studio-icon-button"
                onClick={() => setSelected(null)}
                aria-label={t("Закрыть детали", "Мәліметті жабу")}
              >
                <X size={18} />
              </button>
            </header>
            <div className="studio-product-detail-grid">
              <div>
                <span>{t("На складе", "Қоймада")}</span>
                <b>{product.onHand}</b>
              </div>
              <div>
                <span>{t("В резерве", "Резервте")}</span>
                <b>{product.reserved}</b>
              </div>
              <div>
                <span>{t("Продаж / день", "Күндік сату")}</span>
                <b>{product.daily}</b>
              </div>
              <div>
                <span>{t("Срок поставки", "Жеткізу мерзімі")}</span>
                <b>
                  {product.lead} {t("дней", "күн")}
                </b>
              </div>
            </div>
            {product.sku === "COF-0250" ? (
              <button className="dark-button" onClick={onPurchase}>
                {t("Открыть закупку кофе", "Кофе сатып алуды ашу")}
                <ArrowRight size={16} />
              </button>
            ) : (
              <p>
                {t(
                  "Запас покрывает срок поставки. Пополнение пока не требуется.",
                  "Қор жеткізу мерзіміне жетеді. Әзірге толықтыру қажет емес.",
                )}
              </p>
            )}
          </section>
        )}
      </div>
    );
  if (section === "purchases")
    return (
      <div className="studio-operations" data-guide="purchases">
        <div className="studio-procurement-grid">
          <section className="studio-card studio-purchase-order">
            <header className="studio-card-header">
              <div>
                <span className="studio-eyebrow">
                  PO-2026-014 · Almaty Coffee
                </span>
                <h2>{t("Пополнение запаса кофе", "Кофе қорын толықтыру")}</h2>
              </div>
              <span className="studio-pill green">
                {purchase.stage === "received"
                  ? t("Приёмка записана", "Қабылдау тіркелді")
                  : purchase.stage === "approved"
                    ? t("Утверждено", "Бекітілді")
                    : purchase.stage === "draft"
                      ? t("На проверке", "Тексеруде")
                      : t("Рекомендация", "Ұсыныс")}
              </span>
            </header>
            <div className="studio-order-parties">
              <div>
                <Truck size={21} />
                <span>
                  <small>{t("Поставщик", "Жеткізуші")}</small>
                  <b>Almaty Coffee</b>
                  <em>{t("Алматы · 5 дней", "Алматы · 5 күн")}</em>
                </span>
              </div>
              <div>
                <Box size={21} />
                <span>
                  <small>{t("Получатель", "Алушы")}</small>
                  <b>Qazyna Store</b>
                  <em>
                    {t("Основной склад · Алматы", "Негізгі қойма · Алматы")}
                  </em>
                </span>
              </div>
            </div>
            <div className="studio-order-item">
              <ProductVisual sku="COF-0250" size={88} />
              <div>
                <h3>{t("Кофе в зёрнах, 250 г", "Кофе дәндері, 250 г")}</h3>
                <span>COF-0250 · 30 × 2 000 ₸</span>
              </div>
              <strong>60 000 ₸</strong>
            </div>
            <dl className="studio-order-costs">
              <div>
                <dt>{t("Стоимость товаров", "Тауарлар құны")}</dt>
                <dd>60 000 ₸</dd>
              </div>
              <div>
                <dt>{t("Доставка и сборы", "Жеткізу мен алымдар")}</dt>
                <dd className="warning-text">
                  {t("Нужно уточнить", "Нақтылау қажет")}
                </dd>
              </div>
              <div>
                <dt>{t("Оплата", "Төлем")}</dt>
                <dd>{t("Не проводилась", "Жүргізілген жоқ")}</dd>
              </div>
            </dl>
            <div className="studio-order-total">
              <span>
                {t(
                  "Подытог · без доставки и сборов",
                  "Аралық сома · жеткізу мен алымсыз",
                )}
              </span>
              <strong>60 000 ₸</strong>
            </div>
            <footer className="studio-order-actions">
              <span>
                <ShieldCheck size={15} />
                {t(
                  "Внешние действия не выполняются",
                  "Сыртқы әрекеттер орындалмайды",
                )}
              </span>
              <button className="dark-button" onClick={onPurchase}>
                {purchase.stage === "received"
                  ? t("Детали приёмки", "Қабылдау мәліметі")
                  : t("Продолжить закупку", "Сатып алуды жалғастыру")}
                <ArrowRight size={16} />
              </button>
            </footer>
          </section>
          <aside className="studio-card studio-order-status">
            <span className="studio-eyebrow">
              {t("ПУТЬ ЗАКУПКИ", "САТЫП АЛУ ЖОЛЫ")}
            </span>
            <h2>{t("Каждый шаг виден", "Әр қадам көрініп тұр")}</h2>
            <div className="studio-order-timeline">
              {[
                [
                  t("Сигнал о запасе", "Қор туралы сигнал"),
                  t(
                    "10 шт. ÷ 4 продажи = 2,5 дня",
                    "10 дана ÷ 4 сату = 2,5 күн",
                  ),
                ],
                [
                  t("Проект и проверка", "Жоба және тексеру"),
                  t("Количество, цена, условия", "Саны, бағасы, шарттары"),
                ],
                [
                  t("Подтверждение владельца", "Иесінің бекітуі"),
                  t("Только после проверки", "Тек тексеруден кейін"),
                ],
                [
                  t("Фактическая приёмка", "Нақты қабылдау"),
                  purchase.received
                    ? t(
                        `${purchase.received} из 30 шт. принято`,
                        `${30} данадан ${purchase.received} қабылданды`,
                      )
                    : t(
                        "Запишите реально полученное",
                        "Нақты келген санын енгізіңіз",
                      ),
                ],
              ].map(([title, detail], i) => (
                <div
                  className={
                    i <=
                    ["suggested", "draft", "approved", "received"].indexOf(
                      purchase.stage,
                    )
                      ? "done"
                      : ""
                  }
                  key={title}
                >
                  <i>
                    {i <=
                    ["suggested", "draft", "approved", "received"].indexOf(
                      purchase.stage,
                    ) ? (
                      <Check size={13} />
                    ) : (
                      i + 1
                    )}
                  </i>
                  <span>
                    <b>{title}</b>
                    <small>{detail}</small>
                  </span>
                </div>
              ))}
            </div>
            <div className="studio-stock-callout">
              <PackageCheck size={25} />
              <div>
                <strong>
                  {available} {t("шт.", "дана")}
                </strong>
                <span>
                  {t("сейчас доступно на складе", "қазір қоймада қолжетімді")}
                </span>
              </div>
            </div>
            <button
              className="studio-text-link"
              onClick={() => navigate("suppliers")}
            >
              {t("Сравнить предложения", "Ұсыныстарды салыстыру")}
              <ArrowRight size={16} />
            </button>
          </aside>
        </div>
      </div>
    );
  if (section === "suppliers")
    return (
      <div className="studio-operations" data-guide="suppliers">
        <div className="studio-inline-insight">
          <span>
            <Info size={19} />
          </span>
          <div>
            <b>
              {t(
                "Сравнение для закупки 30 пачек кофе",
                "30 қаптама кофе сатып алуға салыстыру",
              )}
            </b>
            <p>
              {t(
                "Цена — не единственный критерий. Учитывайте срок, минимальный заказ и неизвестные сборы.",
                "Баға жалғыз өлшем емес. Мерзім, ең аз тапсырыс пен белгісіз алымдарды ескеріңіз.",
              )}
            </p>
          </div>
        </div>
        <div className="studio-supplier-grid">
          {supplierQuotes.map((s) => {
            const quote = quoteTotal(s.id)!;
            return (
              <article
                className={`studio-card studio-supplier ${s.current ? "current" : ""}`}
                key={s.id}
              >
                <div className="studio-supplier-top">
                  <span>
                    {s.name
                      .split(" ")
                      .map((x) => x[0])
                      .join("")}
                  </span>
                  <span
                    className={`studio-pill ${s.current ? "green" : "neutral"}`}
                  >
                    {s.current
                      ? t("Текущий поставщик", "Қазіргі жеткізуші")
                      : t("Альтернатива", "Баламалы нұсқа")}
                  </span>
                </div>
                <h2>{s.name}</h2>
                <p>
                  {s.city} · {t("Учебное предложение", "Оқу ұсынысы")}
                </p>
                <div className="studio-supplier-price">
                  <strong>{money(s.cost)}</strong>
                  <span>/ 250 {t("г", "г")}</span>
                </div>
                <dl>
                  <div>
                    <dt>{t("Доставка", "Жеткізу")}</dt>
                    <dd>
                      {s.days} {t("дней", "күн")}
                    </dd>
                  </div>
                  <div>
                    <dt>{t("Минимальный заказ", "Ең аз тапсырыс")}</dt>
                    <dd>
                      {s.minimum} {t("шт.", "дана")}
                    </dd>
                  </div>
                  <div>
                    <dt>{t("Стоимость доставки", "Жеткізу ақысы")}</dt>
                    <dd>
                      {s.delivery === null
                        ? t("Уточняется", "Нақтылануда")
                        : money(s.delivery)}
                    </dd>
                  </div>
                  <div>
                    <dt>{t("Условия", "Шарттар")}</dt>
                    <dd>{tx(s.terms)}</dd>
                  </div>
                </dl>
                <div className="studio-quote-total">
                  <span>
                    {quote.quantity} {t("шт. + доставка", "дана + жеткізу")}
                  </span>
                  <strong>
                    {quote.total === null
                      ? t("Итог не определён", "Қорытынды белгісіз")
                      : money(quote.total)}
                  </strong>
                  <small>
                    {quote.total === null
                      ? t(
                          "60 000 ₸ за товары; доставка неизвестна",
                          "Тауарларға 60 000 ₸; жеткізу белгісіз",
                        )
                      : t(
                          "Сумма до дополнительных сборов",
                          "Қосымша алымдарға дейінгі сома",
                        )}
                  </small>
                </div>
                <button
                  className="hub-outline-button"
                  disabled={hub.quoteRequests.includes(s.id)}
                  onClick={() =>
                    setHub((h) =>
                      h.quoteRequests.includes(s.id)
                        ? h
                        : { ...h, quoteRequests: [...h.quoteRequests, s.id] },
                    )
                  }
                >
                  {hub.quoteRequests.includes(s.id) ? (
                    <Check size={16} />
                  ) : (
                    <FileText size={16} />
                  )}
                  {hub.quoteRequests.includes(s.id)
                    ? t("Запрос подготовлен", "Сұрау дайын")
                    : t("Подготовить запрос условий", "Шарттарды сұрау жобасы")}
                </button>
              </article>
            );
          })}
        </div>
        <section className="studio-card studio-quote-requests">
          <header className="studio-card-header">
            <div>
              <h2>{t("Запросы условий", "Шарттарды нақтылау")}</h2>
              <p>
                {t(
                  "Проекты запросов. Поставщикам ничего не отправляется.",
                  "Сұрау жобалары. Жеткізушілерге ештеңе жіберілмейді.",
                )}
              </p>
            </div>
            <span className="studio-count-badge">
              {hub.quoteRequests.length}
            </span>
          </header>
          {hub.quoteRequests.length ? (
            hub.quoteRequests.map((id) => (
              <div className="studio-quote-request" key={id}>
                <FileText size={20} />
                <div>
                  <b>{supplierQuotes.find((s) => s.id === id)!.name}</b>
                  <p>
                    {t(
                      `Подтвердите наличие ${quoteTotal(id)!.quantity} пачек кофе, ближайший срок поставки, налоги и полную стоимость с доставкой.`,
                      `${quoteTotal(id)!.quantity} қаптама кофенің бар-жоғын, ең жақын жеткізу мерзімін, салықтар мен жеткізуді қосқандағы толық құнын растаңыз.`,
                    )}
                  </p>
                </div>
                <span className="studio-pill neutral">
                  {t("Проект", "Жоба")}
                </span>
              </div>
            ))
          ) : (
            <div className="studio-empty">
              {t(
                "Выберите поставщика выше — проект запроса появится здесь.",
                "Жоғарыдан жеткізушіні таңдаңыз — сұрау жобасы осында көрінеді.",
              )}
            </div>
          )}
          <button
            className="studio-text-link"
            onClick={() => navigate("purchases")}
          >
            {t("Вернуться к текущей закупке", "Қазіргі сатып алуға оралу")}
            <ArrowRight size={16} />
          </button>
        </section>
      </div>
    );
  if (section === "automation")
    return (
      <div className="studio-operations" data-guide="automation">
        <div className="studio-automation-banner">
          <div className="studio-automation-icon">
            <GitBranch size={28} />
          </div>
          <div>
            <span className="studio-eyebrow">
              {t("УПРАВЛЯЕМАЯ АВТОМАТИЗАЦИЯ", "БАСҚАРЫЛАТЫН АВТОМАТТАНДЫРУ")}
            </span>
            <h2>
              {t(
                "От сообщения — к заказу и запасам.",
                "Хабарламадан — тапсырыс пен қорға дейін.",
              )}
            </h2>
            <p>
              {t(
                "Выберите, что поручить помощнику. Ответы попадут в диалоги, проекты заказов — к клиентам, закупка — на вашу проверку.",
                "Көмекшіге қай істі тапсыратыныңызды таңдаңыз. Жауаптар диалогтарға, тапсырыс жобалары клиенттерге, сатып алу сіздің тексеруіңізге түседі.",
              )}
            </p>
          </div>
        </div>
        <div className="ops-workflows">
          {[
            {
              id: "messages",
              number: "01",
              icon: MessageSquare,
              title: t("Ответить клиентам", "Клиенттерге жауап беру"),
              detail: t(
                "Вопрос → проверка наличия → ответ в диалоге",
                "Сұрақ → қорды тексеру → диалогтағы жауап",
              ),
              example: t(
                "Аружан спрашивает про 2 пачки кофе. Помощник уточнит наличие и стоимость.",
                "Аружан 2 қаптама кофе сұрайды. Көмекші қор мен құнын нақтылайды.",
              ),
              result: t(
                "История остаётся у клиента",
                "Тарих клиентте сақталады",
              ),
            },
            {
              id: "orders",
              number: "02",
              icon: ShoppingBag,
              title: t("Подготовить заказ", "Тапсырыс дайындау"),
              detail: t(
                "Ответ клиенту → товар и количество → проект",
                "Клиентке жауап → тауар мен саны → жоба",
              ),
              example: t(
                "Для повторного заказа Аружан: 2 × 3 200 ₸. Оплата и подтверждение отдельно.",
                "Аружанның қайталама тапсырысы: 2 × 3 200 ₸. Төлем мен растау бөлек.",
              ),
              result: t(
                "Заказ без повторного ввода",
                "Қайта енгізусіз тапсырыс",
              ),
            },
            {
              id: "stock",
              number: "03",
              icon: PackageCheck,
              title: t("Вовремя пополнить запас", "Қорды уақытында толықтыру"),
              detail: t(
                "Мало кофе → запрос поставщику → проверка",
                "Кофе аз → жеткізушіге сұрау → тексеру",
              ),
              example: t(
                "Если запас меньше 5 дней, помощник подготовит запрос на 30 пачек кофе.",
                "Қор 5 күнге жетпесе, көмекші 30 қаптама кофеге сұрау дайындайды.",
              ),
              result: t(
                "Закупка только с вашим решением",
                "Сатып алу тек сіздің шешіміңізбен",
              ),
            },
          ].map(
            ({ id, number, icon: Icon, title, detail, example, result }) => {
              const enabled =
                id === "messages"
                  ? hub.autoReplyEnabled
                  : hub.rules.includes(id);
              return (
                <article key={id} className={enabled ? "enabled" : ""}>
                  <header>
                    <span className="ops-workflow-icon">
                      <Icon size={22} />
                    </span>
                    <span className="ops-workflow-number">{number}</span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={enabled}
                      aria-label={title}
                      onClick={() => {
                        setOperationEvents([]);
                        setRunResult(null);
                        setHub((state) =>
                          id === "messages"
                            ? {
                                ...state,
                                autoReplyEnabled: !state.autoReplyEnabled,
                              }
                            : {
                                ...state,
                                rules: state.rules.includes(id)
                                  ? state.rules.filter((rule) => rule !== id)
                                  : [...state.rules, id],
                              },
                        );
                      }}
                    >
                      <i />
                    </button>
                  </header>
                  <h3>{title}</h3>
                  <p>{example}</p>
                  <div className="ops-workflow-path">{detail}</div>
                  <footer>
                    <span className={enabled ? "on" : ""} />
                    {enabled
                      ? t("Включено", "Қосулы")
                      : t("Выключено", "Өшірулі")}
                    <small>{result}</small>
                  </footer>
                </article>
              );
            },
          )}
        </div>
        <details className="ops-extra-rules">
          <summary>
            {t(
              "Дополнительные правила для команды",
              "Командаға арналған қосымша ережелер",
            )}
          </summary>
          <div className="studio-rules">
            {[
              {
                id: "followup",
                icon: MessageSquare,
                title: t(
                  "Не оставить клиента без ответа",
                  "Клиентті жауапсыз қалдырмау",
                ),
                trigger: t("Новое обращение", "Жаңа өтініш"),
                condition: t(
                  "Без ответа 30 минут и больше",
                  "Кемінде 30 минут жауапсыз",
                ),
                action: t(
                  "Задача на следующий контакт",
                  "Келесі байланысқа тапсырма",
                ),
              },
              {
                id: "review",
                icon: Star,
                title: t(
                  "Превратить замечание в улучшение",
                  "Ескертуді жақсартуға айналдыру",
                ),
                trigger: t("Отзыв о долгом ожидании", "Ұзақ күту туралы пікір"),
                condition: t("Ответ ещё не записан", "Жауап әлі тіркелмеген"),
                action: t(
                  "Задача проверить выдачу заказов",
                  "Тапсырыс беруді тексеру",
                ),
              },
            ].map(({ id, icon: Icon, title, trigger, condition, action }) => (
              <section className="studio-card studio-rule" key={id}>
                <header>
                  <span className="studio-rule-icon">
                    <Icon size={21} />
                  </span>
                  <div>
                    <h3>{title}</h3>
                    <small>
                      {t("Задача для команды", "Командаға тапсырма")}
                    </small>
                  </div>
                  <button
                    role="switch"
                    aria-checked={hub.rules.includes(id)}
                    aria-label={title}
                    onClick={() => {
                      setRunResult(null);
                      setHub((h) => ({
                        ...h,
                        rules: h.rules.includes(id)
                          ? h.rules.filter((r) => r !== id)
                          : [...h.rules, id],
                      }));
                    }}
                  >
                    <i />
                  </button>
                </header>
                <div className="studio-rule-flow">
                  <div>
                    <small>{t("КОГДА", "ҚАШАН")}</small>
                    <b>{trigger}</b>
                  </div>
                  <ChevronRight size={18} />
                  <div>
                    <small>{t("ЕСЛИ", "ЕГЕР")}</small>
                    <b>{condition}</b>
                  </div>
                  <ChevronRight size={18} />
                  <div>
                    <small>{t("ТОГДА", "ОНДА")}</small>
                    <b>{action}</b>
                  </div>
                </div>
              </section>
            ))}
          </div>
        </details>
        <section className="studio-card studio-rule-run">
          <div>
            <h2>
              {t(
                "Обработать текущие обращения и остатки",
                "Қазіргі өтініштер мен қорды өңдеу",
              )}
            </h2>
            <p>
              {t(
                "Один запуск покажет всю цепочку. Повторные ответы и заказы не создаются; ваши черновики остаются на месте.",
                "Бір іске қосу бүкіл тізбекті көрсетеді. Жауап пен тапсырыс қайталанбайды; өзіңіз өңдеген жобалар сақталады.",
              )}
            </p>
          </div>
          <button
            className="dark-button"
            disabled={!hub.rules.length && !hub.autoReplyEnabled}
            onClick={() => {
              const result = runOperationsAutomation(hub, language, available);
              setRunResult(
                result.events.filter((event) => event.status === "created")
                  .length,
              );
              setOperationEvents(result.events);
              setHub(result.state);
            }}
          >
            <Play size={16} />
            {t("Обработать сейчас", "Қазір өңдеу")}
          </button>
          {runResult !== null && (
            <div className="studio-rule-result" role="status">
              <CheckCircle2 size={20} />
              <span>
                {t(
                  `Готово: ${runResult} новых действий.`,
                  `Дайын: ${runResult} жаңа әрекет.`,
                )}
              </span>
              <button onClick={() => navigate("growth")}>
                {t("План действий", "Әрекет жоспары")}
                <ArrowRight size={15} />
              </button>
            </div>
          )}
          <small>
            {t(
              `Обработок: ${hub.ruleRuns} · учебный режим: изменения сохраняются здесь, без отправки во внешние сервисы.`,
              `Өңдеу саны: ${hub.ruleRuns} · оқу режимі: өзгерістер осында сақталады, сыртқы сервистерге жіберілмейді.`,
            )}
          </small>
        </section>
        {operationEvents.length > 0 && (
          <section className="studio-card ops-run-log">
            <header>
              <CheckCircle2 size={19} />
              <h2>{t("Что сделал помощник", "Көмекші не істеді")}</h2>
            </header>
            {operationEvents.map((event) => (
              <article key={event.id}>
                <span
                  className={event.status === "created" ? "created" : "skipped"}
                >
                  {event.status === "created" ? (
                    <Check size={16} />
                  ) : (
                    <Info size={16} />
                  )}
                </span>
                <div>
                  <b>{tx(event.title)}</b>
                  <p>{tx(event.detail)}</p>
                </div>
                <button onClick={() => navigate(event.section)}>
                  {t("Открыть", "Ашу")}
                  <ArrowRight size={14} />
                </button>
              </article>
            ))}
          </section>
        )}
      </div>
    );
  return null;
}
