import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Stack } from 'expo-router';
import { Search, ChevronRight, BookOpen, HelpCircle, FileText, Video, Users, Settings, Zap } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  tags: string[];
  type: 'faq' | 'guide';
}

interface KnowledgeSection {
  id: string;
  title: string;
  description: string;
  icon: any;
  items: FAQItem[];
}

const knowledgeData: FAQItem[] = [
  // FAQ Items
  {
    id: '1',
    category: 'Getting Started',
    question: 'How do I create my first prayer request?',
    answer: 'To create a prayer request, go to the Prayers tab and tap the + button in the bottom right corner. Fill in the details of your prayer request, choose whether to keep it private or share it with the community, and tap Save. You can also add tags to categorize your prayers.',
    tags: ['prayer', 'create', 'request', 'getting started'],
    type: 'faq',
  },
  {
    id: '2',
    category: 'Prayer Management',
    question: 'How do I mark a prayer as answered?',
    answer: 'Open the prayer from your prayer list and tap the "Mark as Answered" button at the bottom of the prayer details. You can also add a testimony about how your prayer was answered, which can be shared with the community to encourage others.',
    tags: ['prayer', 'answered', 'testimony', 'mark'],
    type: 'faq',
  },
  {
    id: '3',
    category: 'Community',
    question: 'Can I share my prayers with others?',
    answer: 'Yes! You can share your prayers on the Prayer Wall. When creating or editing a prayer, toggle the "Share on Prayer Wall" option. This allows the community to pray for you and offer support. You can also control the privacy level of your shared prayers.',
    tags: ['share', 'community', 'prayer wall', 'privacy'],
    type: 'faq',
  },
  {
    id: '4',
    category: 'Organizations',
    question: 'How do I join an organization?',
    answer: 'You need an invite code from the organization. Go to your Account tab, tap "Join Organization" and enter the invite code provided by your church or group leader. Once approved, you will have access to organization-specific features and content.',
    tags: ['organization', 'join', 'invite code', 'church'],
    type: 'faq',
  },
  {
    id: '5',
    category: 'Membership',
    question: 'What are the different membership plans?',
    answer: 'Free plan includes basic prayer tracking and community access. Premium ($9.99/month) adds AI prayer suggestions, advanced analytics, and unlimited prayer storage. Organization plans start at $49/month and include member management, custom branding, and advanced features for churches and groups.',
    tags: ['membership', 'plans', 'pricing', 'premium', 'organization'],
    type: 'faq',
  },
  {
    id: '6',
    category: 'Prayer Plans',
    question: 'How do prayer plans work?',
    answer: 'Prayer plans are guided spiritual journeys with daily prayers and reflections. Choose a plan that matches your spiritual goals, and we will send you daily reminders and content to help you grow in faith. You can track your progress and complete daily activities.',
    tags: ['prayer plans', 'spiritual journey', 'daily', 'progress'],
    type: 'faq',
  },
  {
    id: '7',
    category: 'AI Features',
    question: 'How does the AI prayer assistant work?',
    answer: 'Our AI assistant helps you craft meaningful prayers, provides spiritual insights, and suggests prayer topics based on your needs. It uses advanced language models trained on spiritual content to offer personalized guidance while respecting your privacy and faith traditions.',
    tags: ['ai', 'assistant', 'prayer suggestions', 'spiritual guidance'],
    type: 'faq',
  },
  {
    id: '8',
    category: 'Privacy & Security',
    question: 'How is my prayer data protected?',
    answer: 'We take your privacy seriously. All prayers are encrypted and stored securely. Private prayers are never shared with anyone. You control what information is visible to the community. We comply with GDPR and other privacy regulations.',
    tags: ['privacy', 'security', 'encryption', 'data protection'],
    type: 'faq',
  },
  {
    id: '9',
    category: 'Meetings',
    question: 'How do I join a virtual prayer meeting?',
    answer: 'Browse available meetings in the Meetings tab, or use an invite link shared by the meeting organizer. You can join meetings through video call, audio only, or text chat. Some meetings may require approval from the organizer.',
    tags: ['meetings', 'virtual', 'video call', 'join'],
    type: 'faq',
  },
  {
    id: '10',
    category: 'Technical',
    question: 'Can I use the app offline?',
    answer: 'Yes! Your prayers and most content are available offline. However, community features, AI assistance, live meetings, and real-time synchronization require an internet connection. Your offline changes will sync when you reconnect.',
    tags: ['offline', 'sync', 'internet', 'technical'],
    type: 'faq',
  },
  {
    id: '11',
    category: 'Mental Health',
    question: 'What mental health resources are available?',
    answer: 'Premium members have access to guided meditations, stress relief exercises, anxiety management tools, and spiritual wellness content. We also provide crisis resources and professional support contacts when needed.',
    tags: ['mental health', 'wellness', 'meditation', 'anxiety', 'premium'],
    type: 'faq',
  },
  {
    id: '12',
    category: 'Troubleshooting',
    question: 'The app is running slowly or crashing. What should I do?',
    answer: 'First, try restarting the app and checking your internet connection. Make sure you have the latest version installed. Clear the app cache if needed. If problems persist, contact our support team with details about your device and the issue.',
    tags: ['troubleshooting', 'crash', 'slow', 'technical support'],
    type: 'faq',
  },

  // User Guide Items
  {
    id: 'guide-1',
    category: 'Getting Started',
    question: 'Complete Setup Guide: Getting Started with Release Faith',
    answer: 'Welcome to Release Faith! This comprehensive guide will walk you through setting up your account and getting the most out of the app.\n\n1. Account Creation: Start by creating your account with a valid email address. Verify your email to unlock all features.\n\n2. Profile Setup: Add your name, profile picture, and spiritual preferences to personalize your experience.\n\n3. Privacy Settings: Choose your default privacy level for prayers and community interactions.\n\n4. Notification Preferences: Set up prayer reminders, community updates, and spiritual growth notifications.\n\n5. First Prayer: Create your first prayer request to begin your spiritual journey with us.\n\n6. Explore Community: Browse the Prayer Wall to see how others are sharing their faith journey.\n\n7. Join a Prayer Plan: Select a guided prayer plan that matches your spiritual goals.',
    tags: ['setup', 'account', 'profile', 'first time', 'onboarding'],
    type: 'guide',
  },
  {
    id: 'guide-2',
    category: 'Prayer Management',
    question: 'Prayer Management Guide: Organizing Your Spiritual Life',
    answer: 'Learn how to effectively manage your prayers and track your spiritual growth.\n\n1. Creating Prayers: Use the + button to add new prayer requests. Include specific details and choose appropriate categories.\n\n2. Prayer Categories: Organize prayers by type (Personal, Family, Health, Work, etc.) for better tracking.\n\n3. Privacy Levels: Set prayers as Private (only you can see), Shared (visible to community), or Organization-only.\n\n4. Prayer Status: Track prayers as Active, Answered, or Archived to monitor your spiritual journey.\n\n5. Adding Testimonies: When prayers are answered, add testimonies to encourage others and document God\'s faithfulness.\n\n6. Prayer Reminders: Set daily, weekly, or custom reminders to maintain consistent prayer habits.\n\n7. Prayer Analytics: View your prayer statistics, answered prayer rate, and spiritual growth metrics.\n\n8. Exporting Prayers: Download your prayer history for personal records or sharing with spiritual advisors.',
    tags: ['prayer management', 'organization', 'categories', 'tracking', 'testimonies'],
    type: 'guide',
  },
  {
    id: 'guide-3',
    category: 'Community',
    question: 'Community Engagement Guide: Connecting with Fellow Believers',
    answer: 'Discover how to build meaningful connections and support others in their faith journey.\n\n1. Prayer Wall: Share your prayer requests with the community and pray for others. Use the heart icon to show support.\n\n2. Community Guidelines: Follow our community standards for respectful, encouraging, and faith-centered interactions.\n\n3. Praying for Others: Tap "I\'m Praying" on community prayers to let others know they have your support.\n\n4. Sharing Testimonies: Post answered prayer testimonies to encourage and inspire the community.\n\n5. Following Members: Connect with inspiring community members to see their prayer updates.\n\n6. Community Events: Participate in virtual prayer meetings, Bible studies, and fellowship events.\n\n7. Mentorship: Connect with spiritual mentors or offer guidance to newer believers.\n\n8. Group Prayers: Join or create prayer groups focused on specific topics or life situations.\n\n9. Encouraging Others: Leave supportive comments and share relevant scripture verses.',
    tags: ['community', 'prayer wall', 'support', 'fellowship', 'mentorship'],
    type: 'guide',
  },
  {
    id: 'guide-4',
    category: 'Organizations',
    question: 'Organization Management Guide: Leading Your Faith Community',
    answer: 'Complete guide for church leaders and organization administrators.\n\n1. Organization Setup: Create your organization profile with branding, contact information, and mission statement.\n\n2. Member Management: Invite members, manage roles (Admin, Leader, Member), and handle member requests.\n\n3. Content Creation: Create organization-specific prayer plans, devotionals, and spiritual content.\n\n4. Event Planning: Schedule and manage virtual meetings, prayer sessions, and community events.\n\n5. Communication Tools: Send announcements, prayer updates, and spiritual encouragement to members.\n\n6. Analytics Dashboard: Track member engagement, prayer activity, and spiritual growth metrics.\n\n7. Custom Branding: Upload logos, set color schemes, and customize the organization experience.\n\n8. Integration Setup: Connect with church management systems, calendars, and communication platforms.\n\n9. Billing Management: Manage subscription plans, payment methods, and member billing.\n\n10. Privacy Controls: Set organization-wide privacy settings and content moderation policies.',
    tags: ['organization', 'church', 'management', 'admin', 'leadership'],
    type: 'guide',
  },
  {
    id: 'guide-5',
    category: 'AI Features',
    question: 'AI Assistant Guide: Enhancing Your Spiritual Journey with Technology',
    answer: 'Learn how to use AI features to deepen your faith and prayer life.\n\n1. AI Prayer Generator: Get personalized prayer suggestions based on your current needs and spiritual goals.\n\n2. Scripture Insights: Ask the AI for biblical perspectives on life situations and receive relevant verses with explanations.\n\n3. Devotional Creation: Generate custom devotionals tailored to your spiritual growth areas.\n\n4. Prayer Improvement: Get suggestions to make your prayers more specific, meaningful, and biblically grounded.\n\n5. Spiritual Questions: Ask theological questions and receive thoughtful, scripture-based responses.\n\n6. Conversation History: Review past AI conversations to track your spiritual growth and insights.\n\n7. AI Settings: Customize AI responses based on your denomination, spiritual maturity level, and preferences.\n\n8. Privacy Assurance: Understand how AI interactions are processed while maintaining your privacy.\n\n9. Best Practices: Learn effective ways to interact with the AI for maximum spiritual benefit.\n\n10. Limitations: Understand what AI can and cannot do in your spiritual journey.',
    tags: ['ai', 'artificial intelligence', 'prayer generator', 'scripture', 'devotional'],
    type: 'guide',
  },
  {
    id: 'guide-6',
    category: 'Prayer Plans',
    question: 'Prayer Plans Guide: Structured Spiritual Growth',
    answer: 'Master the use of prayer plans for consistent spiritual development.\n\n1. Choosing Plans: Select prayer plans based on your spiritual goals, available time, and current life situation.\n\n2. Plan Types: Explore different categories - Beginner, Intermediate, Advanced, Topical, and Seasonal plans.\n\n3. Daily Practice: Establish consistent daily habits using plan reminders and progress tracking.\n\n4. Progress Tracking: Monitor your completion rate, streak days, and spiritual growth milestones.\n\n5. Customization: Adapt plans to your schedule and modify content to fit your spiritual needs.\n\n6. Sharing Progress: Share your prayer plan journey with accountability partners or spiritual mentors.\n\n7. Creating Plans: Design custom prayer plans for your organization or personal use.\n\n8. Plan Analytics: Review completion statistics and identify patterns in your spiritual growth.\n\n9. Community Plans: Join group prayer plans with your church or faith community.\n\n10. Advanced Features: Use AI-generated plans, scripture integration, and personalized content.',
    tags: ['prayer plans', 'spiritual growth', 'daily practice', 'progress', 'customization'],
    type: 'guide',
  },
  {
    id: 'guide-7',
    category: 'Mental Health',
    question: 'Mental Health & Wellness Guide: Faith-Based Emotional Support',
    answer: 'Integrate faith and mental wellness for holistic spiritual health.\n\n1. Daily Check-ins: Use mood tracking and spiritual wellness assessments to monitor your emotional state.\n\n2. Guided Meditations: Access faith-based meditation exercises for anxiety, stress, and spiritual peace.\n\n3. Scripture for Healing: Find relevant Bible verses for depression, anxiety, grief, and other emotional challenges.\n\n4. Prayer for Mental Health: Learn specific prayer techniques for emotional healing and mental clarity.\n\n5. Crisis Resources: Access immediate help resources and professional support when needed.\n\n6. Community Support: Connect with others facing similar mental health challenges in a faith context.\n\n7. Professional Integration: Learn how to discuss faith with mental health professionals and integrate both approaches.\n\n8. Wellness Plans: Create personalized mental health plans that incorporate prayer, scripture, and professional care.\n\n9. Stress Management: Use biblical principles and practical techniques for managing life stress.\n\n10. Spiritual Counseling: Access faith-based counseling resources and spiritual direction.',
    tags: ['mental health', 'wellness', 'meditation', 'anxiety', 'depression', 'support'],
    type: 'guide',
  },
  {
    id: 'guide-8',
    category: 'Technical',
    question: 'Technical User Guide: Maximizing App Performance',
    answer: 'Get the most out of the Release Faith app with these technical tips.\n\n1. App Navigation: Master the tab system, search functions, and quick access features.\n\n2. Offline Usage: Download content for offline access and understand sync capabilities.\n\n3. Backup & Sync: Set up automatic backups and cross-device synchronization.\n\n4. Notification Management: Customize push notifications, email alerts, and reminder settings.\n\n5. Data Management: Understand data usage, storage options, and privacy controls.\n\n6. Integration Setup: Connect with calendar apps, Bible apps, and other spiritual tools.\n\n7. Troubleshooting: Solve common issues with login, sync, notifications, and performance.\n\n8. Updates & Features: Stay informed about new features and app updates.\n\n9. Security Settings: Set up two-factor authentication and manage account security.\n\n10. Export & Import: Transfer data between devices and backup your spiritual content.',
    tags: ['technical', 'navigation', 'offline', 'backup', 'sync', 'troubleshooting'],
    type: 'guide',
  },
  {
    id: 'guide-9',
    category: 'Advanced Features',
    question: 'Advanced Features Guide: Power User Tips',
    answer: 'Unlock the full potential of Release Faith with advanced features.\n\n1. API Integration: Connect Release Faith with other apps and services using our API.\n\n2. Custom Workflows: Create automated prayer reminders and spiritual growth workflows.\n\n3. Advanced Analytics: Deep dive into your spiritual growth metrics and prayer patterns.\n\n4. Bulk Operations: Manage multiple prayers, events, and content efficiently.\n\n5. Advanced Search: Use filters, tags, and search operators to find specific content quickly.\n\n6. Content Creation: Create and share custom prayer plans, devotionals, and spiritual content.\n\n7. Organization Features: Utilize advanced admin tools for church and group management.\n\n8. Affiliate Program: Learn about earning through referrals and building your faith community.\n\n9. Beta Features: Access and test new features before general release.\n\n10. Developer Tools: For tech-savvy users, explore customization and integration options.',
    tags: ['advanced', 'api', 'analytics', 'automation', 'admin', 'developer'],
    type: 'guide',
  },
];

