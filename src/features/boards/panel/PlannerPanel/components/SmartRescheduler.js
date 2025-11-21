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

  const workload = {}; 
  const next7Days = [];

  for (let i = 0; i < 7; i++) {
    const dateStr = today.add(i, "day").format("YYYY-MM-DD");
    next7Days.push(dateStr);
    // Đếm task hiện có trong ngày đó (trừ task overdue đang xét)
    workload[dateStr] = cards.filter(c => 
      c.due_date && 
      dayjs(c.due_date).format("YYYY-MM-DD") === dateStr && 
      !c.completed
    ).length;
  }

  const base = today.startOf("day");
  const targets = [];
  for (let i = 0; i < 7; i++) {
    targets.push(base.add(i, "day").format("YYYY-MM-DD"));
  }

  return overdue.map((card) => {
    // 2. Tìm ngày có ít việc nhất trong 7 ngày tới
    // Sắp xếp các ngày theo khối lượng việc tăng dần
    const sortedDays = [...next7Days].sort((a, b) => workload[a] - workload[b]);
    
    const bestDate = sortedDays[0]; // Lấy ngày ít việc nhất
    
    // Tăng biến đếm workload ảo lên để task sau không dồn vào ngày này nữa
    workload[bestDate]++;

    return {
      cardId: card.id,
      newDate: bestDate,
    };
  });
}
