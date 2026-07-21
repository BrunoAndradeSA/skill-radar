import { FeatureFlags } from './FeatureFlags';
import { useFeatureFlagStore } from '../store/useFeatureFlagStore';

const ALWAYS_ENABLED: Set<keyof FeatureFlags> = new Set([
  'enableAuthentication',
  'enableAutoTermination',
]);

export class FeatureFlagService {
  static getFlag(key: keyof FeatureFlags): boolean {
    if (ALWAYS_ENABLED.has(key)) return true;
    return useFeatureFlagStore.getState().flags[key];
  }

  static setFlag(key: keyof FeatureFlags, value: boolean): void {
    if (ALWAYS_ENABLED.has(key)) return;
    useFeatureFlagStore.getState().setFlag(key, value);
  }

  static getAllFlags(): FeatureFlags {
    return useFeatureFlagStore.getState().flags;
  }
}
