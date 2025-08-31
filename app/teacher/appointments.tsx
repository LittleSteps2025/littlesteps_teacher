import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MessageSquare,
  Send,
  User,
  X,
  CircleCheck as CheckCircle,
  CircleAlert as AlertCircle,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { API_BASE_URL } from '../../utility/config';
import { auth } from '../../config/firebase';

interface Appointment {
  id: string;
  childName: string;
  meetingDate: string;
  meetingTime: string;
  reason: string;
  status: 'pending' | 'responded' | 'completed';
  response?: string;
  parentName: string;
}

// Status helpers moved outside component for optimization
const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return '#f59e0b';
    case 'responded':
      return '#3b82f6';
    case 'completed':
      return '#10b981';
    default:
      return '#6b7280';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return <AlertCircle size={16} color="#f59e0b" />;
    case 'responded':
      return <MessageSquare size={16} color="#3b82f6" />;
    case 'completed':
      return <CheckCircle size={16} color="#10b981" />;
    default:
      return <Clock size={16} color="#6b7280" />;
  }
};

export default function AppointmentsView() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);

const fetchAppointments = async () => {
  setLoading(true);
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      Alert.alert('Error', 'You must be logged in to view appointments.');
      setLoading(false);
      return;
    }

    const idToken = await currentUser.getIdToken();
    console.log("token", idToken);

    const res = await fetch(`${API_BASE_URL}/api/appointments/view`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'Failed to fetch appointments');
    }

    const data = await res.json();

    // Normalize keys to match your frontend model
    const formattedAppointments = data.map((a: any) => ({
      id: a.id,
      meetingDate: a.meetingdate || "",
      meetingTime: a.meetingtime || "",
      reason: a.reason || "",
      response: a.response || "",
      childName: a.childname || "",
      parentName: a.name || "",
      status: a.status || "pending",
    }));

    setAppointments(formattedAppointments);
  } catch (error: any) {
    Alert.alert('Error', error.message || 'Failed to fetch appointments.');
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchAppointments();
  }, []);

  const isDateUpcoming = (dateStr: string) => {
    const appointmentDate = new Date(dateStr);
    const today = new Date();
    appointmentDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return appointmentDate >= today;
  };

const formatDate = (dateString: string) => {
  if (!dateString) return "Unknown"; // safety
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Unknown"; // invalid date fallback

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};



