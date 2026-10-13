import { Event, Task, Insight, dayKey, money } from "./types";
export function analyze(
  events: Event[],
  tasks: Task[],
  days = 30,
  now = new Date(),
) {
  const end = now.getTime(),
    start = end - days * 864e5,
    previous = start - days * 864e5;
  const accepted = events.filter((e) => e.verified && !e.duplicate_of);
  const current = accepted.filter(
    (e) => +new Date(e.occurred_at) > start && +new Date(e.occurred_at) <= end,
  );
  const prior = accepted.filter(
    (e) =>
      +new Date(e.occurred_at) > previous && +new Date(e.occurred_at) <= start,
  );
  const sum = (es: Event[], kind: string, status?: string) =>
    es
      .filter((e) => e.kind === kind && (!status || e.status === status))
      .reduce((s, e) => s + Number(e.amount), 0);
  const sales = current.filter((e) => e.kind === "sale" && e.status === "paid");
  const refunds = current.filter(
    (e) => e.kind === "refund" && e.status === "paid",
  );
  const revenue = sum(current, "sale", "paid") - sum(current, "refund", "paid");
  const priorRevenue =
    sum(prior, "sale", "paid") - sum(prior, "refund", "paid");
  const expenses = sum(current, "expense", "paid"),
    priorExpenses = sum(prior, "expense", "paid");
  const knownCost =
    sales.length > 0 && [...sales, ...refunds].every((e) => e.cost !== null);
  const cost = knownCost
    ? sales.reduce((s, e) => s + Number(e.cost), 0) -
      refunds.reduce((s, e) => s + Number(e.cost), 0)
    : null;
  const gross = cost === null ? null : revenue - cost;
  const leads = current.filter((e) => e.kind === "lead");
  const unanswered = leads.filter(
    (e) =>
      !e.payload.responded_at && !["closed", "converted"].includes(e.status),
  );
  const responses = leads
    .filter((e) => e.payload.responded_at)
    .map(
      (e) =>
        (+new Date(e.payload.responded_at) - +new Date(e.occurred_at)) / 60000,
    )
    .filter((n) => Number.isFinite(n) && n >= 0);
  const converted = leads.filter((l) =>
    sales.some(
      (s) =>
        s.payload.lead_id === l.external_id ||
        l.payload.order_id === s.external_id,
    ),
  );
  const overdue = tasks.filter(
    (t) =>
      !["completed", "verified", "cancelled", "rejected", "draft"].includes(
        t.status,
      ) && +new Date(t.due_at) < end,
  );
  const margin =
    gross === null || revenue <= 0
      ? null
      : Math.round((gross / revenue) * 1000) / 10;
  const insights: Insight[] = [];
  if (unanswered.length)
    insights.push({
      id: "unanswered",
      severity: "high",
      title: "Обращения остаются без ответа",
      fact: `${unanswered.length} обращений без подтвержденного первого ответа.`,
      action: "Проверить обращения и зафиксировать ответы в новой выгрузке.",
      limitation:
        "Отсутствие ответа в выгрузке не доказывает потерю клиента. Потенциальная выручка не рассчитана.",
      evidence: unanswered.map((e) => e.id),
      metric: "unanswered",
      value: unanswered.length,
      target: 0,
      unit: "обращений",
    });
  if (priorExpenses > 0 && expenses > priorExpenses * 1.15)
    insights.push({
      id: "expenses",
      severity: "medium",
      title: "Расходы растут быстрее ожиданий",
      fact: `${money(expenses)} против ${money(priorExpenses)} за предыдущие ${days} дней: +${Math.round((expenses / priorExpenses - 1) * 100)}%.`,
      action:
        "Проверить категории затрат и согласовать лимиты с ответственными.",
      limitation:
        "Периоды равны по длительности. Сезонность и полнота выгрузок не подтверждены.",
      evidence: current.filter((e) => e.kind === "expense").map((e) => e.id),
      metric: "expenses",
      value: expenses,
      target: priorExpenses,
      unit: "тиын",
    });
  if (margin !== null && margin < 20)
    insights.push({
      id: "margin",
      severity: margin < 0 ? "high" : "medium",
      title: "Низкая валовая маржа",
      fact: `Валовая маржа ${margin}%. Себестоимость известна для всех оплаченных продаж и возвратов.`,
      action:
        "Проверить закупочные цены и скидки. Изменения согласовать с владельцем.",
      limitation:
        "Валовая прибыль не равна чистой прибыли. Налоги и обязательства могут отсутствовать.",
      evidence: sales.map((e) => e.id),
      metric: "margin",
      value: margin,
      target: 25,
      unit: "%",
    });
  if (overdue.length)
    insights.push({
      id: "overdue",
      severity: "medium",
      title: "Задачи просрочены",
      fact: `Не завершено задач после срока: ${overdue.length}.`,
      action: "Уточнить препятствия и согласовать новые сроки.",
      limitation:
        "Завершение задачи само по себе не подтверждает финансовый эффект.",
      evidence: overdue.map((t) => t.id),
      metric: "overdue",
      value: overdue.length,
      target: 0,
      unit: "задач",
    });
  const chart = Array.from({ length: days + 1 }, (_, i) => {
    const date = dayKey(new Date(end - (days - i) * 864e5));
    const es = current.filter((e) => dayKey(e.occurred_at) === date);
    return {
      date,
      revenue: (sum(es, "sale", "paid") - sum(es, "refund", "paid")) / 100,
      expenses: sum(es, "expense", "paid") / 100,
    };
  });
  const campaigns = current
    .filter((e) => e.kind === "campaign")
    .map((c) => {
      const matched = sales.filter(
        (s) => s.payload.campaign_id === c.external_id,
      );
      return {
        id: c.id,
        name: c.payload.name || c.external_id,
        spend: c.amount,
        revenue: matched.reduce((a, e) => a + Number(e.amount), 0),
        orders: matched.length,
        views: c.payload.views || 0,
      };
    });
  const channels = Object.entries(
    sales.reduce(
      (a, e) => {
        const key = e.payload.channel || e.source;
        a[key] = (a[key] || 0) + Number(e.amount);
        return a;
      },
      {} as Record<string, number>,
    ),
  ).map(([name, value]) => ({ name, value }));
  const reviewThemes = ["ожидание", "качество", "ассортимент", "общение"]
    .map((name, i) => ({
      name,
      count: current.filter(
        (e) =>
          e.kind === "review" &&
          [
            /(долго|ждал|очеред|медлен)/i,
            /(качеств|брак)/i,
            /(ассортимент|наличи)/i,
            /(вежлив|груб|общени)/i,
          ][i].test(e.payload.text || ""),
      ).length,
    }))
    .filter((x) => x.count);
  return {
    days,
    period: { from: new Date(start).toISOString(), to: now.toISOString() },
    revenue,
    priorRevenue,
    expenses,
    priorExpenses,
    cost,
    gross,
    net: gross === null ? null : gross - expenses,
    margin,
    orders: sales.length,
    average: sales.length
      ? Math.round(sum(current, "sale", "paid") / sales.length)
      : 0,
    leads: leads.length,
    unanswered: unanswered.length,
    conversion: leads.length
      ? Math.round((converted.length / leads.length) * 1000) / 10
      : null,
    responseMinutes: responses.length
      ? Math.round(responses.reduce((a, b) => a + b, 0) / responses.length)
      : null,
    overdue: overdue.length,
    insights,
    chart,
    channels,
    campaigns,
    reviewThemes,
    coverage: {
      total: events.length,
      verified: accepted.length,
      pending: events.filter((e) => !e.verified && !e.duplicate_of).length,
    },
    forecast: {
      available: false,
      message: "Недостаточно данных для надежного прогноза",
    },
    formulas: {
      revenue: "Σ оплаченных продаж − Σ оплаченных возвратов",
      gross:
        "Выручка − известная себестоимость продаж + себестоимость возвратов",
      expenses: "Σ подтвержденных оплаченных расходов",
      conversion: "Связанные с оплатой обращения / все обращения × 100%",
      margin: "Валовая прибыль / выручка × 100%",
    },
  };
}
