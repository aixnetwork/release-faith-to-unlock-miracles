import { create } from 'zustand';
import { combine } from 'zustand/middleware';
import type { ServiceListing, ServiceCategory, PriceType, MarketplaceSettings } from '@/types';
import { mockServiceListings, mockMarketplaceSettings } from '@/mocks/marketplace';

const initialState = {
  listings: mockServiceListings as ServiceListing[],
  featuredListings: mockServiceListings.filter(l => l.featured) as ServiceListing[],
  categories: [
    'spiritual-guidance',
    'counseling',
    'music-ministry',
    'event-planning',
    'education',
    'technology',
    'creative-services',
    'business-consulting',
    'financial-services',
    'health-wellness',
    'childcare',
    'home-repair',
    'cleaning',
    'transportation',
    'tutoring',
    'other'
  ] as ServiceCategory[],
  settings: mockMarketplaceSettings as MarketplaceSettings | null,
  isLoading: false,
  error: null as string | null,
  
  // Filters
  selectedCategory: null as ServiceCategory | null,
  searchQuery: '',
  priceFilter: null as PriceType | null,
  locationFilter: '',
};

export const useMarketplaceStore = create(
  combine(initialState, (set, get) => ({
    // Actions
    setListings: (listings: ServiceListing[]) => set({ listings }),
    setFeaturedListings: (listings: ServiceListing[]) => set({ featuredListings: listings }),
    setSettings: (settings: MarketplaceSettings) => set({ settings }),
    setLoading: (loading: boolean) => set({ isLoading: loading }),
    setError: (error: string | null) => set({ error }),
    
    // Filter actions
    setSelectedCategory: (category: ServiceCategory | null) => set({ selectedCategory: category }),
    setSearchQuery: (query: string) => set({ searchQuery: query }),
    setPriceFilter: (priceType: PriceType | null) => set({ priceFilter: priceType }),
    setLocationFilter: (location: string) => set({ locationFilter: location }),
    clearFilters: () => set({
      selectedCategory: null,
      searchQuery: '',
      priceFilter: null,
      locationFilter: ''
    }),
    
    // Computed getters
    getFilteredListings: () => {
      const state = get();
      let filtered = [...state.listings];
      
      if (state.selectedCategory) {
        filtered = filtered.filter(listing => listing.category === state.selectedCategory);
      }
      
      if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase();
        filtered = filtered.filter(listing =>
          listing.title.toLowerCase().includes(query) ||
          listing.description.toLowerCase().includes(query) ||
          listing.tags.some(tag => tag.toLowerCase().includes(query)) ||
          listing.provider.name.toLowerCase().includes(query)
        );
      }
      
      if (state.priceFilter) {
        filtered = filtered.filter(listing => listing.priceType === state.priceFilter);
      }
      
      if (state.locationFilter) {
        const location = state.locationFilter.toLowerCase();
        filtered = filtered.filter(listing =>
          listing.location?.city?.toLowerCase().includes(location) ||
          listing.location?.state?.toLowerCase().includes(location) ||
          listing.location?.country?.toLowerCase().includes(location)
        );
      }
      
      return filtered;
    },
    
    getCategoryCount: (category: ServiceCategory) => {
      const state = get();
      const count = state.listings.filter(listing => 
        listing.category === category && 
        listing.isActive && 
        listing.isApproved
      ).length;
      console.log(`📊 Store: Category ${category} has ${count} active/approved listings out of ${state.listings.length} total`);
      return count;
    }
  }))
);