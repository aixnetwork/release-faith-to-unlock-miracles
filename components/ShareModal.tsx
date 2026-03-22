import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, Share, Platform } from 'react-native';
import { X, Share2, Copy, MessageCircle } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import * as Clipboard from 'expo-clipboard';

interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  text: string;
  url?: string;
  hashtags?: string[];
}

export function ShareModal({ visible, onClose, title, text, url, hashtags }: ShareModalProps) {
  const handleShare = async () => {
    try {
      const hashtagsText = hashtags && hashtags.length > 0 ? `\n\n${hashtags.map(tag => `#${tag}`).join(' ')}` : '';
      const shareContent = {
        title,
        message: `${title}\n\n${text}${url ? `\n\n${url}` : ''}${hashtagsText}`,
        url: url || '',
      };

      if (Platform.OS === 'web') {
        if (navigator.share) {
          await navigator.share(shareContent);
        } else {
          // Fallback for web browsers without native share
          await Clipboard.setStringAsync(shareContent.message);
          alert('Content copied to clipboard!');
        }
      } else {
        await Share.share(shareContent);
      }
      onClose();
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      const hashtagsText = hashtags && hashtags.length > 0 ? `\n\n${hashtags.map(tag => `#${tag}`).join(' ')}` : '';
      const content = `${title}\n\n${text}${url ? `\n\n${url}` : ''}${hashtagsText}`;
      await Clipboard.setStringAsync(content);
      onClose();
      // You might want to show a toast here
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Share</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={Colors.light.textMedium} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.title} numberOfLines={2}>{title}</Text>
            <Text style={styles.text} numberOfLines={4}>{text}</Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <Share2 size={20} color={Colors.light.primary} />
              <Text style={styles.actionButtonText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleCopyToClipboard}>
              <Copy size={20} color={Colors.light.primary} />
              <Text style={styles.actionButtonText}>Copy</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.textPrimary,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  content: {
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  text: {
    fontSize: 14,
    color: Colors.light.textMedium,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.card,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    gap: theme.spacing.sm,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.primary,
  },
});