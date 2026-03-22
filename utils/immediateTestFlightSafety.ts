/**
 * Ultra-minimal TestFlight safety
 */

// Simple production check
const isProduction = typeof __DEV__ === 'undefined' || !__DEV__;

// Minimal production setup
if (isProduction && typeof console !== 'undefined') {
  console.log('🚀 Production mode');
}

export const immediateTestFlightSafety = {
  isProduction,
  activated: isProduction,
};

export default immediateTestFlightSafety;