const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};



  const openAppointmentDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setResponseText(appointment.response || '');
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedAppointment(null);
    setResponseText('');
  };

  const handleSubmitResponse = async () => {
    if (!selectedAppointment || !responseText.trim()) {
      Alert.alert('Error', 'Please enter a response before submitting.');
      return;
    }

    setIsSubmittingResponse(true);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('Not logged in');

      const idToken = await currentUser.getIdToken();

      const res = await fetch(`${API_BASE_URL}/api/appointments/respond/${selectedAppointment.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ response: responseText.trim() }),
      });

      if (!res.ok) throw new Error('Failed to submit response');

      // Update local state
      const updatedAppointments = appointments.map((a) =>
        a.id === selectedAppointment.id
          ? { ...a, status: 'responded', response: responseText.trim() }
          : a
      );
      setAppointments(updatedAppointments);
      setSelectedAppointment((prev) =>
        prev ? { ...prev, status: 'responded', response: responseText.trim() } : null
      );

      setIsSubmittingResponse(false);
      Alert.alert('Success', 'Response submitted successfully!');
    } catch (error: any) {
      setIsSubmittingResponse(false);
      Alert.alert('Error', error.message || 'Failed to submit response.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </SafeAreaView>
    );
  }

  return (
    <LinearGradient
      colors={['#DFC1FD', '#f3e8ff', '#F5ECFE', '#F5ECFE', '#e9d5ff', '#DFC1FD']}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.headerContainer}>
           <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
      <ArrowLeft color="#000" size={24} />
    </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Appointments</Text>
            <Text style={styles.subtitle}>Manage parent meetings and consultations</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.listContainer}>
          {appointments.length === 0 && (
            <Text style={{ textAlign: 'center', marginTop: 50, color: '#6b7280' }}>
              No appointments found.
            </Text>
          )}
          {appointments.map((appointment) => {
            const statusColor = getStatusColor(appointment.status);
            const isUpcoming = isDateUpcoming(appointment.meetingDate);

            return (
              <TouchableOpacity
                key={appointment.id}
                onPress={() => openAppointmentDetails(appointment)}
                activeOpacity={0.7}
                style={styles.appointmentCard}
              >
                <View style={styles.appointmentIconContainer}>
                  <View style={[styles.iconCircle, { backgroundColor: statusColor + '15' }]}>
                    <User size={24} color={statusColor} />
                  </View>
                </View>

                <View style={styles.appointmentContent}>
                  <Text style={styles.childName}>{appointment.childName}</Text>
                  <Text style={styles.parentName}>Group: {appointment.parentName}</Text>
                 <Text style={styles.appointmentDateTime}>
  {formatDate(appointment.meetingDate)} • {appointment.meetingTime}
</Text>
                  <Text style={styles.appointmentReason} numberOfLines={2}>
                    {appointment.reason}
                  </Text>
                </View>

                <View style={styles.appointmentStatusContainer}>
                  <View style={[styles.statusBadge, { backgroundColor: statusColor + '15' }]}>
                    {getStatusIcon(appointment.status)}
                    <Text style={[styles.statusText, { color: statusColor }]}>
                      {appointment.status}
                    </Text>
                  </View>
                  <Text style={styles.arrow}>→</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Appointment Details Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={closeModal}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Appointment Details</Text>
                <Pressable onPress={closeModal} style={styles.modalCloseBtn}>
                  <X size={20} color="#6b7280" />
                </Pressable>
              </View>

              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
              >
                <ScrollView contentContainerStyle={styles.modalContent}>
                  {selectedAppointment && (
                    <>
                      <View
                        style={[
                          styles.modalIconCircle,
                          { backgroundColor: getStatusColor(selectedAppointment.status) + '15' },
                        ]}
                      >
                        <User size={36} color={getStatusColor(selectedAppointment.status)} />
                      </View>

                      <Text style={styles.modalAppointmentTitle}>
                        Meeting with {selectedAppointment.parentName}
                      </Text>

                      <View style={styles.detailRow}>
                        <User size={24} color="#6b7280" />
                        <View style={styles.detailText}>
                          <Text style={styles.detailLabel}>Child Name</Text>
                          <Text style={styles.detailValue}>{selectedAppointment.childName}</Text>
                        </View>
                      </View>

                      <View style={styles.detailRow}>
                        <Calendar size={24} color="#6b7280" />
                        <View style={styles.detailText}>
                          <Text style={styles.detailLabel}>Meeting Date</Text>
                          <Text style={styles.detailValue}>
  {formatDate(selectedAppointment.meetingDate)}
</Text>
                        </View>
                      </View>

                      <View style={styles.detailRow}>
                        <Clock size={24} color="#6b7280" />
                        <View style={styles.detailText}>
                          <Text style={styles.detailLabel}>Meeting Time</Text>
                          <Text style={styles.detailValue}>{selectedAppointment.meetingTime}</Text>
                        </View>
                      </View>

                      <View style={styles.detailRow}>
                        <CheckCircle size={24} color="#6b7280" />
                        <View style={styles.detailText}>
                          <Text style={styles.detailLabel}>Status</Text>
                          <Text
                            style={[
                              styles.detailValue,
                              { color: getStatusColor(selectedAppointment.status) },
                            ]}
                          >
                            {selectedAppointment.status.charAt(0).toUpperCase() +
                              selectedAppointment.status.slice(1)}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.reasonContainer}>
                        <Text style={styles.detailLabel}>Reason for Meeting</Text>
                        <Text style={styles.reasonText}>{selectedAppointment.reason}</Text>
                      </View>

                      {/* Response Section */}
                      <View style={styles.responseContainer}>
                        <Text style={styles.responseLabel}>Your Response</Text>

                        {selectedAppointment.response && selectedAppointment.status !== 'pending' ? (
                          <View style={styles.existingResponseContainer}>
                            <Text style={styles.existingResponseText}>
                              {selectedAppointment.response}
                            </Text>
                            <View style={styles.responseStatusBadge}>
                              <CheckCircle size={16} color="#10b981" />
                              <Text style={styles.responseStatusText}>Response Sent</Text>
                            </View>
                          </View>
                        ) : (
                          <>
                            <TextInput
                              style={styles.responseInput}
                              placeholder="Type your response to the parent..."
                              placeholderTextColor="#9ca3af"
                              value={responseText}
                              onChangeText={setResponseText}
                              multiline
                              numberOfLines={4}
                              textAlignVertical="top"
                            />

                            <TouchableOpacity
                              activeOpacity={0.8}
                              style={[
                                styles.submitButton,
                                (!responseText.trim() || isSubmittingResponse) &&
                                  styles.submitButtonDisabled,
                              ]}
                              onPress={handleSubmitResponse}
                              disabled={!responseText.trim() || isSubmittingResponse}
                            >
                              {isSubmittingResponse ? (
                                <ActivityIndicator size="small" color="#fff" />
                              ) : (
                                <>
                                  <Send size={20} color="#fff" />
                                  <Text style={styles.submitButtonText}>Send Response</Text>
                                </>
                              )}
                            </TouchableOpacity>
                          </>
                        )}
                      </View>
                    </>
                  )}
                </ScrollView>
              </KeyboardAvoidingView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

// --- Styles remain unchanged ---
const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 20,
  },
  backButton: {
    paddingRight: 12,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 29,
    fontWeight: 'bold',
    color: '#000',
  },
  subtitle: {
    color: '#000',
    fontSize: 14,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 48,
    marginTop: 30,
  },
  appointmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#f9fafb',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  appointmentIconContainer: {
    marginRight: 12,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appointmentContent: {
    flex: 1,
  },
  childName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  parentName: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  appointmentDateTime: {
    fontSize: 13,
    color: '#4b5563',
    marginTop: 4,
  },
  appointmentReason: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    lineHeight: 16,
  },
  appointmentStatusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  arrow: {
    fontSize: 18,
    color: '#9ca3af',
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: '85%',
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#374151',
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    paddingBottom: 40,
  },
  modalIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 12,
  },
  modalAppointmentTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
  },
  detailText: {
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '700',
  },
  reasonContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
  },
  reasonText: {
    fontSize: 16,
    color: '#1f2937',
    lineHeight: 24,
    marginTop: 4,
  },
  responseContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  responseLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  existingResponseContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  existingResponseText: {
    fontSize: 14,
    color: '#1f2937',
    marginBottom: 8,
  },
  responseStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  responseStatusText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
    marginLeft: 4,
  },
  responseInput: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    fontSize: 14,
    color: '#1f2937',
    marginBottom: 12,
    minHeight: 80,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7c3aed',
    borderRadius: 12,
    paddingVertical: 12,
  },
  submitButtonDisabled: {
    backgroundColor: '#a78bfa',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
});
