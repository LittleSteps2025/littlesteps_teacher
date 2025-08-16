import React, { Profiler } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  StyleSheet
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Users, Bell, Calendar } from 'lucide-react-native';

export default function Dashboard() {
  const router = useRouter();

  const navigationCards = [
    {
      id: 1,
      title: 'Child Profiles',
      subtitle: 'Manage your children',
      icon: Users,
      route: '/teacher/(tabs)/profiles',
      color: '#8b5cf6'
    },
    {
      id: 2,
      title: 'Announcements',
      subtitle: 'Latest updates',
      icon: Bell,
      route: 'teacher/announcements',
      color: '#a855f7'
    },
    {
      id: 3,
      title: 'Events',
      subtitle: 'Upcoming activities',
      icon: Calendar,
      route: 'teacher/events',
      color: '#9333ea'
    },
    //  {
    //   id: 3,
    //   title: 'Profile',
    //   subtitle: 'Manage your profile',
    //   icon: Profiler,
    //   route: 'teacher/teacher-profile',
    //   color: '#9333ea'
    // }
  ];

  const handleNavigation = (route: string) => {
    router.push(route as any);
  };

  return (
    <LinearGradient
      colors={['#DFC1FD','#f3e8ff', '#F5ECFE','#F5ECFE','#e9d5ff', '#DFC1FD']}
      start={[0, 0]}
      end={[1, 1]}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back!</Text>
          <Text style={styles.subtitle}>What would you like to explore today?</Text>
        </View>

        {/* Navigation Cards */}
        <View style={styles.cardsContainer}>
          {navigationCards.map((card, index) => {
            const IconComponent = card.icon;
            return (
              <TouchableOpacity
                key={card.id}
                style={[
                  styles.card,
                  { marginTop: index === 0 ? 0 : 20 }
                ]}
                onPress={() => handleNavigation(card.route)}
                activeOpacity={0.8}
              >
                <View style={styles.cardContent}>
                  <View style={[styles.iconContainer, { backgroundColor: card.color }]}>
                    <IconComponent size={32} color="white" strokeWidth={2} />
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={styles.cardTitle}>{card.title}</Text>
                    <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
                  </View>
                  <View style={styles.arrowContainer}>
                    <Text style={styles.arrow}>›</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    marginTop: 28,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
  cardsContainer: {
    paddingHorizontal: 20,
    flex: 1,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  arrowContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    fontSize: 24,
    color: '#9ca3af',
    fontWeight: 'bold',
  },
  bottomSpacing: {
    height: 40,
  },
});