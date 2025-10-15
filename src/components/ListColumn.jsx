import React from 'react';
import styled from 'styled-components';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import CardItem from './Card/sections/CardItem';
import { Dropdown } from 'react-bootstrap';
import { BsThreeDots } from 'react-icons/bs';

function ListColumn({
  list,
  $background, 
  $textColor,
  textColor,
  cardInput,
  setCardInputs,
  activeCardInput,
  setActiveCardInput,
  onAddCard,
  onEditClick,
  onCheckClick,
  onCardClick,
  onListDeleted,
  hideEmptyCards = false,
}) {
  const handleInputChange = (e) => {
    setCardInputs((prev) => ({ ...prev, [list.id]: e.target.value }));
  };

  const handleAddCard = (e) => {
    e.preventDefault(); // ✅ ngăn reload khi submit form
    onAddCard(list.id); // giữ nguyên logic của bạn
  };


  const isInputActive = activeCardInput === list.id;
  const hasCards = Array.isArray(list.cards) && list.cards.length > 0;

  return (
    <Wrapper $background={$background}>
      <Header $textColor={$textColor}>
        <HeaderTitle>{list.name}</HeaderTitle>

        <Dropdown align="end" flip={false}>
          <Dropdown.Toggle as={MenuButton} id={`dropdown-list-${list.id}`}>
            <BsThreeDots />
          </Dropdown.Toggle>
          <Menu
            container={document.body}
            renderOnMount
            popperConfig={{ strategy: 'fixed' }}
          >
            <MenuHeader>
              List actions
              <CloseX onClick={(e)=> {
                // đóng menu khi bấm X
                const btn = document.getElementById(`dropdown-list-${list.id}`);
                btn && btn.click();
              }}>×</CloseX>
            </MenuHeader>

            <MenuItem onClick={() => setActiveCardInput(list.id)}>Add card</MenuItem>
            <MenuItem onClick={() => {/* TODO: copy */}}>Copy list</MenuItem>
            <MenuItem onClick={() => {/* TODO: move */}}>Move list</MenuItem>
            <MenuItem onClick={() => {/* TODO: watch */}}>Watch</MenuItem>

            <Divider />

            <MenuSectionTitle>Change list color</MenuSectionTitle>
            <UpsellCard>
              <strong>Upgrade to change list colors</strong>
              <div>List colors can make your board fun and help organize your board visually.</div>
              <a href="#">Start free trial</a>
            </UpsellCard>

            <Divider />

            <MenuSectionTitle>Automation</MenuSectionTitle>
            <MenuItem onClick={() => {/* TODO */}}>When a card is added to the list…</MenuItem>
            <MenuItem onClick={() => {/* TODO sort modal */}}>Every day, sort list by…</MenuItem>
            <MenuItem onClick={() => {/* TODO */}}>Every Monday, sort list by…</MenuItem>
            <MenuItem onClick={() => {/* TODO rule modal */}}>Create a rule</MenuItem>

            <Divider />

            <MenuItem onClick={() => {/* TODO: archive */}}>Archive this list</MenuItem>
            <MenuItem
              className="text-danger"
              onClick={() => onListDeleted(list.id, list.name, list.cards)}
            >
              Delete this list…
            </MenuItem>
          </Menu>
        </Dropdown>
      </Header>

      {/* ✅ Vùng thả cho các card */}
      <Droppable droppableId={`list-${list.id}`} type="CARD">
        {(provided, snapshot) => (
          <CardList
            ref={provided.innerRef}
            {...provided.droppableProps}
            $isDraggingOver={snapshot.isDraggingOver} // dùng transient prop
          >
            {list.cards?.map((card, index) => {
              const safeId = card?.id ?? `temp-${index}`;
              return (
                <Draggable
                  key={`card-${safeId}`}
                  draggableId={`card-${safeId}`}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <CardItem
                        draggingOver={snapshot.draggingOver}
                        card={card}
                        index={index}
                        isDragging={snapshot.isDragging}
                        onEditClick={(e) => onEditClick(e, card, index)}
                        onCheckClick={() => onCheckClick(card.id)}
                        onCardClick={onCardClick}
                      />
                    </li>
                  )}
                </Draggable>
              );
            })}
            {provided.placeholder}
            
            {/* ✅ Thêm card mới */}
            {isInputActive ? (
              <li>
                <CardComposerForm onSubmit={handleAddCard}>
                  <StyledTextarea
                    value={cardInput}
                    onChange={handleInputChange}
                    placeholder="Enter a title or paste a link"
                    autoFocus
                  />
                  <CardComposerActions>
                    <AddCardButton type="submit">Add card</AddCardButton>
                    <CancelButton type="button" onClick={() => setActiveCardInput(null)}>✕</CancelButton>
                  </CardComposerActions>
                </CardComposerForm>
              </li>
            ) : (
              <AddCardBtn onClick={() => setActiveCardInput(list.id)}>+ Add a card</AddCardBtn>
            )}
          </CardList>
        )}
      </Droppable>
    </Wrapper>
  );
}

export default React.memo(ListColumn);

// 💅 Styled components
const HeaderTitle = styled.div`
  font-size: 16px;
  font-weight: 700;
  margin: 0;
  padding: 4px 8px;
  flex: 1 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  border-radius: 8px;
  &:focus-visible {
    outline: 2px solid rgba(59,130,246,.6);
    outline-offset: 2px;
  }
`;


