import React from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, CalendarDays, List, Clock, Plus, CheckSquare } from "lucide-react";

export default function PlannerToolbar({
  view,
  setView,
  currentDate,
  navigate,
  onAddCard,
  showCompleted,
  setShowCompleted,
}) {
  const handlePrev = () => navigate(-1);
  const handleNext = () => navigate(1);
  const handleToday = () => navigate(0);

  const formattedRange = (() => {
    if (view === "month") return currentDate.format("MMMM YYYY");
    if (view === "week") {
      const start = currentDate.startOf("week").format("MMM D");
      const end = currentDate.endOf("week").format("MMM D, YYYY");
      return `${start} - ${end}`;
    }
    return `${currentDate.startOf("week").format("MMM D")} → ${currentDate.endOf("week").format("MMM D, YYYY")}`;
  })();

  return (
    <ToolbarWrapper>
      {/* Left section: navigation */}
      <NavSection>
        <NavButton onClick={handlePrev} aria-label="Previous">
          <ChevronLeft size={18} />
        </NavButton>
        <motion.div
          key={formattedRange}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <CurrentLabel>{formattedRange}</CurrentLabel>
        </motion.div>
        <NavButton onClick={handleNext} aria-label="Next">
          <ChevronRight size={18} />
        </NavButton>
        <TodayButton onClick={handleToday}>Today</TodayButton>
      </NavSection>

      {/* Center section: view switch */}
      <ViewSwitchGroup>
        <ViewButton
          data-active={view === "month"}
          onClick={() => setView("month")}
          aria-label="Month view"
        >
          <CalendarDays size={16} />
          <span>Month</span>
        </ViewButton>
        <ViewButton
          data-active={view === "week"}
          onClick={() => setView("week")}
          aria-label="Week view"
        >
          <List size={16} />
          <span>Week</span>
        </ViewButton>
        <ViewButton
          data-active={view === "timeline"}
          onClick={() => setView("timeline")}
          aria-label="Timeline view"
        >
          <Clock size={16} />
          <span>Timeline</span>
        </ViewButton>
      </ViewSwitchGroup>

      {/* Right section: actions */}
      <ActionSection>
        <ToggleCompleted
          type="button"
          onClick={() => setShowCompleted((v) => !v)}
          data-active={showCompleted}
          aria-pressed={showCompleted}
          aria-label="Toggle completed cards"
        >
          <CheckSquare size={16} />
          <span>Completed</span>
        </ToggleCompleted>

        <AddButton onClick={onAddCard} aria-label="Add new card">
          <Plus size={18} />
          <span>New</span>
        </AddButton>
      </ActionSection>
    </ToolbarWrapper>
  );
}

/* ---------------- STYLED COMPONENTS ---------------- */
const ToolbarWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(59, 130, 246, 0.15);
  color: #e2e8f0;
  user-select: none;
  position: sticky;
  top: 0;
  z-index: 10;
`;

const NavSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const NavButton = styled.button`
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: grid;
  place-items: center;
  background: transparent;
  border: 1px solid #2a3347;
  color: #a8b3c4;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(59, 130, 246, 0.15);
    color: #fff;
  }
`;

const CurrentLabel = styled.div`
  font-weight: 700;
  font-size: 14px;
  color: #e2e8f0;
  min-width: 150px;
  text-align: center;
`;

const TodayButton = styled.button`
  padding: 5px 10px;
  margin-left: 8px;
  border-radius: 6px;
  border: 1px solid #2a3347;
  background: transparent;
  color: #94a3b8;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: 0.2s;

  &:hover {
    background: rgba(59, 130, 246, 0.15);
    color: #fff;
  }
`;

const ViewSwitchGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(30, 41, 59, 0.7);
  border-radius: 8px;
  padding: 3px;
  border: 1px solid rgba(59, 130, 246, 0.1);
`;

const ViewButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: #94a3b8;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;

  &[data-active="true"] {
    background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
    color: #fff;
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
  }

  &:hover:not([data-active="true"]) {
    background: rgba(59, 130, 246, 0.12);
    color: #e2e8f0;
  }
`;

const ActionSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ToggleCompleted = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #2a3347;
  background: transparent;
  color: ${({ "data-active": active }) => (active ? "#3b82f6" : "#94a3b8")};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;

  &:hover {
    background: rgba(59, 130, 246, 0.15);
    color: #fff;
  }

  &[data-active="true"] {
    border-color: #3b82f6;
    background: rgba(59, 130, 246, 0.15);
  }
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
  color: #fff;
  border: none;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s;
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  }
`;
