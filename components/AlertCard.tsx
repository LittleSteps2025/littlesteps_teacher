import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TriangleAlert as AlertTriangle, Clock, CircleCheck as CheckCircle } from 'lucide-react-native';
import { Alert } from '@/types/index';

interface AlertCardProps {
  alert: Alert;
  onPress: () => void;
}

export default function AlertCard({ alert, onPress }: AlertCardProps) {
  const getAlertIcon = () => {
    switch (alert.type) {
      case 'overdue':
        return <AlertTriangle size={20} color="#DC2626" />;
      case 'due_soon':
        return <Clock size={20} color="#D97706" />;
      case 'payment_received':
        return <CheckCircle size={20} color="#16A34A" />;
      default:
        return <Clock size={20} color="#6B7280" />;
    }
  };

  const getAlertStyle = () => {
    switch (alert.type) {
      case 'overdue':
        return styles.overdueAlert;
      case 'due_soon':
        return styles.dueSoonAlert;
      case 'payment_received':
        return styles.paymentAlert;
      default:
        return styles.defaultAlert;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <TouchableOpacity 
      style={[
        styles.container,
        getAlertStyle(),
        !alert.isRead && styles.unreadAlert
      ]}
      onPress={onPress}
    >
      <View style={styles.iconContainer}>
        {getAlertIcon()}
      </View>
      <View style={styles.content}>
        <Text style={styles.message}>{alert.message}</Text>
        <Text style={styles.date}>{formatDate(alert.date)}</Text>
      </View>
      {!alert.isRead && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 4,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  overdueAlert: {
    backgroundColor: '#FFFBEB',
  },
  dueSoonAlert: {
    backgroundColor: '#FFFBEB',
  },
  paymentAlert: {
    backgroundColor: '#F0FDF4',
  },
  defaultAlert: {
    backgroundColor: '#FFFFFF',
  },
  unreadAlert: {
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
  },
  iconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  message: {
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 20,
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#6B7280',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563EB',
    marginLeft: 8,
    marginTop: 8,
  },
});