import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Switch, Alert, TextInput, Modal } from 'react-native';
import { Stack } from 'expo-router';
import { ExternalLink, Check, X, Book, Calendar, Music, Users, CreditCard, DollarSign, Brain, Key, Settings, Zap } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { useUserStore } from '@/store/userStore';
import { trpc } from '@/lib/trpc';
import { integrationManager } from '@/lib/integrations/integrationManager';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: any;
  isConnected: boolean;
  category: 'bible' | 'calendar' | 'music' | 'social' | 'payment' | 'ai';
  features: string[];
  website?: string;
  requiresApiKey?: boolean;
  apiKeyPlaceholder?: string;
}

const availableIntegrations: Integration[] = [
  // Bible integrations
  {
    id: 'youversion',
    name: 'YouVersion Bible',
    description: 'Access thousands of Bible versions and reading plans',
    icon: Book,
    isConnected: false,
    category: 'bible',
    features: [
      'Sync reading plans',
      'Import verses',
      'Share highlights',
      'Daily devotionals'
    ],
    website: 'https://www.bible.com',
  },
  // Calendar integrations
  {
    id: 'planning-center',
    name: 'Planning Center',
    description: 'Manage church events and volunteer schedules',
    icon: Calendar,
    isConnected: false,
    category: 'calendar',
    features: [
      'Event sync',
      'Volunteer scheduling',
      'Service planning',
      'Team communication'
    ],
    website: 'https://planningcenter.com',
  },
  // Music integrations
  {
    id: 'spotify',
    name: 'Spotify',
    description: 'Stream worship music and create playlists',
    icon: Music,
    isConnected: false,
    category: 'music',
    features: [
      'Worship playlists',
      'Song recommendations',
      'Offline listening',
      'Share favorites'
    ],
    website: 'https://spotify.com',
  },
  // Social integrations
  {
    id: 'facebook',
    name: 'Facebook',
    description: 'Share prayers and connect with community',
    icon: Users,
    isConnected: false,
    category: 'social',
    features: [
      'Share testimonials',
      'Prayer requests',
      'Event invites',
      'Community groups'
    ],
    website: 'https://facebook.com',
  },
  // Payment integrations
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Process payments and manage subscriptions',
    icon: CreditCard,
    isConnected: false,
    category: 'payment',
    features: [
      'Accept donations',
      'Subscription management',
      'Payment analytics',
      'Secure transactions'
    ],
    website: 'https://stripe.com',
  },
  {
    id: 'paypal',
    name: 'PayPal',
    description: 'Accept PayPal payments and donations',
    icon: DollarSign,
    isConnected: false,
    category: 'payment',
    features: [
      'PayPal donations',
      'One-time payments',
      'Recurring donations',
      'Global payments'
    ],
    website: 'https://paypal.com',
  },
  // AI/LLM integrations
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'Access GPT models for AI-powered content generation',
    icon: Brain,
    isConnected: false,
    category: 'ai',
    requiresApiKey: true,
    apiKeyPlaceholder: 'sk-...',
    features: [
      'Prayer generation',
      'Devotional writing',
      'Scripture insights',
      'Sermon assistance'
    ],
    website: 'https://openai.com',
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    description: 'Use Claude AI for thoughtful biblical content',
    icon: Zap,
    isConnected: false,
    category: 'ai',
    requiresApiKey: true,
    apiKeyPlaceholder: 'sk-ant-...',
    features: [
      'Biblical analysis',
      'Theological discussions',
      'Content creation',
      'Study guides'
    ],
    website: 'https://anthropic.com',
  },
  {
    id: 'google',
    name: 'Google Gemini',
    description: 'Integrate Google\'s Gemini AI for content creation',
    icon: Settings,
    isConnected: false,
    category: 'ai',
    requiresApiKey: true,
    apiKeyPlaceholder: 'AIza...',
    features: [
      'Multimodal AI',
      'Content generation',
      'Image analysis',
      'Research assistance'
    ],
    website: 'https://ai.google.dev',
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    description: 'European AI models for content generation',
    icon: Key,
    isConnected: false,
    category: 'ai',
    requiresApiKey: true,
    apiKeyPlaceholder: 'mistral-...',
    features: [
      'Multilingual support',
      'Fast responses',
      'Content creation',
      'Translation'
    ],
    website: 'https://mistral.ai',
  },
];

