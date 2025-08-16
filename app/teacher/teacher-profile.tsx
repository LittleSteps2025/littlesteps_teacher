import CustomAlert from '@/components/CustomAlert';
import { useUser } from '@/contexts/UserContext';
import { apiService } from '@/services/apiService';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function TeacherProfile() {
  const router = useRouter();
  const { user, logout, updateProfile } = useUser();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(user?.profileImage || null);
  
  // Edit form state - initialize with user data
  const [editForm, setEditForm] = useState({
    name: user?.fullName || '',
    email: user?.email || '',
    phoneNumber: user?.phone || '',
    subject: user?.subject || '',
    experience: user?.experience || '',
    qualification: user?.qualification || '',
    employeeId: user?.employeeId || '',
    department: user?.department || ''
  });

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.fullName || '',
        email: user.email || '',
        phoneNumber: user.phone || '',
        subject: user.subject || '',
        experience: user.experience || '',
        qualification: user.qualification || '',
        employeeId: user.employeeId || '',
        department: user.department || ''
      });
      setProfileImage(user.profileImage || null);
    }
  }, [user]);

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Custom Alert State
  const [customAlert, setCustomAlert] = useState({
    visible: false,
    type: 'success' as 'success' | 'error',
    title: '',
    message: '',
    showCancelButton: false,
    onConfirm: undefined as (() => void) | undefined
  });

  const showCustomAlert = (
    type: 'success' | 'error',
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
      onConfirm
    });
  };

  const hideCustomAlert = () => {
    setCustomAlert(prev => ({ ...prev, visible: false }));
  };

  const handleBack = () => {
    router.back();
  };

  const openEditModal = () => {
    setIsEditModalVisible(true);
  };

  const closeEditModal = () => {
    setIsEditModalVisible(false);
  };

  const openPasswordModal = () => {
    setIsPasswordModalVisible(true);
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const closePasswordModal = () => {
    setIsPasswordModalVisible(false);
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setShowPasswords({
      current: false,
      new: false,
      confirm: false
    });
  };

  const handleSaveProfile = async () => {
    try {
      // Update profile on backend
      const updatedData = {
        fullName: editForm.name,
        email: editForm.email,
        phone: editForm.phoneNumber,
        subject: editForm.subject,
        experience: editForm.experience,
        qualification: editForm.qualification,
        employeeId: editForm.employeeId,
        department: editForm.department,
        ...(profileImage && { profileImage })
      };
      
      await apiService.updateUserProfile(updatedData);
      
      // Update local session data
      await updateProfile(updatedData);
      
      showCustomAlert('success', 'Success', 'Profile updated successfully!');
      closeEditModal();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      showCustomAlert('error', 'Error', error.message || 'Failed to update profile. Please try again.');
    }
  };

  const handlePasswordChange = () => {
    // Basic validation
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      showCustomAlert('error', 'Error', 'Please fill in all password fields.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showCustomAlert('error', 'Error', 'New passwords do not match.');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      showCustomAlert('error', 'Error', 'New password must be at least 8 characters long.');
      return;
    }

    // Here you would typically validate current password and save new password to backend
    showCustomAlert('success', 'Success', 'Password changed successfully!');
    closePasswordModal();
  };

  const handleLogout = async () => {
    try {
      await logout();
      showCustomAlert('success', 'Success', 'Logged out successfully!', false, () => {
        router.replace('/signin');
      });
    } catch (error: any) {
      console.error('Error during logout:', error);
      showCustomAlert('error', 'Error', 'Failed to logout. Please try again.');
    }
  };

  const handleInputChange = (field: keyof typeof editForm, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePasswordInputChange = (field: keyof typeof passwordForm, value: string) => {
    setPasswordForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Image picker functions
  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showCustomAlert(
        'error',
        'Permission Required',
        'Sorry, we need camera roll permissions to change your profile photo.'
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    showCustomAlert(
      'success',
      'Select Photo',
      'Choose how you would like to select a photo',
      true,
      openImageLibrary
    );
  };

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      showCustomAlert(
        'error',
        'Permission Required',
        'Sorry, we need camera permissions to take a photo.'
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const openImageLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setProfileImage(result.assets[0].uri);
    }
  };

  // Teacher data - replace with actual data from your backend/state
  const teacherData = {
    name: editForm.name,
    email: editForm.email,
    phoneNumber: editForm.phoneNumber,
    subject: editForm.subject,
    experience: editForm.experience,
    qualification: editForm.qualification,
    employeeId: editForm.employeeId,
    department: editForm.department,
    profileImage: profileImage ? { uri: profileImage } : { uri: 'https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=400' }, // Use selected image or default
    joinDate: 'September 2020',
    classes: ['Grade 5A', 'Grade 5B', 'Grade 6A'], // List of classes
    totalStudents: 75
  };

  const profileSections = [
    {
      title: 'Personal Information',
      items: [
        {
          label: 'Full Name',
          value: teacherData.name,
          icon: 'person-outline',
          color: '#7c3aed'
        },
        {
          label: 'Email Address',
          value: teacherData.email,
          icon: 'mail-outline',
          color: '#3b82f6'
        },
        {
          label: 'Phone Number',
          value: teacherData.phoneNumber,
          icon: 'call-outline',
          color: '#10b981'
        },
        {
          label: 'Employee ID',
          value: teacherData.employeeId,
          icon: 'card-outline',
          color: '#f59e0b'
        }
      ]
    },
    {
      title: 'Professional Information',
      items: [
        {
          label: 'Subject/Specialization',
          value: teacherData.subject,
          icon: 'book-outline',
          color: '#8b5cf6'
        },
        {
          label: 'Department',
          value: teacherData.department,
          icon: 'business-outline',
          color: '#06b6d4'
        },
        {
          label: 'Teaching Experience',
          value: teacherData.experience,
          icon: 'time-outline',
          color: '#84cc16'
        },
        {
          label: 'Qualification',
          value: teacherData.qualification,
          icon: 'school-outline',
          color: '#f97316'
        }
      ]
    },
    {
      title: 'Teaching Assignment',
      items: [
        {
          label: 'Classes Teaching',
          value: teacherData.classes.join(', '),
          icon: 'people-outline',
          color: '#ef4444'
        },
        {
          label: 'Total Students',
          value: `${teacherData.totalStudents} Students`,
          icon: 'analytics-outline',
          color: '#ec4899'
        },
        {
          label: 'Joined School',
          value: teacherData.joinDate,
          icon: 'calendar-outline',
          color: '#14b8a6'
        }
      ]
    }
  ];

  return (
    <LinearGradient
      colors={['#DFC1FD', '#f3e8ff', '#F5ECFE', '#F5ECFE', '#e9d5ff', '#DFC1FD']}
      start={[0, 0]}
      end={[1, 1]}
      className="flex-1 pt-5"
    >
      <StatusBar barStyle="dark-content" backgroundColor="#DFC1FD" />
      <SafeAreaView className="flex-1">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="px-6 pt-4 pb-2 flex-row items-center justify-between">
            <TouchableOpacity
              onPress={handleBack}
              className="w-10 h-10 justify-center items-center"
            >
              <Ionicons name="chevron-back" size={24} color="#374151" />
            </TouchableOpacity>
            
            <Text className="text-2xl font-bold text-gray-700 mt-4">
              Teacher Profile
            </Text>

            <TouchableOpacity
              onPress={openEditModal}
              className="w-10 h-10 justify-center items-center"
            >
              <Ionicons name="create-outline" size={24} color="#3b82f6" />
            </TouchableOpacity>
          </View>

          {/* Profile Image and Basic Info */}
          <View className="items-center mb-8 mt-4">
            <TouchableOpacity onPress={openEditModal} activeOpacity={0.8}>
              <View className="relative">
                <View
                  className="w-32 h-32 rounded-full overflow-hidden"
                  style={{
                    shadowColor: '#3b82f6',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 8,
                  }}
                >
                  <Image
                    source={teacherData.profileImage}
                    className="w-full h-full"
                    style={{ borderRadius: 64, borderWidth: 4, borderColor: '#3b82f6' }}
                  />
                </View>
                {/* Edit Icon */}
                <View 
                  className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 rounded-full items-center justify-center"
                  style={{
                    shadowColor: '#3b82f6',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 4,
                  }}
                >
                  <Ionicons name="create" size={16} color="white" />
                </View>
              </View>
            </TouchableOpacity>
            
            <Text className="text-2xl font-bold text-gray-800 mt-4">
              {teacherData.name}
            </Text>
            <Text className="text-gray-600 text-base mt-1">
              {teacherData.subject} Teacher • ID: {teacherData.employeeId}
            </Text>
            <Text className="text-gray-500 text-sm mt-1 opacity-70">
              Tap image to edit profile
            </Text>
          </View>

          {/* Profile Information Sections */}
          <View className="px-6 pb-40">
            {profileSections.map((section, sectionIndex) => (
              <View key={sectionIndex} className="mb-8">
                <Text className="text-lg font-bold text-gray-700 mb-4">
                  {section.title}
                </Text>
                
                <View
                  className="rounded-2xl p-6"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    shadowColor: '#3b82f6',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 4,
                  }}
                >
                  {section.items.map((item, itemIndex) => (
                    <View 
                      key={itemIndex} 
                      className={`flex-row items-center py-4 ${
                        itemIndex < section.items.length - 1 ? 'border-b border-gray-100' : ''
                      }`}
                    >
                      <View 
                        className="w-12 h-12 rounded-full items-center justify-center mr-4"
                        style={{ backgroundColor: `${item.color}15` }}
                      >
                        <Ionicons name={item.icon as any} size={20} color={item.color} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm font-medium text-gray-500 mb-1">
                          {item.label}
                        </Text>
                        <Text className="text-base font-semibold text-gray-800">
                          {item.value}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ))}

            {/* Security Section */}
            <View className="mb-8">
              <Text className="text-lg font-bold text-gray-700 mb-4">
                Privacy & Security
              </Text>
              
              <View
                className="rounded-2xl p-6"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  shadowColor: '#3b82f6',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <TouchableOpacity
                  onPress={openPasswordModal}
                  className="flex-row items-center py-4 border-b border-gray-100"
                >
                  <View 
                    className="w-12 h-12 rounded-full items-center justify-center mr-4"
                    style={{ backgroundColor: '#dc262615' }}
                  >
                    <Ionicons name="lock-closed-outline" size={20} color="#dc2626" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-500 mb-1">
                      Password
                    </Text>
                    <Text className="text-base font-semibold text-gray-800">
                      Change Password
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={handleLogout}
                  className="flex-row items-center py-4"
                >
                  <View 
                    className="w-12 h-12 rounded-full items-center justify-center mr-4"
                    style={{ backgroundColor: '#ef444415' }}
                  >
                    <Ionicons name="log-out-outline" size={20} color="#ef4444" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-500 mb-1">
                      Account
                    </Text>
                    <Text className="text-base font-semibold text-gray-800">
                      Logout
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
        
        <View className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md">
          <View
            className="flex-row justify-around items-center py-4 px-6"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            {/* Home */}
            <Pressable 
              className="items-center justify-center py-2"
              onPress={() => router.push('/TeacherDashboard')}
            >
              <View className="w-12 h-12 items-center justify-center">
                <Ionicons name="home" size={24} color="#9ca3af" />
              </View>
              <Text className="text-xs text-gray-500 font-medium mt-1">Home</Text>
            </Pressable>

            {/* Classes */}
            <Pressable 
              className="items-center justify-center py-2"
              onPress={() => router.push('/TeacherClasses')}
            >
              <View className="w-12 h-12 items-center justify-center">
                <Ionicons name="library" size={24} color="#9ca3af" />
              </View>
              <Text className="text-xs text-gray-500 font-medium mt-1">Classes</Text>
            </Pressable>

            {/* Profile */}
            <Pressable
              className="items-center justify-center py-2"
            >
              <View className="w-12 h-12 items-center justify-center">
                <Ionicons name="person" size={24} color="#3b82f6" />
              </View>
              <Text className="text-xs text-blue-600 mt-1">Profile</Text>
            </Pressable>

            {/* More */}
            <Pressable 
              className="items-center justify-center py-2"
              onPress={() => router.push('/TeacherMore')}
            >
              <View className="w-12 h-12 items-center justify-center">
                <Ionicons name="ellipsis-horizontal" size={24} color="#9ca3af" />
              </View>
              <Text className="text-xs text-gray-500 mt-1">More</Text>
            </Pressable>
          </View>
        </View>

        {/* Edit Profile Modal */}
        <Modal
          visible={isEditModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={closeEditModal}
        >
          <View 
            className="flex-1 justify-end"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          >
            <TouchableOpacity 
              className="flex-1"
              onPress={closeEditModal}
              activeOpacity={1}
            />
            
            <View 
              className="rounded-t-3xl p-6"
              style={{
                backgroundColor: 'white',
                maxHeight: '90%',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.25,
                shadowRadius: 16,
                elevation: 16
              }}
            >
              {/* Modal Header */}
              <View className="flex-row items-center justify-between mb-6">
                <Text className="text-xl font-bold text-gray-800">
                  Edit Teacher Profile
                </Text>
                <TouchableOpacity 
                  onPress={closeEditModal}
                  className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
                >
                  <Ionicons name="close" size={18} color="#6b7280" />
                </TouchableOpacity>
              </View>

              {/* Profile Image */}
              <View className="items-center mb-6">
                <View className="relative">
                  <View
                    className="w-24 h-24 rounded-full overflow-hidden"
                    style={{
                      shadowColor: '#3b82f6',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 4,
                      elevation: 4,
                    }}
                  >
                    <Image
                      source={teacherData.profileImage}
                      className="w-full h-full"
                      style={{ borderRadius: 48, borderWidth: 3, borderColor: '#3b82f6' }}
                    />
                  </View>
                  <TouchableOpacity 
                    onPress={pickImage}
                    className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-600 rounded-full items-center justify-center"
                    style={{
                      shadowColor: '#3b82f6',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 4,
                      elevation: 4,
                    }}
                  >
                    <Ionicons name="camera" size={14} color="white" />
                  </TouchableOpacity>
                </View>
                <Text className="text-sm text-gray-500 mt-2">Tap to change photo</Text>
              </View>

              {/* Edit Form */}
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Full Name */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </Text>
                  <TextInput
                    value={editForm.name}
                    onChangeText={(value) => handleInputChange('name', value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50"
                    style={{
                      fontSize: 16,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 2,
                      elevation: 1
                    }}
                  />
                </View>

                {/* Email */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </Text>
                  <TextInput
                    value={editForm.email}
                    onChangeText={(value) => handleInputChange('email', value)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50"
                    style={{
                      fontSize: 16,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 2,
                      elevation: 1
                    }}
                  />
                </View>

                {/* Phone Number */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </Text>
                  <TextInput
                    value={editForm.phoneNumber}
                    onChangeText={(value) => handleInputChange('phoneNumber', value)}
                    keyboardType="phone-pad"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50"
                    style={{
                      fontSize: 16,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 2,
                      elevation: 1
                    }}
                  />
                </View>

                {/* Employee ID */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Employee ID
                  </Text>
                  <TextInput
                    value={editForm.employeeId}
                    onChangeText={(value) => handleInputChange('employeeId', value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50"
                    style={{
                      fontSize: 16,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 2,
                      elevation: 1
                    }}
                  />
                </View>

                {/* Subject */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Subject/Specialization
                  </Text>
                  <TextInput
                    value={editForm.subject}
                    onChangeText={(value) => handleInputChange('subject', value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50"
                    style={{
                      fontSize: 16,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 2,
                      elevation: 1
                    }}
                  />
                </View>

                {/* Department */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Department
                  </Text>
                  <TextInput
                    value={editForm.department}
                    onChangeText={(value) => handleInputChange('department', value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50"
                    style={{
                      fontSize: 16,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 2,
                      elevation: 1
                    }}
                  />
                </View>

                {/* Experience */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Teaching Experience
                  </Text>
                  <TextInput
                    value={editForm.experience}
                    onChangeText={(value) => handleInputChange('experience', value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50"
                    style={{
                      fontSize: 16,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 2,
                      elevation: 1
                    }}
                    placeholder="e.g., 5 years"
                  />
                </View>

                {/* Qualification */}
                <View className="mb-6">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Qualification
                  </Text>
                  <TextInput
                    value={editForm.qualification}
                    onChangeText={(value) => handleInputChange('qualification', value)}
                    multiline
                    numberOfLines={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50"
                    style={{
                      fontSize: 16,
                      height: 80,
                      textAlignVertical: 'top',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 2,
                      elevation: 1
                    }}
                    placeholder="e.g., M.Ed in Mathematics, B.Sc in Mathematics"
                  />
                </View>

                {/* Action Buttons */}
                <View className="flex-row space-x-3 mb-4">
                  <TouchableOpacity
                    onPress={closeEditModal}
                    className="flex-1 py-3 rounded-xl border border-gray-300 mr-2"
                    style={{
                      backgroundColor: '#f9fafb'
                    }}
                  >
                    <Text className="text-center text-gray-700 font-semibold text-base">
                      Cancel
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleSaveProfile}
                    className="flex-1 py-3 rounded-xl"
                    style={{
                      backgroundColor: '#3b82f6',
                      shadowColor: '#3b82f6',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      elevation: 4
                    }}
                  >
                    <Text className="text-center text-white font-semibold text-base">
                      Save Changes
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Password Change Modal */}
        <Modal
          visible={isPasswordModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={closePasswordModal}
        >
          <View 
            className="flex-1 justify-end"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          >
            <TouchableOpacity 
              className="flex-1"
              onPress={closePasswordModal}
              activeOpacity={1}
            />
            
            <View 
              className="rounded-t-3xl p-6"
              style={{
                backgroundColor: 'white',
                maxHeight: '70%',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.25,
                shadowRadius: 16,
                elevation: 16
              }}
            >
              {/* Modal Header */}
              <View className="flex-row items-center justify-between mb-6">
                <Text className="text-xl font-bold text-gray-800">
                  Change Password
                </Text>
                <TouchableOpacity 
                  onPress={closePasswordModal}
                  className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
                >
                  <Ionicons name="close" size={18} color="#6b7280" />
                </TouchableOpacity>
              </View>

              {/* Password Form */}
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Current Password */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </Text>
                  <View className="relative">
                    <TextInput
                      value={passwordForm.currentPassword}
                      onChangeText={(value) => handlePasswordInputChange('currentPassword', value)}
                      secureTextEntry={!showPasswords.current}
                      className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 bg-gray-50"
                      style={{
                        fontSize: 16,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.05,
                        shadowRadius: 2,
                        elevation: 1
                      }}
                    />
                    <TouchableOpacity
                      onPress={() => togglePasswordVisibility('current')}
                      className="absolute right-4 top-3"
                    >
                      <Ionicons 
                        name={showPasswords.current ? 'eye-off' : 'eye'} 
                        size={20} 
                        color="#9ca3af" 
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* New Password */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </Text>
                  <View className="relative">
                    <TextInput
                      value={passwordForm.newPassword}
                      onChangeText={(value) => handlePasswordInputChange('newPassword', value)}
                      secureTextEntry={!showPasswords.new}
                      className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 bg-gray-50"
                      style={{
                        fontSize: 16,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.05,
                        shadowRadius: 2,
                        elevation: 1
                      }}
                    />
                    <TouchableOpacity
                      onPress={() => togglePasswordVisibility('new')}
                      className="absolute right-4 top-3"
                    >
                      <Ionicons 
                        name={showPasswords.new ? 'eye-off' : 'eye'} 
                        size={20} 
                        color="#9ca3af" 
                      />
                    </TouchableOpacity>
                  </View>
                  <Text className="text-xs text-gray-500 mt-1">
                    Password must be at least 8 characters long
                  </Text>
                </View>

                {/* Confirm New Password */}
                <View className="mb-6">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </Text>
                  <View className="relative">
                    <TextInput
                      value={passwordForm.confirmPassword}
                      onChangeText={(value) => handlePasswordInputChange('confirmPassword', value)}
                      secureTextEntry={!showPasswords.confirm}
                      className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 bg-gray-50"
                      style={{
                        fontSize: 16,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.05,
                        shadowRadius: 2,
                        elevation: 1
                      }}
                    />
                    <TouchableOpacity
                      onPress={() => togglePasswordVisibility('confirm')}
                      className="absolute right-4 top-3"
                    >
                      <Ionicons 
                        name={showPasswords.confirm ? 'eye-off' : 'eye'} 
                        size={20} 
                        color="#9ca3af" 
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Action Buttons */}
                <View className="flex-row space-x-3 mb-4">
                  <TouchableOpacity
                    onPress={closePasswordModal}
                    className="flex-1 py-3 rounded-xl border border-gray-300 mr-2"
                    style={{
                      backgroundColor: '#f9fafb'
                    }}
                  >
                    <Text className="text-center text-gray-700 font-semibold text-base">
                      Cancel
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handlePasswordChange}
                    className="flex-1 py-3 rounded-xl"
                    style={{
                      backgroundColor: '#3b82f6',
                      shadowColor: '#3b82f6',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      elevation: 4
                    }}
                  >
                    <Text className="text-center text-white font-semibold text-base">
                      Change Password
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

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
      </SafeAreaView>
    </LinearGradient>
  );
}