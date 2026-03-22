import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Linking, Alert, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Video, ExternalLink, Copy, Check } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { Button } from '@/components/Button';
import { useMeetingStore } from '@/store/meetingStore';
import { Colors } from '@/constants/Colors';
import { theme } from '@/constants/theme';
import * as Haptics from 'expo-haptics';
import { Meeting } from '@/types';

export default function JoinMeetingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getMeeting } = useMeetingStore();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (id) {
      const meetingData = getMeeting(id);
      if (meetingData) {
        setMeeting(meetingData);
      }
    }
  }, [id]);

  if (!meeting) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Meeting not found</Text>
        <Button
          title="Go Back"
          onPress={() => router.back()}
          style={styles.backButton}
        />
      </View>
    );
  }

  const isPastMeeting = new Date(meeting.endTime) < new Date();

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

  const handleCopyLink = async () => {
    if (meeting.link) {
      await Clipboard.setStringAsync(meeting.link);
      setCopied(true);
      
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      setTimeout(() => {
        setCopied(false);
      }, 3000);
    }
  };

  const handleCopyDetails = async () => {
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
    
    const meetingDetails = `${meeting.title}
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
` : '') +
      `Host: ${meeting.host}`;
    
    await Clipboard.setStringAsync(meetingDetails);
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    Alert.alert('Copied', 'Meeting details copied to clipboard');
  };

  const getPlatformIcon = () => {
    switch (meeting.platform) {
      case 'zoom':
      case 'google_meet':
      case 'ms_teams':
        return <Video size={24} color={Colors.light.primary} />;
      case 'whatsapp':
        return <Video size={24} color={Colors.light.primary} />;
      case 'in_person':
        return <Video size={24} color={Colors.light.primary} />;
      default:
        return <Video size={24} color={Colors.light.primary} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          {getPlatformIcon()}
        </View>
        
        <Text style={styles.title}>Join {meeting.title}</Text>
        
        <Text style={styles.platformName}>
          via {meeting.platform === 'google_meet' ? 'Google Meet' : 
               meeting.platform === 'ms_teams' ? 'Microsoft Teams' : 
               meeting.platform ? meeting.platform.charAt(0).toUpperCase() + meeting.platform.slice(1) : 'TBD'}
        </Text>
        
        {meeting.link && (
          <View style={styles.linkContainer}>
            <Text style={styles.linkLabel}>Meeting Link:</Text>
            <Text style={styles.link} numberOfLines={2} ellipsizeMode="middle">
              {meeting.link}
            </Text>
            
            <TouchableOpacity 
              style={styles.copyButton}
              onPress={handleCopyLink}
            >
              {copied ? (
                <Check size={20} color={Colors.light.success} />
              ) : (
                <Copy size={20} color={Colors.light.primary} />
              )}
            </TouchableOpacity>
          </View>
        )}
        
        {isPastMeeting ? (
          <View style={styles.pastMeetingBanner}>
            <Text style={styles.pastMeetingText}>This meeting has ended</Text>
          </View>
        ) : (
          <Button
            title="Join Meeting Now"
            onPress={handleJoinMeeting}
            icon={<ExternalLink size={18} color={Colors.light.white} />}
            style={styles.joinButton}
          />
        )}
        
        <TouchableOpacity 
          style={styles.copyDetailsButton}
          onPress={handleCopyDetails}
        >
          <Text style={styles.copyDetailsText}>Copy Meeting Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  content: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    alignItems: 'center',
    ...theme.shadows.medium,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.light.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    ...theme.typography.title,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  platformName: {
    ...theme.typography.body,
    color: Colors.light.textLight,
    marginBottom: theme.spacing.lg,
  },
  linkContainer: {
    width: '100%',
    backgroundColor: Colors.light.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    position: 'relative',
  },
  linkLabel: {
    ...theme.typography.caption,
    color: Colors.light.textLight,
    marginBottom: 4,
  },
  link: {
    ...theme.typography.body,
    color: Colors.light.primary,
    paddingRight: 40,
  },
  copyButton: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    padding: 4,
  },
  joinButton: {
    width: '100%',
    marginBottom: theme.spacing.md,
  },
  copyDetailsButton: {
    padding: theme.spacing.sm,
  },
  copyDetailsText: {
    ...theme.typography.body,
    color: Colors.light.primary,
    textDecorationLine: 'underline',
  },
  pastMeetingBanner: {
    backgroundColor: Colors.light.border,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    width: '100%',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  pastMeetingText: {
    ...theme.typography.body,
    color: Colors.light.textLight,
  },
  errorText: {
    ...theme.typography.body,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  backButton: {
    alignSelf: 'center',
  },
});