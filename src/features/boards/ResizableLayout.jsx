import React, { useRef, useEffect, useLayoutEffect, useMemo, useCallback } from 'react';
import styled from 'styled-components';

const MIN_WIDTH = 260;        // min width cho mỗi pane
const SPLITTER_SIZE = 8;      // độ rộng thanh kéo

const getStorageKey = (boardId, paneId) =>
  `tn:pane:${boardId || 'default'}:${paneId}:width`;

function loadStoredWidth(boardId, paneId) {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(getStorageKey(boardId, paneId));
    const val = parseInt(raw, 10);
    return Number.isFinite(val) ? val : null;
  } catch {
    return null;
  }
}

function saveStoredWidth(boardId, paneId, width) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      getStorageKey(boardId, paneId),
      String(Math.round(width))
    );
  } catch {
    // ignore
  }
}

/**
 * Layout 3 pane: inbox / planner / board với thanh kéo nhẹ, tối ưu.
 *
 * Props:
 *  - boardId: để lưu width per-board
 *  - activeTabs: ['inbox','planner','board'] (từ BoardDetailPage)
 *  - inboxPane, plannerPane, boardPane: React elements
 */
export default function ResizableLayout({
  boardId,
  activeTabs,
  inboxPane,
  plannerPane,
  boardPane,
}) {
  const containerRef = useRef(null);
  const inboxRef = useRef(null);
  const plannerRef = useRef(null);
  const boardRef = useRef(null);

  // Lưu width hiện tại theo paneId (px) mà không trigger re-render
  const sizesRef = useRef({
    inbox: null,
    planner: null,
    board: null,
  });

  // Lưu state drag hiện tại
  const dragRef = useRef(null);
  const prevBodyStyleRef = useRef({ userSelect: '', cursor: '' });

  const panes = useMemo(() => {
    const arr = [];
    if (activeTabs.includes('inbox') && inboxPane) {
      arr.push({ id: 'inbox', ref: inboxRef, element: inboxPane });
    }
    if (activeTabs.includes('planner') && plannerPane) {
      arr.push({ id: 'planner', ref: plannerRef, element: plannerPane });
    }
    if (activeTabs.includes('board') && boardPane) {
      arr.push({ id: 'board', ref: boardRef, element: boardPane });
    }
    return arr;
  }, [activeTabs, inboxPane, plannerPane, boardPane]);

  const paneRefMap = {
    inbox: inboxRef,
    planner: plannerRef,
    board: boardRef,
  };

  panes.forEach(p => {
    if (!activeTabs.includes(p.id)) {
      sizesRef.current[p.id] = null;
      localStorage.removeItem(getStorageKey(boardId, p.id));
    }
  });


  /** Áp layout từ sizesRef xuống DOM (không dùng setState) */
  const applyLayout = () => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.clientWidth;
    if (!containerWidth || panes.length === 0) return;

    // Nếu chỉ 1 pane → để flex:1 là đủ
    if (panes.length === 1) {
      const onlyPane = panes[0];
      const node = paneRefMap[onlyPane.id]?.current;
      if (node) {
        node.style.flex = "1 1 auto";
        node.style.minWidth = "0";
        node.style.maxWidth = '100%';
      }
      return;
    }

    const splitterCount = panes.length - 1;
    const totalGutter = splitterCount * SPLITTER_SIZE;
    let available = containerWidth - totalGutter;
    if (available <= MIN_WIDTH * panes.length) {
      available = MIN_WIDTH * panes.length;
    }

    // Dùng sizesRef nếu có, nếu không chia đều
    const widths = [];
    let remainingPanes = panes.length;
    let remainingWidth = available;

    panes.forEach((pane, index) => {
      remainingPanes -= 1;
      const stored = sizesRef.current[pane.id] ?? loadStoredWidth(boardId, pane.id);

      let w;
      if (index === panes.length - 1) {
        // Pane cuối: nhận phần còn lại
        w = Math.max(MIN_WIDTH, remainingWidth);
      } else {
        const fallback = remainingWidth / (remainingPanes + 1);
        const maxForThis = remainingWidth - MIN_WIDTH * remainingPanes;

        w = stored ?? fallback;
        w = Math.max(MIN_WIDTH, Math.min(w, maxForThis));
        remainingWidth -= w;
      }

      widths.push(w);
    });

    panes.forEach((pane, index) => {
      const node = paneRefMap[pane.id]?.current;
      if (!node) return;
      const w = widths[index];

      sizesRef.current[pane.id] = w;

      // Flex-basis cố định theo px để tránh reflow thừa
      node.style.flex = `0 0 ${w}px`;
      node.style.minWidth = `${MIN_WIDTH}px`;
      node.style.maxWidth = '100%';
    });
  };

  /** Khởi tạo layout khi activeTabs / boardId thay đổi */
  const paneKey = useMemo(
    () => panes.map((p) => p.id).join('|'),
    [panes]
  );

  useLayoutEffect(() => {
    applyLayout();
  }, [boardId, paneKey]); // thay vì panes.length

  useEffect(() => {
    const handleResize = () => {
      applyLayout();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [paneKey]);

  /** Dọn global handler khi unmount */
  useEffect(() => {
    return () => {
      if (dragRef.current) {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startDragging = (leftId, rightId, clientX) => {
    const leftNode = paneRefMap[leftId]?.current;
    const rightNode = paneRefMap[rightId]?.current;
    if (!leftNode || !rightNode) return;

    const leftWidth = leftNode.getBoundingClientRect().width;
    const rightWidth = rightNode.getBoundingClientRect().width;

    dragRef.current = {
      leftId,
      rightId,
      startX: clientX,
      leftWidth,
      rightWidth,
    };

    // Lưu style body để restore sau
    prevBodyStyleRef.current = {
      userSelect: document.body.style.userSelect,
      cursor: document.body.style.cursor,
    };
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const throttle = (func) => {
    let inThrottle = false;
    return (...args) => {
      if (inThrottle) return;
      inThrottle = true;
      func(...args);
      requestAnimationFrame(() => {
        inThrottle = false;
      });
    };
  };

  
  const handleMouseMove = useCallback(
    throttle((e) => {
    if (!dragRef.current) return;

    
    const { leftId, rightId, startX, leftWidth, rightWidth } = dragRef.current;
    const delta = e.clientX - startX;

    const total = leftWidth + rightWidth;
    let newLeft = leftWidth + delta;
    let newRight = rightWidth - delta;

    // Clamp theo MIN_WIDTH
    if (newLeft < MIN_WIDTH) {
      newLeft = MIN_WIDTH;
      newRight = total - newLeft;
    } else if (newRight < MIN_WIDTH) {
      newRight = MIN_WIDTH;
      newLeft = total - newRight;
    }

    const leftNode = paneRefMap[leftId]?.current;
    const rightNode = paneRefMap[rightId]?.current;
    if (!leftNode || !rightNode) return;

    sizesRef.current[leftId] = newLeft;
    sizesRef.current[rightId] = newRight;

    leftNode.style.flex = `0 0 ${newLeft}px`;
    rightNode.style.flex = `0 0 ${newRight}px`;
    }, 16), 
    []
  ); 

  const handleMouseUp = () => {
    if (!dragRef.current) return;

    const { leftId, rightId } = dragRef.current;

    // Lưu width cuối cùng vào localStorage
    const leftNode = paneRefMap[leftId]?.current;
    const rightNode = paneRefMap[rightId]?.current;

    if (leftNode) {
      const w = leftNode.getBoundingClientRect().width;
      sizesRef.current[leftId] = w;
      saveStoredWidth(boardId, leftId, w);
    }
    if (rightNode) {
      const w = rightNode.getBoundingClientRect().width;
      sizesRef.current[rightId] = w;
      saveStoredWidth(boardId, rightId, w);
    }

    
    dragRef.current = null;

    // Restore body style
    document.body.style.userSelect = prevBodyStyleRef.current.userSelect;
    document.body.style.cursor = prevBodyStyleRef.current.cursor;

    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  };

  const handleSplitterMouseDown = (leftId, rightId) => (e) => {
    e.preventDefault();
    startDragging(leftId, rightId, e.clientX);
  };

  if (panes.length === 0) {
    return null;
  }

  return (
    <LayoutContainer ref={containerRef}>
      {panes.map((pane, index) => {
        const isLast = index === panes.length - 1;
        const leftId = pane.id;
        const rightId = !isLast ? panes[index + 1].id : null;

        return (
          <React.Fragment key={pane.id}>
            <PaneShell ref={pane.ref}>{pane.element}</PaneShell>
            {!isLast && (
              <Splitter
                role="separator"
                aria-orientation="vertical"
                onMouseDown={handleSplitterMouseDown(leftId, rightId)}
              >
                <SplitterGrip />
              </Splitter>
            )}
          </React.Fragment>
        );
      })}
    </LayoutContainer>
  );
}

/* ========== Styled components ========== */

const LayoutContainer = styled.div`
  display: flex;
  flex: 1;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: transparent;
`;

const PaneShell = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: ${MIN_WIDTH}px;
  max-width: 100%;
  overflow: hidden;
  border-left: ${props => props.first ? "none" : "1px solid rgba(...)"};


  &:first-child {
    border-left: none;
  }

  contain: layout style paint;
  will-change: flex-basis;
`;

const Splitter = styled.div`
  flex: 0 0 ${SPLITTER_SIZE}px;
  cursor: col-resize;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: -8px;
    right: -8px;
    top: 0;
    bottom: 0;
    cursor: col-resize;
  }

  z-index: 20;
  display: flex;
  align-items: stretch;
  justify-content: center;
  background: transparent;

  &:hover ${'' /* nhẹ hiệu ứng hover */} {
    & > div {
      background: rgba(148, 163, 184, 0.55);
    }
  }
    
`;

const SplitterGrip = styled.div`
  width: 2px;
  border-radius: 999px;
  margin: 6px 0;
  background: rgba(148, 163, 184, 0.35);
  transition: background 0.15s ease;
`;
