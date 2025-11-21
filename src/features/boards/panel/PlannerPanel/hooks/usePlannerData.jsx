import { useState, useEffect, useCallback, useRef } from 'react';
import * as cardApi from '../../../../../api/cardApi';
import { toast } from 'react-hot-toast';

export const usePlannerData = (boardId) => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);
  const currentRequestRef = useRef(null);

  const loadCards = useCallback(async () => {
    if (!boardId) return;

    const requestId = Date.now();
    currentRequestRef.current = requestId;

    setLoading(true);
    setError(null);

    try {
      // ---- GỌI API MỚI CHỈ 1 LẦN ----
      const res = await cardApi.fetchPlannerData(boardId);
      const { lists = [], inbox = [] } = res.data || {};

      // ---- Chuẩn hóa dữ liệu thành 1 mảng duy nhất ----
      const mergedCards = [
        ...inbox.map(card => ({
          ...card,
          listId: null,
          listName: null
        })),
        ...lists.flatMap(lst =>
          lst.cards.map(card => ({
            ...card,
            listId: lst.id,
            listName: lst.name
          }))
        )
      ];

      if (currentRequestRef.current === requestId) {
        setCards(mergedCards);
      }

    } catch (err) {
      if (currentRequestRef.current === requestId) {
        console.error('Failed to load planner data:', err);
        setError(err.message);
        toast.error('Failed to load cards');
      }

    } finally {
      if (currentRequestRef.current === requestId) {
        setLoading(false);
      }
    }
  }, [boardId]);


  useEffect(() => {
    loadCards();
  }, [loadCards]);

  const updateCardDate = useCallback(async (cardId, newDate) => {
    const previousCards = [...cards];
    
    setCards(prev => 
      prev.map(c => c.id === cardId ? { ...c, due_date: newDate } : c)
    );

    try {
      await cardApi.updateCard(cardId, { due_date: newDate });
      toast.success('Card date updated');
    } catch (err) {
      console.error('Failed to update card date:', err);
      toast.error('Failed to update date');
      setCards(previousCards);
    }
  }, [cards]);

  const updateCardLocal = useCallback((updatedCard) => {
    setCards(prev =>
      prev.map(c => c.id === updatedCard.id ? { ...c, ...updatedCard } : c)
    );
  }, []);

  const deleteCardLocal = useCallback((cardId) => {
    setCards(prev => prev.filter(c => c.id !== cardId));
  }, []);


  const createCard = useCallback(async (data) => {
    try {
      const res = await cardApi.createInboxCard({
        name: data.name,
        due_date: data.due_date,
        description: data.description || '',
        status: data.status || 'doing',
        visibility: data.visibility || 'private',
        position: cards.length
      });

      const newCard = { 
        ...res.data, 
        listId: null, 
        listName: null 
      };
      
      setCards(prev => [...prev, newCard]);
      toast.success('Card created');
      return newCard;
    } catch (err) {
      console.error('Failed to create card:', err);
      toast.error('Failed to create card');
      throw err;
    }
  }, [cards.length]);

  const toggleCardComplete = useCallback(async (cardId) => {
    const card = cards.find(c => c.id === cardId);
    if (!card) return;

    const newStatus = !card.completed;
    const previousCards = [...cards];
    
    setCards(prev =>
      prev.map(c => c.id === cardId ? { ...c, completed: newStatus } : c)
    );

    try {
      await cardApi.updateCard(cardId, { completed: newStatus });
    } catch (err) {
      console.error('Failed to toggle completion:', err);
      toast.error('Failed to update status');
      setCards(previousCards);
    }
  }, [cards]);

  const batchUpdateDates = useCallback(async (updates) => {
    const previousCards = [...cards];
    
    const optimisticCards = cards.map(card => {
      const update = updates.find(u => u.cardId === card.id);
      return update ? { ...card, due_date: update.newDate } : card;
    });
    
    setCards(optimisticCards);
    
    try {
      await Promise.all(
        updates.map(u => cardApi.updateCard(u.cardId, { due_date: u.newDate }))
      );
      toast.success(`Updated ${updates.length} cards`);
    } catch (err) {
      console.error('Failed to batch update:', err);
      toast.error('Failed to batch update');
      setCards(previousCards);
    }
  }, [cards]);

  const onCardCreated = useCallback((card) => {
    setCards(prev => [...prev, { 
      ...card, 
      listId: card.list?.id || null,
      listName: card.list?.name || null
    }]);
  }, []);
  
  const onCardUpdated = useCallback((card) => {
    setCards(prev => prev.map(c => 
      c.id === card.id 
        ? { ...card, listId: card.list?.id || null, listName: card.list?.name || null }
        : c
    ));
  }, []);
  
  const onCardDeleted = useCallback((cardId) => {
    setCards(prev => prev.filter(c => c.id !== cardId));
  }, []);

  return {
    cards,
    loading,
    error,
    updateCardDate,
    createCard,
    toggleCardComplete,
    batchUpdateDates,
    refresh: loadCards,
    onCardCreated,
    onCardUpdated,
    onCardDeleted,
    updateCardLocal,
    deleteCardLocal,
  };
};