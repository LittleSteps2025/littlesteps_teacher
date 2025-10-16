// fcm.js - Teacher App
import { Platform, PermissionsAndroid } from "react-native";
import Constants from "expo-constants";
import { API_BASE_URL } from "./utility/config";

// Call at app start
export async function setupFCM() {
  try {
    // Check if we're in Expo Go (FCM won't work in Expo Go)
    const isExpoGo = Constants.executionEnvironment === "storeClient";

    if (isExpoGo) {
      console.log(
        "FCM: Skipping setup in Expo Go. Use development build for FCM."
      );
      return null;
    }

    console.log("FCM: Setting up Firebase Cloud Messaging for Teacher App...");

    // Dynamically import Firebase messaging to avoid initialization issues
    const { default: messaging } = await import(
      "@react-native-firebase/messaging"
    );

    // On Android 13+ we need runtime 'POST_NOTIFICATIONS' permission
    if (Platform.OS === "android" && Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log("FCM: Notification permission denied");
        return null;
      }
    }

    // Request permission (iOS will ask user)
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
      console.log("FCM: Push permission not granted");
      return null;
    }

    // Get FCM token (this is the raw FCM device token)
    const fcmToken = await messaging().getToken();
    console.log("FCM: Teacher app token obtained:", fcmToken);

    // Subscribe to token refresh
    messaging().onTokenRefresh((token) => {
      console.log("FCM: Teacher app token refreshed:", token);
      // TODO: send updated token to your backend
    });

    // Listen for incoming messages (for teacher notifications)
    messaging().onMessage(async (remoteMessage) => {
      console.log("FCM: Teacher app message received:", remoteMessage);
      // Handle foreground messages here
    });

    return fcmToken;
  } catch (error) {
    console.warn("FCM: Teacher app setup failed:", error.message);
    console.warn(
      "FCM: Make sure you're using a development build, not Expo Go"
    );
    return null;
  }
}

// Function to send notification to parent
export async function sendParentNotification(
  childId,
  childName,
  teacherName,
  notificationType = "sensitive_data_access",
  checkoutPerson = "",
  checkoutTime = ""
) {
  try {
    console.log(
      "FCM: Sending parent notification for child:",
      childId,
      "type:",
      notificationType
    );

    // Get parent's FCM token from backend
    const response = await fetch(
      `${API_BASE_URL}/api/teachers/child/${childId}/parent-token`
    );
    if (!response.ok) {
      throw new Error(`Failed to get parent token: ${response.status}`);
    }

    const data = await response.json();
    const parentToken = data.fcm_token;

    if (!parentToken) {
      console.log("FCM: No FCM token found for parent");
      return false;
    }

    console.log("FCM: Got parent token, sending notification...");

    // Configure notification based on type
    let title, body, dataPayload;

    if (notificationType === "checkout") {
      title = "Child Checkout";
      body = `${childName} has been checked out by ${checkoutPerson || "authorized person"} at ${checkoutTime || "end of day"}`;
      dataPayload = {
        type: "child_checkout",
        childId: childId,
        childName: childName,
        teacherName: teacherName,
        checkoutPerson: checkoutPerson,
        checkoutTime: checkoutTime,
        timestamp: new Date().toISOString(),
      };
    } else {
      // Default: sensitive data access
      title = "Child Information Accessed";
      body = `${teacherName} accessed sensitive information for ${childName}`;
      dataPayload = {
        type: "sensitive_data_access",
        childId: childId,
        childName: childName,
        teacherName: teacherName,
        timestamp: new Date().toISOString(),
      };
    }

    // Send notification via backend
    const notificationResponse = await fetch(
      `${API_BASE_URL}/api/send-notification`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: parentToken,
          title: title,
          body: body,
          data: dataPayload,
        }),
      }
    );

    if (!notificationResponse.ok) {
      throw new Error(
        `Failed to send notification: ${notificationResponse.status}`
      );
    }

    const result = await notificationResponse.json();
    console.log("FCM: Notification sent successfully:", result);
    return true;
  } catch (error) {
    console.error("FCM: Error sending parent notification:", error);
    return false;
  }
}
