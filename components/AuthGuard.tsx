import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'parent' | 'teacher';
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children, requiredRole }) => {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      // Redirect to signin if not authenticated
      router.replace('/teacher/signin');
    } else if (!isLoading && user && requiredRole && user.role !== requiredRole) {
      // Redirect to appropriate dashboard if role doesn't match
      const redirectPath = user.role === 'teacher' ? '/teacher' : '/teacher/signin';
      router.replace(redirectPath);
    }
  }, [user, isLoading, requiredRole, router]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#7c3aed" />
        <Text className="mt-4 text-gray-600">Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  if (requiredRole && user.role !== requiredRole) {
    return null; // Will redirect to appropriate dashboard
  }

  return <>{children}</>;
};
