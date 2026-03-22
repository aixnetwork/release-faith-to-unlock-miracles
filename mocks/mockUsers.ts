export const mockUsers = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@example.com',
    plan: 'premium' as const,
    joinDate: '2024-01-15',
    orgName: 'Grace Community Church',
    orgRole: 'admin' as const,
    organization: {
      id: 'org1',
      name: 'Grace Community Church',
      memberCount: 85,
      groupCount: 4,
      plan: 'org_small' as const,
    }
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    plan: 'org_medium' as const,
    joinDate: '2024-02-20',
    orgName: 'First Baptist Church',
    orgRole: 'admin' as const,
    organization: {
      id: 'org2',
      name: 'First Baptist Church',
      memberCount: 350,
      groupCount: 15,
      plan: 'org_medium' as const,
    }
  },
  {
    id: '3',
    name: 'Michael Davis',
    email: 'michael@example.com',
    plan: 'pro' as const,
    joinDate: '2024-03-10',
  },
  {
    id: '4',
    name: 'Emily Wilson',
    email: 'emily@example.com',
    plan: 'free' as const,
    joinDate: '2024-04-05',
  },
  {
    id: '5',
    name: 'Pastor David Brown',
    email: 'david@megachurch.com',
    plan: 'org_large' as const,
    joinDate: '2024-01-01',
    orgName: 'Mega Faith Center',
    orgRole: 'admin' as const,
    organization: {
      id: 'org3',
      name: 'Mega Faith Center',
      memberCount: 2500,
      groupCount: 50,
      plan: 'org_large' as const,
    }
  }
];

// Mock function to simulate login with different user types
export const mockLogin = (userType: 'free' | 'premium' | 'pro' | 'org_admin' | 'mega_church') => {
  switch (userType) {
    case 'free':
      return mockUsers[3]; // Emily Wilson
    case 'premium':
      return mockUsers[0]; // John Smith
    case 'pro':
      return mockUsers[2]; // Michael Davis
    case 'org_admin':
      return mockUsers[1]; // Sarah Johnson
    case 'mega_church':
      return mockUsers[4]; // Pastor David Brown
    default:
      return mockUsers[3]; // Default to free user
  }
};