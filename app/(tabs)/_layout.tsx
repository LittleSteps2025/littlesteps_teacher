import { Stack } from "expo-router";
import "@/global.css"

export default function RootLayout() {
  return <Stack screenOptions={{
        headerShown: false, // 👈 Hides header for all screens
      }} />;
}
