import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  Linking,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import {
  ArrowLeft,
  Phone,
  Calendar,
  MapPin,
  User,
  Eye,
  EyeOff,
  Users,
} from "lucide-react-native";
import axios from "axios";
import { API_BASE_URL } from "../../utility/config";
import { useLocalSearchParams, useRouter } from "expo-router";

import { auth } from "../../config/firebase"; // adjust import path
import { getIdToken } from "firebase/auth";
import { useUser } from "../../contexts/UserContext";
import { sendParentNotification } from "../../fcm";

interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

interface MedicalReport {
  type: string;
  title: string;
  description: string;
}

interface Child {
  child_id: string;
  name: string;
  age: number;
  group_name: string;
  parent_phone: string;
  gender: "male" | "female";
  dob: string;
  address: string;
  emergency_notes: string;
  emergency_contact: EmergencyContact;
  image?: string;
}

const ChildPage: React.FC = () => {
  const { childId } = useLocalSearchParams();
  const router = useRouter();
  const user = useUser();
  const [child, setChild] = useState<Child | null>(null);
  const [emergencyNotes, setEmergencyNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSensitiveData, setShowSensitiveData] = useState(false);

  const [bloodType, setBloodType] = useState("");
  const [allergies, setAllergies] = useState("");
  const [medicalReports, setMedicalReports] = useState<MedicalReport[]>([]);
  const [loadingSensitive, setLoadingSensitive] = useState(false);

  const getColorScheme = (gender: string) => {
    switch (gender) {
      case "female":
        return { ring: "#60A5FA", accent: "#2563EB" };
      case "male":
        return { ring: "#F472B6", accent: "#DB2777" };
      default:
        return { ring: "#C084FC", accent: "#9333EA" };
    }
  };

  const fetchChild = useCallback(async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/teachers/child/${childId}`
      );
      setChild(res.data);
      setEmergencyNotes(res.data.emergency_notes || "");
    } catch (error) {
      Alert.alert("Error", "Failed to fetch child data");
    } finally {
      setLoading(false);
    }
  }, [childId]);
  useEffect(() => {
    if (childId) {
      fetchChild();
    }
  }, [childId, fetchChild]);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      console.log("Current user at mount:", user.uid);
    } else {
      console.log("No current user at mount");
    }
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        console.log("User signed in:", user.uid);
      } else {
        console.log("User not signed in");
      }
    });

    return unsubscribe;
  }, []);

  const handleSave = async () => {
    console.log("asa");
    if (!child) {
      console.log("No child found, returning");
      return;
    }

    console.log("Child exists:", child.child_id);

    const user = auth.currentUser;
    if (!user) {
      console.log("No user found");
      Alert.alert("Error", "User not authenticated");
      return;
    }
    console.log("User found:", user.uid);
    // const user = auth.currentUser;
    if (!user) {
      console.log("No user found");
      Alert.alert("Error", "User not authenticated");
      return;
    }
    console.log("User found:", user.uid);

    setSaving(true);
    console.log("Saving set to true");
    setSaving(true);
    console.log("Saving set to true");

    try {
      let token;
      try {
        token = await getIdToken(user);
        console.log("Firebase Token:", token);
        Alert.alert("handleSave called");
      } catch (tokenError) {
        console.error("Error getting token:", tokenError);
        Alert.alert("Error", "Failed to get auth token.");
        setSaving(false);
        return; // stop further execution
      }

      console.log("Child IDdddddd");

      await axios.post(
        `${API_BASE_URL}/api/child/${child.child_id}/notes`,
        { emergency_notes: emergencyNotes },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("aaaaaaaaaa:");
      Alert.alert("Success", "Emergency notes updated successfully.");
      setChild({ ...child, emergency_notes: emergencyNotes });
    } catch (error) {
      console.error("Error saving emergency note:", error);
      Alert.alert("Error", "Failed to update emergency notes.");
    } finally {
      setSaving(false);
      console.log("Saving set to false");
    }
  };

  const handleCallContact = () => {
    Linking.openURL(`tel:${child?.parent_phone}`);
  };

  const handleCallEmergencyContact = () => {
    if (child?.emergency_contact?.phone) {
      Linking.openURL(`tel:${child.emergency_contact.phone}`);
    }
  };

  const fetchSensitiveData = async () => {
    if (!childId) return;
    setLoadingSensitive(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/child/${childId}/sensitive`
      );
      const data = response.data;
      console.log("Sensitive Data:", response.data);

      setBloodType(data.blood_type || "");
      setAllergies(data.allergies || "");
      setMedicalReports((data.medical_records as MedicalReport[]) || []);
    } catch (error) {
      console.error("Error fetching sensitive data:", error);
      Alert.alert("Error", "Failed to load sensitive data.");
    } finally {
      setLoadingSensitive(false);
    }
  };

  const toggleSensitiveData = async () => {
    if (!showSensitiveData) {
      await fetchSensitiveData();

      // Send notification to parent when sensitive data is accessed
      if (child?.child_id && child?.name) {
        try {
          const teacherName = user?.user?.fullName || "A teacher";
          await sendParentNotification(
            child.child_id,
            child.name,
            teacherName,
            "sensitive_data_access"
          );
        } catch (error) {
          console.error("Error sending notification:", error);
          // Continue even if notification fails
        }
      }
    }
    setShowSensitiveData(!showSensitiveData);
  };

  if (loading || !child) {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator size="large" color="#9333EA" />
      </SafeAreaView>
    );
  }

  const colorScheme = getColorScheme(child.gender);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F5ECFE" }}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeft color="#444" size={20} />
          </TouchableOpacity>
          <Text style={styles.headerText}></Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.profileSection}>
          <Image
            source={
              child.image && child.image.trim() !== ""
                ? { uri: child.image }
                : require("../../assets/images/default_profile.webp")
            }
            style={styles.profileImage}
            onError={() =>
              console.log("Failed to load image for child:", child.name)
            }
          />
          <Text style={styles.name}>{child.name}</Text>
          <Text style={styles.age}>Age {child.age}</Text>
          <Text style={[styles.group, { color: colorScheme.accent }]}>
            {child.group_name}
          </Text>
        </View>

        <View style={styles.card}>
          <Phone color="#9333EA" size={18} />
          <View style={styles.cardContent}>
            <Text style={styles.cardLabel}>Contact Number</Text>
            <TouchableOpacity onPress={handleCallContact}>
              <Text style={styles.cardValue}>{child.parent_phone}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <Calendar color="#DB2777" size={18} />
          <View style={styles.cardContent}>
            <Text style={styles.cardLabel}>Birthday</Text>
            <Text style={styles.cardValue}>{child.dob}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <MapPin color="#9333EA" size={18} />
          <View style={styles.cardContent}>
            <Text style={styles.cardLabel}>Address</Text>
            <Text style={styles.cardValue}>{child.address}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Users color="#2563EB" size={18} />
          <View style={styles.cardContent}>
            <Text style={styles.cardLabel}>Gender</Text>
            <Text style={styles.cardValue}>
              {child.gender.charAt(0).toUpperCase() + child.gender.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.notesCard}>
          <Text style={styles.notesTitle}>Emergency Notes</Text>
          <TextInput
            value={emergencyNotes}
            onChangeText={setEmergencyNotes}
            multiline
            placeholder="Enter emergency notes..."
            style={styles.notesInput}
          />
          <View style={styles.notesButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setEmergencyNotes(child.emergency_notes)}
              disabled={saving}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, saving && { opacity: 0.7 }]}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.saveText}>
                {saving ? "Saving..." : "Save"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.viewMoreButton}
          onPress={toggleSensitiveData}
        >
          {showSensitiveData ? (
            <EyeOff color="#fff" size={18} />
          ) : (
            <Eye color="#fff" size={18} />
          )}
          <Text style={styles.viewMoreText}>
            {showSensitiveData ? "Hide Sensitive Details" : "View More Details"}
          </Text>
        </TouchableOpacity>

        {showSensitiveData && (
          <View style={styles.sensitiveDataContainer}>
            <View style={styles.warningBanner}>
              <Text style={styles.warningText}>⚠️ Sensitive Information</Text>
              <Text style={styles.warningSubtext}>
                Parent will be notified of this access
              </Text>
            </View>

            {loadingSensitive ? (
              <ActivityIndicator size="large" color="#9333EA" />
            ) : (
              <>
                {/* 🩸 Blood Type & Allergies */}
                <View style={styles.additionalInfoCard}>
                  <Text style={styles.sectionTitle}>Health Details</Text>
                  <Text style={styles.infoText}>
                    Blood Type:{" "}
                    <Text style={styles.infoBold}>{bloodType || "N/A"}</Text>
                  </Text>
                  <Text style={styles.infoText}>
                    Allergies:{" "}
                    <Text style={styles.infoBold}>{allergies || "None"}</Text>
                  </Text>
                </View>

                {/* 🏥 Medical Reports */}
                <View style={styles.additionalInfoCard}>
                  <Text style={styles.sectionTitle}>Medical Reports</Text>
                  {medicalReports.length > 0 ? (
                    medicalReports.map((report, index) => (
                      <View key={index} style={styles.documentCard}>
                        <Text style={styles.detailLabel}>{report.type}</Text>
                        <Text style={styles.detailValue}>{report.title}</Text>
                        <Text style={{ color: "#666", marginTop: 4 }}>
                          {report.description}
                        </Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.infoText}>
                      No medical reports found.
                    </Text>
                  )}
                </View>
              </>
            )}
          </View>
        )}

        <Text style={styles.footerNote}>
          This contains sensitive data. When you view details, parent will be
          notified.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5ECFE",
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 22,
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatarRing: {
    borderWidth: 4,
    padding: 6,
    borderRadius: 999,
    marginBottom: 10,
  },
  avatar: {
    backgroundColor: "#E5E7EB",
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    color: "#222",
  },
  age: {
    color: "#666",
    marginVertical: 2,
  },
  group: {
    fontWeight: "600",
  },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  cardContent: {
    marginLeft: 10,
  },
  cardLabel: {
    fontSize: 12,
    color: "#888",
  },
  cardValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  notesCard: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 16,
    marginTop: 10,
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  notesInput: {
    backgroundColor: "#F3F4F6",
    padding: 10,
    borderRadius: 10,
    minHeight: 80,
    textAlignVertical: "top",
  },
  notesButtons: {
    flexDirection: "row",
    marginTop: 10,
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#EEE",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelText: {
    color: "#333",
    fontWeight: "500",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#9333EA",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  saveText: {
    color: "#FFF",
    fontWeight: "600",
  },
  viewMoreButton: {
    flexDirection: "row",
    backgroundColor: "#DB2777",
    padding: 14,
    marginTop: 20,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  viewMoreText: {
    color: "#FFF",
    fontWeight: "600",
  },
  sensitiveDataContainer: {
    marginTop: 16,
  },
  warningBanner: {
    backgroundColor: "#FEF3C7",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
  },
  warningText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#92400E",
    marginBottom: 4,
  },
  warningSubtext: {
    fontSize: 12,
    color: "#92400E",
  },
  emergencyContactCard: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  detailContent: {
    marginLeft: 10,
    flex: 1,
  },
  detailLabel: {
    fontSize: 17,
    color: "#888",
    marginBottom: 2,
    fontWeight: "600",
  },
  detailValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
  },
  phoneLink: {
    color: "#9333EA",
    textDecorationLine: "underline",
  },
  additionalInfoCard: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  infoBold: {
    fontWeight: "600",
    color: "#333",
  },
  documentCard: {
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  footerNote: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 30,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
});

export default ChildPage;
