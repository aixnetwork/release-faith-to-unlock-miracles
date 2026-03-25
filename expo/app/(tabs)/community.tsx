import React, { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter, useFocusEffect, useNavigation } from 'expo-router';
import { Calendar, Users, MessageCircle, Plus, Heart, Sparkles, BookOpen, MapPin } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { useUserStore } from '@/store/userStore';

export default function CommunityScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { isLoggedIn, plan } = useUserStore();

  const isIndividualPlan = plan === 'individual' || plan === 'individual_yearly' || plan === 'free';
  const isChurchPlan = plan === 'small_church' || plan === 'large_church' || plan === 'org_small' || plan === 'org_medium' || plan === 'org_large' || plan === 'church' || plan?.includes('church');

  const churchGroups = [
    {
      id: '1',
      name: 'Grace Community Church',
      location: 'San Francisco, CA',
      distance: '2.5 miles',
      members: 1250,
      image: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=2073&auto=format&fit=crop',
      tags: ['Youth', 'Worship']
    },
    {
      id: '2',
      name: 'Hope Valley Chapel',
      location: 'Mountain View, CA',
      distance: '5.8 miles',
      members: 850,
      image: 'https://images.unsplash.com/photo-1478147427282-58a87a120781?q=80&w=2070&auto=format&fit=crop',
      tags: ['Family', 'Outreach']
    },
    {
      id: '3',
      name: 'City Light Church',
      location: 'San Jose, CA',
      distance: '12 miles',
      members: 3200,
      image: 'https://images.unsplash.com/photo-1548625361-ec889cb9378c?q=80&w=2069&auto=format&fit=crop',
      tags: ['Modern', 'Young Adults']
    },
    {
      id: '4',
      name: 'Redeemer Presbyterian',
      location: 'New York, NY',
      distance: '0.8 miles',
      members: 4500,
      image: 'https://images.unsplash.com/photo-1543165796-5426273eaab3?q=80&w=2070&auto=format&fit=crop',
      tags: ['Traditional', 'Teaching']
    },
    {
      id: '5',
      name: 'Hillsong Church',
      location: 'Los Angeles, CA',
      distance: '3.2 miles',
      members: 12000,
      image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop',
      tags: ['Music', 'Global']
    },
    {
      id: '6',
      name: 'Elevation Church',
      location: 'Charlotte, NC',
      distance: '1.5 miles',
      members: 8000,
      image: 'https://images.unsplash.com/photo-1510590337019-5ef2d3977e2e?q=80&w=2070&auto=format&fit=crop',
      tags: ['Online', 'Community']
    }
  ];

  useFocusEffect(
    useCallback(() => {
      if (!isLoggedIn) {
        console.log('User not logged in, redirecting to login...');
        router.replace('/login');
        return;
      }

      navigation.setOptions({
        headerShown: true,
        title: 'Community',
      });
    }, [isLoggedIn, navigation, router])
  );

  const communityFeatures = [
    {
      id: 'groups',
      title: isIndividualPlan ? 'Join Church Groups' : 'Group Discussions',
      description: 'Join meaningful conversations with fellow believers',
      icon: Users,
      route: '/groups',
      color: '#6366f1',
      gradient: ['#6366f1', '#4f46e5'] as const,
    },
    ...(plan === 'group_family' ? [{
      id: 'family',
      title: 'Family Group',
      description: 'Manage your family members and spiritual journey',
      icon: Users,
      route: '/family',
      color: '#ec4899',
      gradient: ['#ec4899', '#db2777'] as const,
    }] : []),
    {
      id: 'meetings',
      title: 'Meetings',
      description: 'Join prayer meetings and connect live',
      icon: Calendar,
      route: '/(tabs)/meetings',
      color: '#10b981',
      gradient: ['#10b981', '#059669'] as const,
    },
    {
      id: 'prayer-wall',
      title: 'Prayer Wall',
      description: isIndividualPlan ? 'Public prayer requests from the community' : 'Community prayer requests and support',
      icon: MessageCircle,
      route: '/prayer-wall',
      color: '#f59e0b',
      gradient: ['#f59e0b', '#d97706'] as const,
    },
    {
      id: 'testimonials',
      title: 'Testimonials',
      description: isIndividualPlan ? 'Stories of faith from believers worldwide' : 'Share stories of faith and miracles',
      icon: Heart,
      route: '/(tabs)/testimonials',
      color: '#ec4899',
      gradient: ['#ec4899', '#db2777'] as const,
    },
    {
      id: 'bible-games',
      title: 'Bible Games',
      description: 'Test your biblical knowledge with fun games',
      icon: BookOpen,
      route: '/bible-games',
      color: '#8b5cf6',
      gradient: ['#8b5cf6', '#7c3aed'] as const,
    },
  ];

  const quickActions = [
    {
      id: 'create-group',
      title: 'Create Group',
      route: '/groups/create',
      icon: Plus,
      color: '#6366f1',
    },
    {
      id: 'create-meeting',
      title: 'Create Meeting',
      route: '/meeting/create',
      icon: Plus,
      color: '#10b981',
    },
    {
      id: 'prayer-request',
      title: 'Prayer Request',
      route: '/prayer/new',
      icon: Plus,
      color: '#f59e0b',
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Enhanced Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2'] as const}
        style={[styles.headerGradient, { paddingTop: insets.top + 20 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <Sparkles size={24} color="#fff" />
          <Text style={styles.title}>Community</Text>
          <Text style={styles.subtitle}>Connect with believers worldwide</Text>
        </View>
      </LinearGradient>

      {/* Church Groups Section */}
      {!isChurchPlan && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Nearby Church Groups</Text>
              <Text style={styles.sectionSubtitle}>Find a community near you</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/groups')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.groupsScroll}
          >
            {churchGroups.map((group) => (
              <TouchableOpacity 
                key={group.id}
                style={styles.groupCard}
                onPress={() => router.push('/groups')}
              >
                <Image source={{ uri: group.image }} style={styles.groupImage} />
                <View style={styles.groupBadge}>
                  <Text style={styles.groupDistance}>{group.distance}</Text>
                </View>
                
                <View style={styles.groupContent}>
                  <Text style={styles.groupName}>{group.name}</Text>
                  
                  <View style={styles.groupMetaRow}>
                    <MapPin size={14} color={Colors.light.tabIconDefault} />
                    <Text style={styles.groupLocation} numberOfLines={1}>{group.location}</Text>
                  </View>
                  
                  <View style={styles.groupMetaRow}>
                    <Users size={14} color={Colors.light.tabIconDefault} />
                    <Text style={styles.groupMembers}>{group.members.toLocaleString()} members</Text>
                  </View>

                  <View style={styles.tagsRow}>
                    {group.tags.map((tag, index) => (
                      <View key={index} style={styles.tagContainer}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Community Features</Text>
        <Text style={styles.sectionSubtitle}>Grow together in faith</Text>
        <View style={styles.grid}>
          {communityFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <TouchableOpacity
                key={feature.id}
                style={styles.card}
                onPress={() => router.push(feature.route as any)}
              >
                <LinearGradient
                  colors={feature.gradient}
                  style={styles.cardGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <View style={styles.cardContent}>
                    <View style={styles.iconContainer}>
                      <Icon size={28} color="#fff" />
                    </View>
                    <View style={styles.textContainer}>
                      <Text style={styles.cardTitle}>{feature.title}</Text>
                      <Text style={styles.cardDescription}>{feature.description}</Text>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {isLoggedIn && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <TouchableOpacity
                  key={action.id}
                  style={styles.actionCard}
                  onPress={() => router.push(action.route as any)}
                >
                  <LinearGradient
                    colors={[`${action.color}20`, `${action.color}10`] as const}
                    style={styles.actionGradient}
                  >
                    <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
                      <Icon size={20} color="#fff" />
                    </View>
                    <Text style={[styles.actionText, { color: action.color }]}>
                      {action.title}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Community Guidelines</Text>
        <LinearGradient
          colors={['#f8fafc', '#ffffff'] as const}
          style={styles.guidelinesGradient}
        >
          <View style={styles.guidelinesCard}>
            <Text style={styles.guidelinesTitle}>Built on Love</Text>
            <Text style={styles.guidelinesText}>
              Our community thrives when we support each other with grace
            </Text>
            <View style={styles.guidelinesList}>
              <Text style={styles.guidelineItem}>✨ Be kind and respectful</Text>
              <Text style={styles.guidelineItem}>✨ Respect different perspectives</Text>
              <Text style={styles.guidelineItem}>✨ Share with authenticity</Text>
              <Text style={styles.guidelineItem}>✨ Pray for each other</Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  headerGradient: {
    paddingBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  seeAllText: {
    color: '#6366f1',
    fontWeight: '600',
    fontSize: 14,
    marginTop: 4,
  },
  groupsScroll: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 16,
  },
  groupCard: {
    width: 280,
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  groupImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#f1f5f9',
  },
  groupBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  groupDistance: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  groupContent: {
    padding: 16,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 8,
  },
  groupMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  groupLocation: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
    flex: 1,
  },
  groupMembers: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  tagContainer: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    marginTop: 8,
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  section: {
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 4,
    paddingHorizontal: 20,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: Colors.light.tabIconDefault,
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  grid: {
    gap: 16,
    paddingHorizontal: 20,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  cardGradient: {
    padding: 20,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
  },
  actionCard: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionGradient: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  guidelinesGradient: {
    borderRadius: 16,
    padding: 2,
    marginHorizontal: 20,
  },
  guidelinesCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
  },
  guidelinesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  guidelinesText: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
    lineHeight: 22,
    marginBottom: 16,
    textAlign: 'center',
  },
  guidelinesList: {
    gap: 8,
  },
  guidelineItem: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: '500',
  },
});