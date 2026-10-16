"use client";
import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCheck,
  CheckCircle2,
  ChevronDown,
  Info,
  MessageCircle,
  Package,
  Plus,
  Search,
  Send,
  ShoppingBag,
  Sparkles,
  Star,
  UserRound,
  X,
} from "lucide-react";
import ChannelIcon from "./channel-icon";
import {
  addDemoTask,
  allConversations,
  createThreadOrder,
  demoContacts,
  demoReviews,
  demoThreadHistory,
  hubProducts,
  localText,
  replyDraft,
  reviewDraft,
  runAutoReply,
  sendThreadReply,
  simulateReply,
  syncDemoMessage,
  unanswered,
  type DemoLanguage,
  type HubState,
} from "@/lib/business-hub-demo";

type Props = {
  conversationRequest: { id: string; sequence: number } | null;
  section: string;
  language: DemoLanguage;
  state: HubState;
  setState: Dispatch<SetStateAction<HubState>>;
  available: number;
  navigate: (section: string) => void;
};
export default function BusinessHub({
  conversationRequest,
  section,
  language,
  state,
  setState,
  available,
  navigate,
}: Props) {
  const t = (ru: string, kk: string) => (language === "ru" ? ru : kk);
  const tx = (text: [string, string]) => localText(text, language);
  const [selected, setSelected] = useState("wa-101");
  const [mobileConversation, setMobileConversation] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [filter, setFilter] = useState("all");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [clientId, setClientId] = useState("c1");
  const [reviewSource, setReviewSource] = useState("all");
  const [showOrder, setShowOrder] = useState(false);
  const [productId, setProductId] = useState("COF-0250");
  const [quantity, setQuantity] = useState(2);
  const [notice, setNotice] = useState("");
  const messagesEnd = useRef<HTMLDivElement>(null);
  const composer = useRef<HTMLTextAreaElement>(null);
  const conversations = allConversations(state);
  const pending = unanswered(state);
  const active =
    conversations.find((c) => c.id === selected) || conversations[0];
  const contact = demoContacts.find((c) => c.id === active.contact)!;
  const client = demoContacts.find((c) => c.id === clientId) || demoContacts[0];
  const clientConversations = conversations.filter(
    (c) => c.contact === client.id,
  );
  const messages = state.sentMessages[active.id] || [];
  const order = state.threadOrders.find((o) => o.conversationId === active.id);
  const product = hubProducts.find((p) => p.id === productId)!;
  const channels = ["WhatsApp", "Instagram", "TikTok", "Сайт"];
  const channelsFor = (id: string) => [
    ...new Set([
      ...(demoContacts.find((c) => c.id === id)?.channels || []),
      ...conversations.filter((c) => c.contact === id).map((c) => c.source),
    ]),
  ];
  const visible = conversations.filter(
    (c) =>
      (filter === "all" || c.source === filter) &&
      (status === "all" ||
        (status === "waiting"
          ? !state.replies[c.id]
          : !!state.replies[c.id])) &&
      (
        demoContacts.find((p) => p.id === c.contact)?.name +
        " " +
        tx(c.text) +
        " " +
        c.source
      )
        .toLocaleLowerCase()
        .includes(search.toLocaleLowerCase()),
  );
  useEffect(() => {
    if (!conversationRequest) return;
    setSelected(conversationRequest.id);
    setMobileConversation(true);
    setFilter("all");
    setStatus("all");
    setSearch("");
  }, [conversationRequest]);
  useEffect(() => {
    setShowOrder(false);
    setNotice("");
  }, [selected]);
  useEffect(() => {
    const log = messagesEnd.current?.parentElement;
    if (log) log.scrollTop = log.scrollHeight;
  }, [
    selected,
    messages.length,
    state.replies,
    state.autoReplyEnabled,
    section,
  ]);
  function choose(id: string) {
    setSelected(id);
    setMobileConversation(true);
    setShowDetails(false);
  }
  function send() {
    if (!state.drafts[active.id]?.trim()) return;
    setState((s) => sendThreadReply(s, active.id));
    setNotice(
      t(
        "Ответ сохранён в этом рабочем пространстве.",
        "Жауап осы жұмыс кеңістігінде сақталды.",
      ),
    );
    composer.current?.focus();
  }
  function prepare() {
    setState((s) => ({
      ...s,
      drafts: {
        ...s.drafts,
        [active.id]: replyDraft(active.id, language, available),
      },
    }));
    composer.current?.focus();
  }
  function addTask(id: string) {
    setState((s) => addDemoTask(s, id));
  }
  function selectChannel(source: string) {
    setFilter(source);
    setMobileConversation(false);
    if (source !== "all") {
      const first = conversations.find((c) => c.source === source);
      if (first) setSelected(first.id);
    }
  }
  function openSource(source: string, target: string) {
    if (target === "inbox") {
      selectChannel(channels.includes(source) ? source : "all");
      setStatus("all");
      setMobileConversation(false);
    }
    if (target === "reviews") setReviewSource(source);
    navigate(target);
  }
  if (section === "inbox")
    return (
      <div
        className={"inbox-v2 " + (mobileConversation ? "is-conversation" : "")}
        data-guide="inbox"
      >
        <div
          className="iv-channel-bar"
          aria-label={t("Каналы сообщений", "Хабарлама арналары")}
        >
          <button
            className={filter === "all" ? "selected" : ""}
            aria-pressed={filter === "all"}
            onClick={() => {
              setFilter("all");
              setMobileConversation(false);
            }}
          >
            <MessageCircle size={19} />
            <span>{t("Все", "Бәрі")}</span>
            <b>{conversations.length}</b>
          </button>
          {channels.map((source) => (
            <button
              key={source}
              className={filter === source ? "selected" : ""}
              aria-pressed={filter === source}
              onClick={() => {
                selectChannel(source);
              }}
            >
              <ChannelIcon source={source} size={22} />
              <span>{source === "Сайт" ? t("Сайт", "Сайт") : source}</span>
              <b>{conversations.filter((c) => c.source === source).length}</b>
            </button>
          ))}
        </div>
        <div
          className={
            "iv-workspace " + (mobileConversation ? "is-conversation" : "")
          }
        >
          <aside className="iv-sidebar">
            <label className="iv-search">
              <Search size={17} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label={t("Поиск диалога", "Диалогты іздеу")}
                placeholder={t(
                  "Найти клиента или сообщение",
                  "Клиент не хабарлама іздеу",
                )}
              />
            </label>
            <div className="iv-status-tabs">
              {[
                ["all", t("Все", "Бәрі")],
                ["waiting", t("Без ответа", "Жауапсыз")],
                ["replied", t("Готово", "Жауап берілді")],
              ].map(([id, label]) => (
                <button
                  key={id}
                  aria-pressed={status === id}
                  className={status === id ? "selected" : ""}
                  onClick={() => setStatus(id)}
                >
                  {label}
                  {id === "waiting" && <b>{pending.length}</b>}
                </button>
              ))}
            </div>
            <div className="iv-threads">
              {visible.map((c) => {
                const person = demoContacts.find((p) => p.id === c.contact)!;
                return (
                  <button
                    key={c.id}
                    className={
                      "iv-thread hub-thread " +
                      (c.id === active.id ? "selected" : "")
                    }
                    onClick={() => choose(c.id)}
                    aria-pressed={c.id === active.id}
                  >
                    <span className={"iv-avatar avatar-" + person.id}>
                      {person.initials}
                      <ChannelIcon source={c.source} size={17} />
                    </span>
                    <span className="iv-thread-copy">
                      <span>
                        <b>{person.name}</b>
                        <time>{c.time}</time>
                      </span>
                      <p>
                        {state.replies[c.id]
                          ? t("Вы: ", "Сіз: ") + state.replies[c.id]
                          : tx(c.text)}
                      </p>
                      <small>
                        {tx(c.intent)}
                        {state.replies[c.id] ? (
                          <CheckCheck size={15} />
                        ) : (
                          <i>1</i>
                        )}
                      </small>
                    </span>
                  </button>
                );
              })}
              {!visible.length && (
                <div className="iv-no-results">
                  <Search size={28} />
                  <b>{t("Ничего не найдено", "Ештеңе табылмады")}</b>
                  <p>
                    {t(
                      "Попробуйте другой запрос или канал.",
                      "Басқа сөз не арна таңдаңыз.",
                    )}
                  </p>
                  <button
                    onClick={() => {
                      setSearch("");
                      setFilter("all");
                      setStatus("all");
                    }}
                  >
                    {t("Сбросить фильтры", "Сүзгілерді тазалау")}
                  </button>
                </div>
              )}
            </div>
            <div className="iv-sidebar-bottom">
              <span className="iv-status-dot" />
              {t(
                "Клиент и история — всегда рядом",
                "Клиент пен тарихы бір жерде",
              )}
            </div>
          </aside>
          <section className="iv-chat">
            <header className="iv-chat-header">
              <button
                className="iv-mobile-back iv-icon-button"
                onClick={() => setMobileConversation(false)}
                aria-label={t("Назад к диалогам", "Диалогтарға оралу")}
              >
                <ArrowLeft size={20} />
              </button>
              <span className={"iv-avatar avatar-" + contact.id}>
                {contact.initials}
              </span>
              <div className="iv-chat-heading">
                <h2>{contact.name}</h2>
                <span>
                  <ChannelIcon source={active.source} size={15} />
                  {active.source}
                  <i /> {tx(active.intent)}
                </span>
              </div>
              <button
                className="iv-order-button"
                aria-label={
                  order
                    ? t("Открыть заказ", "Тапсырысты ашу")
                    : t("Создать заказ", "Тапсырыс құру")
                }
                onClick={() => setShowOrder((v) => !v)}
                aria-expanded={showOrder}
              >
                <ShoppingBag size={17} />
                <span>
                  {order
                    ? t("Заказ", "Тапсырыс")
                    : t("Создать заказ", "Тапсырыс құру")}
                </span>
              </button>
              <button
                className={"iv-icon-button " + (showDetails ? "active" : "")}
                onClick={() => setShowDetails((v) => !v)}
                aria-expanded={showDetails}
                aria-label={t("Карточка клиента", "Клиент карточкасы")}
              >
                <Info size={20} />
              </button>
            </header>
            {showDetails && (
              <aside className="iv-client-drawer">
                <header>
                  <b>{t("О клиенте", "Клиент туралы")}</b>
                  <button
                    className="iv-icon-button"
                    onClick={() => setShowDetails(false)}
                    aria-label={t("Закрыть карточку", "Карточканы жабу")}
                  >
                    <X size={18} />
                  </button>
                </header>
                <span className={"iv-avatar large avatar-" + contact.id}>
                  {contact.initials}
                </span>
                <h3>{contact.name}</h3>
                <p>{tx(contact.segment)}</p>
                <div className="iv-channel-pills">
                  {channelsFor(contact.id).map((source) => (
                    <span key={source}>
                      <ChannelIcon source={source} size={18} />
                      {source}
                    </span>
                  ))}
                </div>
                <dl>
                  <div>
                    <dt>{t("Покупок", "Сатып алу")}</dt>
                    <dd>{contact.orders}</dd>
                  </div>
                  <div>
                    <dt>{t("Сумма", "Сома")}</dt>
                    <dd>{contact.total.toLocaleString("ru-RU")} ₸</dd>
                  </div>
                </dl>
                <label>
                  {t("Ответственный", "Жауапты")}
                  <select
                    value={state.owners[active.id] || "Айдана"}
                    onChange={(e) =>
                      setState((s) => ({
                        ...s,
                        owners: { ...s.owners, [active.id]: e.target.value },
                      }))
                    }
                  >
                    <option>Айдана</option>
                    <option>Алина</option>
                  </select>
                </label>
                <button
                  className="iv-secondary"
                  disabled={state.tasks.includes("follow-" + contact.id)}
                  onClick={() => addTask("follow-" + contact.id)}
                >
                  <Plus size={16} />
                  {state.tasks.includes("follow-" + contact.id)
                    ? t("Контакт запланирован", "Байланыс жоспарланды")
                    : t("Напомнить завтра", "Ертең еске салу")}
                </button>
                <button
                  className="iv-text-button"
                  onClick={() => {
                    setClientId(contact.id);
                    navigate("customers");
                  }}
                >
                  {t("Открыть всю историю", "Толық тарихты ашу")}
                  <ArrowRight size={15} />
                </button>
              </aside>
            )}
            {showOrder && (
              <div className="iv-order-form">
                <header>
                  <b>
                    {order
                      ? t("Проект заказа", "Тапсырыс жобасы")
                      : t("Новый заказ для ", "Жаңа тапсырыс: ") + contact.name}
                  </b>
                  <button
                    className="iv-icon-button"
                    aria-label={t("Закрыть заказ", "Тапсырысты жабу")}
                    onClick={() => setShowOrder(false)}
                  >
                    <X size={16} />
                  </button>
                </header>
                {order ? (
                  <p>
                    <Package size={18} />
                    {tx(
                      hubProducts.find((p) => p.id === order.productId)!.name,
                    )}{" "}
                    · {order.quantity} ×{" "}
                    {order.unitPrice.toLocaleString("ru-RU")} ₸
                    <strong>
                      {(order.quantity * order.unitPrice).toLocaleString(
                        "ru-RU",
                      )}{" "}
                      ₸
                    </strong>
                  </p>
                ) : (
                  <>
                    <div>
                      <label>
                        {t("Товар", "Тауар")}
                        <select
                          value={productId}
                          onChange={(e) => setProductId(e.target.value)}
                        >
                          {hubProducts.map((p) => (
                            <option key={p.id} value={p.id}>
                              {tx(p.name)}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        {t("Кол-во", "Саны")}
                        <input
                          type="number"
                          min={1}
                          max={100}
                          value={quantity}
                          onChange={(e) => setQuantity(Number(e.target.value))}
                        />
                      </label>
                      <strong>
                        {(product.price * quantity).toLocaleString("ru-RU")} ₸
                      </strong>
                    </div>
                    <button
                      className="iv-primary"
                      disabled={
                        !Number.isInteger(quantity) ||
                        quantity < 1 ||
                        quantity > 100
                      }
                      onClick={() => {
                        setState((s) =>
                          createThreadOrder(s, active.id, productId, quantity),
                        );
                        setNotice(
                          t(
                            "Проект связан с клиентом и этим диалогом. Остаток пока не списан.",
                            "Жоба клиент пен осы диалогқа байланыстырылды. Қор әзірге өзгерген жоқ.",
                          ),
                        );
                      }}
                    >
                      {t("Сохранить проект", "Жобаны сақтау")}
                      <Check size={16} />
                    </button>
                  </>
                )}
              </div>
            )}
            <div
              className="iv-message-log"
              role="log"
              aria-live="polite"
              aria-label={t("История сообщений", "Хабарлама тарихы")}
            >
              <span className="iv-day">{t("14 октября", "14 қазан")}</span>
              {(demoThreadHistory[active.id] || []).map((m, index) => (
                <div
                  className={
                    "iv-message " +
                    (m.from === "team" ? "outgoing" : "incoming")
                  }
                  key={index}
                >
                  <p>{tx(m.text)}</p>
                  <small>
                    {m.time.replace("Вчера ", "")}
                    {m.from === "team" && <CheckCheck size={14} />}
                  </small>
                </div>
              ))}
              <div className="iv-message incoming">
                <p>{tx(active.text)}</p>
                <small>{active.time}</small>
              </div>
              {!messages.length && state.replies[active.id] && (
                <div className="iv-message outgoing hub-sent-message">
                  <p>{state.replies[active.id]}</p>
                  <small>
                    <Check size={14} />
                    {t("Сохранено", "Сақталды")}
                  </small>
                </div>
              )}
              {messages.map((m) => (
                <div
                  className="iv-message outgoing hub-sent-message"
                  key={m.id}
                >
                  {m.kind === "auto" && (
                    <b className="iv-auto-author">
                      <Sparkles size={12} />
                      Sana · {t("автоответ", "автожауап")}
                    </b>
                  )}
                  <p>{m.text}</p>
                  <small>
                    {m.time}
                    <Check size={14} />
                    {t("локально", "осы жерде")}
                  </small>
                </div>
              ))}
              {order && (
                <button
                  className="iv-order-receipt"
                  onClick={() => setShowOrder(true)}
                >
                  <span>
                    <ShoppingBag size={18} />
                    <b>
                      {t("Проект заказа создан", "Тапсырыс жобасы құрылды")}
                    </b>
                    <small>
                      {tx(
                        hubProducts.find((p) => p.id === order.productId)!.name,
                      )}{" "}
                      · {order.quantity} {t("шт.", "дана")}
                    </small>
                  </span>
                  <strong>
                    {(order.quantity * order.unitPrice).toLocaleString("ru-RU")}{" "}
                    ₸
                  </strong>
                  <ArrowRight size={15} />
                </button>
              )}
              {state.autoReplyEnabled && !state.replies[active.id] && (
                <div className="iv-auto-preview">
                  <div>
                    <Sparkles size={15} />
                    <span>
                      {t(
                        "Предпросмотр автоответа",
                        "Автожауапты алдын ала көру",
                      )}
                    </span>
                  </div>
                  <p>{replyDraft(active.id, language, available)}</p>
                  <button
                    type="button"
                    disabled={
                      !!state.replies[active.id] ||
                      !!state.drafts[active.id]?.trim()
                    }
                    onClick={() => {
                      setState((s) =>
                        runAutoReply(s, active.id, language, available),
                      );
                      setNotice(
                        t(
                          "Автоответ добавлен в этот чат. Во внешний сервис ничего не отправлено.",
                          "Автожауап осы чатқа қосылды. Сыртқы сервиске ештеңе жіберілген жоқ.",
                        ),
                      );
                    }}
                  >
                    {state.replies[active.id]
                      ? t(
                          "На этот запрос уже ответили",
                          "Бұл сұраққа жауап берілді",
                        )
                      : state.drafts[active.id]?.trim()
                        ? t(
                            "Сначала сохраните свой ответ",
                            "Алдымен өз жауабыңызды сақтаңыз",
                          )
                        : t("Попробовать в этом чате", "Осы чатта байқап көру")}
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}
              <div ref={messagesEnd} />
            </div>
            {notice && (
              <div className="iv-notice" role="status">
                <CheckCircle2 size={15} />
                <span>{notice}</span>
                <button
                  aria-label={t("Скрыть", "Жасыру")}
                  onClick={() => setNotice("")}
                >
                  <X size={14} />
                </button>
              </div>
            )}
            <form
              className="iv-compose hub-compose"
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
            >
              <div className="iv-compose-actions">
                <button type="button" onClick={prepare}>
                  <Sparkles size={16} />
                  {t("Ответ с Sana", "Sana-мен жауап")}
                </button>
                <button
                  type="button"
                  className={
                    "iv-auto-toggle " +
                    (state.autoReplyEnabled ? "enabled" : "")
                  }
                  role="switch"
                  aria-checked={state.autoReplyEnabled}
                  onClick={() =>
                    setState((s) => ({
                      ...s,
                      autoReplyEnabled: !s.autoReplyEnabled,
                    }))
                  }
                >
                  <span />
                  {t("Автоответ", "Автожауап")}
                </button>
              </div>
              <div className="iv-compose-input">
                <textarea
                  ref={composer}
                  rows={2}
                  maxLength={2000}
                  aria-label={t("Ответ клиенту", "Клиентке жауап")}
                  placeholder={t("Напишите сообщение…", "Хабарлама жазыңыз…")}
                  value={state.drafts[active.id] || ""}
                  onChange={(e) =>
                    setState((s) => ({
                      ...s,
                      drafts: { ...s.drafts, [active.id]: e.target.value },
                    }))
                  }
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      !e.shiftKey &&
                      !e.nativeEvent.isComposing
                    ) {
                      e.preventDefault();
                      send();
                    }
                  }}
                />
                <button
                  type="submit"
                  disabled={!state.drafts[active.id]?.trim()}
                  aria-label={t(
                    "Сохранить ответ в чате",
                    "Жауапты чатқа сақтау",
                  )}
                >
                  <Send size={19} />
                </button>
              </div>
              <small>
                {t(
                  "Enter — сохранить · Shift + Enter — новая строка",
                  "Enter — сақтау · Shift + Enter — жаңа жол",
                )}
              </small>
            </form>
          </section>
        </div>
      </div>
    );
  if (section === "customers")
    return (
      <div className="hub-v2" data-guide="customers">
        <header className="hv-page-heading">
          <div>
            <h2>{t("Клиенты", "Клиенттер")}</h2>
            <p>
              {t(
                "Вся история человека — независимо от канала.",
                "Арнасы өзгерсе де, клиент тарихы бір жерде.",
              )}
            </p>
          </div>
          <span>
            {demoContacts.length} {t("клиентов", "клиент")}
          </span>
        </header>
        <div className="hv-customers">
          <aside>
            {demoContacts.map((c) => (
              <button
                key={c.id}
                className={client.id === c.id ? "selected" : ""}
                onClick={() => setClientId(c.id)}
              >
                <span className={"iv-avatar avatar-" + c.id}>{c.initials}</span>
                <span>
                  <b>{c.name}</b>
                  <small>{tx(c.segment)}</small>
                  <em>
                    {channelsFor(c.id).map((source) => (
                      <ChannelIcon key={source} source={source} size={17} />
                    ))}
                  </em>
                </span>
                <ArrowRight size={16} />
              </button>
            ))}
          </aside>
          <section className="hv-client hub-client-detail">
            <header>
              <div>
                <span className={"iv-avatar large avatar-" + client.id}>
                  {client.initials}
                </span>
                <h2>{client.name}</h2>
                <p>{tx(client.segment)}</p>
              </div>
              <button
                className="iv-secondary"
                disabled={state.tasks.includes("follow-" + client.id)}
                onClick={() => addTask("follow-" + client.id)}
              >
                <Plus size={16} />
                {state.tasks.includes("follow-" + client.id)
                  ? t("Контакт запланирован", "Байланыс жоспарланды")
                  : t("Напомнить завтра", "Ертең еске салу")}
              </button>
            </header>
            <div className="hv-client-stats hub-mini-stats">
              <div>
                <b>{client.orders}</b>
                <span>{t("покупок", "сатып алу")}</span>
              </div>
              <div>
                <b>{client.total.toLocaleString("ru-RU")} ₸</b>
                <span>{t("сумма покупок", "сатып алу сомасы")}</span>
              </div>
              <div>
                <b>
                  {
                    clientConversations.filter((c) => !state.replies[c.id])
                      .length
                  }
                </b>
                <span>{t("ждут ответа", "жауап күтуде")}</span>
              </div>
            </div>
            <h3>{t("История общения", "Байланыс тарихы")}</h3>
            <div className="hv-timeline">
              {clientConversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    choose(c.id);
                    setFilter("all");
                    setStatus("all");
                    navigate("inbox");
                  }}
                >
                  <ChannelIcon source={c.source} size={28} />
                  <span>
                    <b>
                      {c.source}
                      <time>{c.time}</time>
                    </b>
                    <p>{tx(c.text)}</p>
                    <small className={state.replies[c.id] ? "answered" : ""}>
                      {state.replies[c.id]
                        ? t("Ответ сохранён", "Жауап сақталды")
                        : t("Нужен ответ", "Жауап керек")}
                    </small>
                  </span>
                  <ArrowRight size={17} />
                </button>
              ))}
            </div>
            {state.threadOrders
              .filter((o) => o.contactId === client.id)
              .map((o) => (
                <div className="hv-client-order" key={o.id}>
                  <ShoppingBag size={19} />
                  <span>
                    <b>{t("Проект заказа", "Тапсырыс жобасы")}</b>
                    <small>
                      {tx(hubProducts.find((p) => p.id === o.productId)!.name)}{" "}
                      · {o.quantity} {t("шт.", "дана")}
                    </small>
                  </span>
                  <strong>
                    {(o.unitPrice * o.quantity).toLocaleString("ru-RU")} ₸
                  </strong>
                </div>
              ))}
          </section>
        </div>
      </div>
    );
  if (section === "reviews")
    return (
      <div className="hub-v2" data-guide="reviews">
        <header className="hv-page-heading">
          <div>
            <h2>{t("Отзывы клиентов", "Клиент пікірлері")}</h2>
            <p>
              {t(
                "Услышьте клиента. Подготовьте ответ. Улучшите сервис.",
                "Клиентті тыңдаңыз. Жауап дайындаңыз. Қызметті жақсартыңыз.",
              )}
            </p>
          </div>
          <span className="hv-rating">
            <Star size={20} />
            <b>
              {(
                demoReviews.reduce((n, r) => n + r.stars, 0) /
                demoReviews.length
              )
                .toFixed(1)
                .replace(".", ",")}
            </b>{" "}
            / 5{" "}
            <small>
              · {demoReviews.length} {t("отзыва", "пікір")}
            </small>
          </span>
        </header>
        <div className="hv-filter-pills">
          {["all", "Google Maps", "2GIS", "Сайт"].map((source) => (
            <button
              key={source}
              aria-pressed={reviewSource === source}
              className={reviewSource === source ? "selected" : ""}
              onClick={() => setReviewSource(source)}
            >
              {source !== "all" && <ChannelIcon source={source} size={19} />}
              <span>
                {source === "all" ? t("Все отзывы", "Барлық пікір") : source}
              </span>
            </button>
          ))}
        </div>
        <div className="hv-review-list">
          {demoReviews
            .filter((r) => reviewSource === "all" || r.source === reviewSource)
            .map((r) => (
              <article className="hv-review hub-review" key={r.id}>
                <header>
                  <ChannelIcon source={r.source} size={34} />
                  <div>
                    <h3>{r.name}</h3>
                    <small>{r.source} · 14.10.2026</small>
                  </div>
                  <span className="hv-stars" aria-label={r.stars + " / 5"}>
                    {"★".repeat(r.stars)}
                    <i>{"★".repeat(5 - r.stars)}</i>
                  </span>
                </header>
                <blockquote>{tx(r.text)}</blockquote>
                <span className="hv-review-topic">{tx(r.theme)}</span>
                {state.reviewReplies[r.id] ? (
                  <div className="hv-review-response">
                    <CheckCircle2 size={17} />
                    <div>
                      <b>{t("Ответ сохранён", "Жауап сақталды")}</b>
                      <p>{state.reviewReplies[r.id]}</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="hv-review-actions">
                      <button
                        className="iv-secondary"
                        onClick={() =>
                          setState((s) => ({
                            ...s,
                            reviewDrafts: {
                              ...s.reviewDrafts,
                              [r.id]: reviewDraft(r.id, language),
                            },
                          }))
                        }
                      >
                        <Sparkles size={16} />
                        {t("Подготовить ответ", "Жауап дайындау")}
                      </button>
                      {r.id === "r1" && (
                        <button
                          className="iv-text-button"
                          disabled={state.tasks.includes("service")}
                          onClick={() => addTask("service")}
                        >
                          {state.tasks.includes("service")
                            ? t("В плане", "Жоспарда")
                            : t(
                                "Добавить улучшение в план",
                                "Жақсартуды жоспарға қосу",
                              )}
                          <ArrowRight size={15} />
                        </button>
                      )}
                    </div>
                    {state.reviewDrafts[r.id] !== undefined && (
                      <div className="hv-review-editor">
                        <textarea
                          aria-label={
                            t("Ответ на отзыв ", "Пікірге жауап: ") + r.name
                          }
                          maxLength={2000}
                          value={state.reviewDrafts[r.id]}
                          onChange={(e) =>
                            setState((s) => ({
                              ...s,
                              reviewDrafts: {
                                ...s.reviewDrafts,
                                [r.id]: e.target.value,
                              },
                            }))
                          }
                        />
                        <button
                          className="iv-primary"
                          disabled={!state.reviewDrafts[r.id]?.trim()}
                          onClick={() =>
                            setState((s) => simulateReply(s, r.id, true))
                          }
                        >
                          {t("Сохранить ответ", "Жауапты сақтау")}
                          <Check size={15} />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </article>
            ))}
        </div>
      </div>
    );
  if (section === "integrations") {
    const sources = [
      {
        name: "WhatsApp",
        count: conversations.filter((c) => c.source === "WhatsApp").length,
        target: "inbox",
        label: t("диалога", "диалог"),
        text: t(
          "Заказы и повторные обращения",
          "Тапсырыс пен қайталама өтініштер",
        ),
      },
      {
        name: "Instagram",
        count: 1,
        target: "inbox",
        label: t("диалог", "диалог"),
        text: t(
          "Вопросы о товарах и подарках",
          "Тауар мен сыйлық туралы сұрақтар",
        ),
      },
      {
        name: "TikTok",
        count: 1,
        target: "inbox",
        label: t("диалог", "диалог"),
        text: t(
          "Интерес из видео — в заказ",
          "Видеодағы қызығушылықтан тапсырысқа",
        ),
      },
      {
        name: "2GIS",
        count: demoReviews.filter((r) => r.source === "2GIS").length,
        target: "reviews",
        label: t("отзыв", "пікір"),
        text: t(
          "Обратная связь и карточка магазина",
          "Кері байланыс пен дүкен карточкасы",
        ),
      },
      {
        name: "Google Maps",
        count: demoReviews.filter((r) => r.source === "Google Maps").length,
        target: "reviews",
        label: t("отзыва", "пікір"),
        text: t("Репутация и качество обслуживания", "Бедел мен қызмет сапасы"),
      },
      {
        name: "Kaspi",
        count: 3,
        target: "sales",
        label: t("продажи", "сатылым"),
        text: t("Оплаты и история покупок", "Төлемдер мен сатып алу тарихы"),
      },
      {
        name: "Сайт",
        count: 1,
        target: "inbox",
        label: t("обращение", "өтініш"),
        text: t(
          "Заявки с сайта в общей истории",
          "Сайт өтініштері ортақ тарихта",
        ),
      },
      {
        name: "Excel / CSV",
        count: 14,
        target: "analytics",
        label: t("дней", "күн"),
        text: t("Выручка и расходы по дням", "Күндік түсім мен шығын"),
      },
    ];
    return (
      <div className="hub-v2" data-guide="integrations">
        <header className="hv-page-heading">
          <div>
            <h2>{t("Каналы вашего бизнеса", "Бизнесіңіздің арналары")}</h2>
            <p>
              {t(
                "Сообщения, отзывы и продажи складываются в одну историю клиента.",
                "Хабарламалар, пікірлер мен сатылымдар бір клиент тарихына жиналады.",
              )}
            </p>
          </div>
          <span className="hv-sample-status">
            {t("Примеры данных", "Үлгі деректер")}
          </span>
        </header>
        <div className="hv-sources">
          {sources.map((source) => (
            <article key={source.name}>
              <header>
                <ChannelIcon source={source.name} size={38} />
                <ArrowRight size={17} />
              </header>
              <h3>{source.name}</h3>
              <p>{source.text}</p>
              <footer>
                <span>
                  <b>{source.count}</b> {source.label}
                </span>
                <button onClick={() => openSource(source.name, source.target)}>
                  {t("Открыть", "Ашу")}
                  <ArrowRight size={15} />
                </button>
              </footer>
            </article>
          ))}
        </div>
        <section className="hv-sync hub-sync">
          <div className="hv-sync-channels">
            <ChannelIcon source="Instagram" size={34} />
            <ArrowRight size={18} />
            <ChannelIcon source="WhatsApp" size={34} />
            <ArrowRight size={18} />
            <UserRound size={30} />
          </div>
          <div>
            <h3>{t("Один клиент. Два канала.", "Бір клиент. Екі арна.")}</h3>
            <p>
              {t(
                "Данияр продолжает разговор из Instagram в WhatsApp. Новый диалог добавится в его карточку.",
                "Данияр Instagram-дағы әңгімені WhatsApp-та жалғастырады. Жаңа диалог оның карточкасына қосылады.",
              )}
            </p>
          </div>
          <button
            className="iv-primary"
            onClick={() => setState(syncDemoMessage)}
          >
            {state.incoming
              ? t("Повторить", "Қайталау")
              : t("Добавить сообщение", "Хабарлама қосу")}
            <Plus size={16} />
          </button>
          {state.incoming && (
            <p className="hv-sync-result" role="status">
              <CheckCircle2 size={16} />
              {t(
                "Диалог добавлен. Тот же клиент, без дубликатов.",
                "Диалог қосылды. Сол клиент, көшірме жоқ.",
              )}
              <button
                onClick={() => {
                  choose("wa-105");
                  setFilter("all");
                  setStatus("all");
                  navigate("inbox");
                }}
              >
                {t("Посмотреть", "Көру")}
                <ArrowRight size={14} />
              </button>
            </p>
          )}
        </section>
      </div>
    );
  }
  return null;
}
