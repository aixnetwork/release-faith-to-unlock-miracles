import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { Button } from '@/components/Button';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { useAdminStore } from '@/store/adminStore';
import * as Haptics from 'expo-haptics';
import { 
  Database, 
  HardDrive, 
  Activity, 
  RefreshCw, 
  Download, 
  Upload, 
  Trash2, 
  BarChart3,
  Clock,
  Users,
  FileText,
  AlertTriangle,
  CheckCircle
} from 'lucide-react-native';

interface DatabaseStats {
  totalSize: string;
  tableCount: number;
  recordCount: number;
  lastBackup: string;
  uptime: string;
  connections: number;
}

interface TableInfo {
  name: string;
  records: number;
  size: string;
  lastModified: string;
}

export default function DatabaseManagementScreen() {
  const { isSuperAdmin } = useAdminStore();
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<DatabaseStats>({
    totalSize: '2.4 GB',
    tableCount: 15,
    recordCount: 45892,
    lastBackup: '2024-01-15 14:30:00',
    uptime: '15 days, 8 hours',
    connections: 12
  });

  const [tables] = useState<TableInfo[]>([
    { name: 'users', records: 1247, size: '45.2 MB', lastModified: '2024-01-15 10:30:00' },
    { name: 'prayers', records: 3892, size: '128.5 MB', lastModified: '2024-01-15 11:45:00' },
    { name: 'organizations', records: 24, size: '2.1 MB', lastModified: '2024-01-14 16:20:00' },
    { name: 'testimonials', records: 421, size: '18.7 MB', lastModified: '2024-01-15 09:15:00' },
    { name: 'songs', records: 156, size: '8.9 MB', lastModified: '2024-01-13 14:30:00' },
    { name: 'promises', records: 89, size: '3.2 MB', lastModified: '2024-01-12 11:00:00' },
    { name: 'quotes', records: 234, size: '5.8 MB', lastModified: '2024-01-14 15:45:00' },
    { name: 'meetings', records: 78, size: '4.1 MB', lastModified: '2024-01-15 08:30:00' }
  ]);

  const handleBackup = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    Alert.alert(
      "Create Database Backup",
      "This will create a full backup of the database. This may take several minutes.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Create Backup", 
          onPress: () => {
            setIsLoading(true);
            // Simulate backup process
            setTimeout(() => {
              setIsLoading(false);
              setStats(prev => ({
                ...prev,
                lastBackup: new Date().toLocaleString()
              }));
              Alert.alert("Success", "Database backup created successfully.");
            }, 3000);
          }
        }
      ]
    );
  };

  const handleOptimize = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    Alert.alert(
      "Optimize Database",
      "This will optimize database tables and rebuild indexes. This may affect performance temporarily.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Optimize", 
          onPress: () => {
            setIsLoading(true);
            // Simulate optimization process
            setTimeout(() => {
              setIsLoading(false);
              Alert.alert("Success", "Database optimization completed successfully.");
            }, 2000);
          }
        }
      ]
    );
  };

  const handleCleanup = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    Alert.alert(
      "Database Cleanup",
      "This will remove old logs, temporary files, and orphaned records. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Cleanup", 
          style: "destructive",
          onPress: () => {
            setIsLoading(true);
            // Simulate cleanup process
            setTimeout(() => {
              setIsLoading(false);
              Alert.alert("Success", "Database cleanup completed successfully.");
            }, 1500);
          }
        }
      ]
    );
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
          title: "Database Management",
          headerTintColor: "#e74c3c"
        }} 
      />
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Database Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Database Overview</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <HardDrive size={24} color="#3498db" />
              </View>
              <Text style={styles.statValue}>{stats.totalSize}</Text>
              <Text style={styles.statLabel}>Total Size</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Database size={24} color="#2ecc71" />
              </View>
              <Text style={styles.statValue}>{stats.tableCount}</Text>
              <Text style={styles.statLabel}>Tables</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <FileText size={24} color="#f39c12" />
              </View>
              <Text style={styles.statValue}>{stats.recordCount.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Records</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Users size={24} color="#9b59b6" />
              </View>
              <Text style={styles.statValue}>{stats.connections}</Text>
              <Text style={styles.statLabel}>Connections</Text>
            </View>
          </View>
        </View>

        {/* System Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Status</Text>
          
          <View style={styles.statusCard}>
            <View style={styles.statusItem}>
              <View style={styles.statusIconContainer}>
                <CheckCircle size={20} color="#2ecc71" />
              </View>
              <View style={styles.statusContent}>
                <Text style={styles.statusTitle}>Database Health</Text>
                <Text style={styles.statusValue}>Excellent</Text>
              </View>
            </View>
            
            <View style={styles.statusItem}>
              <View style={styles.statusIconContainer}>
                <Clock size={20} color="#3498db" />
              </View>
              <View style={styles.statusContent}>
                <Text style={styles.statusTitle}>Uptime</Text>
                <Text style={styles.statusValue}>{stats.uptime}</Text>
              </View>
            </View>
            
            <View style={styles.statusItem}>
              <View style={styles.statusIconContainer}>
                <Download size={20} color="#f39c12" />
              </View>
              <View style={styles.statusContent}>
                <Text style={styles.statusTitle}>Last Backup</Text>
                <Text style={styles.statusValue}>{stats.lastBackup}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Database Operations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Database Operations</Text>
          
          <View style={styles.operationsGrid}>
            <TouchableOpacity 
              style={styles.operationCard}
              onPress={handleBackup}
              disabled={isLoading}
            >
              <Download size={24} color="#3498db" />
              <Text style={styles.operationTitle}>Create Backup</Text>
              <Text style={styles.operationDescription}>Full database backup</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.operationCard}
              onPress={() => Alert.alert("Restore", "This feature will be available in a future update.")}
              disabled={isLoading}
            >
              <Upload size={24} color="#2ecc71" />
              <Text style={styles.operationTitle}>Restore</Text>
              <Text style={styles.operationDescription}>Restore from backup</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.operationCard}
              onPress={handleOptimize}
              disabled={isLoading}
            >
              <RefreshCw size={24} color="#f39c12" />
              <Text style={styles.operationTitle}>Optimize</Text>
              <Text style={styles.operationDescription}>Optimize performance</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.operationCard}
              onPress={handleCleanup}
              disabled={isLoading}
            >
              <Trash2 size={24} color="#e74c3c" />
              <Text style={styles.operationTitle}>Cleanup</Text>
              <Text style={styles.operationDescription}>Remove old data</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Table Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Table Information</Text>
          
          <View style={styles.tableCard}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 2 }]}>Table Name</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Records</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Size</Text>
            </View>
            
            {tables.map((table, index) => (
              <View key={table.name} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 2 }]}>{table.name}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{table.records.toLocaleString()}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{table.size}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Performance Monitoring */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Monitoring</Text>
          
          <TouchableOpacity 
            style={styles.monitoringCard}
            onPress={() => Alert.alert("Performance Monitoring", "Detailed performance metrics will be available in a future update.")}
          >
            <View style={styles.monitoringContent}>
              <View style={styles.monitoringIconContainer}>
                <BarChart3 size={28} color="#3498db" />
              </View>
              <View style={styles.monitoringText}>
                <Text style={styles.monitoringTitle}>View Performance Metrics</Text>
                <Text style={styles.monitoringDescription}>
                  Monitor query performance, connection pools, and resource usage
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {isLoading && (
          <View style={styles.loadingOverlay}>
            <Text style={styles.loadingText}>Processing database operation...</Text>
          </View>
        )}
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
  sectionTitle: {
    ...theme.typography.subtitle,
    marginBottom: theme.spacing.md,
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
  statusCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    ...theme.shadows.small,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  statusIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  statusContent: {
    flex: 1,
  },
  statusTitle: {
    ...theme.typography.body,
    fontWeight: '600',
    marginBottom: 2,
  },
  statusValue: {
    ...theme.typography.caption,
    color: Colors.light.icon,
  },
  operationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  operationCard: {
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
  operationTitle: {
    ...theme.typography.subtitle,
    fontSize: 14,
    marginTop: theme.spacing.sm,
    marginBottom: 2,
  },
  operationDescription: {
    ...theme.typography.caption,
    color: Colors.light.icon,
    textAlign: 'center',
  },
  tableCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    ...theme.shadows.small,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  tableHeaderText: {
    ...theme.typography.caption,
    fontWeight: '600',
    color: Colors.light.textDark,
  },
  tableRow: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  tableCell: {
    ...theme.typography.caption,
    color: Colors.light.icon,
  },
  monitoringCard: {
    backgroundColor: Colors.light.card,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.small,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  monitoringContent: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  monitoringIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3498db20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  monitoringText: {
    flex: 1,
  },
  monitoringTitle: {
    ...theme.typography.subtitle,
    marginBottom: 2,
  },
  monitoringDescription: {
    ...theme.typography.caption,
    color: Colors.light.icon,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...theme.typography.body,
    color: Colors.light.white,
    textAlign: 'center',
  },
});