export default function IntegrationsScreen() {
  const { integrations, updateIntegration } = useUserStore();
  const [localIntegrations, setLocalIntegrations] = useState<Integration[]>([]);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // TRPC mutations
  const connectIntegration = trpc.integrations.connect.useMutation();
  const disconnectIntegration = trpc.integrations.disconnect.useMutation();
  const testConnection = trpc.integrations.test.useMutation();

  // Initialize local integrations with store data
  useEffect(() => {
    const initializeIntegrations = () => {
      const updatedIntegrations = availableIntegrations.map(integration => {
        const storeIntegration = integrations.find(i => i.id === integration.id);
        return {
          ...integration,
          isConnected: storeIntegration?.isConnected || false,
        };
      });
      setLocalIntegrations(updatedIntegrations);
    };

    initializeIntegrations();
  }, [integrations]);

  const handleToggleIntegration = async (integrationId: string, isConnected: boolean) => {
    const integration = localIntegrations.find(i => i.id === integrationId);
    if (!integration) return;

    if (isConnected) {
      // Connecting
      if (integration.requiresApiKey) {
        setSelectedIntegration(integration);
        setShowApiKeyModal(true);
        return;
      }

      if (integration.category === 'payment') {
        Alert.alert(
          'Connect Payment Provider',
          `This will set up ${integration.name} for payment processing. Continue?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Connect',
              onPress: () => handlePaymentIntegration(integration),
            },
          ]
        );
        return;
      }

      // Regular OAuth flow
      Alert.alert(
        'Connect Integration',
        'This will set up the integration with the service. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Connect',
            onPress: () => handleOAuthIntegration(integration),
          },
        ]
      );
    } else {
      // Disconnecting
      Alert.alert(
        'Disconnect Integration',
        'This will remove access to this service. You can reconnect anytime.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disconnect',
            style: 'destructive',
            onPress: () => handleDisconnectIntegration(integrationId),
          },
        ]
      );
    }
  };

  const handleApiKeyConnection = async () => {
    if (!selectedIntegration || !apiKey.trim()) {
      Alert.alert('Error', 'Please enter a valid API key');
      return;
    }

    setIsLoading(true);

    try {
      // Test the API key first
      const testResult = await testConnection.mutateAsync({
        integrationId: selectedIntegration.id,
        apiKey: apiKey.trim(),
      });

      if (testResult.success) {
        // Connect the integration
        const connectResult = await connectIntegration.mutateAsync({
          integrationId: selectedIntegration.id,
          apiKey: apiKey.trim(),
        });

        if (connectResult.success) {
          // Update local state
          setLocalIntegrations(prev =>
            prev.map(integration =>
              integration.id === selectedIntegration.id
                ? { ...integration, isConnected: true }
                : integration
            )
          );
          
          // Update store
          updateIntegration(selectedIntegration.id, { 
            isConnected: true,
            settings: { apiKey: apiKey.trim() },
            connectedAt: new Date().toISOString()
          });

          // Setup integration in manager
          await integrationManager.setupIntegration(selectedIntegration.id, {
            apiKey: apiKey.trim(),
          });

          setShowApiKeyModal(false);
          setApiKey('');
          setSelectedIntegration(null);

          Alert.alert('Success!', `${selectedIntegration.name} connected successfully.`);
        } else {
          const errorMessage = connectResult.message || connectResult.error || 'Failed to connect integration';
          Alert.alert('Connection Failed', errorMessage);
        }
      } else {
        const errorMessage = testResult.message || testResult.error || 'Invalid API key';
        Alert.alert('Connection Failed', errorMessage);
      }
    } catch (error) {
      console.error('Integration connection error:', error);
      Alert.alert('Error', 'Failed to connect integration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentIntegration = async (integration: Integration) => {
    setIsLoading(true);

    try {
      // Connect the integration via backend
      const result = await connectIntegration.mutateAsync({
        integrationId: integration.id,
      });

      if (result.success) {
        // Update local state
        setLocalIntegrations(prev =>
          prev.map(int =>
            int.id === integration.id
              ? { ...int, isConnected: true }
              : int
          )
        );

        // Update store
        updateIntegration(integration.id, { 
          isConnected: true,
          connectedAt: new Date().toISOString()
        });

        // Setup integration in manager
        await integrationManager.setupIntegration(integration.id, {});

        Alert.alert('Success!', `${integration.name} connected successfully.`);
      } else {
        const errorMessage = result.message || result.error || 'Failed to connect payment provider';
        Alert.alert('Error', errorMessage);
      }
    } catch (error) {
      console.error('Payment integration error:', error);
      Alert.alert('Error', 'Failed to connect payment provider. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthIntegration = async (integration: Integration) => {
    setIsLoading(true);

    try {
      // Connect the integration via backend
      const result = await connectIntegration.mutateAsync({
        integrationId: integration.id,
      });

      if (result.success) {
        // Update local state
        setLocalIntegrations(prev =>
          prev.map(int =>
            int.id === integration.id
              ? { ...int, isConnected: true }
              : int
          )
        );

        // Update store
        updateIntegration(integration.id, { 
          isConnected: true,
          connectedAt: new Date().toISOString()
        });

        // Setup integration in manager
        await integrationManager.setupIntegration(integration.id, {});

        Alert.alert('Success!', `${integration.name} connected successfully.`);
      } else {
        const errorMessage = result.message || result.error || 'Failed to connect integration';
        Alert.alert('Error', errorMessage);
      }
    } catch (error) {
      console.error('OAuth integration error:', error);
      Alert.alert('Error', 'Failed to connect integration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnectIntegration = async (integrationId: string) => {
    setIsLoading(true);

    try {
      // Disconnect via backend
      const result = await disconnectIntegration.mutateAsync({ integrationId });
      
      if (result.success) {
        // Update local state
        setLocalIntegrations(prev =>
          prev.map(integration =>
            integration.id === integrationId
              ? { ...integration, isConnected: false }
              : integration
          )
        );

        // Update store
        updateIntegration(integrationId, { 
          isConnected: false,
          settings: undefined,
          connectedAt: undefined
        });

        // Remove from integration manager
        await integrationManager.removeIntegration(integrationId);

        Alert.alert('Success!', 'Integration disconnected successfully.');
      } else {
        const errorMessage = result.message || result.error || 'Failed to disconnect integration';
        Alert.alert('Error', errorMessage);
      }
    } catch (error) {
      console.error('Disconnect integration error:', error);
      Alert.alert('Error', 'Failed to disconnect integration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'bible': return '📖';
      case 'calendar': return '📅';
      case 'music': return '🎵';
      case 'social': return '👥';
      case 'payment': return '💳';
      case 'ai': return '🤖';
      default: return '🔗';
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'bible': return 'Bible & Scripture';
      case 'calendar': return 'Calendar & Events';
      case 'music': return 'Music & Worship';
      case 'social': return 'Social & Community';
      case 'payment': return 'Payments & Donations';
      case 'ai': return 'AI & Content Generation';
      default: return 'Other';
    }
  };

  const connectedCount = localIntegrations.filter(i => i.isConnected).length;
  const groupedIntegrations = localIntegrations.reduce((acc, integration) => {
    if (!acc[integration.category]) {
      acc[integration.category] = [];
    }
    acc[integration.category].push(integration);
    return acc;
  }, {} as Record<string, Integration[]>);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Connected Apps',
          headerStyle: { backgroundColor: Colors.light.background },
          headerTintColor: Colors.light.text,
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Connected Apps & Services</Text>
          <Text style={styles.headerSubtitle}>
            Connect your favorite apps and services to enhance your faith journey
          </Text>
          
          <View style={styles.statsCard}>
            <Text style={styles.statsNumber}>{connectedCount}</Text>
            <Text style={styles.statsLabel}>Connected Services</Text>
          </View>
        </View>

        {/* Integrations by Category */}
        {Object.entries(groupedIntegrations).map(([category, integrations]) => (
          <View key={category} style={styles.categorySection}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryIcon}>{getCategoryIcon(category)}</Text>
              <Text style={styles.categoryTitle}>{getCategoryName(category)}</Text>
            </View>
            
            <View style={styles.integrationsList}>
              {integrations.map((integration) => {
                const Icon = integration.icon;
                return (
                  <View key={integration.id} style={styles.integrationCard}>
                    <View style={styles.integrationHeader}>
                      <View style={styles.integrationInfo}>
                        <View style={styles.integrationIconContainer}>
                          <Icon size={20} color={Colors.light.primary} />
                        </View>
                        <View style={styles.integrationDetails}>
                          <View style={styles.integrationTitleRow}>
                            <Text style={styles.integrationName}>{integration.name}</Text>
                            {integration.isConnected && (
                              <View style={styles.connectedBadge}>
                                <Check size={12} color={Colors.light.white} />
                              </View>
                            )}
                          </View>
                          <Text style={styles.integrationDescription}>
                            {integration.description}
                          </Text>
                        </View>
                      </View>
                      
                      <Switch
                        value={integration.isConnected}
                        onValueChange={(value) => handleToggleIntegration(integration.id, value)}
                        trackColor={{ 
                          false: Colors.light.borderLight, 
                          true: Colors.light.success + '40' 
                        }}
                        thumbColor={integration.isConnected ? Colors.light.success : '#f4f3f4'}
                        disabled={isLoading}
                      />
                    </View>

                    {/* Features */}
                    <View style={styles.featuresContainer}>
                      <Text style={styles.featuresTitle}>Features:</Text>
                      <View style={styles.featuresList}>
                        {integration.features.map((feature, index) => (
                          <View key={index} style={styles.featureItem}>
                            <View style={styles.featureDot} />
                            <Text style={styles.featureText}>{feature}</Text>
                          </View>
                        ))}
                      </View>
                    </View>

                    {/* Website Link */}
                    {integration.website && (
                      <TouchableOpacity style={styles.websiteLink}>
                        <ExternalLink size={16} color={Colors.light.primary} />
                        <Text style={styles.websiteLinkText}>Learn more</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        ))}

        {/* Help Section */}
        <View style={styles.helpSection}>
          <Text style={styles.helpTitle}>Need Help?</Text>
          <Text style={styles.helpText}>
            Having trouble connecting an app? Check our help center for setup guides and troubleshooting tips.
          </Text>
          <TouchableOpacity style={styles.helpButton}>
            <Text style={styles.helpButtonText}>Get Support</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* API Key Modal */}
      <Modal
        visible={showApiKeyModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowApiKeyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Connect {selectedIntegration?.name}
            </Text>
            <Text style={styles.modalDescription}>
              Enter your API key to connect {selectedIntegration?.name}. Your key will be stored securely.
            </Text>
            
            <TextInput
              style={styles.apiKeyInput}
              placeholder={selectedIntegration?.apiKeyPlaceholder || 'Enter API key...'}
              value={apiKey}
              onChangeText={setApiKey}
              secureTextEntry={true}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowApiKeyModal(false);
                  setApiKey('');
                  setSelectedIntegration(null);
                }}
                disabled={isLoading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.connectButton, isLoading && styles.disabledButton]}
                onPress={handleApiKeyConnection}
                disabled={!apiKey.trim() || isLoading}
              >
                <Text style={styles.connectButtonText}>
                  {isLoading ? 'Connecting...' : 'Connect'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.light.textMedium,
    lineHeight: 22,
    marginBottom: theme.spacing.lg,
  },
  statsCard: {
    backgroundColor: Colors.light.primary + '10',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.primary + '20',
  },
  statsNumber: {
    fontSize: 32,
    fontWeight: '900' as const,
    color: Colors.light.primary,
    marginBottom: theme.spacing.xs,
  },
  statsLabel: {
    fontSize: 14,
    color: Colors.light.textMedium,
    fontWeight: '600' as const,
  },
  categorySection: {
    marginBottom: theme.spacing.xl,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: theme.spacing.sm,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.light.textPrimary,
  },
  integrationsList: {
    gap: theme.spacing.lg,
  },
  integrationCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  integrationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  integrationInfo: {
    flexDirection: 'row',
    flex: 1,
    marginRight: theme.spacing.md,
  },
  integrationIconContainer: {
    marginRight: theme.spacing.md,
    paddingTop: 2,
  },
  integrationDetails: {
    flex: 1,
  },
  integrationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  integrationName: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.light.textPrimary,
    marginRight: theme.spacing.sm,
  },
  connectedBadge: {
    backgroundColor: Colors.light.success,
    borderRadius: theme.borderRadius.full,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  integrationDescription: {
    fontSize: 14,
    color: Colors.light.textMedium,
    lineHeight: 20,
  },
  featuresContainer: {
    marginBottom: theme.spacing.md,
  },
  featuresTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  featuresList: {
    gap: theme.spacing.xs,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.light.primary,
    marginRight: theme.spacing.sm,
  },
  featureText: {
    fontSize: 14,
    color: Colors.light.textMedium,
  },
  websiteLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderLight,
  },
  websiteLinkText: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '600' as const,
    marginLeft: theme.spacing.xs,
  },
  helpSection: {
    backgroundColor: Colors.light.warning + '10',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginTop: theme.spacing.xl,
    borderWidth: 1,
    borderColor: Colors.light.warning + '20',
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  helpText: {
    fontSize: 14,
    color: Colors.light.textMedium,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  helpButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    alignSelf: 'flex-start',
  },
  helpButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.light.white,
  },
  bottomSpacing: {
    height: 100,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modalContent: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 14,
    color: Colors.light.textMedium,
    lineHeight: 20,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  apiKeyInput: {
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: 16,
    marginBottom: theme.spacing.lg,
    backgroundColor: Colors.light.background,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.light.borderLight,
  },
  connectButton: {
    backgroundColor: Colors.light.primary,
  },
  disabledButton: {
    opacity: 0.6,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.textMedium,
  },
  connectButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.white,
  },
});