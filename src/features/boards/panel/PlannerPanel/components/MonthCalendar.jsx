import React, { useMemo } from "react";
import styled from "styled-components";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { motion } from "framer-motion";

dayjs.extend(isoWeek);

// Cấu hình số lượng card tối đa hiển thị mỗi ô
const MAX_CARDS_DISPLAY = 3;

export default function MonthCalendar({ 
  currentDate, 
  cards, 
  onCardClick, 
  setView,     // Nhận từ usePlannerView
  goToDate     // Nhận từ usePlannerView
}) {
  const startOfMonth = currentDate.startOf("month");
  const endOfMonth = currentDate.endOf("month");
  const startOfGrid = startOfMonth.startOf("week");
  const endOfGrid = endOfMonth.endOf("week");

  // Tạo danh sách các ngày hiển thị trong lưới
  const days = useMemo(() => {
    const arr = [];
    let d = startOfGrid;
    while (d.isBefore(endOfGrid) || d.isSame(endOfGrid, "day")) {
      arr.push(d);
      d = d.add(1, "day");
    }
    return arr;
  }, [startOfGrid, endOfGrid]);

  // Nhóm cards theo ngày
  const cardsByDate = useMemo(() => {
    const grouped = {};
    cards.forEach(card => {
      const date = card.due_date ? dayjs(card.due_date).format("YYYY-MM-DD") : null;
      if (date) {
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(card);
      }
    });
    return grouped;
  }, [cards]);

  // Hàm xử lý khi bấm vào ô ngày hoặc nút "Show more"
  const handleNavigateToDay = (e, date) => {
    e.stopPropagation(); // Ngăn sự kiện lan ra ngoài
    if (goToDate) goToDate(date);
    if (setView) setView("week");
  };

  return (
    <CalendarGrid>
      {days.map((date) => {
        const key = date.format("YYYY-MM-DD");
        const allCards = cardsByDate[key] || [];
        
        // CẮT DANH SÁCH: Chỉ lấy 3 card đầu tiên
        const visibleCards = allCards.slice(0, MAX_CARDS_DISPLAY);
        const hiddenCount = allCards.length - MAX_CARDS_DISPLAY;
        
        const isToday = date.isSame(dayjs(), "day");
        const isCurrentMonth = date.month() === currentDate.month();

        return (
          <Droppable key={key} droppableId={key} type="CARD">
            {(provided, snapshot) => (
              <DayCell
                ref={provided.innerRef}
                {...provided.droppableProps}
                $isToday={isToday}
                $isCurrentMonth={isCurrentMonth}
                $isDraggingOver={snapshot.isDraggingOver}
                // Cho phép click vào cả ô ngày để zoom in (UX option)
                onClick={(e) => handleNavigateToDay(e, date)}
              >
                <DayHeader>{date.format("D")}</DayHeader>
                <CardList>
                  {visibleCards.map((card, index) => (
                    <Draggable key={card.id} draggableId={String(card.id)} index={index}>
                      {(provided, snapshot) => (
                        <motion.div
                          layoutId={String(card.id)} 
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          whileHover={{ scale: 1.02, zIndex: 10 }}
                        >
                          <CardItem
                            $isDragging={snapshot.isDragging}
                            onClick={(e) => {
                              e.stopPropagation();
                              onCardClick(card);
                            }}
                          >
                            {card.name}
                          </CardItem>
                        </motion.div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}

                  {/* NÚT SHOW MORE - Chỉ hiện khi có card bị ẩn */}
                  {hiddenCount > 0 && (
                    <ShowMoreBtn 
                      onClick={(e) => handleNavigateToDay(e, date)}
                    >
                      + {hiddenCount} more
                    </ShowMoreBtn>
                  )}
                </CardList>
              </DayCell>
            )}
          </Droppable>
        );
      })}
    </CalendarGrid>
  );
}

// --- STYLED COMPONENTS ---

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  /* Quan trọng: giúp các ô tự giãn đều chiều cao */
  grid-auto-rows: 1fr; 
  height: 100%;
`;

const DayCell = styled.div`
  background: ${({ $isDraggingOver }) =>
    $isDraggingOver ? "rgba(59,130,246,0.12)" : "var(--surface-2, #1e293b)"};
  border: 1px solid #2b3342;
  border-radius: 10px;
  padding: 8px;
  min-height: 120px; /* Chiều cao tối thiểu */
  display: flex;
  flex-direction: column;
  transition: 0.2s ease;
  cursor: pointer; /* Thêm cursor để user biết có thể click */

  ${({ $isToday }) => $isToday && `box-shadow: 0 0 0 2px #3b82f6;`}
  ${({ $isCurrentMonth }) => !$isCurrentMonth && `opacity: 0.4;`}

  &:hover {
    background: var(--surface-3, #252f45);
  }
`;

const DayHeader = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: #94a3b8;
  margin-bottom: 6px;
  display: flex;
  justify-content: space-between;
`;

const CardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1; /* Để placeholder hoạt động đúng */
`;

const CardItem = styled.div`
  padding: 6px 8px;
  background: ${({ $isDragging }) =>
    $isDragging
      ? "linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)"
      : "var(--surface-3, #2c3341)"};
  border-radius: 6px;
  font-size: 12px;
  color: #e2e8f0;
  cursor: pointer;
  user-select: none;
  transition: 0.2s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  
  &:hover {
    background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
    color: white;
  }
`;

const ShowMoreBtn = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  padding: 4px 6px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: auto; /* Đẩy xuống đáy nếu cell quá cao */
  transition: 0.15s;

  &:hover {
    background: rgba(59, 130, 246, 0.1);
    color: #3b82f6;
  }
`;