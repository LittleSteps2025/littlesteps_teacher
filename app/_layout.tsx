import { UserProvider } from "@/contexts/UserContext";
import "@/global.css";
import { Stack } from "expo-router";

export default function RootLayout() {
  // return <Stack>
  //   <Stack.Screen
  //     name="(tabs)"
  //     options={{headerShown:false}}
  //   />
  // </Stack>

  return (
    <UserProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </UserProvider>
  );
}
