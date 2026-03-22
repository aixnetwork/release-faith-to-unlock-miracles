# Beta Testing & Runtime Error Fixes

## Completed Fixes

- [x] Fix toolkit-sdk inspector module resolution error (metro.config.js now maps shims)
- [x] Fix SuperwallProvider calling setState during render (moved to useEffect)
- [x] Fix prayers screen not loading for individual users without an organization
- [x] Fix hook ordering issue with handleAddPrayer in prayers.tsx
- [x] Remove unused import (Stack) from prayers.tsx
- [x] Add proper useCallback/dependency arrays across prayers screen