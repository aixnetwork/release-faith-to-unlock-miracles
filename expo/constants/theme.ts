export const theme = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  borderRadius: {
    xs: 2,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  typography: {
    title: {
      fontSize: 24,
      fontWeight: '700' as const,
      lineHeight: 32,
    },
    subtitle: {
      fontSize: 18,
      fontWeight: '600' as const,
      lineHeight: 24,
    },
    subtitleDark: {
      fontSize: 18,
      fontWeight: '600' as const,
      lineHeight: 24,
      color: '#1F2937',
    },
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 22,
    },
    caption: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 18,
    },
    captionDark: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 18,
      color: '#374151',
    },
    small: {
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 16,
    },
    inputLabel: {
      fontSize: 16,
      fontWeight: '600' as const,
      lineHeight: 20,
      color: '#374151',
    },
    // Button text styles for better clarity
    buttonText: {
      small: {
        fontSize: 15,
        fontWeight: '600' as const,
        letterSpacing: 0.3,
      },
      medium: {
        fontSize: 17,
        fontWeight: '700' as const,
        letterSpacing: 0.5,
      },
      large: {
        fontSize: 19,
        fontWeight: '700' as const,
        letterSpacing: 0.5,
      },
    },
  },
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.18,
      shadowRadius: 1.0,
      elevation: 1,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.30,
      shadowRadius: 4.65,
      elevation: 8,
    },
  },
  mentalHealth: {
    calm: '#7DD3FC',
    peace: '#A78BFA',
    hope: '#FB7185',
    comfort: '#FBBF24',
    strength: '#34D399',
  },
  gamification: {
    achievementColors: {
      prayer: '#667eea',
      community: '#764ba2',
      learning: '#f093fb',
      milestone: '#f5576c',
      streak: '#4facfe',
      social: '#43e97b',
    },
    streakColors: {
      fire: '#FF9500',
      ice: '#00D4FF',
      gold: '#FFD700',
    },
  },
};