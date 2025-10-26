import { useReducer, useCallback } from 'react';
import { validateField } from '../utils/validation';

const initialState = {
  email: '',
  password: '',
  confirm: '',
  remember: false,
  errors: { email: '', password: '', confirm: '' },
  touched: { email: false, password: false, confirm: false },
  isSubmitting: false,
  apiError: null,
};

const formReducer = (state, action) => {
  switch (action.type) {
    case 'FIELD_CHANGE':
      return { ...state, [action.fieldName]: action.payload };
    
    case 'SET_ERROR':
      return {
        ...state,
        errors: { ...state.errors, [action.fieldName]: action.payload }
      };
    
    case 'SET_TOUCHED':
      return {
        ...state,
        touched: { ...state.touched, [action.fieldName]: true }
      };
    
    case 'SUBMIT_START':
      return { ...state, isSubmitting: true, apiError: null };
    
    case 'SUBMIT_SUCCESS':
      return { ...state, isSubmitting: false };
    
    case 'SUBMIT_ERROR':
      return { ...state, isSubmitting: false, apiError: action.payload };
    
    case 'VALIDATE_ALL':
      return {
        ...state,
        errors: action.payload,
        touched: { email: true, password: true, confirm: true }
      };
    
    case 'RESET':
      return initialState;
    
    default:
      return state;
  }
};

/**
 * Custom hook for auth form logic
 * @param {string} mode - 'login' or 'register'
 * @param {Function} onSubmit - Async function to handle submission
 */
export function useAuthForm(mode, onSubmit) {
  const isLogin = mode === 'login';
  const [state, dispatch] = useReducer(formReducer, initialState);

  // ==================== Field Handlers ====================
  
  const handleFieldChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    dispatch({ type: 'FIELD_CHANGE', fieldName: name, payload: fieldValue });

    // Real-time validation for touched fields
    if (state.touched[name]) {
      const error = validateField(name, fieldValue, state.password);
      dispatch({ type: 'SET_ERROR', fieldName: name, payload: error });
    }
  }, [state.touched, state.password]);

  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;
    dispatch({ type: 'SET_TOUCHED', fieldName: name });
    
    const error = validateField(name, value, state.password);
    dispatch({ type: 'SET_ERROR', fieldName: name, payload: error });
  }, [state.password]);

  // ==================== Form Validation ====================
  
  const validateForm = useCallback(() => {
    const emailError = validateField('email', state.email);
    const passwordError = validateField('password', state.password);
    const confirmError = isLogin ? '' : validateField('confirm', state.confirm, state.password);

    const errors = { email: emailError, password: passwordError, confirm: confirmError };
    dispatch({ type: 'VALIDATE_ALL', payload: errors });

    return !emailError && !passwordError && !confirmError;
  }, [state.email, state.password, state.confirm, isLogin]);

  // ==================== Form Submission ====================
  
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    dispatch({ type: 'SUBMIT_START' });

    try {
      await onSubmit({
        email: state.email,
        password: state.password,
        remember: state.remember
      });
      
      dispatch({ type: 'SUBMIT_SUCCESS' });
    } catch (err) {
      dispatch({ type: 'SUBMIT_ERROR', payload: err.message });
    }
  }, [validateForm, onSubmit, state.email, state.password, state.remember]);

  // ==================== Reset Form ====================
  
  const resetForm = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  // ==================== Clear API Error ====================
  
  const clearApiError = useCallback(() => {
    dispatch({ type: 'SUBMIT_ERROR', payload: null });
  }, []);

  return {
    // State
    formData: {
      email: state.email,
      password: state.password,
      confirm: state.confirm,
      remember: state.remember,
    },
    errors: state.errors,
    touched: state.touched,
    isSubmitting: state.isSubmitting,
    apiError: state.apiError,
    
    // Handlers
    handleFieldChange,
    handleBlur,
    handleSubmit,
    resetForm,
    clearApiError,
  };
}