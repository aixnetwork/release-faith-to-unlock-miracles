import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Stack, router } from 'expo-router';
import { ChevronRight, BookOpen, MessageCircle, Mail, Phone } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';

// Quick FAQ data for help screen
const quickFaqs = [
  {
    question: "How do I create a prayer request?",
    answer: "To create a prayer request, go to the Prayers tab and tap the + button in the bottom right corner. Fill in the details of your prayer request and tap Save. You can also mark prayers as private or share them with the community."
  },
  {
    question: "How do I mark a prayer as answered?",
    answer: "Open the prayer from your prayer list and tap the 'Mark as Answered' button at the bottom of the prayer details. You can also add a testimony about how your prayer was answered."
  },
  {
    question: "Can I share my prayers with others?",
    answer: "Yes! You can share your prayers on the Prayer Wall. When creating or editing a prayer, toggle the 'Share on Prayer Wall' option. This allows the community to pray for you and offer support."
  },
  {
    question: "How do I join an organization?",
    answer: "You need an invite code from the organization. Go to your Account tab, tap 'Join Organization' and enter the invite code provided by your church or group leader."
  },
  {
    question: "What are the different membership plans?",
    answer: "Free plan includes basic prayer tracking and community access. Premium adds AI prayer suggestions, advanced analytics, and unlimited prayer storage. Pro includes everything plus priority support and exclusive content."
  },
];

