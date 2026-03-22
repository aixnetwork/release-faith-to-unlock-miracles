import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, Share, Linking, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Video, Calendar, Clock, Users, Link, MessageCircle, Edit, Trash2, Share2, ExternalLink } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { useMeetingStore } from '@/store/meetingStore';
import { useUserStore } from '@/store/userStore';
import { Colors } from '@/constants/Colors';
import { theme } from '@/constants/theme';
import * as Haptics from 'expo-haptics';
import { Meeting } from '@/types';

export default function MeetingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { meetings, getMeeting, deleteMeeting, isLoading } = useMeetingStore();
  const { name: userName } = useUserStore();
  const [meeting, setMeeting] = useState<Meeting | null>(null);

  useEffect(() => {
    if (id) {
      const meetingData = getMeeting(id);
      if (meetingData) {
        setMeeting(meetingData);
      }
    }
  }, [id, meetings]);

  if (!meeting) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Meeting not found</Text>
        <Button
          title="Go Back"
          onPress={() => router.back()}
          style={styles.backButton}
        />
      </View>
    );
  }

  const isHost = meeting.host === userName;
  const isPastMeeting = new Date(meeting.endTime) < new Date();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleEditMeeting = () => {
    router.push(`/meeting/edit/${id}`);
  };

  const handleDeleteMeeting = () => {
    Alert.alert(
      "Delete Meeting",
      "Are you sure you want to delete this meeting?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            if (Platform.OS !== 'web') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            }
            await deleteMeeting(id);
            router.replace('/(tabs)/meetings');
          }
        }
      ]
    );
  };

  const handleShareMeeting = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    const meetingInfo = `Join my meeting: ${meeting.title}
` +
      `Date: ${formatDate(meeting.startTime)}
` +
      `Time: ${formatTime(meeting.startTime)} - ${formatTime(meeting.endTime)}
` +
      `Platform: ${meeting.platform}
` +
      (meeting.link ? `Link: ${meeting.link}
` : '') +
      (meeting.location ? `Location: ${meeting.location.address || meeting.location.virtualLink || 'TBD'}
` : '');
    
    try {
      await Share.share({
        message: meetingInfo,
        title: meeting.title,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share meeting');
    }
  };

  const handleJoinMeeting = () => {
    if (isPastMeeting) {
      Alert.alert('Meeting Ended', 'This meeting has already ended.');
      return;
    }
    
    if (meeting.link) {
      Linking.openURL(meeting.link).catch(() => {
        Alert.alert('Error', 'Could not open the meeting link');
      });
    } else if (meeting.platform === 'in_person') {
      Alert.alert('In-Person Meeting', `This meeting will take place at: ${meeting.location?.address || 'Location TBD'}`);
    }
  };

  const getPlatformIcon = () => {
    switch (meeting.platform) {
      case 'zoom':
      case 'google_meet':
      case 'ms_teams':
        return <Video size={24} color={Colors.light.primary} />;
      case 'whatsapp':
        return <MessageCircle size={24} color={Colors.light.primary} />;
      case 'in_person':
        return <Users size={24} color={Colors.light.primary} />;
      default:
        return <Link size={24} color={Colors.light.primary} />;
    }
  };

  const getPlatformName = () => {
    switch (meeting.platform) {
      case 'zoom':
        return 'Zoom';
      case 'google_meet':
        return 'Google Meet';
      case 'ms_teams':
        return 'Microsoft Teams';
      case 'whatsapp':
        return 'WhatsApp';
      case 'in_person':
        return 'In Person';
      default:
        return meeting.platform;
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{meeting.title}</Text>
        
        {isHost && !isPastMeeting && (
          <View style={styles.hostActions}>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={handleEditMeeting}
            >
              <Edit size={20} color={Colors.light.primary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={handleDeleteMeeting}
            >
              <Trash2 size={20} color={Colors.light.error} />
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      {meeting.description && (
        <View style={styles.section}>
          <Text style={styles.description}>{meeting.description}</Text>
        </View>
      )}
      
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <Calendar size={20} color={Colors.light.primary} />
          </View>
          <View>
            <Text style={styles.infoLabel}>Date</Text>
            <Text style={styles.infoValue}>{formatDate(meeting.startTime)}</Text>
          </View>
        </View>
        
        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <Clock size={20} color={Colors.light.primary} />
          </View>
          <View>
            <Text style={styles.infoLabel}>Time</Text>
            <Text style={styles.infoValue}>
              {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
            </Text>
          </View>
        </View>
        
        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            {getPlatformIcon()}
          </View>
          <View>
            <Text style={styles.infoLabel}>Platform</Text>
            <Text style={styles.infoValue}>{getPlatformName()}</Text>
          </View>
        </View>
        
        {meeting.link && (
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Link size={20} color={Colors.light.primary} />
            </View>
            <View style={styles.linkContainer}>
              <Text style={styles.infoLabel}>Meeting Link</Text>
              <TouchableOpacity onPress={() => Linking.openURL(meeting.link || '')}>
                <Text style={styles.linkText} numberOfLines={1} ellipsizeMode="middle">
                  {meeting.link}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        {meeting.location && (
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Users size={20} color={Colors.light.primary} />
            </View>
            <View>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>
                {meeting.location.type === 'physical' 
                  ? meeting.location.address || 'Location TBD'
                  : meeting.location.type === 'virtual'
                  ? meeting.location.virtualLink || 'Link TBD'
                  : 'Hybrid meeting'}
              </Text>
            </View>
          </View>
        )}
        
        {meeting.isRecurring && (
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Calendar size={20} color={Colors.light.primary} />
            </View>
            <View>
              <Text style={styles.infoLabel}>Recurring</Text>
              <Text style={styles.infoValue}>
                {meeting.recurringType === 'daily' ? 'Daily' : 
                 meeting.recurringType === 'weekly' ? 'Weekly' : 'Monthly'}
              </Text>
            </View>
          </View>
        )}
        
        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <Users size={20} color={Colors.light.primary} />
          </View>
          <View>
            <Text style={styles.infoLabel}>Host</Text>
            <Text style={styles.infoValue}>{meeting.host}</Text>
          </View>
        </View>
      </View>
      
      {meeting.invitees && meeting.invitees.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Invited Participants</Text>
          <View style={styles.inviteesList}>
            {meeting.invitees.map((invitee: string, index: number) => (
              <View key={index} style={styles.inviteeItem}>
                <Text style={styles.inviteeEmail}>{invitee}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
      
      <View style={styles.actionButtons}>
        <Button
          title="Share Meeting"
          onPress={handleShareMeeting}
          variant="outline"
          icon={<Share2 size={18} color={Colors.light.primary} />}
          style={styles.shareButton}
        />
        
        {!isPastMeeting && (
          <Button
            title="Join Meeting"
            onPress={handleJoinMeeting}
            icon={<ExternalLink size={18} color={Colors.light.white} />}
            style={styles.joinButton}
          />
        )}
      </View>
      
      {isPastMeeting && (
        <View style={styles.pastMeetingBanner}>
          <Text style={styles.pastMeetingText}>This meeting has ended</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  loadingText: {
    ...theme.typography.body,
    marginBottom: theme.spacing.md,
  },
  backButton: {
    marginTop: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
  },
  title: {
    ...theme.typography.title,
    flex: 1,
    marginRight: theme.spacing.md,
  },
  hostActions: {
    flexDirection: 'row',
  },
  iconButton: {
    padding: theme.spacing.sm,
    marginLeft: theme.spacing.sm,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  description: {
    ...theme.typography.body,
    color: Colors.light.text,
  },
  infoCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.small,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
    alignItems: 'center',
  },
  infoIcon: {
    marginRight: theme.spacing.md,
    width: 20,
  },
  infoLabel: {
    ...theme.typography.caption,
    color: Colors.light.textLight,
    marginBottom: 2,
  },
  infoValue: {
    ...theme.typography.body,
  },
  linkContainer: {
    flex: 1,
  },
  linkText: {
    ...theme.typography.body,
    color: Colors.light.primary,
    textDecorationLine: 'underline',
  },
  sectionTitle: {
    ...theme.typography.subtitle,
    marginBottom: theme.spacing.md,
  },
  inviteesList: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    ...theme.shadows.small,
  },
  inviteeItem: {
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  inviteeEmail: {
    ...theme.typography.body,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: theme.spacing.md,
  },
  shareButton: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  joinButton: {
    flex: 1,
  },
  pastMeetingBanner: {
    backgroundColor: Colors.light.border,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  pastMeetingText: {
    ...theme.typography.body,
    color: Colors.light.textLight,
  },
});