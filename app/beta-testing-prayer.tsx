import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RefreshCw,
} from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { theme } from '@/constants/theme';
import { useUserStore } from '@/store/userStore';
import { ENV } from '@/config/env';
import { fetchWithAuth } from '@/utils/authUtils';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  error?: string;
}

export default function BetaTestingPrayerScreen() {
  const insets = useSafeAreaInsets();
  const { user, organization, isLoggedIn } = useUserStore();
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [createdPrayerId, setCreatedPrayerId] = useState<string | null>(null);

  useEffect(() => {
    console.log('=== Prayer Beta Testing Screen ===');
    console.log('User logged in:', isLoggedIn);
    console.log('User ID:', user?.id);
    console.log('Organization ID:', organization?.id);
  }, [isLoggedIn, user, organization]);

  const addResult = (result: TestResult) => {
    setResults(prev => [...prev, result]);
  };

  const runAllTests = async () => {
    setTesting(true);
    setResults([]);
    setCreatedPrayerId(null);

    try {
      // Test 1: Authentication Check
      await testAuthentication();

      // Test 2: Fetch Prayers
      await testFetchPrayers();

      // Test 3: Create Prayer
      await testCreatePrayer();

      // Test 4: Fetch Prayer by ID
      if (createdPrayerId) {
        await testFetchPrayerById(createdPrayerId);
      }

      // Test 5: Update Prayer
      if (createdPrayerId) {
        await testUpdatePrayer(createdPrayerId);
      }

      // Test 6: Add Comment to Prayer
      if (createdPrayerId) {
        await testAddComment(createdPrayerId);
      }

      // Test 7: Fetch Comments
      if (createdPrayerId) {
        await testFetchComments(createdPrayerId);
      }

      // Test 8: Mark as Prayed
      if (createdPrayerId) {
        await testMarkPrayed(createdPrayerId);
      }

      // Test 9: Prayer Wall Fetch
      await testPrayerWallFetch();

      // Test 10: Delete Prayer (cleanup)
      if (createdPrayerId) {
        await testDeletePrayer(createdPrayerId);
      }

      addResult({
        name: 'All Tests Completed',
        status: 'pass',
        message: 'Prayer functionality testing completed successfully',
      });
    } catch (error) {
      addResult({
        name: 'Test Suite Failed',
        status: 'fail',
        message: 'One or more tests failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setTesting(false);
    }
  };

  const testAuthentication = async () => {
    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      if (!user?.accessToken) {
        throw new Error('No access token found');
      }

      if (!organization?.id) {
        throw new Error('No organization found');
      }

      addResult({
        name: '✓ Authentication Check',
        status: 'pass',
        message: `User authenticated with ID: ${user.id}, Organization: ${organization.id}`,
      });
    } catch (error) {
      addResult({
        name: '✗ Authentication Check',
        status: 'fail',
        message: 'Authentication check failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  };

  const testFetchPrayers = async () => {
    try {
      const filter = `filter[user_id][_eq]=${user?.id}&filter[organization_id][_eq]=${organization?.id}`;
      const response = await fetchWithAuth(
        `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/prayers?${filter}&fields=*&sort=-date_created`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch prayers: ${response.status}`);
      }

      const data = await response.json();
      addResult({
        name: '✓ Fetch Prayers',
        status: 'pass',
        message: `Successfully fetched ${data.data?.length || 0} prayers`,
      });
    } catch (error) {
      addResult({
        name: '✗ Fetch Prayers',
        status: 'fail',
        message: 'Failed to fetch prayers',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const testCreatePrayer = async () => {
    try {
      const prayerData = {
        title: `Beta Test Prayer ${Date.now()}`,
        content: 'This is a test prayer created during beta testing. Please delete if seen.',
        category: 'other',
        shareOnWall: 1,
        user_id: user?.id,
        answered: 0,
        prayerCount: 0,
        hasPrayed: 0,
        organization_id: organization?.id,
        status: 'published',
        date_created: new Date().toISOString(),
      };

      const response = await fetchWithAuth(
        `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/prayers`,
        {
          method: 'POST',
          body: JSON.stringify(prayerData),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create prayer: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      const prayerId = result.data?.id;
      
      if (!prayerId) {
        throw new Error('No prayer ID returned from API');
      }

      setCreatedPrayerId(prayerId);

      addResult({
        name: '✓ Create Prayer',
        status: 'pass',
        message: `Prayer created successfully with ID: ${prayerId}`,
      });
    } catch (error) {
      addResult({
        name: '✗ Create Prayer',
        status: 'fail',
        message: 'Failed to create prayer',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const testFetchPrayerById = async (prayerId: string) => {
    try {
      const response = await fetch(
        `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/prayers/${prayerId}?fields=*,user_id.id,user_id.first_name,user_id.last_name`,
        {
          headers: {
            'Authorization': `Bearer ${ENV.EXPO_PUBLIC_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch prayer: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.data) {
        throw new Error('No prayer data returned');
      }

      addResult({
        name: '✓ Fetch Prayer by ID',
        status: 'pass',
        message: `Prayer fetched successfully: ${data.data.title}`,
      });
    } catch (error) {
      addResult({
        name: '✗ Fetch Prayer by ID',
        status: 'fail',
        message: 'Failed to fetch prayer by ID',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const testUpdatePrayer = async (prayerId: string) => {
    try {
      const updates = {
        title: `Updated Test Prayer ${Date.now()}`,
      };

      const response = await fetchWithAuth(
        `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/prayers/${prayerId}`,
        {
          method: 'PATCH',
          body: JSON.stringify(updates),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update prayer: ${response.status}`);
      }

      addResult({
        name: '✓ Update Prayer',
        status: 'pass',
        message: 'Prayer updated successfully',
      });
    } catch (error) {
      addResult({
        name: '✗ Update Prayer',
        status: 'fail',
        message: 'Failed to update prayer',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const testAddComment = async (prayerId: string) => {
    try {
      const commentData = {
        prayer_id: prayerId,
        user_id: user?.id,
        comments: 'Test comment from beta testing',
        liked: 0,
        comment_id: null,
      };

      const response = await fetch(
        `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/prayer_comments`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${ENV.EXPO_PUBLIC_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(commentData),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to add comment: ${response.status}`);
      }

      const result = await response.json();
      
      addResult({
        name: '✓ Add Comment',
        status: 'pass',
        message: `Comment added successfully with ID: ${result.data?.id}`,
      });
    } catch (error) {
      addResult({
        name: '✗ Add Comment',
        status: 'fail',
        message: 'Failed to add comment',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const testFetchComments = async (prayerId: string) => {
    try {
      const response = await fetch(
        `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/prayer_comments?filter[prayer_id][_eq]=${prayerId}&fields=*,user_id.id,user_id.first_name,user_id.last_name`,
        {
          headers: {
            'Authorization': `Bearer ${ENV.EXPO_PUBLIC_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch comments: ${response.status}`);
      }

      const data = await response.json();
      
      addResult({
        name: '✓ Fetch Comments',
        status: 'pass',
        message: `Fetched ${data.data?.length || 0} comments`,
      });
    } catch (error) {
      addResult({
        name: '✗ Fetch Comments',
        status: 'fail',
        message: 'Failed to fetch comments',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const testMarkPrayed = async (prayerId: string) => {
    try {
      const commentData = {
        prayer_id: prayerId,
        user_id: user?.id,
        comments: 'I prayed for this request',
        liked: 0,
        comment_id: null,
      };

      const response = await fetch(
        `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/prayer_comments`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${ENV.EXPO_PUBLIC_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(commentData),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to mark as prayed: ${response.status}`);
      }

      addResult({
        name: '✓ Mark as Prayed',
        status: 'pass',
        message: 'Successfully marked prayer as prayed',
      });
    } catch (error) {
      addResult({
        name: '✗ Mark as Prayed',
        status: 'fail',
        message: 'Failed to mark as prayed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const testPrayerWallFetch = async () => {
    try {
      const filter = {
        shareOnWall: { _eq: 1 },
        organization_id: { _eq: organization?.id },
      };

      const params = new URLSearchParams({
        filter: JSON.stringify(filter),
        sort: '-date_created',
        fields: '*,user_id.id,user_id.first_name,user_id.last_name',
      });

      const response = await fetch(
        `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/prayers?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${ENV.EXPO_PUBLIC_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch prayer wall: ${response.status}`);
      }

      const data = await response.json();
      
      addResult({
        name: '✓ Prayer Wall Fetch',
        status: 'pass',
        message: `Fetched ${data.data?.length || 0} prayers from wall`,
      });
    } catch (error) {
      addResult({
        name: '✗ Prayer Wall Fetch',
        status: 'fail',
        message: 'Failed to fetch prayer wall',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const testDeletePrayer = async (prayerId: string) => {
    try {
      const response = await fetchWithAuth(
        `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/prayers/${prayerId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete prayer: ${response.status}`);
      }

      addResult({
        name: '✓ Delete Prayer (Cleanup)',
        status: 'pass',
        message: 'Test prayer deleted successfully',
      });

      setCreatedPrayerId(null);
    } catch (error) {
      addResult({
        name: '✗ Delete Prayer (Cleanup)',
        status: 'warning',
        message: 'Failed to delete test prayer (manual cleanup needed)',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const getStatusIcon = (status: 'pass' | 'fail' | 'warning') => {
    switch (status) {
      case 'pass':
        return <CheckCircle size={20} color={Colors.light.success} />;
      case 'fail':
        return <XCircle size={20} color={Colors.light.error} />;
      case 'warning':
        return <AlertCircle size={20} color={Colors.light.warning} />;
    }
  };

  const getStatusColor = (status: 'pass' | 'fail' | 'warning') => {
    switch (status) {
      case 'pass':
        return Colors.light.success;
      case 'fail':
        return Colors.light.error;
      case 'warning':
        return Colors.light.warning;
    }
  };

  const passCount = results.filter(r => r.status === 'pass').length;
  const failCount = results.filter(r => r.status === 'fail').length;
  const warningCount = results.filter(r => r.status === 'warning').length;

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Prayer Beta Testing',
          headerStyle: { backgroundColor: Colors.light.background },
        }}
      />
      
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Prayer Request & Wall Testing</Text>
            <Text style={styles.subtitle}>
              Comprehensive test suite for prayer functionality
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Test Coverage</Text>
            <View style={styles.infoItems}>
              <Text style={styles.infoItem}>• Authentication & Authorization</Text>
              <Text style={styles.infoItem}>• Create Prayer Request</Text>
              <Text style={styles.infoItem}>• Fetch Prayers (Personal & Wall)</Text>
              <Text style={styles.infoItem}>• Update Prayer</Text>
              <Text style={styles.infoItem}>• Add Comments</Text>
              <Text style={styles.infoItem}>• Mark as Prayed</Text>
              <Text style={styles.infoItem}>• Delete Prayer</Text>
            </View>
          </View>

          {!isLoggedIn && (
            <View style={styles.warningCard}>
              <AlertCircle size={24} color={Colors.light.warning} />
              <Text style={styles.warningText}>
                You must be logged in to run these tests
              </Text>
              <TouchableOpacity
                style={styles.warningButton}
                onPress={() => router.push('/login')}
              >
                <Text style={styles.warningButtonText}>Go to Login</Text>
              </TouchableOpacity>
            </View>
          )}

          {results.length > 0 && (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Test Summary</Text>
              <View style={styles.summaryStats}>
                <View style={styles.statItem}>
                  <CheckCircle size={24} color={Colors.light.success} />
                  <Text style={styles.statCount}>{passCount}</Text>
                  <Text style={styles.statLabel}>Passed</Text>
                </View>
                <View style={styles.statItem}>
                  <XCircle size={24} color={Colors.light.error} />
                  <Text style={styles.statCount}>{failCount}</Text>
                  <Text style={styles.statLabel}>Failed</Text>
                </View>
                <View style={styles.statItem}>
                  <AlertCircle size={24} color={Colors.light.warning} />
                  <Text style={styles.statCount}>{warningCount}</Text>
                  <Text style={styles.statLabel}>Warnings</Text>
                </View>
              </View>
            </View>
          )}

          {results.length > 0 && (
            <View style={styles.resultsSection}>
              <Text style={styles.resultsTitle}>Test Results</Text>
              {results.map((result, index) => (
                <View
                  key={index}
                  style={[
                    styles.resultCard,
                    { borderLeftColor: getStatusColor(result.status) },
                  ]}
                >
                  <View style={styles.resultHeader}>
                    {getStatusIcon(result.status)}
                    <Text style={styles.resultName}>{result.name}</Text>
                  </View>
                  <Text style={styles.resultMessage}>{result.message}</Text>
                  {result.error && (
                    <Text style={styles.resultError}>Error: {result.error}</Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, styles.runButton, testing && styles.buttonDisabled]}
            onPress={runAllTests}
            disabled={testing || !isLoggedIn}
          >
            {testing ? (
              <>
                <ActivityIndicator size="small" color={Colors.light.white} />
                <Text style={styles.buttonText}>Running Tests...</Text>
              </>
            ) : (
              <>
                <RefreshCw size={20} color={Colors.light.white} />
                <Text style={styles.buttonText}>Run All Tests</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    flex: 1,
  },
  header: {
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textMedium,
  },
  infoCard: {
    backgroundColor: Colors.light.card,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.small,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  infoItems: {
    gap: theme.spacing.xs,
  },
  infoItem: {
    fontSize: 14,
    color: Colors.light.textMedium,
  },
  warningCard: {
    backgroundColor: Colors.light.warning + '15',
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.warning,
    alignItems: 'center',
  },
  warningText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.warning,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  warningButton: {
    backgroundColor: Colors.light.warning,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  warningButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.white,
  },
  summaryCard: {
    backgroundColor: Colors.light.card,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.medium,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.md,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  statCount: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.light.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.textMedium,
  },
  resultsSection: {
    padding: theme.spacing.lg,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.textPrimary,
    marginBottom: theme.spacing.md,
  },
  resultCard: {
    backgroundColor: Colors.light.card,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    borderLeftWidth: 4,
    ...theme.shadows.small,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.textPrimary,
    flex: 1,
  },
  resultMessage: {
    fontSize: 14,
    color: Colors.light.textMedium,
    marginLeft: 28,
  },
  resultError: {
    fontSize: 12,
    color: Colors.light.error,
    marginLeft: 28,
    marginTop: theme.spacing.xs,
    fontStyle: 'italic',
  },
  footer: {
    padding: theme.spacing.lg,
    backgroundColor: Colors.light.card,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderLight,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.medium,
  },
  runButton: {
    backgroundColor: Colors.light.primary,
  },
  buttonDisabled: {
    backgroundColor: Colors.light.textLight,
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.white,
  },
});
