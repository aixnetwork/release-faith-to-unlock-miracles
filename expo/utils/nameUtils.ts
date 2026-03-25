export const getFirstName = (
  firstName?: string | null,
  fullName?: string | null,
  email?: string | null
): string => {
  if (firstName && firstName.trim()) {
    return firstName.trim();
  }
  
  if (fullName && fullName.trim()) {
    const parts = fullName.trim().split(' ');
    if (parts.length > 0 && parts[0]) {
      return parts[0];
    }
  }
  
  if (email && email.includes('@')) {
    const username = email.split('@')[0];
    if (username) {
      return username.charAt(0).toUpperCase() + username.slice(1);
    }
  }
  
  return 'Someone';
};

export const getFullName = (
  firstName?: string | null,
  lastName?: string | null,
  fullName?: string | null,
  email?: string | null
): string => {
  if (firstName && lastName) {
    return `${firstName.trim()} ${lastName.trim()}`;
  }
  
  if (firstName) {
    return firstName.trim();
  }
  
  if (fullName && fullName.trim()) {
    return fullName.trim();
  }
  
  if (email && email.includes('@')) {
    const username = email.split('@')[0];
    if (username) {
      return username.charAt(0).toUpperCase() + username.slice(1);
    }
  }
  
  return 'Anonymous';
};
