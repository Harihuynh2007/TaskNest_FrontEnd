import React, { useState } from 'react';
import styled from 'styled-components';
import ReactDOM from 'react-dom';
import dayjs from 'dayjs';
import { X } from 'lucide-react';

export default function CreateCardModal({ onClose, onCreate, defaultDate }) {
  const [name, setName] = useState('');
  const [dueDate, setDueDate] = useState(defaultDate || dayjs().format('YYYY-MM-DD'));
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      await onCreate({
        name: name.trim(),
        due_date: dueDate,
        description: description.trim()
      });
    } finally {
      setSubmitting(false);
    }
  };

  const modal = (
    <Backdrop onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <h3>Create Card</h3>
          <CloseBtn onClick={onClose}><X size={20} /></CloseBtn>
        </Header>

        <Form onSubmit={handleSubmit}>
          <Field>
            <Label>Card Name *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter card name..."
              autoFocus
              required
            />
          </Field>

          <Field>
            <Label>Due Date *</Label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </Field>

          <Field>
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description..."
              rows={4}
            />
          </Field>

          <Actions>
            <CancelBtn type="button" onClick={onClose}>Cancel</CancelBtn>
            <SubmitBtn type="submit" disabled={!name.trim() || submitting}>
              {submitting ? 'Creating...' : 'Create Card'}
            </SubmitBtn>
          </Actions>
        </Form>
      </Modal>
    </Backdrop>
  );

  return ReactDOM.createPortal(modal, document.body);
}

// Styled components
const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: grid;
  place-items: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
`;

const Modal = styled.div`
  width: min(90vw, 480px);
  background: var(--surface-3, #2c3341);
  border: 1px solid var(--panel-border, #3a465e);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--panel-border, #3a465e);

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 800;
  }
`;

const CloseBtn = styled.button`
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  background: transparent;
  border: none;
  color: var(--text-secondary, #8a93a2);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: var(--surface-4, #3c4455);
    color: var(--text-primary, #e1e3e6);
  }
`;

const Form = styled.form`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 13px;
  font-weight: 700;
  color: var(--text-secondary, #8a93a2);
`;

const Input = styled.input`
  padding: 10px 12px;
  background: var(--surface-2, #1f2633);
  border: 1px solid var(--panel-border, #3a465e);
  border-radius: 8px;
  color: var(--text-primary, #e1e3e6);
  font-size: 14px;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: var(--brand-primary, #58aff6);
    box-shadow: 0 0 0 3px rgba(88, 175, 246, 0.2);
  }
`;

const Textarea = styled.textarea`
  padding: 10px 12px;
  background: var(--surface-2, #1f2633);
  border: 1px solid var(--panel-border, #3a465e);
  border-radius: 8px;
  color: var(--text-primary, #e1e3e6);
  font-size: 14px;
  resize: vertical;
  font-family: inherit;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: var(--brand-primary, #58aff6);
    box-shadow: 0 0 0 3px rgba(88, 175, 246, 0.2);
  }
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
`;

const CancelBtn = styled.button`
  padding: 10px 20px;
  background: transparent;
  border: 1px solid var(--panel-border, #3a465e);
  border-radius: 8px;
  color: var(--text-primary, #e1e3e6);
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: var(--surface-4, #3c4455);
  }
`;

const SubmitBtn = styled.button`
  padding: 10px 20px;
  background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
  border: none;
  border-radius: 8px;
  color: #fff;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