const knowledgeSections: KnowledgeSection[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Setup guides and first steps',
    icon: BookOpen,
    items: knowledgeData.filter(item => item.category === 'Getting Started'),
  },
  {
    id: 'prayer-management',
    title: 'Prayer Management',
    description: 'Managing prayers and spiritual tracking',
    icon: HelpCircle,
    items: knowledgeData.filter(item => item.category === 'Prayer Management'),
  },
  {
    id: 'community',
    title: 'Community & Fellowship',
    description: 'Connecting with other believers',
    icon: Users,
    items: knowledgeData.filter(item => item.category === 'Community'),
  },
  {
    id: 'organizations',
    title: 'Organizations & Churches',
    description: 'Church and group management',
    icon: Settings,
    items: knowledgeData.filter(item => item.category === 'Organizations'),
  },
  {
    id: 'prayer-plans',
    title: 'Prayer Plans & Growth',
    description: 'Structured spiritual development',
    icon: FileText,
    items: knowledgeData.filter(item => item.category === 'Prayer Plans'),
  },
  {
    id: 'ai-features',
    title: 'AI & Advanced Features',
    description: 'AI assistance and premium features',
    icon: Zap,
    items: knowledgeData.filter(item => item.category === 'AI Features' || item.category === 'Advanced Features'),
  },
  {
    id: 'wellness',
    title: 'Mental Health & Wellness',
    description: 'Faith-based emotional support',
    icon: HelpCircle,
    items: knowledgeData.filter(item => item.category === 'Mental Health'),
  },
  {
    id: 'technical',
    title: 'Technical Support',
    description: 'App usage and troubleshooting',
    icon: Video,
    items: knowledgeData.filter(item => 
      ['Technical', 'Privacy & Security', 'Troubleshooting', 'Meetings', 'Membership'].includes(item.category)
    ),
  },
];

