import { useState, useEffect } from 'react';

interface FeedbackMessage {
  type: "success" | "error";
  text: string;
}

export function useFeedback() {
  const [message, setMessage] = useState<FeedbackMessage | null>(null);

  // Auto-clear messages after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const showSuccess = (text: string) => {
    setMessage({ type: "success", text });
  };

  const showError = (text: string) => {
    setMessage({ type: "error", text });
  };

  const clearMessage = () => {
    setMessage(null);
  };

  return {
    message,
    showSuccess,
    showError,
    clearMessage
  };
}