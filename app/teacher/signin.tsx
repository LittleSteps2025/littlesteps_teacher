import { images } from '@/assets/images/images';
import CustomAlert from '@/components/CustomAlert';
import { useCustomAlert } from '@/hooks/useCustomAlert';
import { API_BASE_URL } from '../../utility/config';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
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
  View
} from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase'; // adjust if needed



// Define types for better type safety
type FormData = {
  email: string;
  password: string;

};

type FormField = keyof FormData;

type FormErrors = {
  [K in FormField]?: string | null;
};

type TouchedFields = {
  [K in FormField]?: boolean;
};



export default function CreateAccountWithValidation() {
  const router = useRouter();
  const { customAlert, showCustomAlert, hideCustomAlert } = useCustomAlert();
  
  // Form state
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });
  
  // Validation errors
  const [errors, setErrors] = useState<FormErrors>({});
  
  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState<TouchedFields>({});

  // Validation rules
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return null;
  };

  const validatePassword = (password: string) => {
    if (!password) return 'Password is required';
    // if (password.length < 8) return 'Password must be at least 8 characters';
    // if (!/(?=.*[a-z])/.test(password)) return 'Password must contain at least one lowercase letter';
    // if (!/(?=.*[A-Z])/.test(password)) return 'Password must contain at least one uppercase letter';
    // if (!/(?=.*\d)/.test(password)) return 'Password must contain at least one number';
    // if (!/(?=.*[@$!%*?&])/.test(password)) return 'Password must contain at least one special character';
    return null;
  };


  // Real-time validation
  const validateField = (field: FormField, value: string) => {
    let error = null;
    
    switch (field) {
      case 'email':
        error = validateEmail(value);
        break;
      case 'password':
        error = validatePassword(value);
        break;
      
    }
    
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
    
    return error === null;
  };

  // Handle input change
  const handleInputChange = (field: FormField, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Validate if field has been touched
    if (touched[field]) {
      validateField(field, value);
    }
    
    // Re-validate confirm password if password changes
    // if (field === 'password' && touched.confirmPassword && formData.confirmPassword) {
    //   validateField('confirmPassword', formData.confirmPassword);
    // }
  };

  // Handle input blur (when user leaves the field)
  const handleBlur = (field: FormField) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
    validateField(field, formData[field]);
  };

  // Validate entire form
  const validateForm = () => {
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    
    const newErrors: FormErrors = {
      email: emailError,
      password: passwordError,
    };
    
    setErrors(newErrors);
    setTouched({
      email: true,
      password: true,

    });
    
    return !emailError && !passwordError ;
  };

  // Handle form submission
  const handleCreateAccount = async () => {
    if (!validateForm()) {
      showCustomAlert('error', 'Validation Error', 'Please fix the errors below');
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Attempting teacher login with email:', formData.email);
      console.log('Using API Base URL:', API_BASE_URL);
      
      // Try Firebase authentication for teachers
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      console.log('Firebase login successful:', userCredential.user.uid);

      showCustomAlert('success', 'Success', 'Login successful!', false, () => {
        router.push('/teacher');
      });
      
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = 'Failed to login. Please try again.';
      
      // Handle Firebase-specific errors
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No teacher account found with this email address.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.message && error.message.includes('Network request failed')) {
        errorMessage = 'Cannot connect to server. Please check your internet connection.';
      }
      
      showCustomAlert('error', 'Login Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Get password strength
  // const getPasswordStrength = (password: string) => {
  //   let strength = 0;
  //   if (password.length >= 8) strength++;
  //   if (/(?=.*[a-z])/.test(password)) strength++;
  //   if (/(?=.*[A-Z])/.test(password)) strength++;
  //   if (/(?=.*\d)/.test(password)) strength++;
  //   if (/(?=.*[@$!%*?&])/.test(password)) strength++;
    
  //   return strength;
  // };

  // const passwordStrength = getPasswordStrength(formData.password);
  // const strengthColors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a'];
  // const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];

  return (
    <LinearGradient
      colors={['#DFC1FD','#f3e8ff', '#F5ECFE','#F5ECFE','#e9d5ff', '#DFC1FD']}
      start={[0, 0]}
      end={[1, 1]}
      className="flex-1"
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <SafeAreaView className="flex-1 mt-7">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {/* Header */}
            {/* <View className="px-5 pt-2">
              <TouchableOpacity 
                onPress={() => router.back()}
                className="w-10 h-10 justify-center items-center"
              >
                <Ionicons name="chevron-back" size={24} color="#374151" />
              </TouchableOpacity>
            </View> */}

            {/* Content */}
            <View className="px-5 pt-5">
              <Text className="text-3xl font-bold text-gray-700 mb-2">
                Log In
              </Text>
              <Text className="text-base text-gray-500 mb-8">
                Excited to have you on board!
              </Text>
              <Image source={images.teacher} className="w-40 h-40 mx-auto mb-8 border rounded-full border-purple-400 border-2" />
              {/* Email Input */}
              <Text className="text-base text-gray-700 mb-2 font-medium">
                Email
              </Text>
              <View className="mb-1">
                <TextInput
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  onBlur={() => handleBlur('email')}
                  placeholder="Enter your email"
                  placeholderTextColor="#9ca3af"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={{
                    backgroundColor: 'white',
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 16,
                    fontSize: 16,
                    borderWidth: errors.email && touched.email ? 2 : 0,
                    borderColor: errors.email && touched.email ? '#ef4444' : 'transparent',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 2,
                    elevation: 2
                  }}
                />
              </View>
              {errors.email && touched.email && (
                <Text className="text-red-500 text-sm mb-4 ml-1">
                  {errors.email}
                </Text>
              )}
              {!errors.email && touched.email && (
                <View className="flex-row items-center mb-4 ml-1">
                  <Ionicons name="checkmark-circle" size={16} color="#22c55e" />
                  <Text className="text-green-500 text-sm ml-1">Valid email</Text>
                </View>
              )}

              {/* Password Input */}
              <Text className="text-base text-gray-700 mb-2 font-medium">
                Password
              </Text>
              <View className="relative mb-1">
                <TextInput
                  value={formData.password}
                  onChangeText={(value) => handleInputChange('password', value)}
                  onBlur={() => handleBlur('password')}
                  placeholder="Create password"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry={!showPassword}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 16,
                    paddingRight: 50,
                    fontSize: 16,
                    borderWidth: errors.password && touched.password ? 2 : 0,
                    borderColor: errors.password && touched.password ? '#ef4444' : 'transparent',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 2,
                    elevation: 2
                  }}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4"
                >
                  <Ionicons 
                    name={showPassword ? "eye-off" : "eye"} 
                    size={20} 
                    color="#9ca3af" 
                  />
                </TouchableOpacity>
              </View>
              <View className="px-5 pb-8 items-end">
            <View className="flex-row items-center">
              <TouchableOpacity onPress={() => router.push('/teacher/forgot_password')}>
                <Text className="text-base text-purple-600 font-semibold">
                  Forgot password ?
                </Text>
              </TouchableOpacity>
            </View>
          </View>
              
              {/* Password Strength Indicator */}
              {/* {formData.password.length > 0 && (
                <View className="mb-2">
                  <View className="flex-row items-center justify-between mb-1">
                    <Text className="text-sm text-gray-600">Password Strength</Text>
                    <Text 
                      className="text-sm font-medium"
                      style={{ color: strengthColors[passwordStrength - 1] || '#ef4444' }}
                    >
                      {strengthLabels[passwordStrength - 1] || 'Very Weak'}
                    </Text>
                  </View>
                  <View className="flex-row space-x-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <View
                        key={level}
                        className="flex-1 h-2 rounded-full"
                        style={{
                          backgroundColor: level <= passwordStrength 
                            ? strengthColors[passwordStrength - 1] || '#ef4444'
                            : '#e5e7eb'
                        }}
                      />
                    ))}
                  </View>
                </View>
              )} */}
              
              {errors.password && touched.password && (
                <Text className="text-red-500 text-sm mb-4 ml-1">
                  {errors.password}
                </Text>
              )}


              {/* Password Requirements */}
              {/* <View className="mb-8 p-4 bg-white/50 rounded-xl">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Password Requirements:
                </Text>
                {[
                  { rule: 'At least 8 characters', check: formData.password.length >= 8 },
                  { rule: 'One lowercase letter', check: /(?=.*[a-z])/.test(formData.password) },
                  { rule: 'One uppercase letter', check: /(?=.*[A-Z])/.test(formData.password) },
                  { rule: 'One number', check: /(?=.*\d)/.test(formData.password) },
                  { rule: 'One special character', check: /(?=.*[@$!%*?&])/.test(formData.password) }
                ].map((req, index) => (
                  <View key={index} className="flex-row items-center mb-1">
                    <Ionicons 
                      name={req.check ? "checkmark-circle" : "ellipse-outline"} 
                      size={16} 
                      color={req.check ? "#22c55e" : "#9ca3af"} 
                    />
                    <Text 
                      className={`text-sm ml-2 ${req.check ? 'text-green-600' : 'text-gray-500'}`}
                    >
                      {req.rule}
                    </Text>
                  </View>
                ))}
              </View> */}

              {/* Create Account Button */}
              <TouchableOpacity
                onPress={handleCreateAccount}
                disabled={isLoading}
                className={`rounded-3xl py-4 items-center mb-8 ${
                  isLoading ? 'bg-purple-400' : 'bg-purple-600'
                }`}
                style={{
                  shadowColor: '#7c3aed',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 4
                }}
              >
                <Text className="text-white text-lg font-semibold">
                  {isLoading ? 'Logging in...' : 'Log In'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Bottom Login Link */}
          <View className="px-5 pb-8 items-center">
            <View className="flex-row items-center">
              <Text className="text-base text-gray-500">
                Are you new here? please contact supervisor
              </Text>

            </View>
          </View>
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
        confirmText={customAlert.showCancelButton ? 'Yes' : 'OK'}
        cancelText="Cancel"
      />
    </LinearGradient>
  );
}