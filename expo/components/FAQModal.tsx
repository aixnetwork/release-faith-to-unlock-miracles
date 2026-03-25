import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Modal, TextInput } from 'react-native';
import { X, ChevronRight, Search, HelpCircle } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  tags: string[];
}

interface FAQModalProps {
  visible: boolean;
  onClose: () => void;
}

const faqData: FAQItem[] = [
  {
    id: '1',
    category: 'Getting Started',
    question: 'How do I create my first prayer request?',
    answer: 'To create a prayer request, go to the Prayers tab and tap the + button in the bottom right corner. Fill in the details of your prayer request, choose whether to keep it private or share it with the community, and tap Save. You can also add tags to categorize your prayers.',
    tags: ['prayer', 'create', 'request', 'getting started'],
  },
  {
    id: '2',
    category: 'Prayer Management',
    question: 'How do I mark a prayer as answered?',
    answer: 'Open the prayer from your prayer list and tap the "Mark as Answered" button at the bottom of the prayer details. You can also add a testimony about how your prayer was answered, which can be shared with the community to encourage others.',
    tags: ['prayer', 'answered', 'testimony', 'mark'],
  },
  {
    id: '3',
    category: 'Community',
    question: 'Can I share my prayers with others?',
    answer: 'Yes! You can share your prayers on the Prayer Wall. When creating or editing a prayer, toggle the "Share on Prayer Wall" option. This allows the community to pray for you and offer support. You can also control the privacy level of your shared prayers.',
    tags: ['share', 'community', 'prayer wall', 'privacy'],
  },
  {
    id: '4',
    category: 'Organizations',
    question: 'How do I join an organization?',
    answer: 'You need an invite code from the organization. Go to your Account tab, tap "Join Organization" and enter the invite code provided by your church or group leader. Once approved, you will have access to organization-specific features and content.',
    tags: ['organization', 'join', 'invite code', 'church'],
  },
  {
    id: '5',
    category: 'Membership',
    question: 'What are the different membership plans?',
    answer: 'Free plan includes basic prayer tracking and community access. Premium ($9.99/month) adds AI prayer suggestions, advanced analytics, and unlimited prayer storage. Organization plans start at $49/month and include member management, custom branding, and advanced features for churches and groups.',
    tags: ['membership', 'plans', 'pricing', 'premium', 'organization'],
  },
  {
    id: '6',
    category: 'Affiliate Program',
    question: 'How do I become an affiliate?',
    answer: 'Go to Settings > Affiliate Program and complete the application. Once approved, you will receive your unique referral code and can start earning 20% commission on referrals. Track your earnings and request payouts through the affiliate dashboard.',
    tags: ['affiliate', 'commission', 'referral', 'earnings'],
  },
  {
    id: '7',
    category: 'Prayer Plans',
    question: 'How do prayer plans work?',
    answer: 'Prayer plans are guided spiritual journeys with daily prayers and reflections. Choose a plan that matches your spiritual goals, and we will send you daily reminders and content to help you grow in faith. You can track your progress and complete daily activities.',
    tags: ['prayer plans', 'spiritual journey', 'daily', 'progress'],
  },
  {
    id: '8',
    category: 'Technical',
    question: 'Can I use the app offline?',
    answer: 'Yes! Your prayers and most content are available offline. However, community features, AI assistance, live meetings, and real-time synchronization require an internet connection. Your offline changes will sync when you reconnect.',
    tags: ['offline', 'sync', 'internet', 'technical'],
  },
  {
    id: '9',
    category: 'AI Features',
    question: 'How does the AI prayer assistant work?',
    answer: 'Our AI assistant helps you craft meaningful prayers, provides spiritual insights, and suggests prayer topics based on your needs. It uses advanced language models trained on spiritual content to offer personalized guidance while respecting your privacy and faith traditions.',
    tags: ['ai', 'assistant', 'prayer suggestions', 'spiritual guidance'],
  },
  {
    id: '10',
    category: 'Privacy & Security',
    question: 'How is my prayer data protected?',
    answer: 'We take your privacy seriously. All prayers are encrypted and stored securely. Private prayers are never shared with anyone. You control what information is visible to the community. We comply with GDPR and other privacy regulations.',
    tags: ['privacy', 'security', 'encryption', 'data protection'],
  },
  {
    id: '11',
    category: 'Meetings',
    question: 'How do I join a virtual prayer meeting?',
    answer: 'Browse available meetings in the Meetings tab, or use an invite link shared by the meeting organizer. You can join meetings through video call, audio only, or text chat. Some meetings may require approval from the organizer.',
    tags: ['meetings', 'virtual', 'video call', 'join'],
  },
  {
    id: '12',
    category: 'Notifications',
    question: 'How do I customize my notification settings?',
    answer: 'Go to Settings > Notifications to customize when and how you receive alerts. You can set prayer reminders, community notifications, meeting alerts, and quiet hours. All notifications can be individually controlled.',
    tags: ['notifications', 'settings', 'reminders', 'customize'],
  },
  {
    id: '13',
    category: 'Mental Health',
    question: 'What mental health resources are available?',
    answer: 'Premium members have access to guided meditations, stress relief exercises, anxiety management tools, and spiritual wellness content. We also provide crisis resources and professional support contacts when needed.',
    tags: ['mental health', 'wellness', 'meditation', 'anxiety', 'premium'],
  },
  {
    id: '14',
    category: 'Integrations',
    question: 'What external apps can I connect?',
    answer: 'You can connect YouVersion Bible, Planning Center, calendar apps, and other faith-based platforms. These integrations allow you to sync your spiritual activities and access content across multiple platforms.',
    tags: ['integrations', 'youversion', 'planning center', 'sync'],
  },
  {
    id: '15',
    category: 'Troubleshooting',
    question: 'The app is running slowly or crashing. What should I do?',
    answer: 'First, try restarting the app and checking your internet connection. Make sure you have the latest version installed. Clear the app cache if needed. If problems persist, contact our support team with details about your device and the issue.',
    tags: ['troubleshooting', 'crash', 'slow', 'technical support'],
  },
];

