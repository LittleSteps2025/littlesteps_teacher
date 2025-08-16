import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  Image,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Phone,
  Shield,
  FileText,
  Eye
} from 'lucide-react-native';

const getChildDetails = () => ({
  id: 1,
  name: 'Emma Johnson',
  age: 8,
  gender: 'girl',
  profileImage: 'https://images.pexels.com/photos/1462637/pexels-photo-1462637.jpeg?auto=compress&cs=tinysrgb&w=400',
  grade: '3rd Grade',
  school: 'Sunshine Elementary',
  birthday: 'March 15, 2016',
  address: '123 Maple Street, Springfield, IL 62701',
  mother: {
    name: 'Sarah Johnson',
    phone: '+1 (555) 123-4567',
    email: 'sarah.johnson@email.com',
    workplace: 'Springfield General Hospital'
  },
  father: {
    name: 'Michael Johnson',
    phone: '+1 (555) 987-6543',
    email: 'michael.johnson@email.com',
    workplace: 'Tech Solutions Inc.'
  },
  allergies: ['Peanuts', 'Shellfish', 'Pollen'],
  medicines: ['Albuterol Inhaler (as needed)', 'Children\'s Claritin (daily)'],
  emergencyContact: {
    name: 'Grandma Rose',
    phone: '+1 (555) 456-7890',
    relation: 'Grandmother'
  }
});

export default function ChildProfile() {
  const router = useRouter();
  const [showSensitiveData, setShowSensitiveData] = useState(false);

  const child = getChildDetails();

  const getGenderColors = (gender: string) => {
    return gender === 'girl'
      ? { primary: '#ec4899', secondary: '#fce7f3', accent: '#be185d', light: '#fdf2f8' }
      : { primary: '#3b82f6', secondary: '#dbeafe', accent: '#1d4ed8', light: '#eff6ff' };
  };

  const colors = getGenderColors(child.gender);

  const handleViewSensitiveData = () => {
    Alert.alert(
      'Access Sensitive Information',
      'Are you sure you want to view details?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          onPress: () => {
            setShowSensitiveData(true);
            Alert.alert(
              'Parent Notified',
              'The parent has been notified that sensitive information was accessed.',
              [{ text: 'OK' }]
            );
          },
        },
      ]
    );
  };

  const InfoCard = ({ icon: Icon, title, content }: any) => (
    <View style={styles.infoCard}>
      <View style={[styles.iconContainer, { backgroundColor: colors.light }]}>
        <Icon size={20} color={colors.primary} />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoTitle}>{title}</Text>
        <Text style={styles.infoText}>{content}</Text>
      </View>
    </View>
  );

  const SensitiveDocument = ({ title, type, date }: any) => (
    <View style={styles.documentCard}>
      <View style={styles.documentIcon}>
        <FileText size={24} color={colors.primary} />
      </View>
      <View style={styles.documentInfo}>
        <Text style={styles.documentTitle}>{title}</Text>
        <Text style={styles.documentType}>{type}</Text>
        <Text style={styles.documentDate}>{date}</Text>
      </View>
      <TouchableOpacity style={[styles.viewButton, { backgroundColor: colors.secondary }]}>
        <Eye size={16} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient
      colors={['#DFC1FD', '#f3e8ff', '#F5ECFE', '#F5ECFE', '#e9d5ff', '#DFC1FD']}
      start={[0, 0]}
      end={[1, 1]}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.title}>Child Profile</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.profileHeader}>
            <View style={[styles.profileImageContainer, { borderColor: colors.primary }]}>
              <Image source={{ uri: child.profileImage }} style={styles.profileImage} />
              <View style={[styles.genderBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.genderText}>{child.gender === 'girl' ? '♀' : '♂'}</Text>
              </View>
            </View>
            <Text style={styles.childName}>{child.name}</Text>
            <Text style={styles.childAge}>Age {child.age}</Text>
            <View style={[styles.gradeTag, { backgroundColor: colors.secondary }]}>
              <Text style={[styles.gradeText, { color: colors.accent }]}>{child.grade}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            <InfoCard icon={Calendar} title="Birthday" content={child.birthday} />
            <InfoCard icon={MapPin} title="Address" content={child.address} />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Emergency Contact</Text>
            <View style={styles.emergencyCard}>
              <Text style={styles.emergencyName}>{child.emergencyContact.name}</Text>
              <Text style={styles.emergencyRelation}>{child.emergencyContact.relation}</Text>
              <View style={styles.contactRow}>
                <Phone size={16} color="#ef4444" />
                <Text style={[styles.contactText, { color: '#ef4444' }]}>
                  {child.emergencyContact.phone}
                </Text>
              </View>
            </View>
          </View>

          {!showSensitiveData ? (
            <View style={styles.section}>
              <TouchableOpacity
                style={[styles.sensitiveButton, { backgroundColor: colors.primary }]}
                onPress={handleViewSensitiveData}
              >
                <Shield size={20} color="white" />
                <Text style={styles.sensitiveButtonText}>View More Details</Text>
              </TouchableOpacity>
              <Text style={styles.sensitiveWarning}>
                This contains sensitive data. Once you click yes, parent will be notified.
              </Text>
            </View>
          ) : (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sensitive Documents</Text>
              <SensitiveDocument title="Birth Certificate" type="Official Document" date="Issued: March 15, 2016" />
              <SensitiveDocument title="Medical Records" type="Health Document" date="Updated: Jan 2024" />
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, marginTop: 28 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#374151' },
  placeholder: { width: 40 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 30 },
  profileHeader: { alignItems: 'center', marginBottom: 30 },
  profileImageContainer: { position: 'relative', borderWidth: 4, borderRadius: 60, padding: 4, marginBottom: 16 },
  profileImage: { width: 100, height: 100, borderRadius: 50 },
  genderBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  genderText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  childName: { fontSize: 28, fontWeight: 'bold', color: '#1f2937', marginBottom: 4 },
  childAge: { fontSize: 18, color: '#6b7280', marginBottom: 12 },
  gradeTag: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  gradeText: { fontSize: 14, fontWeight: '600' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1f2937', marginBottom: 16 },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: { flex: 1 },
  infoTitle: { fontSize: 14, fontWeight: '600', color: '#6b7280', marginBottom: 4 },
  infoText: { fontSize: 16, color: '#1f2937', lineHeight: 22 },
  sensitiveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  sensitiveButtonText: { color: 'white', fontSize: 16, fontWeight: '600', marginLeft: 8 },
  sensitiveWarning: { fontSize: 12, color: '#6b7280', textAlign: 'center', fontStyle: 'italic' },
  documentCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  documentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  documentInfo: { flex: 1 },
  documentTitle: { fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 4 },
  documentType: { fontSize: 14, color: '#6b7280', marginBottom: 2 },
  documentDate: { fontSize: 12, color: '#9ca3af' },
  viewButton: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  emergencyCard: {
    backgroundColor: '#fef2f2',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  emergencyName: { fontSize: 18, fontWeight: 'bold', color: '#dc2626', marginBottom: 4 },
  emergencyRelation: { fontSize: 14, color: '#7f1d1d', marginBottom: 8 },
  contactRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  contactText: { fontSize: 16, color: '#374151', marginLeft: 8 },
});