export default function HelpScreen() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    if (expandedFaq === index) {
      setExpandedFaq(null);
    } else {
      setExpandedFaq(index);
    }
  };

  const openEmail = () => {
    Linking.openURL('mailto:support@releasefaith.net?subject=Support%20Request');
  };

  const callSupport = () => {
    Linking.openURL('tel:+18887185333');
  };

  const openKnowledgeBase = () => {
    router.push('/settings/knowledge-base');
  };

  const openLiveChat = () => {
    Linking.openURL('https://chat.whatsapp.com/FUxLSjOQLHIDM6Ng9W8rE7');
  };

  return (
    <>
      <Stack.Screen options={{ title: "Help & Support" }} />
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>How can we help you?</Text>
          <Text style={styles.welcomeSubtitle}>
            Find answers to common questions or get in touch with our support team
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Help</Text>
          
          <View style={styles.helpCard}>
            <TouchableOpacity 
              style={styles.helpItem}
              onPress={openKnowledgeBase}
            >
              <View style={styles.helpItemLeft}>
                <BookOpen size={20} color={Colors.light.primary} style={styles.helpIcon} />
                <View style={styles.helpItemContent}>
                  <Text style={styles.helpItemText}>Knowledge Base</Text>
                  <Text style={styles.helpItemDescription}>
                    Comprehensive guides, FAQs, and tutorials covering all app features
                  </Text>
                </View>
              </View>
              <ChevronRight size={20} color={Colors.light.textLight} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.helpItem, { borderBottomWidth: 0 }]}
              onPress={openKnowledgeBase}
            >
              <View style={styles.helpItemLeft}>
                <BookOpen size={20} color={Colors.light.secondary} style={styles.helpIcon} />
                <View style={styles.helpItemContent}>
                  <Text style={styles.helpItemText}>User Guides</Text>
                  <Text style={styles.helpItemDescription}>
                    Step-by-step guides for getting started and mastering advanced features
                  </Text>
                </View>
              </View>
              <ChevronRight size={20} color={Colors.light.textLight} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick FAQs</Text>
          
          <View style={styles.faqCard}>
            {quickFaqs.map((faq, index) => (
              <TouchableOpacity 
                key={index}
                style={[
                  styles.faqItem,
                  index === quickFaqs.length - 1 && expandedFaq !== index && { borderBottomWidth: 0 }
                ]}
                onPress={() => toggleFaq(index)}
              >
                <View style={styles.faqHeader}>
                  <Text style={styles.faqQuestion}>{faq.question}</Text>
                  <ChevronRight 
                    size={20} 
                    color={Colors.light.textLight} 
                    style={[
                      styles.faqChevron,
                      expandedFaq === index && styles.faqChevronExpanded
                    ]} 
                  />
                </View>
                
                {expandedFaq === index && (
                  <Text style={styles.faqAnswer}>{faq.answer}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity 
            style={styles.viewAllButton}
            onPress={openKnowledgeBase}
          >
            <Text style={styles.viewAllButtonText}>View Complete Knowledge Base</Text>
            <ChevronRight size={16} color={Colors.light.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Support</Text>
          
          <View style={styles.contactCard}>
            <TouchableOpacity 
              style={styles.contactItem}
              onPress={openEmail}
            >
              <View style={styles.contactItemLeft}>
                <Mail size={20} color={Colors.light.primary} style={styles.contactIcon} />
                <View>
                  <Text style={styles.contactItemText}>Email Support</Text>
                  <Text style={styles.contactItemSubtext}>support@releasefaith.net</Text>
                  <Text style={styles.contactItemNote}>Response within 24 hours</Text>
                </View>
              </View>
              <ChevronRight size={20} color={Colors.light.textLight} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.contactItem}
              onPress={callSupport}
            >
              <View style={styles.contactItemLeft}>
                <Phone size={20} color={Colors.light.success} style={styles.contactIcon} />
                <View>
                  <Text style={styles.contactItemText}>Phone Support</Text>
                  <Text style={styles.contactItemSubtext}>1-888-718-5333</Text>
                  <Text style={styles.contactItemNote}>Mon-Fri, 9am-6pm EST</Text>
                </View>
              </View>
              <ChevronRight size={20} color={Colors.light.textLight} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.contactItem, { borderBottomWidth: 0 }]}
              onPress={openLiveChat}
            >
              <View style={styles.contactItemLeft}>
                <MessageCircle size={20} color={Colors.light.warning} style={styles.contactIcon} />
                <View>
                  <Text style={styles.contactItemText}>Live Chat</Text>
                  <Text style={styles.contactItemSubtext}>WhatsApp Community</Text>
                  <Text style={styles.contactItemNote}>Available 24/7</Text>
                </View>
              </View>
              <ChevronRight size={20} color={Colors.light.textLight} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.supportInfo}>
          <Text style={styles.supportInfoTitle}>Need More Help?</Text>
          <Text style={styles.supportInfoText}>
            Our support team is dedicated to helping you grow in your faith journey.
          </Text>
          <Text style={styles.supportInfoText}>
            For urgent prayer requests or spiritual guidance, please use our Live Chat.
          </Text>
          <TouchableOpacity 
            style={styles.knowledgeBaseButton}
            onPress={openKnowledgeBase}
          >
            <BookOpen size={18} color={Colors.light.white} />
            <Text style={styles.knowledgeBaseButtonText}>Browse Knowledge Base</Text>
          </TouchableOpacity>
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
  welcomeSection: {
    padding: theme.spacing.lg,
    backgroundColor: Colors.light.primaryLight,
    alignItems: 'center',
  },
  welcomeTitle: {
    ...theme.typography.title,
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    ...theme.typography.body,
    color: Colors.light.textMedium,
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.subtitle,
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.md,
  },
  helpCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.small,
  },
  helpItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  helpItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  helpIcon: {
    marginRight: theme.spacing.md,
  },
  helpItemContent: {
    flex: 1,
  },
  helpItemText: {
    ...theme.typography.body,
    fontWeight: '600',
    color: Colors.light.textPrimary,
    marginBottom: 2,
  },
  helpItemDescription: {
    ...theme.typography.caption,
    color: Colors.light.textLight,
    lineHeight: 18,
  },
  faqCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.small,
  },
  faqItem: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    ...theme.typography.body,
    fontWeight: '600',
    color: Colors.light.textPrimary,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  faqChevron: {
    transform: [{ rotate: '0deg' }],
  },
  faqChevronExpanded: {
    transform: [{ rotate: '90deg' }],
  },
  faqAnswer: {
    ...theme.typography.body,
    color: Colors.light.textMedium,
    marginTop: theme.spacing.md,
    lineHeight: 22,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primaryLight,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  viewAllButtonText: {
    color: Colors.light.primary,
    fontWeight: '600',
    fontSize: 14,
    marginRight: theme.spacing.xs,
  },
  contactCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.small,
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  contactItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  contactIcon: {
    marginRight: theme.spacing.md,
  },
  contactItemText: {
    ...theme.typography.body,
    fontWeight: '600',
    color: Colors.light.textPrimary,
  },
  contactItemSubtext: {
    ...theme.typography.caption,
    color: Colors.light.primary,
    fontWeight: '500',
    marginTop: 2,
  },
  contactItemNote: {
    ...theme.typography.small,
    color: Colors.light.textLight,
    marginTop: 2,
  },
  supportInfo: {
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: Colors.light.backgroundLight,
    marginHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.lg,
  },
  supportInfoTitle: {
    ...theme.typography.subtitle,
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  supportInfoText: {
    ...theme.typography.caption,
    color: Colors.light.textLight,
    textAlign: 'center',
    marginBottom: 4,
    lineHeight: 18,
  },
  knowledgeBaseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.md,
    ...theme.shadows.small,
  },
  knowledgeBaseButtonText: {
    color: Colors.light.white,
    fontWeight: '600',
    fontSize: 16,
    marginLeft: theme.spacing.sm,
  },
});