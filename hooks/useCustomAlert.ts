import { useState } from 'react';

export interface CustomAlertState {
  visible: boolean;
  type: 'success' | 'error';
  title: string;
  message: string;
  showCancelButton: boolean;
  onConfirm?: () => void;
}

export const useCustomAlert = () => {
  const [customAlert, setCustomAlert] = useState<CustomAlertState>({
    visible: false,
    type: 'success',
    title: '',
    message: '',
    showCancelButton: false,
    onConfirm: undefined
  });

  const showCustomAlert = (
    type: 'success' | 'error',
    title: string,
    message: string,
    showCancelButton: boolean = false,
    onConfirm?: () => void
  ) => {
    setCustomAlert({
      visible: true,
      type,
      title,
      message,
      showCancelButton,
      onConfirm
    });
  };

  const hideCustomAlert = () => {
    setCustomAlert(prev => ({ ...prev, visible: false }));
  };

  return {
    customAlert,
    showCustomAlert,
    hideCustomAlert
  };
};
