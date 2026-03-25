import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Tag, Check, X } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { trpcClient } from '@/lib/trpc';

interface CouponValidatorProps {
  planId?: string;
  amount?: number;
  onCouponApplied?: (coupon: any) => void;
  onCouponRemoved?: () => void;
  appliedCoupon?: any;
}

export default function CouponValidator({
  planId,
  amount,
  onCouponApplied,
  onCouponRemoved,
  appliedCoupon,
}: CouponValidatorProps) {
  const [couponCode, setCouponCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) {
      Alert.alert('Error', 'Please enter a coupon code');
      return;
    }

    setIsValidating(true);

    try {
      const result = await trpcClient.admin.coupons.validate.query({
        code: couponCode.trim(),
        planId,
        amount,
      });

      if (result.success && result.valid && result.coupon) {
        onCouponApplied?.(result.coupon);
        Alert.alert('Success!', `Coupon "${result.coupon.code}" applied successfully!`);
      } else {
        Alert.alert('Invalid Coupon', result.error || 'This coupon is not valid');
      }
    } catch (error) {
      console.error('Coupon validation error:', error);
      Alert.alert('Error', 'Failed to validate coupon. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    onCouponRemoved?.();
  };

  if (appliedCoupon) {
    return (
      <View style={styles.appliedCouponContainer}>
        <View style={styles.appliedCouponInfo}>
          <Check size={16} color={Colors.light.success} />
          <Text style={styles.appliedCouponCode}>{appliedCoupon.code}</Text>
          <Text style={styles.appliedCouponDescription}>{appliedCoupon.description}</Text>
        </View>
        <TouchableOpacity onPress={handleRemoveCoupon} style={styles.removeCouponButton}>
          <X size={16} color={Colors.light.error} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Have a Coupon Code?</Text>
      
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <Tag size={20} color={Colors.light.textMedium} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Enter coupon code"
            value={couponCode}
            onChangeText={setCouponCode}
            autoCapitalize="characters"
            placeholderTextColor={Colors.light.inputPlaceholder}
            editable={!isValidating}
          />
        </View>
        <TouchableOpacity
          style={[styles.applyButton, (isValidating || !couponCode.trim()) && styles.applyButtonDisabled]}
          onPress={handleValidateCoupon}
          disabled={isValidating || !couponCode.trim()}
        >
          {isValidating ? (
            <ActivityIndicator size="small" color={Colors.light.white} />
          ) : (
            <Text style={styles.applyButtonText}>Apply</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Sample coupon codes for demo */}
      <View style={styles.sampleCoupons}>
        <Text style={styles.sampleCouponsTitle}>Try these codes:</Text>
        <View style={styles.sampleCouponsList}>
          <TouchableOpacity
            style={styles.sampleCouponCode}
            onPress={() => setCouponCode('LAUNCH50')}
          >
            <Text style={styles.sampleCouponText}>LAUNCH50</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.sampleCouponCode}
            onPress={() => setCouponCode('LIFETIME25')}
          >
            <Text style={styles.sampleCouponText}>LIFETIME25</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.sampleCouponCode}
            onPress={() => setCouponCode('SAVE20')}
          >
            <Text style={styles.sampleCouponText}>SAVE20</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.md,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  icon: {
    marginRight: theme.spacing.sm,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: Colors.light.textPrimary,
  },
  applyButton: {
    backgroundColor: Colors.light.secondary,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  applyButtonDisabled: {
    opacity: 0.6,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.white,
  },
  appliedCouponContainer: {
    backgroundColor: Colors.light.success + '10',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.light.success + '30',
    marginBottom: theme.spacing.md,
  },
  appliedCouponInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: theme.spacing.sm,
  },
  appliedCouponCode: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.light.success,
  },
  appliedCouponDescription: {
    fontSize: 14,
    color: Colors.light.success,
    opacity: 0.8,
  },
  removeCouponButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.light.error + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sampleCoupons: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
  },
  sampleCouponsTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.light.textMedium,
    marginBottom: theme.spacing.sm,
  },
  sampleCouponsList: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  sampleCouponCode: {
    backgroundColor: Colors.light.primary + '10',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  sampleCouponText: {
    color: Colors.light.primary,
    fontSize: 12,
    fontWeight: '600' as const,
  },
});