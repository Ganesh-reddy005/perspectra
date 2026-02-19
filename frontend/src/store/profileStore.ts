import { create } from 'zustand';

interface Profile {
  user_id: string;
  onboarding_complete: boolean;
  experience_level: string;
  preferred_style: string;
  skills: Record<string, number>;
  gaps: string[];
  strengths: string[];
  mistake_patterns: string[];
  recent_hints: string[];
  submissions_count: number;
  insights: any;
}

interface ProfileState {
  profile: Profile | null;
  loading: boolean;
  setProfile: (profile: Profile) => void;
  clearProfile: () => void;
  setLoading: (loading: boolean) => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  loading: false,

  setProfile: (profile: Profile) => set({ profile, loading: false }),
  clearProfile: () => set({ profile: null }),
  setLoading: (loading: boolean) => set({ loading }),
}));
