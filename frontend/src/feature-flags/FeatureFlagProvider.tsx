import React, { useEffect } from 'react';
import { useFeatureFlagStore } from '../store/useFeatureFlagStore';

export const FeatureFlagProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const setFlags = useFeatureFlagStore((state) => state.setFlags);

  useEffect(() => {
    const storedFlags = localStorage.getItem('feature_flags');
    const parsed = storedFlags ? (() => { try { return JSON.parse(storedFlags); } catch { return {}; } })() : {};
    if (Object.keys(parsed).length > 0) {
      setFlags(parsed);
    }
  }, [setFlags]);

  // Optionally, sync to local storage on change
  const flags = useFeatureFlagStore((state) => state.flags);
  useEffect(() => {
    localStorage.setItem('feature_flags', JSON.stringify(flags));
  }, [flags]);

  return <>{children}</>;
};
