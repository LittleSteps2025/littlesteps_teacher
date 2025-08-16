import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Slot } from 'expo-router';

import { API_BASE_URL } from "../../utility/config"; // Adjust the import path as necessary
import { SafeAreaProvider } from "react-native-safe-area-context";
import { SafeAreaView } from "react-native-safe-area-context";

// export default function Layout() {
//   return (
//     <SafeAreaProvider>
//       <Slot/>
//     </SafeAreaProvider>
//   );
// }

import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import {
  Clock,
  Coffee,
  Utensils,
  Heart,
  Pill,
  Save,
  Send,
  ArrowLeft,
  Check,
  Calendar,
  User,
  LogOut,
  Users,
} from "lucide-react-native";
import { auth } from '../../config/firebase'; // your firebase config





interface ReportField {
  id: string;
  title: string;
  icon: any;
  time: string;
  description: string;
  completed: boolean;
  required: boolean;
  color: string;
}

export default function DailyReportForm() {
  // const { child_id } = useLocalSearchParams();
  const { report_id } = useLocalSearchParams();

  const [childName, setChildName] = useState("");
  const [reportDate, setReportDate] = useState(new Date().toLocaleDateString());
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  const [reportFields, setReportFields] = useState<ReportField[]>([]);
  const [specialNotes, setSpecialNotes] = useState("");
  const [dailySummary, setDailySummary] = useState("");
  const [checkoutPerson, setCheckoutPerson] = useState("");
  const [checkoutTime, setCheckoutTime] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");
  const [arrivalCompleted, setArrivalCompleted] = useState(false);

  const [guardians, setGuardians] = useState<string[]>([]);
  const [child_id, setChildId] = useState<string | null>(null);

  const totalTasks = reportFields.length + 1;
  const completedTasks =
    reportFields.filter((field) => field.completed).length +
    (arrivalCompleted ? 1 : 0);
  const progressPercentage =
    totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  useEffect(() => {
 const fetchReport = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reports/${report_id}`);
    const report = await response.json();
    setChildId(report.child_id);
    console.log("Report ID:", report_id);

    const formattedArrivalTime = report.arrived_time
      ? new Date(report.arrived_time).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        })
      : "";

    setReportFields([
      {
        id: "breakfirst",
        title: "Breakfirst",
        icon: Coffee,
        time: "",
        description: report.breakfirst || "No breakfast details recorded",
        completed: !!report.breakfirst_status,
        required: true,
        color: "#F59E0B",
      },
      {
        id: "morning_snack",
        title: "Morning snack",
        icon: Coffee,
        time: "",
        description: report.morning_snack || "No tea time details recorded",
        completed: !!report.morning_snack_status,
        required: false,
        color: "#D97706",
      },
      {
        id: "lunch",
        title: "Lunch",
        icon: Utensils,
        time: "",
        description: report.lunch || "No lunch details recorded",
        completed: !!report.lunch_status,
        required: true,
        color: "#EF4444",
      },
      {
        id: "evening_snack",
        title: "Evening Snack",
        icon: Coffee,
        time: "",
        description: report.evening_snack || "No snack time details recorded",
        completed: !!report.evening_snack_status,
        required: false,
        color: "#06B6D4",
      },
      {
        id: "medicine",
        title: "Medicine",
        icon: Pill,
        time: "",
        description:
          report.medicine === "true"
            ? "Medicine needs to be given today."
            : "No medicine for today",
        completed: !!report.medicine_status,
        required: false,
        color: "#F97316",
      },
    ]);

    setSpecialNotes(report.special_note || "");
    setDailySummary(report.day_summery || "");
    setCheckoutPerson(report.checkout_person || "");
    setCheckoutTime(report.checkout_time || "");
    setArrivalTime(formattedArrivalTime);
    setArrivalCompleted(!!report.arrived_time);
  } catch (err) {
    console.error("Failed to fetch report:", err);
  } finally {
    setLoading(false);
  }
};


    if (report_id) fetchReport();
  }, [report_id]);

  const updateField = (
    id: string,
    field: "time" | "description",
    value: string
  ) => {
    setReportFields((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const toggleComplete = (id: string) => {
    setReportFields((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  useEffect(() => {
    if (!child_id) return;
    async function fetchGuardians() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/guardians/${child_id}`);
        const data = await res.json();
        setGuardians(data.map((g: any) => g.name));
      } catch (e) {
        console.error("Failed to fetch guardians", e);
      }
    }
    fetchGuardians();
  }, [child_id]);

  
  const saveArrivalTime = async () => {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");

    const formattedTimestamp = `${year}-${month}-${day} ${hours}:${minutes}:00`;

    setArrivalTime(formattedTimestamp);
    setArrivalCompleted(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/reports/${report_id}/arrival`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ arrived_time: formattedTimestamp }),
        }
      );

      if (response.ok) {
        Alert.alert(
          "Arrival time saved",
          `Arrival time set to ${formattedTimestamp}`
        );
      } else {
        throw new Error("Failed to update arrival time");
      }
    } catch (error) {
      console.error("Error saving arrival time:", error);
      Alert.alert("Error", "Failed to save arrival time to the server.");
    }
  };


  //meka weda
const saveProgress = async () => {
const statusUpdates: { [key: string]: number | string } = {};

    reportFields.forEach((field) => {
      statusUpdates[field.id] = field.completed ? 1 : 0;
    });

    statusUpdates.progress = Math.round(progressPercentage);
    statusUpdates.day_summery = dailySummary;

    // Do NOT add report_id here because it's in the URL param
    // statusUpdates.report_id = report_id;  <-- remove this line

    console.log("Payload to send:", statusUpdates);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/reports/child/${report_id}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(statusUpdates),
        }
      );

      const text = await response.text();
      console.log("Server response text:", text);

      if (response.ok) {
        Alert.alert("Progress Saved", "Saved successfully.");
        router.back();
      } else {
        console.error("Save failed with status", response.status);
        Alert.alert("Save Failed", "Server responded with error.");
      }
    } catch (err) {
      console.error("Save error", err);
      Alert.alert("Save Failed", "An error occurred.");
    }
  };























const handleSubmit = async () => {
  console.log('llll');

  if (!checkoutPerson || !checkoutTime) {
    Alert.alert("Incomplete Checkout Details", "Please fill out both checkout person and checkout time.");
    console.log('Incomplete Checkout Details');
    return;
  }

  try {
    const user = auth.currentUser;
    if (!user) {
      console.log('User not found');
      Alert.alert("Error", "You must be logged in to submit the report.");
      return;
    }

    const idToken = await user.getIdToken();

const statusUpdates: { [key: string]: number } = {};
    reportFields.forEach((field) => {
      statusUpdates[field.id] = field.completed ? 1 : 0;
    });

    const payload = {
      statusUpdates,
      checkoutPerson,
      checkoutTime,
      progress: Math.round(progressPercentage),
      dailySummary,
      report_id,
    };

    const response = await fetch(`${API_BASE_URL}/api/reports/${report_id}/submit`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      Alert.alert("Progress Saved", "Report submitted");
      setIsSubmitted(true);
      router.back();
    } else {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to submit report");
    }
  } catch (error) {
  console.error("Submit error:", error);

  let errorMessage = "Failed to submit report.";

  if (error instanceof Error) {
    errorMessage = error.message;
  }

  Alert.alert("Error", errorMessage);
}
};





  

  

  const validateForm = () => {
    const incompleteRequired = reportFields.filter(
      (field) => field.required && !field.completed
    );
    if (!arrivalCompleted) {
      Alert.alert(
        "Arrival Not Set",
        'Please press the "Arrived" button to set arrival time.'
      );
      return false;
    }
    if (incompleteRequired.length > 0) {
      Alert.alert(
        "Incomplete Required Fields",
        `Please complete:\n${incompleteRequired.map((f) => f.title).join("\n")}`,
        [{ text: "OK" }]
      );
      return false;
    }
    return true;
  };

  const getCurrentTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={styles.loadingText}>Loading report...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
      <ScrollView style={styles.container}>
        {/* Header with Progress Bar */}
        <LinearGradient colors={["#DFC1FD", "#b279ec"]} style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <ArrowLeft color="#fff" size={24} />
            </TouchableOpacity>

            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Daily Report</Text>
              <View style={styles.headerInfo}>
                <View style={styles.headerInfoItem}>
                  <User color="#fff" size={16} />
                  <Text style={styles.headerInfoText}>{childName}</Text>
                </View>
                <View style={styles.headerInfoItem}>
                  <Calendar color="#fff" size={16} />
                  <Text style={styles.headerInfoText}>{reportDate}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressText}>
                Progress: {completedTasks}/{totalTasks} tasks completed
              </Text>
              <Text style={styles.progressPercentage}>
                {Math.round(progressPercentage)}%
              </Text>
            </View>
            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${progressPercentage}%` },
                ]}
              />
            </View>
          </View>
        </LinearGradient>

        {/* Arrival Section */}

        <View style={styles.taskCard}>
          {/* Header */}
          <View style={styles.taskHeader}>
            <View style={styles.taskHeaderLeft}>
              <View
                style={[styles.iconContainer, { backgroundColor: "#10B981" }]}
              >
                <Check size={18} color="#fff" />
              </View>
              <View>
                <Text style={styles.taskTitle}>Arrival</Text>
                <Text style={styles.taskSubtitle}>Required</Text>
              </View>
            </View>
          </View>

          {/* Content */}
          <View style={styles.taskContent}>
            <View style={styles.timeSection}>
              <Text style={styles.timeLabel}>Arrival Time:</Text>
              <Text style={styles.timeValue}>{arrivalTime || "Not set"}</Text>
            </View>

            <TouchableOpacity
              style={[
                styles.arrivalButton,
                arrivalCompleted
                  ? styles.arrivalButtonCompleted
                  : styles.arrivalButtonPrimary,
              ]}
              onPress={saveArrivalTime}
              disabled={arrivalCompleted || isSubmitted}
            >
              <Clock size={14} color="#fff" />
              <Text style={styles.arrivalButtonText}>
                {arrivalCompleted ? "Arrived ✓" : "Mark as Arrived"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Report Fields */}
        {reportFields.map((field) => (
          <View key={field.id} style={styles.taskCard}>
            <View style={styles.taskHeader}>
              <View style={styles.taskHeaderLeft}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: field.color },
                  ]}
                >
                  <field.icon size={18} color="#fff" />
                </View>
                <View>
                  <Text style={styles.taskTitle}>{field.title}</Text>
                  <Text style={styles.taskSubtitle}>
                    {field.required ? "" : ""}
                  </Text>
                </View>
              </View>
              <View style={styles.taskHeaderRight}>
                {field.id !== "medicine" && (
                  <Switch
                    value={field.completed}
                    onValueChange={() => toggleComplete(field.id)}
                    disabled={isSubmitted}
                    trackColor={{ false: "#E5E7EB", true: "#10B981" }}
                    thumbColor={field.completed ? "#fff" : "#f4f3f4"}
                  />
                )}
              </View>
            </View>

            <View style={styles.taskContent}>
              <View style={styles.dataSection}>
                <View style={styles.dataContent}>
                  {field.id === "medicine" && field.description ? (
                    <Text style={styles.dataText}>{field.description}</Text>
                  ) : field.id !== "medicine" ? (
                    <>
                      <Text style={styles.dataLabel}>Data by parent</Text>
                      <Text
                        style={styles.dataText}
                        numberOfLines={2}
                        ellipsizeMode="tail"
                      >
                        {field.description}
                      </Text>
                    </>
                  ) : null}
                </View>
              </View>
            </View>
          </View>
        ))}

        {/* Special Notes */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Special Notes</Text>
          <View style={styles.notesContainer}>
            <Text
              style={styles.notesText}
              numberOfLines={3}
              ellipsizeMode="tail"
            >
              {specialNotes || "No special notes available"}
            </Text>
          </View>
        </View>

        {/* Daily Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Daily Summary</Text>
          <TextInput
            placeholder="Enter daily summary..."
            value={dailySummary}
            onChangeText={setDailySummary}
            multiline
            editable={!isSubmitted}
            style={styles.summaryInput}
          />
        </View>

        {/* Enhanced Checkout Section */}
        <View style={styles.checkoutCard}>
          <View style={styles.checkoutHeader}>
            <View style={styles.checkoutHeaderLeft}>
              <View
                style={[styles.iconContainer, { backgroundColor: "#EF4444" }]}
              >
                <LogOut size={18} color="#fff" />
              </View>
              <View>
                <Text style={styles.cardTitle}>Checkout Information</Text>
                <Text style={styles.checkoutSubtitle}>End of day details</Text>
              </View>
            </View>
          </View>

          <View style={styles.checkoutContent}>
            <View style={styles.checkoutField}>
              <View style={styles.checkoutFieldLabelRow}>
                <Users size={14} color="#374151" />
                <Text style={styles.checkoutFieldLabelText}>Pickup Person</Text>
              </View>
              <View style={styles.pickerWrapper}>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={checkoutPerson}
                    onValueChange={(itemValue) => setCheckoutPerson(itemValue)}
                    enabled={!isSubmitted}
                    style={styles.picker}
                  >
                    <Picker.Item
                      label="Select guardian or authorized person"
                      value=""
                      color="#9CA3AF"
                    />
                    {guardians.map((guardian) => (
                      <Picker.Item
                        key={guardian}
                        label={guardian}
                        value={guardian}
                        color="#1F2937"
                      />
                    ))}
                  </Picker>
                </View>
                {checkoutPerson ? (
                  <View style={styles.selectedPersonIndicator}>
                    <Check size={14} color="#10B981" />
                    <Text style={styles.selectedPersonText}>
                      {checkoutPerson}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>

            <View style={styles.checkoutField}>
              <View style={styles.checkoutFieldLabelRow}>
                <Clock size={14} color="#374151" />
                <Text style={styles.checkoutFieldLabelText}>Checkout Time</Text>
              </View>
              <View style={styles.timeInputContainer}>
                <TextInput
                  placeholder="Enter checkout time"
                  value={checkoutTime}
                  onChangeText={setCheckoutTime}
                  editable={!isSubmitted}
                  style={styles.checkoutTimeInput}
                  placeholderTextColor="#9CA3AF"
                />
                <TouchableOpacity
                  style={styles.checkoutNowButton}
                  onPress={() => setCheckoutTime(getCurrentTime())}
                  disabled={isSubmitted}
                >
                  <Clock size={14} color="#fff" />
                  <Text style={styles.checkoutNowButtonText}>Now</Text>
                </TouchableOpacity>
              </View>
              {checkoutTime ? (
                <View style={styles.timeConfirmation}>
                  <Check size={12} color="#10B981" />
                  <Text style={styles.timeConfirmationText}>
                    Checkout scheduled for {checkoutTime}
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Checkout Summary */}
            {(checkoutPerson || checkoutTime) && (
              <View style={styles.checkoutSummary}>
                <Text style={styles.checkoutSummaryTitle}>
                  Checkout Summary
                </Text>
                <View style={styles.checkoutSummaryContent}>
                  {checkoutPerson && (
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Pickup by:</Text>
                      <Text style={styles.summaryValue}>{checkoutPerson}</Text>
                    </View>
                  )}
                  {checkoutTime && (
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Time:</Text>
                      <Text style={styles.summaryValue}>{checkoutTime}</Text>
                    </View>
                  )}
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons */}

        <View style={styles.actionButtonsContainer}>
        <TouchableOpacity
  style={[styles.actionButton, styles.saveButton]}
  onPress={saveProgress}
  disabled={isSubmitted}
>
  <Save color="#fff" size={16} />
  <Text style={styles.actionButtonText}>Save Progress</Text>
</TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              isSubmitted ? styles.actionButtonDisabled : styles.submitButton,
            ]}
            onPress={handleSubmit}
            disabled={isSubmitted}
          >
            <Send color="#fff" size={16} />
            <Text style={styles.actionButtonText}>
              {isSubmitted ? "Submitted" : "Submit Report"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkoutFieldLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 6,
  },
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#64748B",
  },
  header: {
    borderRadius: 0,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    padding: 20,
    paddingTop: 50,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 12,
    padding: 6,
  },
  headerContent: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 10,
  },
  headerInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  headerInfoItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerInfoText: {
    color: "#fff",
    marginLeft: 6,
    fontSize: 14,
    opacity: 0.9,
  },
  progressContainer: {
    marginTop: 6,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  progressText: {
    color: "#fff",
    fontSize: 13,
    opacity: 0.9,
  },
  progressPercentage: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 3,
  },
  taskCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  taskHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  taskHeaderRight: {
    marginLeft: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  taskSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 1,
  },
  taskContent: {
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 12,
  },
  dataSection: {
    marginBottom: 12,
  },
  dataLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 6,
  },
  dataContent: {
    backgroundColor: "#F9FAFB",
    borderRadius: 6,
    padding: 10,
    borderLeftWidth: 2,
    borderLeftColor: "#3B82F6",
  },
  dataText: {
    fontSize: 13,
    color: "#4B5563",
    lineHeight: 18,
  },
  timeSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  timeInputSection: {
    marginTop: 6,
  },
  timeLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#374151",
  },
  timeValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginLeft: 6,
  },
  timeInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  timeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
    backgroundColor: "#fff",
  },
  nowButton: {
    backgroundColor: "#EEF2FF",
    borderWidth: 1,
    borderColor: "#C7D2FE",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  nowButtonText: {
    color: "#8B5CF6",
    fontWeight: "600",
    fontSize: 12,
  },
  arrivalButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 8,
    gap: 6,
    marginTop: 4,
  },
  arrivalButtonPrimary: {
    backgroundColor: "#10B981",
  },
  arrivalButtonCompleted: {
    backgroundColor: "#6B7280",
  },
  arrivalButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 10,
  },
  notesContainer: {
    backgroundColor: "#F9FAFB",
    borderRadius: 6,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  notesText: {
    fontSize: 13,
    color: "#4B5563",
    lineHeight: 18,
  },
  summaryInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 6,
    minHeight: 80,
    padding: 10,
    fontSize: 14,
    textAlignVertical: "top",
    backgroundColor: "#fff",
  },
  // Enhanced Checkout Styles
  checkoutCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 3,
    borderLeftColor: "#EF4444",
  },
  checkoutHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  checkoutHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  checkoutSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 1,
  },
  checkoutContent: {
    gap: 16,
  },
  checkoutField: {
    gap: 8,
  },
  checkoutFieldLabelText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#374151",
  },
  pickerWrapper: {
    marginTop: 4,
  },
pickerContainer: {
  borderWidth: 1,
  borderColor: '#D1D5DB',
  borderRadius: 8,
  overflow: 'hidden',
  height: 50,       // Increased height (was likely too small)
  justifyContent: 'center',
},

picker: {
  height: 50,       // Match container height
  fontSize: 16,
},

  selectedPersonIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 6,
  },
  selectedPersonText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#10B981",
  },
  checkoutTimeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
    backgroundColor: "#fff",
  },
  checkoutNowButton: {
    backgroundColor: "#10B981",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginLeft: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  checkoutNowButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },
  timeConfirmation: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 6,
  },
  timeConfirmationText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#10B981",
  },
  checkoutSummary: {
    marginTop: 12,
  },
  checkoutSummaryTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  checkoutSummaryContent: {
    gap: 4,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryLabel: {
    fontSize: 13,
    color: "#6B7280",
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: "500",
    color: "#374151",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 20,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  saveButton: {
    backgroundColor: "#6366F1",
  },
  submitButton: {
    backgroundColor: "#8B5CF6",
  },
  actionButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});
