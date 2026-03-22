import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Linking, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { Send, Mail, Phone, MessageCircle, CheckCircle } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { useUserStore } from '@/store/userStore';
import { useTranslation } from '@/utils/translations';

export default function ContactSupportScreen() {
  const { name, email, settings } = useUserStore();
  const { t } = useTranslation(settings.language);
  
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const categories = [
    'Account Issues',
    'Billing & Payments',
    'Technical Problems',
    'Feature Request',
    'Prayer Support',
    'Community Guidelines',
    'Content Issues',
    'Bug Report',
    'Feedback',
    'Other'
  ];

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    
    if (!message.trim()) {
      newErrors.message = 'Message is required';
    } else if (message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }
    
    if (!category) {
      newErrors.category = 'Please select a category';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call - in real app, this would send to your backend
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create email body for fallback
      const emailBody = `
Category: ${category}
Subject: ${subject}

Message:
${message}

---
User Details:
Name: ${name}
Email: ${email}
App Version: 1.0.0
Platform: ${Platform.OS}
      `.trim();

      // Try to send email as fallback
      const emailUrl = `mailto:support@releasefaith.net?subject=${encodeURIComponent(`[${category}] ${subject}`)}&body=${encodeURIComponent(emailBody)}`;
      
      const canOpenEmail = await Linking.canOpenURL(emailUrl);
      if (canOpenEmail) {
        await Linking.openURL(emailUrl);
      }
      
      setIsSubmitted(true);
      setIsSubmitting(false);
      
      // Reset form after delay
      setTimeout(() => {
        setSubject('');
        setMessage('');
        setCategory('');
        setIsSubmitted(false);
      }, 3000);
      
    } catch (error) {
      setIsSubmitting(false);
      Alert.alert(
        "Error",
        "Failed to send message. Please try again or contact us directly at support@releasefaith.net"
      );
    }
  };

  const openDirectContact = (type: 'email' | 'phone' | 'whatsapp') => {
    switch (type) {
      case 'email':
        Linking.openURL('mailto:support@releasefaith.net?subject=Support%20Request');
        break;
      case 'phone':
        Linking.openURL('tel:+18887185333');
        break;
      case 'whatsapp':
        Linking.openURL('https://chat.whatsapp.com/FUxLSjOQLHIDM6Ng9W8rE7');
        break;
    }
  };

  if (isSubmitted) {
    return (
      <>
        <Stack.Screen options={{ title: t('help.contact') }} />
        <View style={styles.successContainer}>
          <CheckCircle size={64} color={Colors.light.success} />
          <Text style={styles.successTitle}>Message Sent Successfully!</Text>
          <Text style={styles.successMessage}>
            Thank you for contacting us. Our support team will get back to you within 24 hours at support@releasefaith.net
          </Text>
          <Button
            title="Send Another Message"
            onPress={() => setIsSubmitted(false)}
            style={styles.successButton}
          />
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: t('help.contact') }} />
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerSection}>
          <Text style={styles.title}>How can we help you?</Text>
          <Text style={styles.subtitle}>
            Our support team is here to assist you with any questions or issues you may have.
          </Text>
        </View>

        <View style={styles.quickContactSection}>
          <Text style={styles.sectionTitle}>Quick Contact Options</Text>
          <View style={styles.quickContactGrid}>
            <TouchableOpacity 
              style={styles.quickContactItem}
              onPress={() => openDirectContact('email')}
            >
              <Mail size={24} color={Colors.light.primary} />
              <Text style={styles.quickContactLabel}>{t('contact.email')}</Text>
              <Text style={styles.quickContactValue}>support@releasefaith.net</Text>
              <Text style={styles.quickContactNote}>Response within 24 hours</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickContactItem}
              onPress={() => openDirectContact('phone')}
            >
              <Phone size={24} color={Colors.light.success} />
              <Text style={styles.quickContactLabel}>{t('contact.phone')}</Text>
              <Text style={styles.quickContactValue}>1-888-718-5333</Text>
              <Text style={styles.quickContactNote}>Mon-Fri, 9am-6pm EST</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickContactItem}
              onPress={() => openDirectContact('whatsapp')}
            >
              <MessageCircle size={24} color={Colors.light.warning} />
              <Text style={styles.quickContactLabel}>{t('contact.chat')}</Text>
              <Text style={styles.quickContactValue}>WhatsApp</Text>
              <Text style={styles.quickContactNote}>Available 24/7</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Send us a message</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Name</Text>
              <Text style={styles.infoValue}>{name}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{email}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.formSection}>
          <Text style={styles.label}>{t('contact.category')} *</Text>
          <View style={styles.categoryContainer}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryButton,
                  category === cat && styles.categoryButtonActive
                ]}
                onPress={() => {
                  setCategory(cat);
                  if (errors.category) {
                    const { category, ...rest } = errors;
                    setErrors(rest);
                  }
                }}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    category === cat && styles.categoryButtonTextActive
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.category ? (
            <Text style={styles.errorText}>{errors.category}</Text>
          ) : null}
        </View>
        
        <View style={styles.formSection}>
          <Text style={styles.label}>{t('contact.subject')} *</Text>
          <TextInput
            style={[styles.input, errors.subject && styles.inputError]}
            placeholder="Brief description of your issue"
            value={subject}
            onChangeText={(text) => {
              setSubject(text);
              if (errors.subject) {
                const { subject, ...rest } = errors;
                setErrors(rest);
              }
            }}
            placeholderTextColor={Colors.light.inputPlaceholder}
          />
          {errors.subject ? (
            <Text style={styles.errorText}>{errors.subject}</Text>
          ) : null}
        </View>
        
        <View style={styles.formSection}>
          <Text style={styles.label}>{t('contact.message')} *</Text>
          <TextInput
            style={[styles.textArea, errors.message && styles.inputError]}
            placeholder="Please provide details about your issue or question. Include any error messages, steps you took, and what you expected to happen."
            value={message}
            onChangeText={(text) => {
              setMessage(text);
              if (errors.message) {
                const { message, ...rest } = errors;
                setErrors(rest);
              }
            }}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            placeholderTextColor={Colors.light.inputPlaceholder}
          />
          {errors.message ? (
            <Text style={styles.errorText}>{errors.message}</Text>
          ) : null}
        </View>
        
        <Button
          title={isSubmitting ? "Sending..." : t('contact.send')}
          onPress={handleSubmit}
          leftIcon={isSubmitting ? 
            <ActivityIndicator size="small" color={Colors.light.white} /> : 
            <Send size={18} color={Colors.light.white} />
          }
          style={styles.submitButton}
          loading={isSubmitting}
          disabled={isSubmitting}
        />
        
        <View style={styles.supportInfo}>
          <Text style={styles.supportInfoTitle}>Response Times</Text>
          <Text style={styles.supportInfoText}>
            • Email: Within 24 hours
          </Text>
          <Text style={styles.supportInfoText}>
            • Phone: Mon-Fri, 9am-6pm EST
          </Text>
          <Text style={styles.supportInfoText}>
            • Live Chat: Available 24/7
          </Text>
          <Text style={styles.supportInfoNote}>
            For urgent prayer requests or spiritual guidance, please use our Live Chat on WhatsApp.
          </Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    paddingBottom: theme.spacing.xxl,
  },
  headerSection: {
    padding: theme.spacing.lg,
    backgroundColor: Colors.light.primaryLight,
    alignItems: 'center',
  },
  title: {
    ...theme.typography.title,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...theme.typography.body,
    color: Colors.light.textMedium,
    textAlign: 'center',
    lineHeight: 22,
  },
  quickContactSection: {
    padding: theme.spacing.lg,
  },
  quickContactGrid: {
    gap: theme.spacing.md,
  },
  quickContactItem: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    ...theme.shadows.small,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  quickContactLabel: {
    ...theme.typography.caption,
    fontWeight: '600',
    color: Colors.light.textMedium,
    marginTop: theme.spacing.sm,
  },
  quickContactValue: {
    ...theme.typography.body,
    fontWeight: '600',
    color: Colors.light.primary,
    textAlign: 'center',
    marginTop: 4,
  },
  quickContactNote: {
    ...theme.typography.small,
    color: Colors.light.textLight,
    textAlign: 'center',
    marginTop: 4,
  },
  formSection: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.subtitle,
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.md,
  },
  label: {
    ...theme.typography.body,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
    color: Colors.light.textPrimary,
  },
  infoCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.small,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  infoItem: {
    marginBottom: theme.spacing.sm,
  },
  infoLabel: {
    ...theme.typography.caption,
    color: Colors.light.textLight,
    marginBottom: 2,
  },
  infoValue: {
    ...theme.typography.body,
    fontWeight: '500',
    color: Colors.light.textPrimary,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.xs,
    gap: theme.spacing.xs,
  },
  categoryButton: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  categoryButtonActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  categoryButtonText: {
    ...theme.typography.caption,
    color: Colors.light.textMedium,
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: Colors.light.white,
    fontWeight: '600',
  },
  input: {
    backgroundColor: Colors.light.inputBackground,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.typography.body,
    color: Colors.light.inputText,
    borderWidth: 1,
    borderColor: Colors.light.inputBorder,
  },
  inputError: {
    borderColor: Colors.light.error,
  },
  textArea: {
    backgroundColor: Colors.light.inputBackground,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.typography.body,
    color: Colors.light.inputText,
    height: 120,
    borderWidth: 1,
    borderColor: Colors.light.inputBorder,
  },
  errorText: {
    ...theme.typography.caption,
    color: Colors.light.error,
    marginTop: theme.spacing.xs,
  },
  submitButton: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  supportInfo: {
    backgroundColor: Colors.light.backgroundLight,
    margin: theme.spacing.lg,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
  },
  supportInfoTitle: {
    ...theme.typography.subtitle,
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  supportInfoText: {
    ...theme.typography.caption,
    color: Colors.light.textMedium,
    marginBottom: 4,
    lineHeight: 18,
  },
  supportInfoNote: {
    ...theme.typography.caption,
    color: Colors.light.textLight,
    fontStyle: 'italic',
    marginTop: theme.spacing.sm,
    lineHeight: 18,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
    backgroundColor: Colors.light.background,
  },
  successTitle: {
    ...theme.typography.title,
    color: Colors.light.textPrimary,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  successMessage: {
    ...theme.typography.body,
    color: Colors.light.textMedium,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: theme.spacing.xl,
  },
  successButton: {
    width: '80%',
  },
});