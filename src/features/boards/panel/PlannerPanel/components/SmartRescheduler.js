import dayjs from "dayjs";

/**
 * Lấy danh sách card quá hạn (chưa hoàn thành)
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
 * Smart Rescheduler (phiên bản nâng cấp)
 * - Rải đều task quá hạn vào 7 ngày tới
 * - Ưu tiên ngày có nhiều khoảng trống nhất
 * - Tùy chọn bỏ cuối tuần
 * - Load balancing thực sự
 */

export function buildSmartRescheduleUpdates(
  cards,
  today = dayjs(),
  {
    avoidWeekend = true,
    maxTasksPerDay = 5,
  } = {}
) {

  // 1. Lấy card quá hạn
  const overdue = getOverdueCards(cards, today);
  if (!overdue.length) return [];

  // 2. Chuẩn bị 7 ngày tới
  const next7 = [];
  const workload = {};
  const freeSlots = {};

  for (let i = 0; i < 7; i++) {
    const date = today.add(i, "day");
    const dateStr = date.format("YYYY-MM-DD");

    // Nếu tránh weekend → skip
    if (avoidWeekend && (date.day() === 0 || date.day() === 6)) {
      continue;
    }

    next7.push(dateStr);

    // Tính workload ban đầu
    const count = cards.filter(c => 
      c.due_date &&
      !c.completed &&
      dayjs(c.due_date).format("YYYY-MM-DD") === dateStr
    ).length;
    workload[dateStr] = count;
    freeSlots[dateStr] = Math.max(0, maxTasksPerDay - count);
  }

  // Nếu không còn ngày nào hợp lệ → trả về []
  if (!next7.length) return [];

  const results = [];

  // 3. Phân bổ từng card overdue
  for (const card of overdue) {

    // Sắp xếp theo freeSlots DESC, workload ASC, date ASC
    const sortedDays = [...next7].sort((a, b) => {
      if (freeSlots[b] !== freeSlots[a]) {
        return freeSlots[b] - freeSlots[a];  // nhiều chỗ trống hơn trước
      }
      if (workload[a] !== workload[b]) {
        return workload[a] - workload[b];    // công việc ít hơn trước
      }
      return a.localeCompare(b);            // ngày gần hơn trước
    });

    // Chọn ngày tốt nhất
    const best = sortedDays[0];

    // Nếu hết chỗ trống → vẫn phải xếp vào
    workload[best]++;
    freeSlots[best] = Math.max(0, freeSlots[best] - 1);

    results.push({
      cardId: card.id,
      newDate: best,
    });
  }

  return results;
}