const categories = Array.from(new Set(faqData.map(item => item.category)));

export const FAQModal = ({ visible, onClose }: FAQModalProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const filteredFAQs = faqData.filter(item => {
    const matchesSearch = searchQuery === '' || 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === null || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setExpandedItems(new Set());
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Frequently Asked Questions</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={Colors.light.textMedium} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color={Colors.light.textLight} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search FAQs..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={Colors.light.textLight}
            />
          </View>
        </View>

        {/* Category Filter */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContainer}
        >
          <TouchableOpacity
            style={[styles.categoryButton, selectedCategory === null && styles.categoryButtonActive]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text style={[
              styles.categoryButtonText,
              selectedCategory === null && styles.categoryButtonTextActive
            ]}>
              All
            </Text>
          </TouchableOpacity>
          {categories.map(category => (
            <TouchableOpacity
              key={category}
              style={[styles.categoryButton, selectedCategory === category && styles.categoryButtonActive]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[
                styles.categoryButtonText,
                selectedCategory === category && styles.categoryButtonTextActive
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Results Info */}
        <View style={styles.resultsInfo}>
          <Text style={styles.resultsText}>
            {filteredFAQs.length} {filteredFAQs.length === 1 ? 'result' : 'results'}
            {(searchQuery || selectedCategory) ? (
              <Text style={styles.clearFilters} onPress={clearFilters}> • Clear filters</Text>
            ) : null}
          </Text>
        </View>

        {/* FAQ List */}
        <ScrollView style={styles.faqList} showsVerticalScrollIndicator={false}>
          {filteredFAQs.length === 0 ? (
            <View style={styles.emptyState}>
              <HelpCircle size={48} color={Colors.light.textLight} />
              <Text style={styles.emptyTitle}>No FAQs found</Text>
              <Text style={styles.emptyDescription}>
                Try adjusting your search terms or category filter
              </Text>
            </View>
          ) : (
            filteredFAQs.map(item => {
              const isExpanded = expandedItems.has(item.id);
              
              return (
                <View key={item.id} style={styles.faqItem}>
                  <TouchableOpacity
                    style={styles.faqHeader}
                    onPress={() => toggleExpanded(item.id)}
                  >
                    <View style={styles.faqHeaderContent}>
                      <Text style={styles.faqCategory}>{item.category}</Text>
                      <Text style={styles.faqQuestion}>{item.question}</Text>
                    </View>
                    <ChevronRight 
                      size={20} 
                      color={Colors.light.textLight}
                      style={[
                        styles.chevron,
                        isExpanded && styles.chevronExpanded
                      ]}
                    />
                  </TouchableOpacity>
                  
                  {isExpanded && (
                    <View style={styles.faqAnswer}>
                      <Text style={styles.faqAnswerText}>{item.answer}</Text>
                      <View style={styles.faqTags}>
                        {item.tags.map(tag => (
                          <View key={tag} style={styles.faqTag}>
                            <Text style={styles.faqTagText}>{tag}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Can't find what you're looking for?{' '}
            <Text style={styles.footerLink} onPress={onClose}>
              Contact Support
            </Text>
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.textPrimary,
  },
  closeButton: {
    padding: theme.spacing.sm,
  },
  searchContainer: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    fontSize: 16,
    color: Colors.light.textPrimary,
  },
  categoryScroll: {
    maxHeight: 50,
  },
  categoryContainer: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  categoryButton: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  categoryButtonActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.textMedium,
  },
  categoryButtonTextActive: {
    color: Colors.light.white,
    fontWeight: '600',
  },
  resultsInfo: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  resultsText: {
    fontSize: 14,
    color: Colors.light.textLight,
  },
  clearFilters: {
    color: Colors.light.primary,
    fontWeight: '500',
  },
  faqList: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  faqItem: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  faqHeaderContent: {
    flex: 1,
  },
  faqCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.primary,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.textPrimary,
    lineHeight: 22,
  },
  chevron: {
    transform: [{ rotate: '0deg' }],
  },
  chevronExpanded: {
    transform: [{ rotate: '90deg' }],
  },
  faqAnswer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderLight,
  },
  faqAnswerText: {
    fontSize: 14,
    color: Colors.light.textMedium,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  faqTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  faqTag: {
    backgroundColor: Colors.light.backgroundLight,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
  },
  faqTagText: {
    fontSize: 12,
    color: Colors.light.textLight,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.textMedium,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  emptyDescription: {
    fontSize: 14,
    color: Colors.light.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: Colors.light.textMedium,
    textAlign: 'center',
  },
  footerLink: {
    color: Colors.light.primary,
    fontWeight: '600',
  },
});