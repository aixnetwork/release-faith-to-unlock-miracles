import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { X, User, Mail, Calendar } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';

interface UserProfileModalProps {
  visible: boolean;
  onClose: () => void;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email?: string;
    date_created?: string;
  } | null;
  isOrganizer?: boolean;
}

export function UserProfileModal({
  visible,
  onClose,
  user,
  isOrganizer = false,
}: UserProfileModalProps) {
  if (!user) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch (error) {
      return 'N/A';
    }
  };

  const userName = user.first_name && user.last_name
    ? `${user.first_name} ${user.last_name}`
    : 'Anonymous';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>User Profile</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
            >
              <X size={24} color={Colors.light.textMedium} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <User size={48} color={Colors.light.white} />
              </View>
              <Text style={styles.userName}>{userName}</Text>
              {isOrganizer && (
                <View style={styles.organizerBadge}>
                  <Text style={styles.organizerBadgeText}>Organizer</Text>
                </View>
              )}
            </View>

            <View style={styles.infoSection}>
              {user.email && (
                <View style={styles.infoRow}>
                  <View style={styles.infoIcon}>
                    <Mail size={20} color={Colors.light.primary} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Email</Text>
                    <Text style={styles.infoValue}>{user.email}</Text>
                  </View>
                </View>
              )}

              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Calendar size={20} color={Colors.light.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Member Since</Text>
                  <Text style={styles.infoValue}>{formatDate(user.date_created)}</Text>
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.closeButtonBottom}
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    ...theme.shadows.large,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.textPrimary,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  avatarContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  organizerBadge: {
    backgroundColor: Colors.light.primary + '20',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.xs,
  },
  organizerBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  infoSection: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textLight,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    color: Colors.light.textPrimary,
    fontWeight: '500',
  },
  footer: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderLight,
  },
  closeButtonBottom: {
    backgroundColor: Colors.light.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.white,
  },
});
