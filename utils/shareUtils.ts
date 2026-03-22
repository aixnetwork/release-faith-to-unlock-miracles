import { Platform, Share as RNShare, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';

export interface ShareContent {
  title: string;
  text: string;
  url?: string;
  hashtags?: string[];
}

export const shareContent = async (content: ShareContent) => {
  const { title, text, url, hashtags = [] } = content;
  const shareUrl = url || '';
  const shareText = `${text}\n\n${shareUrl}`;

  try {
    if (Platform.OS === 'web') {
      // For web, try to use Web Share API if available, otherwise copy to clipboard
      if (navigator.share) {
        await navigator.share({
          title,
          text: shareText,
          url: shareUrl,
        });
      } else {
        await copyToClipboard(shareText);
        alert('Link copied to clipboard!');
      }
    } else {
      // For mobile, use native share
      await RNShare.share({
        message: shareText,
        url: shareUrl,
        title,
      });
    }
  } catch (error) {
    console.error('Error sharing:', error);
    // Fallback to copying to clipboard
    await copyToClipboard(shareText);
    Alert.alert('Shared', 'Content copied to clipboard');
  }
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await Clipboard.setStringAsync(text);
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    return true;
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return false;
  }
};

export const shareToSocialMedia = {
  twitter: (text: string, url: string, hashtags: string[] = []) => {
    const twitterText = encodeURIComponent(`${text} ${hashtags.map(tag => `#${tag}`).join(' ')}`);
    const twitterUrl = encodeURIComponent(url);
    return `https://twitter.com/intent/tweet?text=${twitterText}&url=${twitterUrl}`;
  },
  
  facebook: (url: string) => {
    const facebookUrl = encodeURIComponent(url);
    return `https://www.facebook.com/sharer/sharer.php?u=${facebookUrl}`;
  },
  
  whatsapp: (text: string, url: string) => {
    const whatsappText = encodeURIComponent(`${text}\n\n${url}`);
    return `https://wa.me/?text=${whatsappText}`;
  },
  
  linkedin: (title: string, text: string, url: string) => {
    const linkedinUrl = encodeURIComponent(url);
    const linkedinTitle = encodeURIComponent(title);
    const linkedinSummary = encodeURIComponent(text);
    return `https://www.linkedin.com/sharing/share-offsite/?url=${linkedinUrl}&title=${linkedinTitle}&summary=${linkedinSummary}`;
  },
  
  email: (title: string, text: string, url: string) => {
    const subject = encodeURIComponent(title);
    const body = encodeURIComponent(`${text}\n\n${url}`);
    return `mailto:?subject=${subject}&body=${body}`;
  },
};