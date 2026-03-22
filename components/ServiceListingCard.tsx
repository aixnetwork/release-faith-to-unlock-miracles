import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Star, MapPin, Clock } from 'lucide-react-native';
import type { ServiceListing } from '@/types';
import SafeImage from '@/components/SafeImage';

interface ServiceListingCardProps {
  listing: ServiceListing;
  onPress: () => void;
  testID?: string;
}

export const ServiceListingCard: React.FC<ServiceListingCardProps> = ({
  listing,
  onPress,
  testID
}) => {
  const formatCurrency = (value: unknown): string => {
    const num = typeof value === 'string' ? parseFloat(value) : typeof value === 'number' ? value : Number(value ?? 0);
    const isValid = Number.isFinite(num);
    const amount = isValid ? num : 0;
    return `$${amount.toFixed(2)}`;
  };

  const formatPrice = () => {
    console.log('formatPrice(listing):', listing);
    switch (listing.priceType) {
      case 'free':
        return 'Free';
      case 'donation':
        return 'Donation';
      case 'fixed':
        return formatCurrency(listing.price);
      case 'hourly':
        return `${formatCurrency(listing.price)}/hr`;
      default:
        return 'Contact for pricing';
    }
  };

  const getCategoryLabel = (category: string) => {
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const displayCategory = (listing: any) => {
    if (listing.categoryName) {
      return listing.categoryName;
    }
    return getCategoryLabel(listing.category);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      testID={testID}
      activeOpacity={0.7}
    >
      
      
      {listing.images.length > 0 && listing.images[0] && (
        <SafeImage
          source={listing.images[0]}
          fallbackType="service"
          style={styles.image}
          resizeMode="cover"
          testID={`service-image-${listing.id}`}
        />
      )}
      
      <View style={styles.content}>
        {listing.featured && (
            <View style={styles.featuredBadge}>
              <Text style={styles.featuredText}>Featured</Text>
            </View>
          )}
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={2}>
            {listing.title}
          </Text>
          <Text style={styles.price} testID={`service-price-${listing.id}`}>{formatPrice()}</Text>
        </View>
        
        <Text style={styles.category}>
          {displayCategory(listing)}
        </Text>
        
        <Text style={styles.description} numberOfLines={2}>
          {listing.description}
        </Text>
        
        <View style={styles.providerInfo}>
          <SafeImage
            source={listing.provider.avatar || undefined}
            fallbackType="user"
            style={styles.providerAvatar}
            testID={`provider-avatar-${listing.provider.id}`}
          />
          <View style={styles.providerDetails}>
            <Text style={styles.providerName}>{listing.provider.name}</Text>
            <View style={styles.ratingContainer}>
              <Star size={14} color="#FFD700" fill="#FFD700" />
              <Text style={styles.rating}>
                {listing.provider.rating.toFixed(1)} ({listing.provider.reviewCount})
              </Text>
              {listing.provider.verified && (
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>✓</Text>
                </View>
              )}
            </View>
          </View>
        </View>
        
        <View style={styles.footer}>
          {listing.location && (
            <View style={styles.locationContainer}>
              <MapPin size={14} color="#666" />
              <Text style={styles.locationText}>
                {listing.location.type === 'online' ? 'Online' : 
                 `${listing.location.city || ''} ${listing.location.state || ''}`.trim()}
              </Text>
            </View>
          )}
          
          {listing.duration && (
            <View style={styles.durationContainer}>
              <Clock size={14} color="#666" />
              <Text style={styles.durationText}>{listing.duration} min</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  featuredBadge: {
    alignSelf: 'flex-start',
    marginBottom: 12,
    backgroundColor: '#FF6B35',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  featuredText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  image: {
    width: '100%',
    height: 160,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginRight: 12,
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
  },
  category: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  providerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  providerDetails: {
    flex: 1,
  },
  providerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    marginRight: 8,
  },
  verifiedBadge: {
    backgroundColor: '#10B981',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
});
