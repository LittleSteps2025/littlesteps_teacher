import { API_BASE_URL } from '@/utility';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Safe JSON parsing function
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
  } catch {
    console.error("Failed to parse JSON:", text);
    throw new Error("Invalid JSON response from server");
  }
};

class ApiService {
  private async getAuthHeaders() {
    const token = await AsyncStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  async authenticatedRequest(endpoint: string, options: RequestInit = {}) {
    const headers = await this.getAuthHeaders();
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers
      }
    });

    // If token expired, clear storage but don't redirect here
    // Let the UserContext handle the redirect
    if (response.status === 401) {
      await this.handleTokenExpired();
      throw new Error('Session expired. Please login again.');
    }

    return response;
  }

  private async handleTokenExpired() {
    await Promise.all([
      AsyncStorage.removeItem('userData'),
      AsyncStorage.removeItem('authToken'),
      AsyncStorage.removeItem('loginTime')
    ]);
  }

  // Parent Profile APIs
  async getUserProfile() {
    const response = await this.authenticatedRequest('/parent/profile');
    return safeJsonParse(response);
  }

  async updateUserProfile(profileData: any) {
    const response = await this.authenticatedRequest('/parent/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
    return safeJsonParse(response);
  }

  // Children APIs
  async getUserChildren() {
    const response = await this.authenticatedRequest('/parent/children');
    return safeJsonParse(response);
  }

  async getChildDetails(childId: string) {
    const response = await this.authenticatedRequest(`/children/${childId}`);
    return safeJsonParse(response);
  }

  async updateChildDetails(childId: string, childData: any) {
    const response = await this.authenticatedRequest(`/children/${childId}`, {
      method: 'PUT',
      body: JSON.stringify(childData)
    });
    return safeJsonParse(response);
  }

  // Daily Records APIs
  async getDailyRecords(childId: string, date: string) {
    const response = await this.authenticatedRequest(`/children/${childId}/daily-records?date=${date}`);
    return safeJsonParse(response);
  }

  async createDailyRecord(childId: string, recordData: any) {
    const response = await this.authenticatedRequest(`/children/${childId}/daily-records`, {
      method: 'POST',
      body: JSON.stringify(recordData)
    });
    return safeJsonParse(response);
  }

  // Health Records APIs
  async getHealthRecords(childId: string) {
    const response = await this.authenticatedRequest(`/children/${childId}/health-records`);
    return safeJsonParse(response);
  }

  async addHealthRecord(childId: string, healthData: any) {
    const response = await this.authenticatedRequest(`/children/${childId}/health-records`, {
      method: 'POST',
      body: JSON.stringify(healthData)
    });
    return safeJsonParse(response);
  }

  // Pickup APIs
  async getPickupHistory(childId: string) {
    const response = await this.authenticatedRequest(`/children/${childId}/pickup-history`);
    return safeJsonParse(response);
  }

  async authorizePickup(childId: string, pickupData: any) {
    const response = await this.authenticatedRequest(`/children/${childId}/authorize-pickup`, {
      method: 'POST',
      body: JSON.stringify(pickupData)
    });
    return safeJsonParse(response);
  }

  // Payment APIs
  async getPaymentHistory() {
    const response = await this.authenticatedRequest('/parent/payments');
    return safeJsonParse(response);
  }

  async makePayment(paymentData: any) {
    const response = await this.authenticatedRequest('/parent/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData)
    });
    return safeJsonParse(response);
  }

  // Notifications APIs
  async getNotifications() {
    const response = await this.authenticatedRequest('/parent/notifications');
    return safeJsonParse(response);
  }

  async markNotificationRead(notificationId: string) {
    const response = await this.authenticatedRequest(`/notifications/${notificationId}/read`, {
      method: 'PUT'
    });
    return safeJsonParse(response);
  }
}

export const apiService = new ApiService();
