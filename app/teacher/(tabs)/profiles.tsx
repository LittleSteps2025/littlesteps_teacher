import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Image,
  Modal,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ArrowLeft, Filter, ChevronDown } from "lucide-react-native";
import { API_BASE_URL } from "../../../utility/config";

export default function ChildProfiles() {
  const router = useRouter();
  const [childrenData, setChildrenData] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState("all");
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [packageOptions, setPackageOptions] = useState([
    { label: "All Packages", value: "all" },
  ]);
  const [groupOptions, setGroupOptions] = useState([
    { label: "All Groups", value: "all" },
  ]);
  const [packageModalVisible, setPackageModalVisible] = useState(false);
  const [groupModalVisible, setGroupModalVisible] = useState(false);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [pkgRes, grpRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/child/filter/packages`),
          fetch(`${API_BASE_URL}/api/child/filter/groups`),
        ]);

        const [pkgData, grpData] = await Promise.all([
          pkgRes.json(),
          grpRes.json(),
        ]);

        setPackageOptions([
          { label: "All Packages", value: "all" },
          ...pkgData.map((p /*: { name: string }*/) => ({
            label: p.name,
            value: p.name,
          })),
        ]);

        setGroupOptions([
          { label: "All Groups", value: "all" },
          ...grpData.map((g /*: { name: string }*/) => ({
            label: g.name,
            value: g.name,
          })),
        ]);
      } catch (error) {
        console.error("Failed to fetch package or group filters", error);
      }
    };
    fetchFilters();
  }, []);

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const month = new Date().getMonth() + 1;
        const query = `group=${selectedGroup}&pkg=${selectedPackage}&month=${month}`;

        const res = await fetch(`${API_BASE_URL}/api/child?${query}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setChildrenData(data);
        } else {
          console.error("Invalid data format: expected an array", data);
          setChildrenData([]);
        }
      } catch (err) {
        console.error("Failed to fetch children", err);
        setChildrenData([]);
      }
    };
    fetchChildren();
  }, [selectedGroup, selectedPackage]);

  const getGenderColors = (gender) => {
    return gender === "female"
      ? { primary: "#ec4899", secondary: "#fce7f3", accent: "#be185d" }
      : { primary: "#3b82f6", secondary: "#dbeafe", accent: "#1d4ed8" };
  };

  const handleChildPress = (childId) => {
    router.push(`/teacher/child-page?childId=${childId}`);
  };

  const resetFilters = () => {
    setSelectedPackage("all");
    setSelectedGroup("all");
  };

  const hasActiveFilters = selectedPackage !== "all" || selectedGroup !== "all";

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
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <SafeAreaView style={{ flex: 1, marginTop: 28 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 20,
            paddingTop: 8,
            paddingBottom: 20,
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>
          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              color: "#374151",
              flex: 1,
              textAlign: "center",
            }}
          >
            All Children
          </Text>
          <View style={{ width: 80, alignItems: "flex-end" }}>
            <Text style={{ fontSize: 12, color: "#6B7280", fontWeight: "500" }}>
              {childrenData.length} children
            </Text>
          </View>
        </View>

        {/* Filter Section */}
        <View
          style={{
            marginHorizontal: 20,
            marginBottom: 20,
            backgroundColor: "#fff",
            borderRadius: 16,
            padding: 16,
            elevation: 3,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Filter size={20} color="#8B5CF6" />
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: "#374151",
                  marginLeft: 8,
                }}
              >
                Filters
              </Text>
            </View>
            {hasActiveFilters && (
              <TouchableOpacity
                onPress={resetFilters}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: "#8B5CF6",
                }}
              >
                <Text
                  style={{ color: "#8B5CF6", fontSize: 14, fontWeight: "500" }}
                >
                  Reset
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            {/* Package Dropdown */}
            <View style={{ flex: 1, marginHorizontal: 4 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: "#374151",
                  marginBottom: 8,
                }}
              >
                Package
              </Text>
              <TouchableOpacity
                onPress={() => setPackageModalVisible(true)}
                style={{
                  backgroundColor: "#8B5CF6",
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#fff" }}>
                  {
                    packageOptions.find((p) => p.value === selectedPackage)
                      ?.label
                  }
                </Text>
                <ChevronDown size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <Modal
                transparent
                visible={packageModalVisible}
                animationType="fade"
                onRequestClose={() => setPackageModalVisible(false)}
              >
                <Pressable
                  style={{
                    flex: 1,
                    backgroundColor: "rgba(0,0,0,0.3)",
                    justifyContent: "center",
                    padding: 20,
                  }}
                  onPress={() => setPackageModalVisible(false)}
                >
                  <View
                    style={{
                      backgroundColor: "#fff",
                      borderRadius: 12,
                      padding: 16,
                    }}
                  >
                    {packageOptions.map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        onPress={() => {
                          setSelectedPackage(option.value);
                          setPackageModalVisible(false);
                        }}
                        style={{ paddingVertical: 10 }}
                      >
                        <Text style={{ fontSize: 16 }}>{option.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </Pressable>
              </Modal>
            </View>

            {/* Group Dropdown */}
            <View style={{ flex: 1, marginHorizontal: 4 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: "#374151",
                  marginBottom: 8,
                }}
              >
                Group
              </Text>
              <TouchableOpacity
                onPress={() => setGroupModalVisible(true)}
                style={{
                  backgroundColor: "#8B5CF6",
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#fff" }}>
                  {groupOptions.find((g) => g.value === selectedGroup)?.label}
                </Text>
                <ChevronDown size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <Modal
                transparent
                visible={groupModalVisible}
                animationType="fade"
                onRequestClose={() => setGroupModalVisible(false)}
              >
                <Pressable
                  style={{
                    flex: 1,
                    backgroundColor: "rgba(0,0,0,0.3)",
                    justifyContent: "center",
                    padding: 20,
                  }}
                  onPress={() => setGroupModalVisible(false)}
                >
                  <View
                    style={{
                      backgroundColor: "#fff",
                      borderRadius: 12,
                      padding: 16,
                    }}
                  >
                    {groupOptions.map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        onPress={() => {
                          setSelectedGroup(option.value);
                          setGroupModalVisible(false);
                        }}
                        style={{ paddingVertical: 10 }}
                      >
                        <Text style={{ fontSize: 16 }}>{option.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </Pressable>
              </Modal>
            </View>
          </View>
        </View>

        <ScrollView style={{ paddingHorizontal: 20 }}>
          {childrenData.length === 0 ? (
            <View style={{ alignItems: "center", paddingVertical: 40 }}>
              <Text
                style={{ fontSize: 16, color: "#6B7280", marginBottom: 16 }}
              >
                No children match your filters
              </Text>
              <TouchableOpacity
                onPress={resetFilters}
                style={{
                  backgroundColor: "#8B5CF6",
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>
                  Clear Filters
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            childrenData.map((child) => {
              const colors = getGenderColors(child.gender);
              return (
                <TouchableOpacity
                  key={child.id} // Use child.id if unique
                  onPress={() => handleChildPress(child.id)}
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: 20,
                    marginBottom: 16,
                    padding: 20,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 12,
                    elevation: 5,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View
                      style={{
                        borderRadius: 35,
                        borderWidth: 3,
                        borderColor: colors.primary,
                        padding: 3,
                      }}
                    >
                      <Image
                        source={
                          child.profileImage
                            ? { uri: child.profileImage }
                            : require("../../../assets/images/default_profile.webp")
                        }
                        style={{ width: 60, height: 60, borderRadius: 30 }}
                      />
                    </View>
                    <View style={{ flex: 1, marginLeft: 16 }}>
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: "600",
                          color: "#1f2937",
                        }}
                      >
                        {child.name}
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          color: "#6b7280",
                          marginBottom: 8,
                        }}
                      >
                        Age {child.age}
                      </Text>
                      <Text style={{ fontSize: 12, color: "#9ca3af" }}>
                        {child.school}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}




const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, marginTop: 28 },

  // Header Styles
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#374151",
    flex: 1,
    textAlign: "center",
  },
  headerRight: {
    width: 40,
    alignItems: "flex-end",
  },
  resultCount: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },

  // Filter Styles
  filterContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  filterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  filterTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginLeft: 8,
  },
  resetButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#8B5CF6",
  },
  resetButtonText: {
    color: "#8B5CF6",
    fontSize: 14,
    fontWeight: "500",
  },
  filtersRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  filterItem: {
    flex: 1,
    marginHorizontal: 4,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  customDropdown: {
    backgroundColor: "#8B5CF6",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
    marginRight: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: "50%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
  },
  modalCloseButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#8B5CF6",
    borderRadius: 8,
  },
  modalCloseText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  optionsList: {
    paddingHorizontal: 20,
  },
  optionItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  selectedOption: {
    backgroundColor: "#F3F4F6",
  },
  optionText: {
    fontSize: 16,
    color: "#374151",
  },
  selectedOptionText: {
    color: "#8B5CF6",
    fontWeight: "600",
  },
  toggleButton: {
    borderRadius: 12,
    padding: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  toggleButtonActive: {
    backgroundColor: "#F3F4F6",
    borderWidth: 2,
    borderColor: "#8B5CF6",
  },
  toggleButtonInactive: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  toggleContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  toggleButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  toggleButtonTextActive: {
    color: "#374151",
  },
  toggleButtonTextInactive: {
    color: "#6B7280",
  },
  toggleIndicator: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
    justifyContent: "center",
  },
  toggleIndicatorActive: {
    backgroundColor: "#8B5CF6",
    alignItems: "flex-end",
  },
  toggleIndicatorInactive: {
    backgroundColor: "#D1D5DB",
    alignItems: "flex-start",
  },
  toggleCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  toggleCircleActive: {
    backgroundColor: "#FFFFFF",
  },
  toggleCircleInactive: {
    backgroundColor: "#FFFFFF",
  },

  // List Styles
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 20 },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 16,
  },
  emptyStateButton: {
    backgroundColor: "#8B5CF6",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },

  // Card Styles
  childCard: {
    backgroundColor: "white",
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    overflow: "hidden",
  },
  cardContent: { flexDirection: "row", padding: 20, alignItems: "center" },
  imageContainer: {
    position: "relative",
    borderWidth: 3,
    borderRadius: 35,
    padding: 3,
  },
  profileImage: { width: 60, height: 60, borderRadius: 30 },
  genderIndicator: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  genderText: { color: "white", fontSize: 12, fontWeight: "bold" },
  childInfo: { flex: 1, marginLeft: 16 },
  childNameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  childName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    flex: 1,
  },
  presentBadge: {
    backgroundColor: "#10B981",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  presentBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "600",
  },
  childAge: { fontSize: 14, color: "#6b7280", marginBottom: 8 },
  tagsContainer: {
    flexDirection: "row",
    marginBottom: 4,
  },
  gradeTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
  },
  dropdownPopover: {
    position: "absolute",
    top: 60, // adjust if needed
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 20, // increase for Android
    zIndex: 9999, // ensure it’s above all content
  },

  gradeText: { fontSize: 12, fontWeight: "600" },
  groupTag: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  groupText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
    textTransform: "capitalize",
  },
  schoolName: { fontSize: 12, color: "#9ca3af" },
  bottomBorder: { height: 4, width: "100%" },
});