export default function KnowledgeBaseScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [contentFilter, setContentFilter] = useState<'all' | 'faq' | 'guide'>('all');

  const filteredSections = knowledgeSections.map(section => ({
    ...section,
    items: section.items.filter(item => {
      const matchesSearch = !searchQuery || (
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      const matchesFilter = contentFilter === 'all' || item.type === contentFilter;
      return matchesSearch && matchesFilter;
    }),
  })).filter(section => section.items.length > 0);

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSelectedSection(null);
    setExpandedItems(new Set());
    setContentFilter('all');
  };

  const totalResults = filteredSections.reduce((total, section) => total + section.items.length, 0);

  return (
    <>
      <Stack.Screen options={{ title: "Knowledge Base" }} />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Knowledge Base</Text>
          <Text style={styles.headerSubtitle}>
            Comprehensive guides, FAQs, and tutorials for mastering Release Faith
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color={Colors.light.textLight} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search guides and FAQs..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={Colors.light.textLight}
            />
          </View>
          {(searchQuery || contentFilter !== 'all') ? (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Content Filter */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, contentFilter === 'all' && styles.filterButtonActive]}
            onPress={() => setContentFilter('all')}
          >
            <Text style={[styles.filterButtonText, contentFilter === 'all' && styles.filterButtonTextActive]}>
              All Content
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, contentFilter === 'guide' && styles.filterButtonActive]}
            onPress={() => setContentFilter('guide')}
          >
            <Text style={[styles.filterButtonText, contentFilter === 'guide' && styles.filterButtonTextActive]}>
              User Guides
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, contentFilter === 'faq' && styles.filterButtonActive]}
            onPress={() => setContentFilter('faq')}
          >
            <Text style={[styles.filterButtonText, contentFilter === 'faq' && styles.filterButtonTextActive]}>
              FAQs
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {searchQuery || contentFilter !== 'all' ? (
            // Search Results
            <View style={styles.searchResults}>
              <Text style={styles.resultsTitle}>
                {totalResults} {totalResults === 1 ? 'result' : 'results'} found
              </Text>
              
              {filteredSections.map(section => (
                <View key={section.id} style={styles.sectionCard}>
                  <View style={styles.sectionHeaderInline}>
                    <section.icon size={20} color={Colors.light.primary} />
                    <Text style={styles.sectionTitleInline}>{section.title}</Text>
                  </View>
                  {section.items.map(item => {
                    const isExpanded = expandedItems.has(item.id);
                    
                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={styles.knowledgeItem}
                        onPress={() => toggleExpanded(item.id)}
                      >
                        <View style={styles.knowledgeHeader}>
                          <View style={styles.knowledgeHeaderLeft}>
                            <View style={[styles.contentTypeBadge, item.type === 'guide' ? styles.guideBadge : styles.faqBadge]}>
                              <Text style={styles.contentTypeText}>
                                {item.type === 'guide' ? 'GUIDE' : 'FAQ'}
                              </Text>
                            </View>
                            <Text style={styles.knowledgeQuestion}>{item.question}</Text>
                          </View>
                          <ChevronRight 
                            size={20} 
                            color={Colors.light.textLight}
                            style={[
                              styles.chevron,
                              isExpanded && styles.chevronExpanded
                            ]}
                          />
                        </View>
                        
                        {isExpanded && (
                          <View style={styles.knowledgeAnswer}>
                            <Text style={styles.knowledgeAnswerText}>{item.answer}</Text>
                            <View style={styles.knowledgeTags}>
                              {item.tags.map(tag => (
                                <View key={tag} style={styles.knowledgeTag}>
                                  <Text style={styles.knowledgeTagText}>{tag}</Text>
                                </View>
                              ))}
                            </View>
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>
          ) : (
            // Browse by Category
            <View style={styles.categories}>
              <Text style={styles.categoriesTitle}>Browse by Category</Text>
              
              {knowledgeSections.map(section => (
                <TouchableOpacity
                  key={section.id}
                  style={styles.categoryCard}
                  onPress={() => setSelectedSection(section.id)}
                >
                  <View style={styles.categoryHeader}>
                    <View style={styles.categoryIcon}>
                      <section.icon size={24} color={Colors.light.primary} />
                    </View>
                    <View style={styles.categoryContent}>
                      <Text style={styles.categoryTitle}>{section.title}</Text>
                      <Text style={styles.categoryDescription}>{section.description}</Text>
                      <View style={styles.categoryStats}>
                        <Text style={styles.categoryCount}>
                          {section.items.filter(i => i.type === 'guide').length} guides
                        </Text>
                        <Text style={styles.categorySeparator}>•</Text>
                        <Text style={styles.categoryCount}>
                          {section.items.filter(i => i.type === 'faq').length} FAQs
                        </Text>
                      </View>
                    </View>
                    <ChevronRight size={20} color={Colors.light.textLight} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Selected Section Details */}
          {selectedSection && !searchQuery && contentFilter === 'all' && (
            <View style={styles.sectionDetails}>
              {(() => {
                const section = knowledgeSections.find(s => s.id === selectedSection);
                if (!section) return null;
                
                return (
                  <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                      <TouchableOpacity 
                        onPress={() => setSelectedSection(null)}
                        style={styles.backButton}
                      >
                        <Text style={styles.backButtonText}>← Back to Categories</Text>
                      </TouchableOpacity>
                      <View style={styles.sectionHeaderInline}>
                        <section.icon size={24} color={Colors.light.primary} />
                        <Text style={styles.sectionTitle}>{section.title}</Text>
                      </View>
                      <Text style={styles.sectionDescription}>{section.description}</Text>
                    </View>
                    
                    {section.items.map(item => {
                      const isExpanded = expandedItems.has(item.id);
                      
                      return (
                        <TouchableOpacity
                          key={item.id}
                          style={styles.knowledgeItem}
                          onPress={() => toggleExpanded(item.id)}
                        >
                          <View style={styles.knowledgeHeader}>
                            <View style={styles.knowledgeHeaderLeft}>
                              <View style={[styles.contentTypeBadge, item.type === 'guide' ? styles.guideBadge : styles.faqBadge]}>
                                <Text style={styles.contentTypeText}>
                                  {item.type === 'guide' ? 'GUIDE' : 'FAQ'}
                                </Text>
                              </View>
                              <Text style={styles.knowledgeQuestion}>{item.question}</Text>
                            </View>
                            <ChevronRight 
                              size={20} 
                              color={Colors.light.textLight}
                              style={[
                                styles.chevron,
                                isExpanded && styles.chevronExpanded
                              ]}
                            />
                          </View>
                          
                          {isExpanded && (
                            <View style={styles.knowledgeAnswer}>
                              <Text style={styles.knowledgeAnswerText}>{item.answer}</Text>
                              <View style={styles.knowledgeTags}>
                                {item.tags.map(tag => (
                                  <View key={tag} style={styles.knowledgeTag}>
                                    <Text style={styles.knowledgeTagText}>{tag}</Text>
                                  </View>
                                ))}
                              </View>
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                );
              })()}
            </View>
          )}

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    padding: theme.spacing.lg,
    backgroundColor: Colors.light.primaryLight,
    alignItems: 'center',
  },
  headerTitle: {
    ...theme.typography.title,
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  headerSubtitle: {
    ...theme.typography.body,
    color: Colors.light.textMedium,
    textAlign: 'center',
    lineHeight: 22,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  searchBar: {
    flex: 1,
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
  clearButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  clearButtonText: {
    color: Colors.light.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  filterButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: Colors.light.backgroundLight,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  filterButtonActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.textMedium,
  },
  filterButtonTextActive: {
    color: Colors.light.white,
  },
  content: {
    flex: 1,
  },
  searchResults: {
    padding: theme.spacing.lg,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.lg,
  },
  categories: {
    padding: theme.spacing.lg,
  },
  categoriesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.lg,
  },
  categoryCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
    ...theme.shadows.small,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  categoryContent: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.textPrimary,
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: Colors.light.textMedium,
    marginBottom: 6,
  },
  categoryStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryCount: {
    fontSize: 12,
    color: Colors.light.textLight,
    fontWeight: '500',
  },
  categorySeparator: {
    fontSize: 12,
    color: Colors.light.textLight,
    marginHorizontal: theme.spacing.xs,
  },
  sectionDetails: {
    padding: theme.spacing.lg,
  },
  sectionCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.light.border,
    ...theme.shadows.small,
  },
  sectionHeader: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  sectionHeaderInline: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  backButton: {
    marginBottom: theme.spacing.md,
  },
  backButtonText: {
    color: Colors.light.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.textPrimary,
    marginLeft: theme.spacing.sm,
  },
  sectionTitleInline: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.textPrimary,
    marginLeft: theme.spacing.sm,
  },
  sectionDescription: {
    fontSize: 14,
    color: Colors.light.textMedium,
    lineHeight: 20,
  },
  knowledgeItem: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  knowledgeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  knowledgeHeaderLeft: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  contentTypeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.xs,
  },
  guideBadge: {
    backgroundColor: Colors.light.primary + '20',
  },
  faqBadge: {
    backgroundColor: Colors.light.secondary + '20',
  },
  contentTypeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.light.primary,
    letterSpacing: 0.5,
  },
  knowledgeQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.textPrimary,
    lineHeight: 22,
  },
  chevron: {
    transform: [{ rotate: '0deg' }],
    marginTop: 2,
  },
  chevronExpanded: {
    transform: [{ rotate: '90deg' }],
  },
  knowledgeAnswer: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderLight,
  },
  knowledgeAnswerText: {
    fontSize: 14,
    color: Colors.light.textMedium,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  knowledgeTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  knowledgeTag: {
    backgroundColor: Colors.light.backgroundLight,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
  },
  knowledgeTagText: {
    fontSize: 12,
    color: Colors.light.textLight,
  },
  bottomSpacing: {
    height: 100,
  },
});