import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { Stack, router } from 'expo-router';
import { Plus, Calendar, Video, Clock, Users } from 'lucide-react-native';
import { EmptyState } from '@/components/EmptyState';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { useMeetingStore } from '@/store/meetingStore';
import { useUserStore } from '@/store/userStore';
import { Meeting } from '@/types';
import { formatDate, formatTime } from '@/utils/dateUtils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MeetingsScreen() {
  const { meetings, fetchMeetings } = useMeetingStore();
  const { isLoggedIn, plan } = useUserStore();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<'upcoming' | 'past' | 'all'>('upcoming');
  const [refreshing, setRefreshing] = useState(false);

  const isIndividualPlan = plan === 'individual' || plan === 'individual_yearly' || plan === 'free';
  const hasGroupAccess = plan && (['org_small', 'org_medium', 'org_large', 'group_family', 'small_church', 'large_church'].includes(plan) || isIndividualPlan);

  useEffect(() => {
    if (isLoggedIn) {
      fetchMeetings();
    }
  }, [isLoggedIn, fetchMeetings]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (isLoggedIn) {
      await fetchMeetings();
    }
    setRefreshing(false);
  };
  
  const filteredMeetings = meetings.filter((meeting) => {
    const meetingDate = new Date(meeting.startTime);
    const now = new Date();
    
    if (filter === 'upcoming') {
      return meetingDate >= now;
    } else if (filter === 'past') {
      return meetingDate < now;
    }
    return true;
  });
  
  const sortedMeetings = [...filteredMeetings].sort((a, b) => {
    return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
  });

  const handleMeetingPress = (id: string) => {
    try {
      router.push(`/meeting/${id}`);
    } catch (error) {
      console.error('Error navigating to meeting:', error);
    }
  };

  const handleCreateMeeting = () => {
    try {
      router.push('/meeting/create');
    } catch (error) {
      console.error('Error navigating to create meeting:', error);
    }
  };
  
  const renderMeetingItem = ({ item }: { item: Meeting }) => {
    const startTime = new Date(item.startTime);
    const endTime = new Date(item.endTime);
    const isPast = startTime < new Date();
    
    return (
      <TouchableOpacity
        style={[styles.meetingCard, isPast && styles.pastMeetingCard]}
        onPress={() => handleMeetingPress(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.meetingHeader}>
          <View style={[styles.meetingTypeTag, item.isOnline ? styles.onlineTag : styles.inPersonTag]}>
            <Text style={styles.meetingTypeText}>
              {item.isOnline ? 'Online' : 'In Person'}
            </Text>
          </View>
          {isPast && (
            <View style={styles.pastTag}>
              <Text style={styles.pastTagText}>Past</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.meetingTitle}>{item.title}</Text>
        
        <View style={styles.meetingInfoRow}>
          <Calendar size={16} color={Colors.light.icon} />
          <Text style={styles.meetingInfoText}>{formatDate(startTime)}</Text>
        </View>
        
        <View style={styles.meetingInfoRow}>
          <Clock size={16} color={Colors.light.icon} />
          <Text style={styles.meetingInfoText}>
            {formatTime(startTime)} - {formatTime(endTime)}
          </Text>
        </View>
        
        {item.location && !item.isOnline && (
          <View style={styles.meetingInfoRow}>
            <Video size={16} color={Colors.light.icon} />
            <Text style={styles.meetingInfoText}>
              {typeof item.location === 'string'
                ? item.location
                : item.location.address || item.location.virtualLink || 'Location TBD'}
            </Text>
          </View>
        )}
        
        <View style={styles.meetingFooter}>
          <View style={styles.hostInfo}>
            <Text style={styles.hostLabel}>Host:</Text>
            <Text style={styles.hostName}>{item.hostName}</Text>
          </View>
          
          {item.attendees && (
            <View style={styles.attendeeCount}>
              <Users size={14} color={Colors.light.primary} />
              <Text style={styles.attendeeCountText}>
                {item.attendees.length}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const showAddButton = isLoggedIn && (filter === 'upcoming' || filter === 'all');
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen
        options={{
          title: 'Prayer Meetings',
        }}
      />
      
      <View style={styles.content}>
        {/* Filter Tabs */}
        {!hasGroupAccess && isLoggedIn ? (
           <View style={styles.upgradeContainer}>
             <View style={styles.upgradeCard}>
               <Users size={48} color={Colors.light.primary} />
               <Text style={styles.upgradeTitle}>Upgrade to Join Meetings</Text>
               <Text style={styles.upgradeDescription}>
                 Prayer meetings are available for church and family groups. Upgrade your plan to host and join live prayer sessions.
               </Text>
               <TouchableOpacity 
                 style={styles.upgradeButton}
                 onPress={() => router.push('/membership')}
               >
                 <Text style={styles.upgradeButtonText}>View Plans</Text>
               </TouchableOpacity>
             </View>
           </View>
        ) : (
          <>
            <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'upcoming' && styles.activeFilterTab]}
            onPress={() => setFilter('upcoming')}
          >
            <Text style={[styles.filterText, filter === 'upcoming' && styles.activeFilterText]}>
              Upcoming
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterTab, filter === 'past' && styles.activeFilterTab]}
            onPress={() => setFilter('past')}
          >
            <Text style={[styles.filterText, filter === 'past' && styles.activeFilterText]}>
              Past
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterTab, filter === 'all' && styles.activeFilterTab]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>
              All
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Meetings List */}
        {!isLoggedIn ? (
          <EmptyState
            icon="calendar"
            title="Join Prayer Meetings"
            description="Sign in to join virtual prayer meetings or create your own"
            actionText="Sign In"
            onAction={() => router.push('/login')}
          />
        ) : sortedMeetings.length === 0 ? (
          <EmptyState
            icon="calendar"
            title="No meetings found"
            description={
              filter === 'upcoming'
                ? "You don't have any upcoming meetings"
                : filter === 'past'
                ? "You don't have any past meetings"
                : "You don't have any meetings yet"
            }
            actionText="Create Meeting"
            onAction={handleCreateMeeting}
          />
        ) : (
          <FlatList
            data={sortedMeetings}
            renderItem={renderMeetingItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.meetingsList}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        )}
        </>
        )}
      </View>

      {/* Floating Add Meeting Button */}
      {showAddButton && (
        <TouchableOpacity
          style={styles.floatingAddButton}
          onPress={handleCreateMeeting}
          activeOpacity={0.8}
        >
          <Plus size={24} color={Colors.light.white} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  upgradeContainer: {
    flex: 1,
    padding: theme.spacing.lg,
    justifyContent: 'center',
  },
  upgradeCard: {
    backgroundColor: Colors.light.card,
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    gap: theme.spacing.md,
    ...theme.shadows.medium,
  },
  upgradeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.textPrimary,
    textAlign: 'center',
  },
  upgradeDescription: {
    fontSize: 16,
    color: Colors.light.textMedium,
    textAlign: 'center',
    lineHeight: 22,
  },
  upgradeButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginTop: theme.spacing.sm,
  },
  upgradeButtonText: {
    color: Colors.light.white,
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  addButton: {
    padding: theme.spacing.xs,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    backgroundColor: Colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterTab: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeFilterTab: {
    borderBottomColor: Colors.light.primary,
  },
  filterText: {
    ...theme.typography.body,
    color: Colors.light.icon,
    fontWeight: '500',
  },
  activeFilterText: {
    color: Colors.light.primary,
    fontWeight: '600',
  },
  meetingsList: {
    padding: theme.spacing.md,
    paddingBottom: 100,
  },
  meetingCard: {
    backgroundColor: Colors.light.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#eee',
    ...theme.shadows.small,
  },
  pastMeetingCard: {
    opacity: 0.7,
  },
  meetingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  meetingTypeTag: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  onlineTag: {
    backgroundColor: '#E0F2FE',
  },
  inPersonTag: {
    backgroundColor: '#E0E7FF',
  },
  meetingTypeText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.light.primary,
  },
  pastTag: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: '#F3F4F6',
  },
  pastTagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  meetingTitle: {
    ...theme.typography.subtitle,
    marginBottom: theme.spacing.sm,
  },
  meetingInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  meetingInfoText: {
    ...theme.typography.body,
    color: Colors.light.text,
    marginLeft: theme.spacing.sm,
  },
  meetingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  hostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hostLabel: {
    ...theme.typography.caption,
    color: Colors.light.icon,
    marginRight: 4,
  },
  hostName: {
    ...theme.typography.caption,
    fontWeight: '500',
    color: Colors.light.text,
  },
  attendeeCount: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primary + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  attendeeCountText: {
    ...theme.typography.caption,
    color: Colors.light.primary,
    fontWeight: '500',
    marginLeft: 4,
  },
  floatingAddButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.large,
    elevation: 8,
  },
});