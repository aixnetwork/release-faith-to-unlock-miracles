import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Share2 } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import Colors from '@/constants/Colors';
import { Quote } from '@/types';
import { ShareModal } from '@/components/ShareModal';
import SafeImage from '@/components/SafeImage';

export interface QuoteCardProps {
  quote: Quote;
  onPress?: () => void;
}

export const QuoteCard = ({ quote, onPress }: QuoteCardProps) => {
  const [showShareModal, setShowShareModal] = useState(false);

  const handleShare = () => {
    setShowShareModal(true);
  };

  const shareContent = {
    title: `Quote by ${quote.author}`,
    text: `"${quote.text}" - ${quote.author}`,
    url: `https://releasefaith.app/quote/${quote.id}`,
    hashtags: ['inspiration', 'faith', 'quotes'],
  };

  const CardContent = () => {
    const imageSource = quote.imageUrl && typeof quote.imageUrl === 'string' && quote.imageUrl.trim() !== '' 
      ? quote.imageUrl 
      : undefined;
    
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <SafeImage
            source={imageSource}
            fallbackType="quote"
            style={styles.image}
            resizeMode="cover"
            testID={`quote-image-${quote.id}`}
          />
        </View>
      <View style={styles.content}>
        <Text style={styles.quoteText}>&ldquo;{quote.text}&rdquo;</Text>
        <Text style={styles.author}>— {quote.author}</Text>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Share2 size={18} color={Colors.light.primary} />
          <Text style={styles.shareText}>Share</Text>
        </TouchableOpacity>
      </View>
      </View>
    );
  };

  return (
    <>
      {onPress ? (
        <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
          <CardContent />
        </TouchableOpacity>
      ) : (
        <CardContent />
      )}

      <ShareModal
        visible={showShareModal}
        onClose={() => setShowShareModal(false)}
        title={shareContent.title}
        text={shareContent.text}
        url={shareContent.url}
        hashtags={shareContent.hashtags}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    marginBottom: theme.spacing.lg,
    ...theme.shadows.small
  },
  header: {
    height: 120
  },
  image: {
    width: '100%',
    height: '100%'
  },
  content: {
    padding: theme.spacing.lg
  },
  quoteText: {
    ...theme.typography.body,
    fontStyle: 'italic',
    lineHeight: 24,
    marginBottom: theme.spacing.md
  },
  author: {
    ...theme.typography.caption,
    fontWeight: '600',
    marginBottom: theme.spacing.md
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end'
  },
  shareText: {
    ...theme.typography.caption,
    color: Colors.light.primary,
    marginLeft: 4
  }
});