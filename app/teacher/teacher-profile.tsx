import CustomAlert from '@/components/CustomAlert';
import { useUser } from '@/contexts/UserContext';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert
} from 'react-native';
import { API_BASE_URL } from "../../utility/config";
import { auth } from '../../config/firebase';
import { reauthenticateWithCredential, EmailAuthProvider, updatePassword } from 'firebase/auth';





export default function TeacherProfile() {
  const router = useRouter();
  const { user, logout, updateProfile } = useUser();
  const [loading, setLoading] = useState(true);

  const [teacherData, setTeacherData] = useState<any>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Modals
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);

  // Edit form
  const [editForm, setEditForm] = useState({ phoneNumber: '', address: '' });

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });

  // Custom Alert
  const [customAlert, setCustomAlert] = useState({
    visible: false,
    type: 'success' as 'success' | 'error',
    title: '',
    message: '',
    showCancelButton: false,
    onConfirm: undefined as (() => void) | undefined
  });

  // Handlers for Custom Alert
  const showCustomAlert = (
    type: 'success' | 'error',
    title: string,
    message: string,
    showCancelButton: boolean = false,
    onConfirm?: () => void
  ) => {
    setCustomAlert({ visible: true, type, title, message, showCancelButton, onConfirm });
  };
  const hideCustomAlert = () => setCustomAlert(prev => ({ ...prev, visible: false }));

  // Navigation
  const handleBack = () => router.push('/teacher');

  // Modal handlers
  const openEditModal = () => setIsEditModalVisible(true);
  const closeEditModal = () => setIsEditModalVisible(false);
  const openPasswordModal = () => setIsPasswordModalVisible(true);
  const closePasswordModal = () => setIsPasswordModalVisible(false);

  // Edit form input change
  const handleInputChange = (field: string, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  // Password form input change
  const handlePasswordInputChange = (field: string, value: string) => {
    setPasswordForm(prev => ({ ...prev, [field]: value }));
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/teacher/signin');
  };

  // Image picker
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return showCustomAlert('error', 'Permission Required', 'Media permission needed.');
    const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1] });
    if (!result.canceled && result.assets[0]) setProfileImage(result.assets[0].uri);
  };

  // Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          Alert.alert("Error", "You must be logged in to view the profile.");
          return;
        }

        const idToken = await currentUser.getIdToken();
        console.log("ID Token:", idToken);
        const res = await fetch(`${API_BASE_URL}/api/teacherprofile/view`, {
          method: "GET",
          headers: { Authorization: `Bearer ${idToken}`, "Content-Type": "application/json" },
        });

        if (!res.ok) throw new Error("Failed to fetch profile");

        const data = await res.json();
        setTeacherData(data);
        setEditForm({ phoneNumber: data.phoneNumber || '', address: data.address || '' });
        setProfileImage(data.profileImage || null);

      } catch (err) {
        console.error(err);
        Alert.alert("Error", "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);



const handleSaveProfile = async () => {
  try {
    const updatedData: any = { phone: editForm.phone, address: editForm.address };
    if (profileImage) updatedData.profileImage = profileImage;
  const currentUser = auth.currentUser;
        if (!currentUser) {
          Alert.alert("Error", "You must be logged in to view the profile.");
          return;
        }

        const idToken = await currentUser.getIdToken();
    const res = await fetch(`${API_BASE_URL}/api/teacherprofile/edit`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}` // if you use token auth
      },
      body: JSON.stringify(updatedData),
    });

    // ✅ Check for non-200 status
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Update failed");
    }

    // ✅ Parse JSON safely
    const updated = await res.json();
    if (!updated) throw new Error("Backend returned empty response");

    setTeacherData(updated);
    await updateProfile(updated);
    showCustomAlert('success', 'Success', 'Profile updated successfully!');
    closeEditModal();

  } catch (error: any) {
    showCustomAlert('error', 'Error', error.message || 'Update failed.');
  }
};




const handlePasswordChange = async () => {
  if (!passwordForm.currentPassword || !passwordForm.newPassword) {
    return showCustomAlert('error', 'Error', 'Please fill all fields');
  }

  try {
    const user = auth.currentUser;
    if (!user || !user.email) throw new Error('No user logged in');

    // Step 1: Re-authenticate
    const credential = EmailAuthProvider.credential(
      user.email,
      passwordForm.currentPassword
    );
    await reauthenticateWithCredential(user, credential);

    // Step 2: Update Password
    await updatePassword(user, passwordForm.newPassword);

    showCustomAlert('success', 'Success', 'Password changed successfully!');
    closePasswordModal();
  } catch (err: any) {
    showCustomAlert('error', 'Error', err.message);
  }
};


  if (loading) return (
    <SafeAreaView className="flex-1 items-center justify-center">
      <Text>Loading...</Text>
    </SafeAreaView>
  );


  // Image picker


  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  const displayData = {
    name: teacherData?.fullName || 'N/A',
    teacher_id: teacherData?.teacher_id || 'N/A',
    phone: teacherData?.phone || 'N/A',
    email: teacherData?.email || 'N/A',
    address: teacherData?.address || 'N/A',
    nic: teacherData?.nic || 'N/A',
    main_group: teacherData?.main_group || 'N/A',
    co_group: teacherData?.co_group || 'N/A',
    profileImage: profileImage
      ? { uri: profileImage }
      : teacherData?.profileImage
        ? { uri: teacherData.profileImage }
        : { uri: 'https://via.placeholder.com/150' }
  };


  const profileSections = [
    {
      title: 'Personal Information',
      items: [
        {
          label: 'Full Name',
          value: teacherData?.name?? "N/A",
          icon: 'person-outline',
          color: '#7c3aed',
          editable: false
        },
        {
          label: 'Teacher ID',
           value: teacherData?.teacher_id || 'N/A',
          icon: 'card-outline',
          color: '#f59e0b',
          editable: false
        },
        {
          label: 'Phone Number',
          value: teacherData?.phone || 'N/A',
          icon: 'call-outline',
          color: '#10b981',
          editable: true
        },
        {
          label: 'Email Address',
          value: teacherData?.email || 'N/A',
          icon: 'mail-outline',
          color: '#3b82f6',
          editable: false
        },
        {
          label: 'Address',
          value: teacherData?.address || 'N/A',
          icon: 'location-outline',
          color: '#8b5cf6',
          editable: true
        },
        {
          label: 'NIC Number',
          value: teacherData?.nic || 'N/A',
          icon: 'document-outline',
          color: '#06b6d4',
          editable: false
        }
      ]
    },
    {
      title: 'Class Assignments',
      items: [
        {
          label: 'Allocated Main Group',
          value: teacherData?.main_group || 'N/A',
          icon: 'school-outline',
          color: '#84cc16',
          editable: false
        },
        {
          label: 'Allocated Co-Group',
          value: teacherData?.co_group || 'N/A',
          icon: 'people-outline',
          color: '#ef4444',
          editable: false
        }
      ]
    }
  ];

  return (
    <LinearGradient colors={['#DFC1FD', '#f3e8ff']} start={[0, 0]} end={[1, 1]} className="flex-1 pt-5">
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
                    source={displayData.profileImage}
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
              Teacher ID: {teacherData.teacher_id}
            </Text>
            <Text className="text-gray-500 text-sm mt-1 opacity-70">
              Tap image to edit profile
            </Text>
          </View>

          {/* Profile Information Sections */}
          <View className="px-6 pb-8">
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
                      className={`flex-row items-center py-4 ${itemIndex < section.items.length - 1 ? 'border-b border-gray-100' : ''
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
                      {item.editable && (
                        <View className="w-6 h-6 rounded-full bg-green-100 items-center justify-center">
                          <Ionicons name="create" size={12} color="#10b981" />
                        </View>
                      )}
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

        {/* Edit Profile Modal - Only editable fields */}
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
                  Edit Profile
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
                      source={displayData.profileImage}
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

              {/* Edit Form - Only editable fields */}
              <ScrollView showsVerticalScrollIndicator={false}>
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
                    placeholder="Enter phone number"
                  />
                </View>

                {/* Address */}
                <View className="mb-6">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Address
                  </Text>
                  <TextInput
                    value={editForm.address}
                    onChangeText={(value) => handleInputChange('address', value)}
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
                    placeholder="Enter your address"
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
  )
};