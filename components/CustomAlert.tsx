import { images } from '@/assets/images/images';
import React from 'react';
import {
    Image,
    Modal,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface CustomAlertProps {
  visible: boolean;
  type: 'success' | 'error';
  title: string;
  message: string;
  onClose: () => void;
  onConfirm?: () => void;
  showCancelButton?: boolean;
  confirmText?: string;
  cancelText?: string;
}

export default function CustomAlert({
  visible,
  type,
  title,
  message,
  onClose,
  onConfirm,
  showCancelButton = false,
  confirmText = 'OK',
  cancelText = 'Cancel'
}: CustomAlertProps) {
  const getAlertConfig = () => {
    switch (type) {
      case 'success':
        return {
          image: images.success,
          colors: ['#10b981', '#34d399'],
          iconColor: '#10b981',
          buttonColor: '#10b981'
        };
      case 'error':
        return {
          image: images.error,
          colors: ['#ef4444', '#f87171'],
          iconColor: '#ef4444',
          buttonColor: '#ef4444'
        };
      default:
        return {
          image: images.success,
          colors: ['#6b7280', '#9ca3af'],
          iconColor: '#6b7280',
          buttonColor: '#6b7280'
        };
    }
  };

  const config = getAlertConfig();

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View 
        className="flex-1 justify-center items-center px-6"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      >
        <View
          className="bg-white rounded-3xl p-6 w-full max-w-sm"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 20,
          }}
        >
          {/* Alert Image */}
          <View className="items-center mb-6">
            <View className="relative">
              <Image
                source={config.image}
                style={{
                  width: 80,
                  height: 80,
                  resizeMode: 'contain'
                }}
              />
              {/* Glow effect */}
              <View
                className="absolute inset-0 rounded-full"
                style={{
                  backgroundColor: config.iconColor,
                  opacity: 0.1,
                  transform: [{ scale: 1.2 }]
                }}
              />
            </View>
          </View>

          {/* Title */}
          <Text className="text-2xl font-bold text-gray-800 text-center mb-3">
            {title}
          </Text>

          {/* Message */}
          <Text className="text-base text-gray-600 text-center mb-8 leading-6">
            {message}
          </Text>

          {/* Buttons */}
          <View className={`${showCancelButton ? 'flex-row space-x-3' : ''}`}>
            {showCancelButton && (
              <TouchableOpacity
                onPress={onClose}
                className="flex-1 py-3 rounded-xl border border-gray-300"
                style={{
                  backgroundColor: '#f9fafb'
                }}
              >
                <Text className="text-center text-gray-700 font-semibold text-base">
                  {cancelText}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() => {
  onClose();    // Always close the alert first
  if (onConfirm) onConfirm();  // Then call confirm action if exists
}}
              className={`py-3 rounded-xl ${showCancelButton ? 'flex-1' : 'w-full'}`}
              style={{
                backgroundColor: config.buttonColor,
                shadowColor: config.buttonColor,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4
              }}
            >
              <Text className="text-center text-white font-semibold text-base">
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