const MenuButton = styled.button.attrs({ 'aria-label': 'Open list actions' })`
  background: transparent;
  border: none;
  padding: 6px;
  border-radius: 8px;
  cursor: pointer;
  color: inherit;
  flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  transition: background .2s ease, transform .06s ease;
  &:hover { background: rgba(59,130,246,0.12); }
  &:active { transform: translateY(1px); }
  &:focus-visible {
    outline: 2px solid rgba(59,130,246,.6);
    outline-offset: 2px;
  }
`;


const Wrapper = styled.div`
  min-width: 260px;
  background: ${({ $background }) =>
    $background ||
    'rgba(13, 17, 23, 0.6)'}; /* glass dark */
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
`;

const Header = styled.h3`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  color: ${({ $textColor }) => $textColor || '#E5E7EB'};
  gap: 8px;
`;


const CardList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 40px;

  background: ${({ $isDraggingOver }) =>
    $isDraggingOver
      ? 'linear-gradient(135deg, rgba(59,130,246,.10), rgba(6,182,212,.10))'
      : 'transparent'};

  border-radius: 10px;
  transition: background .2s ease;
  width: 100%;
  overflow-y: auto;

  /* Scrollbar tinh gọn */
  scrollbar-width: thin;
  scrollbar-color: rgba(148,163,184,.5) transparent;
  &::-webkit-scrollbar { width: 8px; }
  &::-webkit-scrollbar-thumb {
    background: rgba(148,163,184,.45);
    border-radius: 6px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(148,163,184,.7);
  }
`;



const AddCardBtn = styled.button.attrs({ 'aria-label': 'Add card' })`
  margin-top: 8px;
  background: transparent;
  border: none;
  color: #E5E7EB;
  font-weight: 500;
  cursor: pointer;
  text-align: left;
  padding: 8px 10px;
  border-radius: 8px;
  width: 100%;
  transition: background .2s ease;

  &:hover {
    background: rgba(59,130,246,0.12);
  }
  &:focus-visible {
    outline: 2px solid rgba(59,130,246,.6);
    outline-offset: 2px;
  }
`;


const CardComposerForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const StyledTextarea = styled.textarea`
  width: 100%;
  min-height: 56px;
  padding: 10px 12px;
  font-size: 14px;
  border: none;
  border-radius: 10px;
  resize: none;
  color: #E5E7EB;
  background: rgba(2,6,23,.6);
  box-shadow: inset 0 0 0 2px rgba(59,130,246,.35);
  outline: none;
  transition: box-shadow .2s ease, background .2s ease;
  &::placeholder { color: rgba(226,232,240,.6); }
  &:focus {
    background: rgba(2,6,23,.75);
    box-shadow: inset 0 0 0 2px rgba(59,130,246,.75),
                0 0 0 3px rgba(59,130,246,.20);
  }
`;

const CardComposerActions = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;


const AddCardButton = styled.button`
  background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
  color: white;
  padding: 8px 14px;
  font-size: 14px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
  transition: transform .05s ease, filter .2s ease, background .2s ease;
  &:hover {
    background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
    filter: brightness(1.02);
  }
  &:active { transform: translateY(1px); }
  &:focus-visible {
    outline: 2px solid rgba(59,130,246,.6);
    outline-offset: 2px;
  }
`;

const CancelButton = styled.button.attrs({ title: 'Cancel' })`
  background: transparent;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #94A3B8;
  border-radius: 8px;
  padding: 6px 8px;
  transition: background .2s ease, color .2s ease;
  &:hover { background: rgba(59,130,246,0.12); color: #E5E7EB; }
  &:focus-visible {
    outline: 2px solid rgba(59,130,246,.6);
    outline-offset: 2px;
  }
`;




// đặt gần cuối file ListColumn.jsx, chung chỗ các styled components khác
const Menu = styled(Dropdown.Menu)`
  min-width: 304px;
  padding: 0;
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 14px;
  box-shadow: 0 8px 24px rgba(9,30,66,.35), 0 0 0 1px rgba(9,30,66,.18);
  overflow: hidden;
  background: rgba(13,17,23,.96);
  color: #E5E7EB;
`;

const MenuHeader = styled.div`
  position: sticky; top: 0;
  display: flex; align-items: center; justify-content: center;
  padding: 12px 16px;
  background: rgba(2,6,23,.9);
  font-weight: 700; color: #E5E7EB; font-size: 14px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
`;

const CloseX = styled.button`
  position: absolute; right: 8px; top: 8px;
  background: transparent; border: 0; border-radius: 8px; padding: 6px;
  cursor: pointer; color: #94A3B8;
  transition: background .2s ease, color .2s ease;
  &:hover { background: rgba(59,130,246,0.12); color: #E5E7EB; }
`;

const MenuSectionTitle = styled.div`
  padding: 10px 12px 4px;
  font-size: 12px; font-weight: 700; color: #94A3B8;
  text-transform: uppercase;
`;

const Divider = styled.div`
  height: 1px; background: rgba(255,255,255,0.08); margin: 8px 0;
`;

const MenuItem = styled(Dropdown.Item)`
  padding: 10px 12px; font-size: 14px; color: #E5E7EB;
  &:hover, &:focus { background: rgba(59,130,246,0.12); color: #FFFFFF; }
`;

const UpsellCard = styled.div`
  margin: 4px 12px 8px; padding: 12px;
  background: rgba(2,6,23,.7); border: 1px dashed rgba(59,130,246,.35);
  border-radius: 10px; color: #CBD5E1;
  font-size: 12px; line-height: 1.45;
  a { color: #93c5fd; text-decoration: underline; }
`;

