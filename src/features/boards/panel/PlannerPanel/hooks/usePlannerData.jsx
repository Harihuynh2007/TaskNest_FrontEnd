import { useState, useEffect, useCallback } from 'react';
import * as cardApi from '../../../../../api/cardApi';
import { fetchCardsByList, fetchInboxCards } from '../../../../../api/cardApi';
import { fetchLists } from '../../../../../api/listApi';
import { toast } from 'react-hot-toast';

export const usePlannerData = (boardId) => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load all cards from board + inbox
  const loadCards = useCallback(async () => {
    if (!boardId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // 1. Fetch all lists
      const listsRes = await fetchLists(boardId);
      const lists = listsRes.data || [];
      
      // 2. Fetch cards from each list
      const listCardsPromises = lists.map(list => 
        fetchCardsByList(list.id).then(res => ({
          listId: list.id,
          listName: list.name,
          cards: res.data || []
        }))
      );
      
      const listCardsResults = await Promise.all(listCardsPromises);
      
      // 3. Fetch inbox cards
      const inboxRes = await fetchInboxCards();
      const inboxCards = (inboxRes.data || []).map(card => ({
        ...card,
        list: null
      }));
      
      // 4. Combine all cards
      const allCards = [
        ...inboxCards,
        ...listCardsResults.flatMap(result => 
          result.cards.map(card => ({
            ...card,
            list: { id: result.listId, name: result.listName }
          }))
        )
      ];
      
      setCards(allCards);
    } catch (err) {
      console.error('Failed to load planner cards:', err);
      setError(err.message);
      toast.error('Failed to load cards');
    } finally {
      setLoading(false);
    }
  }, [boardId]);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  // Update card date
  const updateCardDate = useCallback(async (cardId, newDate) => {
    // Optimistic update
    setCards(prev => 
      prev.map(c => c.id === cardId ? { ...c, due_date: newDate } : c)
    );

    try {
      await cardApi.updateCard(cardId, { due_date: newDate });
      toast.success('Card date updated');
    } catch (err) {
      console.error('Failed to update card date:', err);
      toast.error('Failed to update date');
      // Rollback
      loadCards();
    }
  }, [loadCards]);

  // Create new card
  const createCard = useCallback(async (data) => {
    try {
      const res = await cardApi.createInboxCard({
        name: data.name,
        due_date: data.due_date,
        status: 'doing',
        visibility: 'private'
      });

      const newCard = { ...res.data, list: null };
      setCards(prev => [...prev, newCard]);
      toast.success('Card created');
      return newCard;
    } catch (err) {
      console.error('Failed to create card:', err);
      toast.error('Failed to create card');
      throw err;
    }
  }, []);

  // Toggle card completion
  const toggleCardComplete = useCallback(async (cardId) => {
    const card = cards.find(c => c.id === cardId);
    if (!card) return;

    const newStatus = !card.completed;
    
    // Optimistic update
    setCards(prev =>
      prev.map(c => c.id === cardId ? { ...c, completed: newStatus } : c)
    );

    try {
      await cardApi.updateCard(cardId, { completed: newStatus });
    } catch (err) {
      console.error('Failed to toggle completion:', err);
      toast.error('Failed to update status');
      // Rollback
      setCards(prev =>
        prev.map(c => c.id === cardId ? { ...c, completed: !newStatus } : c)
      );
    }
  }, [cards]);

  return {
    cards,
    loading,
    error,
    updateCardDate,
    createCard,
    toggleCardComplete,
    refresh: loadCards
  };
};