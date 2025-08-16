import { images } from "@/assets/images/images";
import CustomAlert from "@/components/CustomAlert";
import { auth } from "@/config/firebase";
import { API_BASE_URL } from "../../utility/config";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { navigate } from "expo-router/build/global-state/routing";
import { sendPasswordResetEmail } from "firebase/auth";
import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
const safeJsonParse = async (response: Response) => {
  const text = await response.text();

  if (!text || text.trim() === "") {
    throw new Error("Empty response from server");
  }

  // Check if response starts with HTML
  if (text.trim().startsWith("<")) {
    throw new Error(
      "Server returned HTML instead of JSON. Check if the endpoint exists."
    );
  }

  try {
    return JSON.parse(text);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    console.error("Failed to parse JSON:", text);
    throw new Error("Invalid JSON response from server");
  }
};

type FormData = {
  email: string;
};

type FormField = keyof FormData;

type FormErrors = {
  [K in FormField]?: string | null;
};

type TouchedFields = {
  [K in FormField]?: boolean;
};

function ForgotPassword() {
  const [customAlert, setCustomAlert] = useState({
    visible: false,
    type: "success" as "success" | "error",
    title: "",
    message: "",
    showCancelButton: false,
    onConfirm: undefined as (() => void) | undefined,
  });

  const showCustomAlert = (
    type: "success" | "error",
    title: string,
    message: string,
    showCancelButton: boolean = false,
    onConfirm?: () => void
  ) => {
    setCustomAlert({
      visible: true,
      type,
      title,
      message,
      showCancelButton,
      onConfirm,
    });
  };

  const hideCustomAlert = () => {
    setCustomAlert((prev) => ({ ...prev, visible: false }));
  };
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState<FormData>({
    email: "",
  });

  // Validation errors
  const [errors, setErrors] = useState<FormErrors>({});

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState<TouchedFields>({});

  const validateEmailFormat = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email is required";
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return null;
  };

  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      const checkResponse = await fetch(`${API_BASE_URL}/api/users/check-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      console.log("Email check response status:", checkResponse.status);

      if (checkResponse.status !== 200) {
        console.error("Email check failed with status:", checkResponse.status);
        return false;
      }

      const checkData = await safeJsonParse(checkResponse);
      console.log("Email check response:", checkData);

      return checkResponse.ok;
    } catch (error) {
      console.error("Error checking email existence:", error);
      return false;
    }
  };

  // Real-time validation
  const validateField = (field: FormField, value: string) => {
    let error = null;

    switch (field) {
      case "email":
        error = validateEmailFormat(value);
        break;
    }

    setErrors((prev) => ({
      ...prev,
      [field]: error,
    }));

    return error === null;
  };

  // Handle input change
  const handleInputChange = (field: FormField, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Validate if field has been touched
    if (touched[field]) {
      validateField(field, value);
    }
  };

  // Handle input blur (when user leaves the field)
  const handleBlur = (field: FormField) => {
    setTouched((prev) => ({
      ...prev,
      [field]: true,
    }));
    validateField(field, formData[field]);
  };

  // Validate entire form
  const validateForm = () => {
    const emailError = validateEmailFormat(formData.email);

    const newErrors: FormErrors = {
      email: emailError,
    };

    setErrors(newErrors);
    setTouched({
      email: true,
    });

    return !emailError;
  };

  // Handle form submission
  const handleForgotPassword = async () => {
    setIsLoading(true);
    
    // First validate email format
    const isValid = validateForm();
    if (!isValid) {
      showCustomAlert(
        "error",
        "Validation Error",
        "Please enter a valid email address"
      );
      setIsLoading(false);
      return;
    }

    try {
      // Check if email exists in the system
      const emailExists = await checkEmailExists(formData.email);
      console.log("Email exists:", emailExists);
      if (!emailExists) {
        showCustomAlert(
          "error",
          "Email Not Found",
          "Email not found in our system. Please contact the supervisor to register your email first."
        );
        setIsLoading(false);
        return;
      }

      // Send password reset email
      await sendPasswordResetEmail(auth, formData.email);
      showCustomAlert(
        "success",
        "Reset Link Sent",
        "A password reset link has been sent to your email. Please check your inbox and follow the instructions to reset your password."
      );
      // Optionally, navigate to a different screen or reset the form
      navigate("/teacher/signin")
    } catch (firebaseError: any) {
      console.error("Firebase password reset error:", firebaseError);
      
      let errorMessage = "Failed to send password reset email. Please try again later.";
      
      // Handle specific Firebase errors
      if (firebaseError?.code) {
        switch (firebaseError.code) {
          case "auth/user-not-found":
            errorMessage = "No user found with this email address.";
            break;
          case "auth/invalid-email":
            errorMessage = "Invalid email address format.";
            break;
          case "auth/network-request-failed":
            errorMessage = "Network error. Please check your internet connection.";
            break;
          case "auth/too-many-requests":
            errorMessage = "Too many requests. Please wait a moment before trying again.";
            break;
        }
      }
      
      showCustomAlert("error", "Reset Failed", errorMessage);
    } finally {
      setIsLoading(false);
    }
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
      start={[0, 0]}
      end={[1, 1]}
      className="flex-1"
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <SafeAreaView className="flex-1 mt-7">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View className="px-5 pt-2">
              <TouchableOpacity
                onPress={() => router.back()}
                className="w-10 h-10 justify-center items-center"
              >
                <Ionicons name="chevron-back" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            <View className="px-5 pt-5">
              <Text className="text-3xl font-bold text-gray-700 mb-2">
                Forgot Password
              </Text>
              <Text className="text-base text-gray-500 mb-8">
                Enter your email to receive a password reset link
              </Text>
              <View className="justify-center items-center">
                <Image className="w-60 h-60 " source={images.forgot} />
              </View>
              {/* Email Input */}
              <Text className="text-base text-gray-700 mb-2 font-medium">
                Email
              </Text>
              <View className="mb-1">
                <TextInput
                  value={formData.email}
                  onChangeText={(value) => handleInputChange("email", value)}
                  onBlur={() => handleBlur("email")}
                  placeholder="Enter your email"
                  placeholderTextColor="#9ca3af"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={{
                    backgroundColor: "white",
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 16,
                    fontSize: 16,
                    borderWidth: errors.email && touched.email ? 2 : 0,
                    borderColor:
                      errors.email && touched.email ? "#ef4444" : "transparent",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 2,
                    elevation: 2,
                  }}
                />
              </View>
              {errors.email && touched.email && (
                <Text className="text-red-500 text-sm mb-4 ml-1">
                  {errors.email}
                </Text>
              )}
              {!errors.email && touched.email && formData.email && (
                <View className="flex-row items-center mb-4 ml-1">
                  <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
                  <Text className="text-green-500 text-sm ml-1">
                    Valid email
                  </Text>
                </View>
              )}

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleForgotPassword}
                disabled={isLoading}
                style={{
                  backgroundColor: isLoading ? "#9ca3af" : "#8b5cf6",
                  borderRadius: 12,
                  paddingVertical: 16,
                  alignItems: "center",
                  marginTop: 16,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 4,
                }}
              >
                <Text className="text-white text-lg font-semibold">
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
      {/* Custom Alert */}
      <CustomAlert
        visible={customAlert.visible}
        type={customAlert.type}
        title={customAlert.title}
        message={customAlert.message}
        onClose={hideCustomAlert}
        onConfirm={customAlert.onConfirm}
        showCancelButton={customAlert.showCancelButton}
        confirmText={customAlert.showCancelButton ? "Yes" : "OK"}
        cancelText="Cancel"
      />
    </LinearGradient>
  );
}

export default ForgotPassword;
