import React from 'react';
import { Text, View } from 'react-native';

/**
 * TextNodeValidator - A component that safely wraps any loose text nodes
 * This prevents "Unexpected text node" errors in React Native
 */

interface TextNodeValidatorProps {
  children: React.ReactNode;
  fallbackComponent?: React.ComponentType<any>;
}

export const TextNodeValidator: React.FC<TextNodeValidatorProps> = ({ 
  children, 
  fallbackComponent: FallbackComponent = View 
}) => {
  const validateAndWrapChildren = (children: React.ReactNode): React.ReactNode => {
    return React.Children.map(children, (child, index) => {
      // Handle string children (potential loose text nodes)
      if (typeof child === 'string') {
        // If it's just whitespace or a single period, hide it
        if (child.trim() === '' || child.trim() === '.') {
          return null;
        }
        // Wrap string in Text component
        return (
          <Text key={`text-${index}`} style={{ display: 'none' }}>
            {child}
          </Text>
        );
      }
      
      // Handle number children
      if (typeof child === 'number') {
        return (
          <Text key={`number-${index}`} style={{ display: 'none' }}>
            {child}
          </Text>
        );
      }
      
      // Handle React elements with children
      if (React.isValidElement(child)) {
        const props = child.props as any;
        if (props && props.children) {
          return React.cloneElement(child, {
            ...props,
            children: validateAndWrapChildren(props.children),
            key: child.key || `element-${index}`
          } as any);
        }
      }
      
      // Return other valid React nodes as-is
      return child;
    });
  };

  try {
    const validatedChildren = validateAndWrapChildren(children);
    return <>{validatedChildren}</>;
  } catch (error) {
    console.error('TextNodeValidator error:', error);
    // Return fallback component on error
    return <FallbackComponent />;
  }
};

/**
 * SafeText - A safe wrapper for Text components that handles undefined/null values
 */
interface SafeTextProps {
  children?: React.ReactNode;
  style?: any;
  [key: string]: any;
}

export const SafeText: React.FC<SafeTextProps> = ({ children, style, ...props }) => {
  // Handle undefined, null, or empty children
  if (children === undefined || children === null || children === '') {
    return null;
  }
  
  // Handle loose periods or whitespace
  if (typeof children === 'string' && (children.trim() === '.' || children.trim() === '')) {
    return null;
  }
  
  return (
    <Text style={style} {...props}>
      {children}
    </Text>
  );
};

/**
 * SafeView - A safe wrapper for View components that validates children
 */
interface SafeViewProps {
  children?: React.ReactNode;
  style?: any;
  [key: string]: any;
}

export const SafeView: React.FC<SafeViewProps> = ({ children, style, ...props }) => {
  return (
    <View style={style} {...props}>
      <TextNodeValidator>
        {children}
      </TextNodeValidator>
    </View>
  );
};

export default TextNodeValidator;