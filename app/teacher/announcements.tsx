import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ArrowLeft, Bell, Megaphone } from "lucide-react-native";
import { API_BASE_URL } from "../../utility/config";
import { auth } from "../../config/firebase";

export default function Announcements() {
  const router = useRouter();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          console.log("User not found");
          Alert.alert("Error", "You must be logged in to view announcements.");
          return;
        }

        // get Firebase ID token
        const idToken = await user.getIdToken();

        // send request with Authorization header
        const response = await fetch(`${API_BASE_URL}/api/announcements`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          console.error("Failed to fetch announcements:", response.status);
          return;
        }

        const data = await response.json();
        console.log("Announcements data received:", data);
        console.log(
          "Number of announcements:",
          Array.isArray(data) ? data.length : "Not an array"
        );
        setAnnouncements(data || []);
      } catch (error) {
        console.error("Error fetching announcements:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
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
      start={[0, 0]}
      end={[1, 1]}
      style={styles.container}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.title}>Announcements</Text>
        </View>

        {/* Content */}
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#a855f7" />
              <Text style={styles.loadingText}>Loading announcements...</Text>
            </View>
          ) : (
            <View style={styles.announcementsContainer}>
              {Array.isArray(announcements) && announcements.length > 0 ? (
                announcements.map((announcement, index) => (
                  <View key={index} style={styles.announcementCard}>
                    <View style={styles.announcementHeader}>
                      <Megaphone size={20} color="#a855f7" />
                      <Text style={styles.announcementTitle}>
                        {announcement.title}
                      </Text>
                    </View>
                    <Text style={styles.announcementContent}>
                      {announcement.details}
                    </Text>
                    <View style={styles.announcementMeta}>
                      <Text style={styles.announcementDate}>
                        📅 {new Date(announcement.date).toLocaleDateString()} at{" "}
                        {announcement.time}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Bell size={64} color="#d1d5db" strokeWidth={1} />
                  <Text style={styles.emptyTitle}>No Announcements</Text>
                  <Text style={styles.emptyDescription}>
                    There are no announcements available at the moment.
                  </Text>
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
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    marginTop: 28,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#374151",
    marginLeft: 12,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
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
  announcementsContainer: {
    paddingTop: 20,
  },
  announcementCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.1)",
  },
  announcementHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  announcementTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginLeft: 12,
  },
  announcementContent: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 24,
    marginBottom: 12,
  },
  announcementDate: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  announcementMeta: {
    marginTop: 8,
  },
  announcementAuthor: {
    fontSize: 12,
    color: "#8B5CF6",
    fontWeight: "500",
    marginTop: 4,
  },
  statusContainer: {
    marginTop: 12,
    alignSelf: "flex-start",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    textAlign: "center",
  },
  statusDraft: {
    backgroundColor: "#FEF3C7",
    color: "#D97706",
  },
  statusPublished: {
    backgroundColor: "#D1FAE5",
    color: "#059669",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
  },
});
