import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Referral {
  id: string;
  referredEmail: string;
  referredName?: string;
  date: string;
  status: 'registered' | 'subscribed' | 'expired' | 'pending';
  plan?: string | null;
  commission: number;
}

export interface Payout {
  id: string;
  amount: number;
  date: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  method: 'bank_transfer' | 'paypal' | 'stripe';
  transactionId?: string;
  reference?: string;
}

interface AffiliateState {
  isAffiliate: boolean;
  referralCode: string;
  referralLink: string;
  totalEarnings: number;
  availableBalance: number;
  pendingBalance: number;
  lifetimeReferrals: number;
  activeReferrals: number;
  referrals: Referral[];
  payouts: Payout[];
  paymentMethod: {
    type: 'bank_transfer' | 'paypal' | 'stripe' | null;
    details: Record<string, any>;
  };
  
  // Actions
  becomeAffiliate: () => void;
  addReferral: (referral: Omit<Referral, 'id' | 'date'>) => void;
  updateReferralStatus: (referralId: string, status: Referral['status'], plan?: string) => void;
  requestPayout: (method: 'bank_transfer' | 'paypal' | 'stripe') => void;
  updatePaymentMethod: (method: 'bank_transfer' | 'paypal' | 'stripe', details: Record<string, any>) => void;
  getAnalytics: () => {
    totalClicks: number;
    conversionRate: number;
    monthlyEarnings: number;
    topReferralSource: string;
  };
}

const generateReferralCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const useAffiliateStore = create<AffiliateState>()(
  persist(
    (set, get) => ({
      isAffiliate: false,
      referralCode: '',
      referralLink: '',
      totalEarnings: 0,
      availableBalance: 0,
      pendingBalance: 0,
      lifetimeReferrals: 0,
      activeReferrals: 0,
      referrals: [],
      payouts: [],
      paymentMethod: {
        type: null,
        details: {},
      },
      
      becomeAffiliate: () => {
        const code = generateReferralCode();
        const link = `https://releasefaith.app/register?ref=${code}`;
        
        set({
          isAffiliate: true,
          referralCode: code,
          referralLink: link,
        });
      },
      
      addReferral: (referralData) => {
        const newReferral: Referral = {
          ...referralData,
          id: `ref_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          date: new Date().toISOString(),
        };
        
        set((state) => ({
          referrals: [newReferral, ...state.referrals],
          lifetimeReferrals: state.lifetimeReferrals + 1,
          activeReferrals: state.activeReferrals + (newReferral.status === 'subscribed' ? 1 : 0),
        }));
      },
      
      updateReferralStatus: (referralId, status, plan) => {
        set((state) => {
          const updatedReferrals = state.referrals.map((referral) => {
            if (referral.id === referralId) {
              let commission = 0;
              
              // Calculate commission based on plan
              if (status === 'subscribed' && plan) {
                switch (plan) {
                  case 'premium':
                    commission = 9.99 * 0.2; // 20% of $9.99
                    break;
                  case 'org_small':
                    commission = 49 * 0.2; // 20% of $49
                    break;
                  case 'org_medium':
                    commission = 99 * 0.2; // 20% of $99
                    break;
                  case 'org_large':
                    commission = 199 * 0.2; // 20% of $199
                    break;
                }
              }
              
              return {
                ...referral,
                status,
                plan,
                commission,
              };
            }
            return referral;
          });
          
          // Recalculate totals
          const totalCommission = updatedReferrals.reduce((sum, ref) => sum + ref.commission, 0);
          const activeCount = updatedReferrals.filter(ref => ref.status === 'subscribed').length;
          
          // Pending balance (commissions from last 30 days)
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          
          const recentCommissions = updatedReferrals
            .filter(ref => new Date(ref.date) > thirtyDaysAgo && ref.commission > 0)
            .reduce((sum, ref) => sum + ref.commission, 0);
          
          const availableCommissions = updatedReferrals
            .filter(ref => new Date(ref.date) <= thirtyDaysAgo && ref.commission > 0)
            .reduce((sum, ref) => sum + ref.commission, 0);
          
          return {
            referrals: updatedReferrals,
            totalEarnings: totalCommission,
            activeReferrals: activeCount,
            pendingBalance: recentCommissions,
            availableBalance: Math.max(0, availableCommissions - state.payouts.reduce((sum, payout) => 
              payout.status === 'completed' ? sum + payout.amount : sum, 0
            )),
          };
        });
      },
      
      requestPayout: (method) => {
        const state = get();
        const amount = state.availableBalance;
        
        if (amount <= 0) {
          throw new Error('No available balance');
        }
        
        const newPayout: Payout = {
          id: `payout_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          amount,
          date: new Date().toISOString(),
          status: 'pending',
          method,
          reference: `REF${Date.now()}`,
        };
        
        set((state) => ({
          payouts: [newPayout, ...state.payouts],
          availableBalance: 0,
        }));
      },
      
      updatePaymentMethod: (method, details) => {
        set({
          paymentMethod: {
            type: method,
            details,
          },
        });
      },
      
      getAnalytics: () => {
        const state = get();
        
        // Mock analytics data
        const totalClicks = state.lifetimeReferrals * 3; // Assume 3 clicks per referral
        const conversionRate = state.lifetimeReferrals > 0 ? (state.activeReferrals / totalClicks) * 100 : 0;
        
        // Calculate monthly earnings
        const thisMonth = new Date();
        thisMonth.setDate(1);
        const monthlyEarnings = state.referrals
          .filter(ref => new Date(ref.date) >= thisMonth && ref.commission > 0)
          .reduce((sum, ref) => sum + ref.commission, 0);
        
        return {
          totalClicks,
          conversionRate,
          monthlyEarnings,
          topReferralSource: 'Direct Link', // Mock data
        };
      },
    }),
    {
      name: 'affiliate-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);