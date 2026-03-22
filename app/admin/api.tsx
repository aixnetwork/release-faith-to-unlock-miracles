import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, Platform, Switch } from 'react-native';
import { Stack } from 'expo-router';
import { Button } from '@/components/Button';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { useAdminStore } from '@/store/adminStore';
import * as Haptics from 'expo-haptics';
import { 
  Server, 
  Activity, 
  Key, 
  Shield, 
  BarChart3, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Globe,
  Zap,
  FileText,
  Settings,
  RefreshCw,
  Eye,
  TrendingUp
} from 'lucide-react-native';

interface APIStats {
  totalRequests: number;
  requestsToday: number;
  averageResponseTime: number;
  errorRate: number;
  activeKeys: number;
  uptime: string;
}

interface APIEndpoint {
  path: string;
  method: string;
  requests: number;
  avgResponseTime: number;
  status: 'healthy' | 'warning' | 'error';
}

interface APIKey {
  id: string;
  name: string;
  key: string;
  requests: number;
  lastUsed: string;
  status: 'active' | 'inactive';
}

export default function APIManagementScreen() {
  const { isSuperAdmin } = useAdminStore();
  const [isLoading, setIsLoading] = useState(false);
  const [rateLimitEnabled, setRateLimitEnabled] = useState(true);
  const [loggingEnabled, setLoggingEnabled] = useState(true);
  
  const [stats] = useState<APIStats>({
    totalRequests: 1247892,
    requestsToday: 3421,
    averageResponseTime: 145,
    errorRate: 0.8,
    activeKeys: 12,
    uptime: '99.9%'
  });

  const [endpoints] = useState<APIEndpoint[]>([
    { path: '/api/trpc/prayers.get', method: 'GET', requests: 15420, avgResponseTime: 120, status: 'healthy' },
    { path: '/api/trpc/users.create', method: 'POST', requests: 892, avgResponseTime: 180, status: 'healthy' },
    { path: '/api/trpc/meetings.get', method: 'GET', requests: 5431, avgResponseTime: 95, status: 'healthy' },
    { path: '/api/trpc/ai.generate', method: 'POST', requests: 2341, avgResponseTime: 2500, status: 'warning' },
    { path: '/api/trpc/testimonials.get', method: 'GET', requests: 1234, avgResponseTime: 110, status: 'healthy' },
    { path: '/api/trpc/organizations.get', method: 'GET', requests: 567, avgResponseTime: 85, status: 'healthy' }
  ]);

  const [apiKeys] = useState<APIKey[]>([
    { id: '1', name: 'Mobile App', key: 'pk_live_51H...', requests: 45231, lastUsed: '2024-01-15 14:30:00', status: 'active' },
    { id: '2', name: 'Web Dashboard', key: 'pk_live_52K...', requests: 23451, lastUsed: '2024-01-15 14:25:00', status: 'active' },
    { id: '3', name: 'Integration Test', key: 'pk_test_53L...', requests: 1234, lastUsed: '2024-01-14 10:15:00', status: 'active' },
    { id: '4', name: 'Legacy System', key: 'pk_live_54M...', requests: 0, lastUsed: '2024-01-10 09:00:00', status: 'inactive' }
  ]);

  const handleRefreshStats = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert("Success", "API statistics refreshed successfully.");
    }, 1000);
  };

  const handleGenerateAPIKey = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    Alert.alert(
      "Generate API Key",
      "This will create a new API key for external integrations.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Generate", 
          onPress: () => {
            Alert.alert("Success", "New API key generated successfully.");
          }
        }
      ]
    );
  };

  const handleRevokeAPIKey = (keyName: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    Alert.alert(
      "Revoke API Key",
      `Are you sure you want to revoke the API key for "${keyName}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Revoke", 
          style: "destructive",
          onPress: () => {
            Alert.alert("Success", "API key revoked successfully.");
          }
        }
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return '#2ecc71';
      case 'warning': return '#f39c12';
      case 'error': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle size={16} color="#2ecc71" />;
      case 'warning': return <AlertTriangle size={16} color="#f39c12" />;
      case 'error': return <AlertTriangle size={16} color="#e74c3c" />;
      default: return <AlertTriangle size={16} color="#95a5a6" />;
    }
  };

  if (!isSuperAdmin) {
    return (
      <View style={styles.container}>
        <Text style={styles.unauthorizedText}>You do not have permission to access this page.</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: "API Management",
          headerTintColor: "#e74c3c"
        }} 
      />
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* API Overview */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>API Overview</Text>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={handleRefreshStats}
              disabled={isLoading}
            >
              <RefreshCw size={16} color={Colors.light.tint} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <BarChart3 size={24} color="#3498db" />
              </View>
              <Text style={styles.statValue}>{stats.totalRequests.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Total Requests</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <TrendingUp size={24} color="#2ecc71" />
              </View>
              <Text style={styles.statValue}>{stats.requestsToday.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Today</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Clock size={24} color="#f39c12" />
              </View>
              <Text style={styles.statValue}>{stats.averageResponseTime}ms</Text>
              <Text style={styles.statLabel}>Avg Response</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Activity size={24} color="#9b59b6" />
              </View>
              <Text style={styles.statValue}>{stats.uptime}</Text>
              <Text style={styles.statLabel}>Uptime</Text>
            </View>
          </View>
        </View>

        {/* API Configuration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>API Configuration</Text>
          
          <View style={styles.configCard}>
            <View style={styles.configItem}>
              <View style={styles.configItemLeft}>
                <Text style={styles.configItemText}>Rate Limiting</Text>
                <Text style={styles.configItemDescription}>
                  Limit API requests per minute
                </Text>
              </View>
              <Switch
                value={rateLimitEnabled}
                onValueChange={setRateLimitEnabled}
                trackColor={{ false: Colors.light.border, true: "#e74c3c80" }}
                thumbColor={rateLimitEnabled ? "#e74c3c" : '#f4f3f4'}
                ios_backgroundColor={Colors.light.border}
              />
            </View>
            
            <View style={styles.configItem}>
              <View style={styles.configItemLeft}>
                <Text style={styles.configItemText}>Request Logging</Text>
                <Text style={styles.configItemDescription}>
                  Log all API requests for monitoring
                </Text>
              </View>
              <Switch
                value={loggingEnabled}
                onValueChange={setLoggingEnabled}
                trackColor={{ false: Colors.light.border, true: "#e74c3c80" }}
                thumbColor={loggingEnabled ? "#e74c3c" : '#f4f3f4'}
                ios_backgroundColor={Colors.light.border}
              />
            </View>
          </View>
        </View>

        {/* API Endpoints */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>API Endpoints</Text>
          
          <View style={styles.endpointsCard}>
            <View style={styles.endpointsHeader}>
              <Text style={[styles.endpointsHeaderText, { flex: 3 }]}>Endpoint</Text>
              <Text style={[styles.endpointsHeaderText, { flex: 1 }]}>Requests</Text>
              <Text style={[styles.endpointsHeaderText, { flex: 1 }]}>Status</Text>
            </View>
            
            {endpoints.map((endpoint, index) => (
              <View key={index} style={styles.endpointRow}>
                <View style={{ flex: 3 }}>
                  <Text style={styles.endpointPath}>{endpoint.path}</Text>
                  <Text style={styles.endpointMethod}>{endpoint.method} • {endpoint.avgResponseTime}ms</Text>
                </View>
                <Text style={[styles.endpointCell, { flex: 1 }]}>{endpoint.requests.toLocaleString()}</Text>
                <View style={[styles.endpointCell, { flex: 1, flexDirection: 'row', alignItems: 'center' }]}>
                  {getStatusIcon(endpoint.status)}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* API Keys Management */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>API Keys</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={handleGenerateAPIKey}
            >
              <Text style={styles.addButtonText}>Generate Key</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.keysCard}>
            {apiKeys.map((apiKey) => (
              <View key={apiKey.id} style={styles.keyItem}>
                <View style={styles.keyIconContainer}>
                  <Key size={20} color="#3498db" />
                </View>
                <View style={styles.keyContent}>
                  <Text style={styles.keyName}>{apiKey.name}</Text>
                  <Text style={styles.keyDetails}>{apiKey.key}</Text>
                  <Text style={styles.keyStats}>
                    {apiKey.requests.toLocaleString()} requests • Last used: {apiKey.lastUsed}
                  </Text>
                </View>
                <View style={styles.keyActions}>
                  <View style={[
                    styles.keyStatus,
                    { backgroundColor: apiKey.status === 'active' ? '#2ecc7120' : '#95a5a620' }
                  ]}>
                    <Text style={[
                      styles.keyStatusText,
                      { color: apiKey.status === 'active' ? '#2ecc71' : '#95a5a6' }
                    ]}>
                      {apiKey.status}
                    </Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.revokeButton}
                    onPress={() => handleRevokeAPIKey(apiKey.name)}
                  >
                    <Text style={styles.revokeButtonText}>Revoke</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* API Monitoring */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Monitoring & Logs</Text>
          
          <View style={styles.monitoringGrid}>
            <TouchableOpacity 
              style={styles.monitoringCard}
              onPress={() => Alert.alert("Request Logs", "Detailed request logs will be available in a future update.")}
            >
              <FileText size={24} color="#3498db" />
              <Text style={styles.monitoringTitle}>Request Logs</Text>
              <Text style={styles.monitoringDescription}>View detailed logs</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.monitoringCard}
              onPress={() => Alert.alert("Error Monitoring", "Error monitoring dashboard will be available in a future update.")}
            >
              <AlertTriangle size={24} color="#e74c3c" />
              <Text style={styles.monitoringTitle}>Error Monitor</Text>
              <Text style={styles.monitoringDescription}>Track API errors</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.monitoringCard}
              onPress={() => Alert.alert("Performance", "Performance analytics will be available in a future update.")}
            >
              <Activity size={24} color="#2ecc71" />
              <Text style={styles.monitoringTitle}>Performance</Text>
              <Text style={styles.monitoringDescription}>Response times</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.monitoringCard}
              onPress={() => Alert.alert("Security", "Security monitoring will be available in a future update.")}
            >
              <Shield size={24} color="#f39c12" />
              <Text style={styles.monitoringTitle}>Security</Text>
              <Text style={styles.monitoringDescription}>Security events</Text>
            </TouchableOpacity>
          </View>
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
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  unauthorizedText: {
    ...theme.typography.body,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.subtitle,
  },
  refreshButton: {
    padding: 8,
  },
  addButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.sm,
  },
  addButtonText: {
    color: Colors.light.white,
    fontWeight: '600',
    fontSize: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    ...theme.shadows.small,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  statValue: {
    ...theme.typography.subtitle,
    fontSize: 18,
    marginBottom: 2,
  },
  statLabel: {
    ...theme.typography.caption,
    color: Colors.light.icon,
  },
  configCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    ...theme.shadows.small,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  configItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  configItemLeft: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  configItemText: {
    ...theme.typography.body,
    fontWeight: '600',
    marginBottom: 2,
  },
  configItemDescription: {
    ...theme.typography.caption,
    color: Colors.light.textLight,
  },
  endpointsCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    ...theme.shadows.small,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  endpointsHeader: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  endpointsHeaderText: {
    ...theme.typography.caption,
    fontWeight: '600',
    color: Colors.light.textDark,
  },
  endpointRow: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    alignItems: 'center',
  },
  endpointPath: {
    ...theme.typography.caption,
    fontWeight: '600',
    marginBottom: 2,
  },
  endpointMethod: {
    ...theme.typography.small,
    color: Colors.light.icon,
  },
  endpointCell: {
    ...theme.typography.caption,
    color: Colors.light.icon,
  },
  keysCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    ...theme.shadows.small,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  keyItem: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    alignItems: 'center',
  },
  keyIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3498db20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  keyContent: {
    flex: 1,
  },
  keyName: {
    ...theme.typography.body,
    fontWeight: '600',
    marginBottom: 2,
  },
  keyDetails: {
    ...theme.typography.caption,
    color: Colors.light.icon,
    marginBottom: 2,
  },
  keyStats: {
    ...theme.typography.small,
    color: Colors.light.textLight,
  },
  keyActions: {
    alignItems: 'flex-end',
  },
  keyStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: theme.spacing.sm,
  },
  keyStatusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  revokeButton: {
    backgroundColor: '#fef5f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  revokeButtonText: {
    color: '#e74c3c',
    fontWeight: '600',
    fontSize: 10,
  },
  monitoringGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  monitoringCard: {
    width: '48%',
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    ...theme.shadows.small,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  monitoringTitle: {
    ...theme.typography.subtitle,
    fontSize: 14,
    marginTop: theme.spacing.sm,
    marginBottom: 2,
  },
  monitoringDescription: {
    ...theme.typography.caption,
    color: Colors.light.icon,
    textAlign: 'center',
  },
});