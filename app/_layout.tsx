import { UserProvider } from "@/contexts/UserContext";
import "@/global.css";
import { Stack } from "expo-router";
import { setupFCM } from "../fcm";
import { useEffect } from "react";
import Constants from "expo-constants";
import { suppressReactWarnings } from "@/utility/consoleUtils";

// Suppress React warnings
suppressReactWarnings();

export default function RootLayout() {
  useEffect(() => {
    // Check if we're in Expo Go
    const isExpoGo = Constants.executionEnvironment === "storeClient";

    if (isExpoGo) {
      console.log("Teacher App: Running in Expo Go - FCM disabled");
    } else {
      console.log("Teacher App: Running in development build - enabling FCM");
      // Delay FCM setup to ensure native modules are ready
      const timer = setTimeout(() => {
        setupFCM();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <UserProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </UserProvider>
  );
}
