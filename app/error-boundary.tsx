import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

interface Props {
  children: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

const IFRAME_ID = 'rork-web-preview';

const webTargetOrigins = [
  "http://localhost:3000",
  "https://rorkai.com",
  "https://rork.app",
];    

function sendErrorToIframeParent(error: any, errorInfo?: any) {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    try {
      const errorMessage = {
        type: 'ERROR',
        error: {
          message: error?.message || error?.toString() || 'Unknown error',
          stack: error?.stack,
          componentStack: errorInfo?.componentStack,
          timestamp: new Date().toISOString(),
        },
        iframeId: IFRAME_ID,
      };

      window.parent.postMessage(
        errorMessage,
        webTargetOrigins.includes(document.referrer) ? document.referrer : '*'
      );
    } catch (postMessageError) {
      console.warn('Failed to send error to parent:', postMessageError);
    }
  }
}

if (Platform.OS === 'web' && typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    event.preventDefault();
    const errorDetails = event.error ?? {
      message: event.message ?? 'Unknown error',
      filename: event.filename ?? 'Unknown file',
      lineno: event.lineno ?? 'Unknown line',
      colno: event.colno ?? 'Unknown column'
    };
    sendErrorToIframeParent(errorDetails);
  }, true);

  window.addEventListener('unhandledrejection', (event) => {
    event.preventDefault();
    sendErrorToIframeParent(event.reason);
  }, true);
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const isProduction = typeof __DEV__ === 'undefined' || !__DEV__;
    
    // In production, handle errors silently and recover quickly
    if (isProduction) {
      try {
        console.warn('App recovering...');
      } catch {
        // Silent fallback
      }
      
      // Quick recovery
      setTimeout(() => {
        this.setState({ hasError: false, error: null });
      }, 300);
      
      return;
    }
    
    // Development error handling
    try {
      console.error('Error caught by ErrorBoundary:', error);
      sendErrorToIframeParent(error, errorInfo);
      if (this.props.onError) {
        this.props.onError(error, errorInfo);
      }
    } catch {
      // Silent fallback
    }
  }

  render() {
    if (this.state.hasError) {
      const isProduction = typeof __DEV__ === 'undefined' || !__DEV__;
      
      // In production, show minimal loading UI
      if (isProduction) {
        return (
          <View style={styles.container}>
            <View style={styles.content}>
              <Text style={styles.title}>Loading...</Text>
            </View>
          </View>
        );
      }
      
      // In development, show error details
      if (__DEV__) {
        return (
          <View style={styles.container}>
            <View style={styles.content}>
              <Text style={styles.title}>Something went wrong</Text>
              <Text style={styles.subtitle}>{this.state.error?.message}</Text>
              {Platform.OS !== 'web' && (
                <Text style={styles.description}>
                  Please check your device logs for more details.
                </Text>
              )}
            </View>
          </View>
        );
      }
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 36,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
}); 

export default ErrorBoundary;