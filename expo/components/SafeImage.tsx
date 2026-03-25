import React, { useState } from 'react';
import { Image, ImageProps, ImageStyle, StyleProp } from 'react-native';
import { FALLBACK_IMAGES, handleImageError, isValidImageUri } from '@/utils/imageUtils';

interface SafeImageProps extends Omit<ImageProps, 'source'> {
  source?: string | { uri?: string } | number | null;
  fallbackType?: keyof typeof FALLBACK_IMAGES;
  fallbackUri?: string;
  style?: StyleProp<ImageStyle>;
}

export default function SafeImage({ 
  source, 
  fallbackType = 'default',
  fallbackUri,
  style,
  onError,
  ...props 
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);

  const handleError = (error: any) => {
    console.warn('SafeImage: Failed to load image, using fallback', error);
    setHasError(true);
    handleImageError('SafeImage', error);
    
    if (onError) {
      onError(error);
    }
  };

  const getImageSource = (): { uri: string } | number => {
    const defaultFallback = fallbackUri || FALLBACK_IMAGES[fallbackType];
    
    if (hasError) {
      return { uri: defaultFallback };
    }

    if (typeof source === 'number') {
      return source;
    }

    if (typeof source === 'string') {
      const trimmed = source.trim();
      if (trimmed.length === 0 || !isValidImageUri(trimmed)) {
        return { uri: defaultFallback };
      }
      return { uri: trimmed };
    }

    if (source && typeof source === 'object' && 'uri' in source) {
      const uri = source.uri;
      if (!uri || (typeof uri === 'string' && uri.trim().length === 0) || !isValidImageUri(uri)) {
        return { uri: defaultFallback };
      }
      const trimmed = typeof uri === 'string' ? uri.trim() : uri;
      if (!isValidImageUri(trimmed)) {
        return { uri: defaultFallback };
      }
      return { uri: trimmed };
    }

    return { uri: defaultFallback };
  };

  const imageSource = getImageSource();
  
  if (typeof imageSource === 'object' && 'uri' in imageSource) {
    if (!imageSource.uri || imageSource.uri.trim() === '') {
      console.error('SafeImage: Attempted to render with empty URI, using fallback');
      const fallback = fallbackUri || FALLBACK_IMAGES[fallbackType];
      return (
        <Image
          {...props}
          source={{ uri: fallback }}
          style={style}
          onError={handleError}
        />
      );
    }
  }

  return (
    <Image
      {...props}
      source={imageSource}
      style={style}
      onError={handleError}
    />
  );
}
