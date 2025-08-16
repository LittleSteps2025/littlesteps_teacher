import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FileText, ArrowLeft } from "lucide-react-native";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "../../../utility/config";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Children() {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/reports`);
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
      <ScrollView
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <ArrowLeft size={24} color="#374151" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Today child reports</Text>
          </View>

          {loading ? (
            <ActivityIndicator
              size="large"
              color="#8B5CF6"
              style={{ marginTop: 20 }}
            />
          ) : (
            <View style={styles.content}>
              {Array.isArray(children) &&
                children.map((child) => (
                  <View key={child.child_id} style={styles.childCard}>
                    <View style={styles.childHeader}>
                      <Image
                        source={{
                          uri:
                            child.avatar || "https://via.placeholder.com/50",
                        }}
                        style={styles.avatar}
                      />
                      <View style={styles.childInfo}>
                        <Text style={styles.childName}>
                          {child.child_name}
                        </Text>
                        <Text style={styles.childDetails}>
                          {child.child_age} years • {child.child_group} Group
                        </Text>
                      </View>
                      <View style={styles.progressContainer}>
                        <Text style={styles.progressText}>
                          {child.progress}%
                        </Text>
                        <View style={styles.progressBar}>
                          <View
                            style={[
                              styles.progressFill,
                              { width: `${child.progress || 0}%` },
                            ]}
                          />
                        </View>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={styles.reportButton}
                      onPress={() =>
                        router.push(
                          `/teacher/daily-report-form?report_id=${child.report_id}`
                        )
                      }
                      activeOpacity={0.8}
                    >
                      <FileText size={16} color="#8B5CF6" strokeWidth={2} />
                      <Text style={styles.reportButtonText}>View Report</Text>
                    </TouchableOpacity>
                  </View>
                ))}

              {Array.isArray(children) && children.length === 0 && (
                <Text
                  style={{
                    textAlign: "center",
                    color: "#6B7280",
                    fontSize: 16,
                    marginTop: 40,
                  }}
                >
                  No reports for today
                </Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerTitle: {
    fontSize: 27,
    fontWeight: "700",
    color: "#000000",
  },
  content: {
    flex: 1,
    paddingHorizontal: 12,
    marginTop: 56,
  },
  childCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  childHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
  },
  childDetails: {
    fontSize: 13,
    color: "#6B7280",
  },
  progressContainer: {
    alignItems: "flex-end",
  },
  progressText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8B5CF6",
    marginBottom: 4,
  },
  progressBar: {
    width: 50,
    height: 3,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#8B5CF6",
    borderRadius: 2,
  },
  reportButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 8,
  },
  reportButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1F2937",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
});
