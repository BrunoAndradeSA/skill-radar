import { create } from 'zustand';
import { FeatureFlags, defaultFeatureFlags } from '../feature-flags/FeatureFlags';

interface FeatureFlagState {
  flags: FeatureFlags;
  setFlag: (key: keyof FeatureFlags, value: boolean) => void;
  setFlags: (flags: Partial<FeatureFlags>) => void;
}

export const useFeatureFlagStore = create<FeatureFlagState>((set) => ({
  flags: defaultFeatureFlags,
  setFlag: (key, value) =>
    set((state) => ({
      flags: { ...state.flags, [key]: value },
    })),
  setFlags: (newFlags) =>
    set((state) => ({
      flags: { ...state.flags, ...newFlags },
    })),
}));

export const useFeatureFlag = (key: keyof FeatureFlags) => {
  return useFeatureFlagStore((state) => state.flags[key]);
};
