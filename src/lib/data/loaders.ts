import "server-only";

import { notFound } from "next/navigation";
import { isDemoMode } from "@/lib/env";
import {
  demoAchievements,
  demoBadges,
  demoCourses,
  getDemoAdminDashboard,
  getDemoDashboard,
  getDemoLeaderboards,
  getDemoLearningClass,
  getDemoOnboarding,
  getDemoProfile,
  getDemoShop
} from "@/lib/data/demo";
import { supabaseRpc } from "@/lib/supabase/rest";
import { getDemoProfileIdFromToken } from "@/lib/supabase/server";
import type {
  AchievementStory,
  AdminDashboardData,
  BadgeSummary,
  DashboardData,
  LeaderboardsData,
  LearningClassDetail,
  LearningClassSummary,
  OnboardingData,
  ProfileSummary,
  ShopData
} from "@/types/domain";

export async function loadCurrentProfile(accessToken: string): Promise<ProfileSummary> {
  if (isDemoMode) return getDemoProfile(getDemoProfileIdFromToken(accessToken));
  return supabaseRpc<ProfileSummary>("get_profile_summary", accessToken);
}

export async function assertAdmin(accessToken: string): Promise<ProfileSummary> {
  const profile = await loadCurrentProfile(accessToken);
  if (!["hr", "admin"].includes(profile.role)) throw new Error("Недостаточно прав.");
  return profile;
}

export async function loadDashboard(accessToken: string): Promise<DashboardData> {
  if (isDemoMode) return getDemoDashboard(getDemoProfileIdFromToken(accessToken));
  return supabaseRpc<DashboardData>("get_dashboard", accessToken);
}

export async function loadOnboarding(accessToken: string): Promise<OnboardingData> {
  if (isDemoMode) return getDemoOnboarding();
  return supabaseRpc<OnboardingData>("get_onboarding", accessToken);
}

export async function loadLearningCatalog(accessToken: string): Promise<LearningClassSummary[]> {
  if (isDemoMode) return demoCourses;
  return supabaseRpc<LearningClassSummary[]>("get_learning_catalog", accessToken);
}
