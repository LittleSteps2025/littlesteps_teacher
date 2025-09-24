import {
  View,
  Text,
  Alert,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FileText, ArrowLeft, Clock, Users } from "lucide-react-native";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "../../utility/config";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from '../../config/firebase';

export default function Children() {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          console.log("User not found");
          Alert.alert("Error", "You must be logged in to view the reports.");
          return;
        }

        // get Firebase ID token
        const idToken = await user.getIdToken();

        // send request with Authorization header
        const response = await fetch(`${API_BASE_URL}/api/reports/allreports`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          console.error("Failed to fetch reports:", response.status);
          return;
        }

        const data = await response.json();
        setChildren(data);
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <LinearGradient
      colors={[
        "#DFC1FD",
        "#f3e8ff",
        "#F5ECFE",
        "#F5ECFE",
        "#e9d5ff",
        "#DFC1FD",
      ]}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.backButton}
              >
                <ArrowLeft size={24} color="#374151" />
              </TouchableOpacity>
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle}>Today's Reports</Text>
                <Text style={styles.headerSubtitle}>{formatDate()}</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.showAllButton}
                onPress={() => router.push('/teacher/all-reports')}
                activeOpacity={0.8}
              >
                <Clock size={14} color="#8B5CF6" strokeWidth={2} />
                <Text style={styles.showAllButtonText}>Show All</Text>
              </TouchableOpacity>
            </View>

            {/* Stats Card */}
            <View style={styles.statsCard}>
              <View style={styles.statItem}>
                <Users size={20} color="#8B5CF6" strokeWidth={2} />
                <Text style={styles.statNumber}>{children.length}</Text>
                <Text style={styles.statLabel}>Reports Today</Text>
              </View>
            </View>
          </View>

          {/* Content Section */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#8B5CF6" />
              <Text style={styles.loadingText}>Loading reports...</Text>
            </View>
          ) : (
            <View style={styles.content}>
              {Array.isArray(children) && children.length > 0 ? (
                children.map((child, index) => (
                  <View key={child.child_id} style={[
                    styles.childCard,
                    { 
                      marginTop: index === 0 ? 0 : 12,
                      transform: [{ scale: 1 }] 
                    }
                  ]}>
                    <View style={styles.childHeader}>
                      <View style={styles.avatarContainer}>
                        <Image
                          source={{
                            uri: child.avatar || "https://via.placeholder.com/60",
                          }}
                          style={styles.avatar}
                        />
                        <View style={styles.onlineIndicator} />
                      </View>
                      <View style={styles.childInfo}>
                        <Text style={styles.childName}>{child.child_name}</Text>
                        <Text style={styles.childDetails}>
                          {child.child_age} years • {child.group_name} Group
                        </Text>
                      </View>
                    </View>

                    <View style={styles.buttonContainer}>
                      <TouchableOpacity
                        style={styles.reportButton}
                        onPress={() =>
                          router.push(
                            `/teacher/daily-report-form?report_id=${child.report_id}`
                          )
                        }
                        activeOpacity={0.8}
                      >
                        <FileText size={16} color="#FFFFFF" strokeWidth={2} />
                        <Text style={styles.reportButtonText}>View Report</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <View style={styles.emptyIcon}>
                    <FileText size={48} color="#D1D5DB" strokeWidth={1} />
                  </View>
                  <Text style={styles.emptyTitle}>No Reports Today</Text>
                  <Text style={styles.emptyDescription}>
                    No daily reports have been generated for today yet.
                  </Text>
                  <TouchableOpacity
                    style={styles.emptyButton}
                    onPress={() => router.push('/teacher/all-reports')}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.emptyButtonText}>View All Reports</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
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
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
  },
  actionButtons: {
    alignItems: "flex-end",
    marginBottom: 20,
  },
  showAllButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  showAllButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8B5CF6",
  },
  statsCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1F2937",
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  content: {
    paddingHorizontal: 16,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
  },
  childCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.1)",
  },
  childHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: "#F3F4F6",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    backgroundColor: "#10B981",
    borderRadius: 8,
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  childDetails: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
    fontWeight: "500",
  },
  reportStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    backgroundColor: "#10B981",
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: "#059669",
    fontWeight: "600",
  },
  buttonContainer: {
    marginTop: 8,
  },
  reportButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#8B5CF6",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  reportButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    backgroundColor: "#F9FAFB",
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
});