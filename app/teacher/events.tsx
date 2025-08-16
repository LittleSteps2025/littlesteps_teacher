import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  ArrowLeft,
  Calendar,
  Car,
  CheckCircle,
  Clock,
  Dumbbell,
  MapPin,
  Palette,
  Users,
  X,
} from 'lucide-react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { API_BASE_URL } from "../../utility/config";

export default function EventListAndDetail() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const isDateUpcoming = (eventDateStr) => {
    const eventDate = new Date(eventDateStr);
    const today = new Date();
    eventDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return eventDate >= today;
  };

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/events`)
      .then((res) => res.json())
      .then((data) => {
        const mappedEvents = data.map((e, index) => ({
          id: String(index + 1),
          title: e.topic,
          description: e.description,
          date: e.date,
          time: e.time,
          location: e.venue,
          type: 'meeting',
          status: isDateUpcoming(e.date) ? 'upcoming' : 'completed',
        }));
        setEvents(mappedEvents);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching events:', error);
        setLoading(false);
      });
  }, []);

  const openEventDetails = (event) => {
    setSelectedEvent(event);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedEvent(null);
  };


const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
};



  const getEventIcon = (type, size = 24, color = '#000') => {
    switch (type) {
      case 'sports':
        return <Dumbbell size={size} color={color} />;
      case 'meeting':
        return <Users size={size} color={color} />;
      case 'exhibition':
        return <Palette size={size} color={color} />;
      case 'outing':
        return <Car size={size} color={color} />;
      default:
        return <Calendar size={size} color={color} />;
    }
  };

  const getEventColor = (type) => {
    switch (type) {
      case 'sports':
        return '#10b981';
      case 'meeting':
        return '#3b82f6';
      case 'exhibition':
        return '#f59e0b';
      case 'outing':
        return '#8b5cf6';
      default:
        return '#6b7280';
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
    <LinearGradient colors={[ "#DFC1FD",
        "#f3e8ff",
        "#F5ECFE",
        "#F5ECFE",
        "#e9d5ff",
        "#DFC1FD",]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft color="#000" size={24} />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Daycare Events</Text>
            <Text style={styles.subtitle}>Stay updated with upcoming activities</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.listContainer}>
          {events.map((item) => {
            const eventColor = getEventColor(item.type);
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => openEventDetails(item)}
                activeOpacity={0.7}
                style={styles.eventCard}
              >
                <View style={styles.eventIconContainer}>
                  <View style={[styles.iconCircle, { backgroundColor: eventColor + '15' }]}>
                    {getEventIcon(item.type, 24, eventColor)}
                  </View>
                </View>

                <View style={styles.eventContent}>
                  <Text style={styles.eventTitle}>{item.title}</Text>
                  <Text style={styles.eventDateTime}>
                    {formatDate(item.date)} • {item.time}
                  </Text>
                  <Text style={styles.eventLocation}>{item.location}</Text>
                </View>

                <View style={styles.eventStatusContainer}>
                  <View
                    style={[
                      styles.statusBadge,
                      item.status === 'upcoming' ? styles.statusUpcoming : styles.statusCompleted,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        item.status === 'upcoming' ? styles.statusTextUpcoming : styles.statusTextCompleted,
                      ]}
                    >
                      {item.status}
                    </Text>
                  </View>
                  <Text style={styles.arrow}>→</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Event Details Modal */}
        <Modal animationType="slide" transparent={true} visible={isModalVisible} onRequestClose={closeModal}>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Event Details</Text>
                <Pressable onPress={closeModal} style={styles.modalCloseBtn}>
                  <X size={20} color="#6b7280" />
                </Pressable>
              </View>

              <ScrollView contentContainerStyle={styles.modalContent}>
                {selectedEvent && (
                  <>
                    <View
                      style={[
                        styles.modalIconCircle,
                        { backgroundColor: getEventColor(selectedEvent.type) + '15' },
                      ]}
                    >
                      {getEventIcon(selectedEvent.type, 36, getEventColor(selectedEvent.type))}
                    </View>
                    <Text style={styles.modalEventTitle}>{selectedEvent.title}</Text>

                    <View style={styles.detailRow}>
                      <Calendar size={24} color="#6b7280" />
                      <View style={styles.detailText}>
                        <Text style={styles.detailLabel}>Date</Text>
<Text style={styles.detailValue}>{formatDate(selectedEvent.date)}</Text>
                      </View>
                    </View>

                    <View style={styles.detailRow}>
                      <Clock size={24} color="#6b7280" />
                      <View style={styles.detailText}>
                        <Text style={styles.detailLabel}>Time</Text>
                        <Text style={styles.detailValue}>{selectedEvent.time}</Text>
                      </View>
                    </View>

                    <View style={styles.detailRow}>
                      <MapPin size={24} color="#6b7280" />
                      <View style={styles.detailText}>
                        <Text style={styles.detailLabel}>Location</Text>
                        <Text style={styles.detailValue}>{selectedEvent.location}</Text>
                      </View>
                    </View>

                    <View style={styles.detailRow}>
                      <CheckCircle size={24} color="#6b7280" />
                      <View style={styles.detailText}>
                        <Text style={styles.detailLabel}>Status</Text>
                        <Text
                          style={[
                            styles.detailValue,
                            selectedEvent.status === 'upcoming'
                              ? styles.statusGreenText
                              : styles.statusGrayText,
                          ]}
                        >
                          {selectedEvent.status.charAt(0).toUpperCase() + selectedEvent.status.slice(1)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.descriptionContainer}>
                      <Text style={styles.detailLabel}>Description</Text>
                      <Text style={styles.descriptionText}>{selectedEvent.description}</Text>
                    </View>
                  </>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 20
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
    marginTop:30
  },
  eventCard: {
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
  eventIconContainer: { marginRight: 12 },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventContent: { flex: 1 },
  eventTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  eventDateTime: {
    fontSize: 13,
    color: '#4b5563',
    marginTop: 2,
  },
  eventLocation: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  eventStatusContainer: { alignItems: 'flex-end' },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 4,
  },
  statusUpcoming: { backgroundColor: '#ede9fe' },
  statusCompleted: { backgroundColor: '#f3f4f6' },
  statusText: { fontSize: 10, fontWeight: '600' },
  statusTextUpcoming: { color: '#7c3aed' },
  statusTextCompleted: { color: '#4b5563' },
  arrow: { fontSize: 18, color: '#9ca3af' },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: '75%',
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
  modalContent: { paddingBottom: 40 },
  modalIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 12,
  },
  modalEventTitle: {
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
  detailText: { marginLeft: 12 },
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
  statusGreenText: {
    color: '#16a34a',
  },
  statusGrayText: {
    color: '#4b5563',
  },
  descriptionContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 20,
    padding: 16,
  },
  descriptionText: {
    fontSize: 16,
    color: '#1f2937',
    lineHeight: 24,
  },
});
