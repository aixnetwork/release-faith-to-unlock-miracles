import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Video, MessageCircle, Users, Calendar, Clock, ExternalLink } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { theme } from '@/constants/theme';
import { Meeting } from '@/types';

interface MeetingCardProps {
  meeting: Meeting;
  onPress: () => void;
  onJoin?: () => void;
}

export const MeetingCard: React.FC<MeetingCardProps> = ({ meeting, onPress, onJoin }) => {
  const startTime = new Date(meeting.startTime);
  const endTime = new Date(meeting.endTime);
  const isUpcoming = startTime > new Date();
  const isPast = endTime < new Date();
  const isOngoing = startTime <= new Date() && endTime >= new Date();

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getPlatformIcon = () => {
    switch (meeting.platform) {
      case 'zoom':
      case 'google_meet':
      case 'ms_teams':
        return <Video size={18} color={Colors.light.tint} />;
      case 'whatsapp':
        return <MessageCircle size={18} color={Colors.light.tint} />;
      case 'in_person':
        return <Users size={18} color={Colors.light.tint} />;
      default:
        return <Video size={18} color={Colors.light.tint} />;
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

  const handleJoin = () => {
    if (onJoin) {
      onJoin();
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isOngoing && styles.ongoingContainer,
        isPast && styles.pastContainer
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
            {meeting.title}
          </Text>
          {meeting.isRecurring && (
            <View style={styles.recurringBadge}>
              <Calendar size={12} color={Colors.light.tint} />
              <Text style={styles.recurringText}>
                {meeting.recurringType === 'daily' ? 'Daily' : 
                 meeting.recurringType === 'weekly' ? 'Weekly' : 'Monthly'}
              </Text>
            </View>
          )}
        </View>
        
        {isOngoing && (
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>Ongoing</Text>
          </View>
        )}
      </View>
      
      <View style={styles.infoRow}>
        <View style={styles.platformInfo}>
          {getPlatformIcon()}
          <Text style={styles.platformText}>{getPlatformName()}</Text>
        </View>
        
        <View style={styles.timeInfo}>
          <Clock size={14} color={Colors.light.text} />
          <Text style={styles.timeText}>
            {formatTime(startTime)} - {formatTime(endTime)}
          </Text>
        </View>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.hostText}>Host: {meeting.host}</Text>
        
        {isUpcoming && onJoin && (
          <TouchableOpacity style={styles.joinButton} onPress={handleJoin}>
            <ExternalLink size={14} color="#FFD93D" />
            <Text style={styles.joinText}>Join</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.tint,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  ongoingContainer: {
    borderLeftColor: '#4CAF50',
    backgroundColor: '#4CAF50' + '10',
  },
  pastContainer: {
    borderLeftColor: '#E5E5E5',
    opacity: 0.8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginRight: theme.spacing.xs,
  },
  recurringBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.tint + '15',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 2,
  },
  recurringText: {
    fontSize: 10,
    color: Colors.light.tint,
    marginLeft: 2,
    fontWeight: '500',
  },
  statusBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    color: Colors.light.background,
    fontSize: 10,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  platformInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  platformText: {
    fontSize: 14,
    color: Colors.light.text,
    marginLeft: theme.spacing.xs,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    color: Colors.light.text,
    opacity: 0.7,
    marginLeft: theme.spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hostText: {
    fontSize: 12,
    color: Colors.light.text,
    opacity: 0.7,
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD93D' + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  joinText: {
    fontSize: 12,
    color: '#FFD93D',
    fontWeight: '600',
    marginLeft: 4,
  },
});