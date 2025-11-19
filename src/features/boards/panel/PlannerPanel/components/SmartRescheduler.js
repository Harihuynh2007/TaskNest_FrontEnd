import dayjs from "dayjs";

/**
 * Trả về danh sách card quá hạn (chưa completed)
 */
export function getOverdueCards(cards, today = dayjs()) {
  const base = today.startOf("day");
  return cards.filter((c) => {
    if (!c.due_date || c.completed) return false;
    const d = dayjs(c.due_date).startOf("day");
    return d.isBefore(base, "day");
  });
}

/**
 * Tính toán lịch Smart Reschedule cho các card quá hạn,
 * rải đều vào 7 ngày tới (bao gồm hôm nay).
 * 
 * @returns [{ cardId, newDate }]
 */
export function buildSmartRescheduleUpdates(cards, today = dayjs()) {
  const overdue = getOverdueCards(cards, today);
  if (!overdue.length) return [];

  const base = today.startOf("day");
  const targets = [];
  for (let i = 0; i < 7; i++) {
    targets.push(base.add(i, "day").format("YYYY-MM-DD"));
  }

  return overdue.map((card, index) => {
    const slot = targets[index % targets.length];
    return {
      cardId: card.id,
      newDate: slot,
    };
  });
}
