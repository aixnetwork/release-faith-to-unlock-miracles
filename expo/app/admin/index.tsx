import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Book, Music, Quote, MessageSquare, Users, LogOut, BarChart, Settings, Shield, Database, Server, TrendingUp, UserCheck, Building, ShoppingBag, Clock, CreditCard } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { theme } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { useAdminStore } from '@/store/adminStore';
import { useLogout } from '@/hooks/useLogout';
import { ENV } from '@/config/env';
import BottomNavigation from '@/components/BottomNavigation';

export default function AdminDashboardScreen() {
  const { username, lastLogin, isSuperAdmin, canManageUsers, canAccessDatabase, canAccessAPI, canManageMarketplace } = useAdminStore();
  const { handleLogout } = useLogout();
  const [analyticsData, setAnalyticsData] = useState({
    activeUsers: { count: 0, trend: '+0%', positive: true },
    organizations: { count: 0, trend: '+0%', positive: true },
    prayers: { count: 0, trend: '+0%', positive: true },
    testimonials: { count: 0, trend: '+0%', positive: true }
  });
  const [isLoading, setIsLoading] = useState(true);

  const formattedLastLogin = lastLogin 
    ? new Date(lastLogin).toLocaleString() 
    : 'N/A';

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true);
      console.log('📊 Fetching analytics data...');

      // Check if user is organizer (admin role but not superadmin)
      const isOrganizer = !isSuperAdmin() && useAdminStore.getState().directusUserId;
      const directusToken = useAdminStore.getState().directusToken;
      
      if (isOrganizer && directusToken) {
        console.log('👤 Fetching organization-specific analytics for organizer');
        
        // First, get the organization ID for this user
        const userOrgRes = await fetch(
          `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/organizations?filter[user_created][_eq]=${useAdminStore.getState().directusUserId}`,
          {
            headers: {
              'Authorization': `Bearer ${directusToken}`,
              'Content-Type': 'application/json',
            },
          }
        );
        
        const userOrgData = await userOrgRes.json();
        const organizationId = userOrgData.data?.[0]?.id;
        
        if (organizationId) {
          console.log('🏢 Organization ID:', organizationId);
          
          // Fetch organization-specific data
          const [usersRes, prayersRes, testimonialsRes] = await Promise.all([
            fetch(
              `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/organization_users?filter[organization_id][_eq]=${organizationId}`,
              {
                headers: {
                  'Authorization': `Bearer ${directusToken}`,
                  'Content-Type': 'application/json',
                },
              }
            ),
            fetch(
              `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/prayers?filter[organization_id][_eq]=${organizationId}`,
              {
                headers: {
                  'Authorization': `Bearer ${directusToken}`,
                  'Content-Type': 'application/json',
                },
              }
            ),
            fetch(
              `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/testimonials?filter[organization_id][_eq]=${organizationId}`,
              {
                headers: {
                  'Authorization': `Bearer ${directusToken}`,
                  'Content-Type': 'application/json',
                },
              }
            ),
          ]);

          const [usersData, prayersData, testimonialsData] = await Promise.all([
            usersRes.json(),
            prayersRes.json(),
            testimonialsRes.json(),
          ]);

          console.log('✅ Organization analytics data fetched:', {
            users: usersData,
            prayers: prayersData,
            testimonials: testimonialsData,
          });

          const membersCount = usersData.data?.length || 0;
          const prayersCount = prayersData.data?.length || 0;
          const testimonialsCount = testimonialsData.data?.length || 0;

          console.log('📊 Parsed counts:', {
            members: membersCount,
            prayers: prayersCount,
            testimonials: testimonialsCount,
          });

          setAnalyticsData({
            activeUsers: {
              count: membersCount,
              trend: '+12%',
              positive: true
            },
            organizations: {
              count: 1,
              trend: '0%',
              positive: true
            },
            prayers: {
              count: prayersCount,
              trend: '+8%',
              positive: true
            },
            testimonials: {
              count: testimonialsCount,
              trend: '+15%',
              positive: true
            }
          });
        } else {
          console.log('⚠️ No organization found for this user');
        }
      } else {
        // SuperAdmin: fetch all data
        console.log('👑 Fetching global analytics for superadmin');
        
        const [usersRes, orgsRes, prayersRes, testimonialsRes] = await Promise.all([
          fetch(
            `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/users?aggregate[countDistinct]=id&filter[status][_eq]=active`,
            {
              headers: {
                'Authorization': `Bearer ${ENV.EXPO_PUBLIC_API_TOKEN}`,
                'Content-Type': 'application/json',
              },
            }
          ),
          fetch(
            `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/organizations?aggregate[countDistinct]=id`,
            {
              headers: {
                'Authorization': `Bearer ${ENV.EXPO_PUBLIC_API_TOKEN}`,
                'Content-Type': 'application/json',
              },
            }
          ),
          fetch(
            `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/prayers?aggregate[countDistinct]=id`,
            {
              headers: {
                'Authorization': `Bearer ${ENV.EXPO_PUBLIC_API_TOKEN}`,
                'Content-Type': 'application/json',
              },
            }
          ),
          fetch(
            `${ENV.EXPO_PUBLIC_RORK_API_BASE_URL}/items/testimonials?aggregate[countDistinct]=id`,
            {
              headers: {
                'Authorization': `Bearer ${ENV.EXPO_PUBLIC_API_TOKEN}`,
                'Content-Type': 'application/json',
              },
            }
          ),
        ]);

        const [usersData, orgsData, prayersData, testimonialsData] = await Promise.all([
          usersRes.json(),
          orgsRes.json(),
          prayersRes.json(),
          testimonialsRes.json(),
        ]);

        console.log('✅ Analytics data fetched:', {
          users: usersData,
          orgs: orgsData,
          prayers: prayersData,
          testimonials: testimonialsData,
        });

        const usersCount = usersData.data?.[0]?.countDistinct?.id || 0;
        const orgsCount = orgsData.data?.[0]?.countDistinct?.id || 0;
        const prayersCount = prayersData.data?.[0]?.countDistinct?.id || 0;
        const testimonialsCount = testimonialsData.data?.[0]?.countDistinct?.id || 0;

        console.log('📊 Parsed counts:', {
          users: usersCount,
          orgs: orgsCount,
          prayers: prayersCount,
          testimonials: testimonialsCount,
        });

        setAnalyticsData({
          activeUsers: {
            count: usersCount,
            trend: '+12%',
            positive: true
          },
          organizations: {
            count: orgsCount,
            trend: '+3%',
            positive: true
          },
          prayers: {
            count: prayersCount,
            trend: '+8%',
            positive: true
          },
          testimonials: {
            count: testimonialsCount,
            trend: '+15%',
            positive: true
          }
        });
      }
    } catch (error) {
      console.error('❌ Error fetching analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{isSuperAdmin() ? 'SuperAdmin Dashboard' : 'Admin Dashboard'}</Text>
          <Text style={styles.subtitle}>{isSuperAdmin() ? 'Manage all system content and settings' : 'Manage content and marketplace'}</Text>
        </View>
        <View style={styles.adminBadge}>
          <Shield size={16} color={Colors.light.background} />
          <Text style={styles.adminBadgeText}>{isSuperAdmin() ? 'SuperAdmin' : 'Admin'}</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Username:</Text>
          <Text style={styles.infoValue}>{username || (isSuperAdmin() ? 'superadmin' : 'admin')}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Last Login:</Text>
          <Text style={styles.infoValue}>{formattedLastLogin}</Text>
        </View>
      </View>

      {/* Analytics Overview Section */}
      <View style={styles.analyticsHeader}>
        <Text style={styles.sectionTitle}>Analytics Overview</Text>
        <TouchableOpacity 
          style={styles.viewAllButton}
          onPress={() => router.push('/admin/analytics')}
        >
          <Text style={styles.viewAllText}>View All</Text>
          <BarChart size={16} color={Colors.light.tint} />
        </TouchableOpacity>
      </View>
      
      <View style={[styles.analyticsGrid, !isSuperAdmin() && styles.analyticsGridThree]}>
        <View style={styles.analyticsCard}>
          <View style={styles.analyticsIconContainer}>
            <UserCheck size={20} color="#3498db" />
          </View>
          <View>
            <Text style={styles.analyticsValue}>
              {isLoading ? '...' : analyticsData.activeUsers.count.toLocaleString()}
            </Text>
            <Text style={styles.analyticsLabel}>{isSuperAdmin() ? 'Active Users' : 'Members'}</Text>
          </View>
          <View style={[
            styles.trendBadge, 
            analyticsData.activeUsers.positive ? styles.positiveTrend : styles.negativeTrend
          ]}>
            <TrendingUp size={12} color={analyticsData.activeUsers.positive ? '#2ecc71' : '#e74c3c'} />
            <Text style={[
              styles.trendText,
              analyticsData.activeUsers.positive ? styles.positiveTrendText : styles.negativeTrendText
            ]}>{analyticsData.activeUsers.trend}</Text>
          </View>
        </View>
        
        {isSuperAdmin() && (
          <View style={styles.analyticsCard}>
            <View style={styles.analyticsIconContainer}>
              <Building size={20} color="#e74c3c" />
            </View>
            <View>
              <Text style={styles.analyticsValue}>
                {isLoading ? '...' : analyticsData.organizations.count.toLocaleString()}
              </Text>
              <Text style={styles.analyticsLabel}>Organizations</Text>
            </View>
            <View style={[
              styles.trendBadge, 
              analyticsData.organizations.positive ? styles.positiveTrend : styles.negativeTrend
            ]}>
              <TrendingUp size={12} color={analyticsData.organizations.positive ? '#2ecc71' : '#e74c3c'} />
              <Text style={[
                styles.trendText,
                analyticsData.organizations.positive ? styles.positiveTrendText : styles.negativeTrendText
              ]}>{analyticsData.organizations.trend}</Text>
            </View>
          </View>
        )}
        
        <View style={styles.analyticsCard}>
          <View style={styles.analyticsIconContainer}>
            <MessageSquare size={20} color="#9b59b6" />
          </View>
          <View>
            <Text style={styles.analyticsValue}>
              {isLoading ? '...' : analyticsData.prayers.count.toLocaleString()}
            </Text>
            <Text style={styles.analyticsLabel}>Prayers</Text>
          </View>
          <View style={[
            styles.trendBadge, 
            analyticsData.prayers.positive ? styles.positiveTrend : styles.negativeTrend
          ]}>
            <TrendingUp size={12} color={analyticsData.prayers.positive ? '#2ecc71' : '#e74c3c'} />
            <Text style={[
              styles.trendText,
              analyticsData.prayers.positive ? styles.positiveTrendText : styles.negativeTrendText
            ]}>{analyticsData.prayers.trend}</Text>
          </View>
        </View>
        
        <View style={styles.analyticsCard}>
          <View style={styles.analyticsIconContainer}>
            <Quote size={20} color="#f39c12" />
          </View>
          <View>
            <Text style={styles.analyticsValue}>
              {isLoading ? '...' : analyticsData.testimonials.count.toLocaleString()}
            </Text>
            <Text style={styles.analyticsLabel}>Testimonials</Text>
          </View>
          <View style={[
            styles.trendBadge, 
            analyticsData.testimonials.positive ? styles.positiveTrend : styles.negativeTrend
          ]}>
            <TrendingUp size={12} color={analyticsData.testimonials.positive ? '#2ecc71' : '#e74c3c'} />
            <Text style={[
              styles.trendText,
              analyticsData.testimonials.positive ? styles.positiveTrendText : styles.negativeTrendText
            ]}>{analyticsData.testimonials.trend}</Text>
          </View>
        </View>
      </View>

      {!isSuperAdmin() && (
        <>
          <Text style={styles.sectionTitle}>Organization Management</Text>
          
          <TouchableOpacity 
            style={styles.largeCard}
            onPress={() => router.push('/organization')}
          >
            <View style={styles.largeCardContent}>
              <View style={[styles.largeIconContainer, { backgroundColor: '#e74c3c20' }]}>
                <Building size={28} color="#e74c3c" />
              </View>
              <View style={styles.largeCardText}>
                <Text style={styles.largeCardTitle}>My Organization</Text>
                <Text style={styles.largeCardSubtitle}>
                  Manage your church settings, members, and content
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </>
      )}

      {isSuperAdmin() && (
        <>
          <Text style={styles.sectionTitle}>Organization Management</Text>
          
          <View style={styles.cardsContainer}>
            <TouchableOpacity 
              style={styles.card}
              onPress={() => router.push('/admin/organizations')}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#e74c3c20' }]}>
                <Building size={24} color="#e74c3c" />
              </View>
              <Text style={styles.cardTitle}>Organizations</Text>
              <Text style={styles.cardSubtitle}>Manage churches</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.card}
              onPress={() => router.push('/admin/plans')}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#3498db20' }]}>
                <CreditCard size={24} color="#3498db" />
              </View>
              <Text style={styles.cardTitle}>Plans</Text>
              <Text style={styles.cardSubtitle}>Manage subscription plans</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <Text style={styles.sectionTitle}>Content Management</Text>
      
      <View style={styles.cardsContainer}>
        <TouchableOpacity 
          style={styles.card}
          onPress={() => router.push('/admin/promises')}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#3498db20' }]}>
            <Book size={24} color="#3498db" />
          </View>
          <Text style={styles.cardTitle}>Bible Promises</Text>
          <Text style={styles.cardSubtitle}>Manage daily verses</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.card}
          onPress={() => router.push('/admin/songs')}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#9b59b620' }]}>
            <Music size={24} color="#9b59b6" />
          </View>
          <Text style={styles.cardTitle}>Songs</Text>
          <Text style={styles.cardSubtitle}>Manage worship songs</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.card}
          onPress={() => router.push('/admin/quotes')}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#f39c1220' }]}>
            <Quote size={24} color="#f39c12" />
          </View>
          <Text style={styles.cardTitle}>Quotes</Text>
          <Text style={styles.cardSubtitle}>Manage inspirational quotes</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.card}
          onPress={() => router.push('/admin/testimonials')}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#2ecc7120' }]}>
            <MessageSquare size={24} color="#2ecc71" />
          </View>
          <Text style={styles.cardTitle}>Testimonials</Text>
          <Text style={styles.cardSubtitle}>Manage user testimonies</Text>
        </TouchableOpacity>
      </View>

      {canManageMarketplace() && (
        <>
          <Text style={styles.sectionTitle}>Marketplace Management</Text>
          
          <View style={styles.cardsContainer}>
            <TouchableOpacity 
              style={styles.card}
              onPress={() => router.push('/admin/marketplace')}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#9b59b620' }]}>
                <ShoppingBag size={24} color="#9b59b6" />
              </View>
              <Text style={styles.cardTitle}>Settings</Text>
              <Text style={styles.cardSubtitle}>Configure marketplace</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.card}
              onPress={() => router.push('/admin/service-approvals')}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#f39c1220' }]}>
                <Clock size={24} color="#f39c12" />
              </View>
              <Text style={styles.cardTitle}>Approvals</Text>
              <Text style={styles.cardSubtitle}>Review service listings</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {canManageUsers() && (
        <>
          <Text style={styles.sectionTitle}>User Management</Text>
          
          <TouchableOpacity 
            style={styles.largeCard}
            onPress={() => router.push('/admin/users')}
          >
            <View style={styles.largeCardContent}>
              <View style={[styles.largeIconContainer, { backgroundColor: '#3498db20' }]}>
                <Users size={28} color="#3498db" />
              </View>
              <View style={styles.largeCardText}>
                <Text style={styles.largeCardTitle}>Manage Users</Text>
                <Text style={styles.largeCardSubtitle}>
                  View and manage all users, admins, and individual accounts
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </>
      )}

      {isSuperAdmin() && (
        <>
          <Text style={styles.sectionTitle}>System Administration</Text>
          
          <View style={styles.systemCards}>
            {canAccessDatabase() && (
              <TouchableOpacity 
                style={styles.systemCard}
                onPress={() => router.push('/admin/database')}
              >
                <Database size={24} color="#e74c3c" />
                <Text style={styles.systemCardTitle}>Database</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={styles.systemCard}
              onPress={() => router.push('/admin/analytics')}
            >
              <BarChart size={24} color="#3498db" />
              <Text style={styles.systemCardTitle}>Analytics</Text>
            </TouchableOpacity>
            
            {canAccessAPI() && (
              <TouchableOpacity 
                style={styles.systemCard}
                onPress={() => router.push('/admin/api')}
              >
                <Server size={24} color="#2ecc71" />
                <Text style={styles.systemCardTitle}>API</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={styles.systemCard}
              onPress={() => router.push('/admin/settings')}
            >
              <Settings size={24} color="#f39c12" />
              <Text style={styles.systemCardTitle}>Settings</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <Button
        title="Log Out"
        onPress={handleLogout}
        variant="outline"
        icon={<LogOut size={18} color="#e74c3c" />}
        style={styles.logoutButton}
        textStyle={{ color: '#e74c3c' }}
      />
      <BottomNavigation />
    </ScrollView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    ...theme.typography.title,
    color: '#e74c3c',
  },
  subtitle: {
    ...theme.typography.body,
    color: Colors.light.icon,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e74c3c',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  adminBadgeText: {
    color: Colors.light.background,
    fontWeight: '600',
    fontSize: 12,
  },
  infoCard: {
    backgroundColor: Colors.light.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.xl,
    borderLeftWidth: 3,
    borderLeftColor: '#e74c3c',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  infoLabel: {
    ...theme.typography.body,
    fontWeight: '600',
    width: 100,
  },
  infoValue: {
    ...theme.typography.body,
    color: Colors.light.icon,
  },
  analyticsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    ...theme.typography.caption,
    color: Colors.light.tint,
    fontWeight: '600',
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xl,
  },
  analyticsGridThree: {
    justifyContent: 'flex-start',
    gap: theme.spacing.md,
  },
  analyticsCard: {
    width: '48%',
    backgroundColor: Colors.light.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.small,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    minWidth: '30%',
  },
  analyticsIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  analyticsValue: {
    ...theme.typography.subtitle,
    fontSize: 16,
  },
  analyticsLabel: {
    ...theme.typography.caption,
    color: Colors.light.icon,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 2,
  },
  positiveTrend: {
    backgroundColor: '#2ecc7120',
  },
  negativeTrend: {
    backgroundColor: '#e74c3c20',
  },
  trendText: {
    fontSize: 10,
    fontWeight: '600',
  },
  positiveTrendText: {
    color: '#2ecc71',
  },
  negativeTrendText: {
    color: '#e74c3c',
  },
  sectionTitle: {
    ...theme.typography.subtitle,
    marginBottom: theme.spacing.md,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xl,
  },
  card: {
    width: '48%',
    backgroundColor: Colors.light.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.small,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  cardTitle: {
    ...theme.typography.subtitle,
    fontSize: 16,
    marginBottom: 2,
  },
  cardSubtitle: {
    ...theme.typography.caption,
    color: Colors.light.icon,
  },
  largeCard: {
    backgroundColor: Colors.light.background,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.xl,
    ...theme.shadows.small,
    borderLeftWidth: 3,
    borderLeftColor: '#e74c3c',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  largeCardContent: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  largeIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  largeCardText: {
    flex: 1,
  },
  largeCardTitle: {
    ...theme.typography.subtitle,
    marginBottom: 2,
  },
  largeCardSubtitle: {
    ...theme.typography.caption,
    color: Colors.light.icon,
  },
  systemCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xl,
  },
  systemCard: {
    width: '19%',
    backgroundColor: Colors.light.background,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    ...theme.shadows.small,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  systemCardTitle: {
    ...theme.typography.caption,
    fontWeight: '600',
    marginTop: theme.spacing.sm,
  },
  logoutButton: {
    marginTop: theme.spacing.md,
    borderColor: '#e74c3c',
  },
});