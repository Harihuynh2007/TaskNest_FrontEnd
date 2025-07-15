
import React, { useState } from 'react'
import styled from 'styled-components'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'

export default function BoardDetailPage() {
  const [cards, setCards] = useState([
    { text: 'Add a card', completed: false },
    { text: 'Hello', completed: false },
    { text: 'test thử card', completed: false }
  ])
  const [archived, setArchived] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [showInput, setShowInput] = useState(true)

  const handleAddCard = () => {
    if (inputValue.trim() === '') return
    setCards([...cards, { text: inputValue, completed: false }])
    setInputValue('')
  }

  const onDragEnd = (result) => {
    if (!result.destination) return
    const newCards = Array.from(cards)
    const [moved] = newCards.splice(result.source.index, 1)
    newCards.splice(result.destination.index, 0, moved)
    setCards(newCards)
  }

  const toggleComplete = (index) => {
  const updated = [...cards]
  updated[index].completed = true
  setCards([...updated]) // cập nhật để hiện ✅ ngay lập tức

  setTimeout(() => {
    const fresh = [...updated]
    const [completedCard] = fresh.splice(index, 1)
    setCards(fresh)
    setArchived(prev => [...prev, completedCard])
  }, 1000) // delay 1 giây rồi mới chuyển vào archive
}


  return (
    <BoardWrapper>
      <CenterColumn>
        {showInput && (
          <CardInputWrapper>
            <Input
              placeholder="Enter a title"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <ButtonRow>
              <AddButton onClick={handleAddCard}>Add card</AddButton>
              <CancelButton onClick={() => setShowInput(false)}>Cancel</CancelButton>
            </ButtonRow>
          </CardInputWrapper>
        )}

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="cardList">
            {(provided) => (
              <CardList ref={provided.innerRef} {...provided.droppableProps}>
                {cards.map((card, index) => (
                  <Draggable key={card.text + index} draggableId={card.text + index} index={index}>
                    {(provided, snapshot) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        isDragging={snapshot.isDragging}
                      >
                        <CheckCircle
                          className="check-icon"
                          onClick={() => toggleComplete(index)}
                          title={card.completed ? 'Mark incomplete' : 'Mark complete'}
                        >
                          {card.completed ? '✅' : '○'}
                        </CheckCircle>

                        <CardText className="card-text" completed={card.completed}>
                          {card.text}
                        </CardText>

                        <EditIcon className="edit-icon" title="Edit card">✏️</EditIcon>
                      </Card>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </CardList>
            )}
          </Droppable>
        </DragDropContext>

        {/* Future archive section */}
        {/* <ArchivedList archived={archived} /> */}
      </CenterColumn>
    </BoardWrapper>
  )
}

// styled components
const BoardWrapper = styled.div`
  background: #e7effa;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  padding: 40px 16px;
`

const CenterColumn = styled.div`
  width: 100%;
  max-width: 500px;
`

const CardInputWrapper = styled.div`
  background: white;
  padding: 12px;
  border-radius: 6px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
`

const Input = styled.input`
  width: 100%;
  padding: 8px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
`

const ButtonRow = styled.div`
  margin-top: 8px;
  display: flex;
  gap: 8px;
`

const AddButton = styled.button`
  background: #0c66e4;
  color: white;
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-weight: 500;
`

const CancelButton = styled.button`
  background: none;
  border: none;
  color: #5e6c84;
  font-weight: 500;
`

const CardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const Card = styled.div`
  position: relative;
  background: white;
  padding: 10px 12px 10px 48px;
  border-radius: 6px;
  box-shadow: ${({ isDragging }) =>
    isDragging ? '0 4px 12px rgba(0, 0, 0, 0.2)' : '0 1px 3px rgba(0,0,0,0.1)'};
  border: ${({ isDragging }) => (isDragging ? '2px solid #0c66e4' : 'none')};
  transition: all 0.2s ease;
  cursor: grab;
  display: flex;
  align-items: center;

  &:hover .card-text {
    transform: translateX(8px);
  }

  &:hover .edit-icon {
    opacity: 1;
  }
`

const CardText = styled.div`
  font-size: 16px;
  transition: transform 0.2s ease;
  flex: 1;
  ${({ completed }) => completed && 'text-decoration: line-through; opacity: 0.6;'}
`


const CheckCircle = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 20px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: 0.2s;

  &:hover {
    background: #f0f0f0;
  }
`

const EditIcon = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  background: #f4f5f7;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #172b4d;
  opacity: 0;
  cursor: pointer;
  transition: 0.2s;
  box-shadow: 0 0 0 1px rgba(9, 30, 66, 0.08);

  &:hover::after {
    content: 'Edit card';
    position: absolute;
    bottom: -30px;
    right: 0;
    background: #42526e;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    white-space: nowrap;
    z-index: 10;
  }
`
