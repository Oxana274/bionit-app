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

export async function loadLearningClass(accessToken: string, classId: string): Promise<LearningClassDetail> {
  if (isDemoMode) return getDemoLearningClass(classId);
  const value = await supabaseRpc<LearningClassDetail | null>("get_learning_class", accessToken, { p_class_id: classId });
  if (!value) notFound();
  return value;
}

export async function loadAchievements(accessToken: string): Promise<AchievementStory[]> {
  if (isDemoMode) return demoAchievements;
  return supabaseRpc<AchievementStory[]>("get_achievement_stories", accessToken);
}

export async function loadLeaderboards(accessToken: string): Promise<LeaderboardsData> {
  if (isDemoMode) return getDemoLeaderboards(getDemoProfileIdFromToken(accessToken));
  return supabaseRpc<LeaderboardsData>("get_leaderboards", accessToken);
}

export async function loadBadges(accessToken: string): Promise<BadgeSummary[]> {
  if (isDemoMode) return demoBadges;
  return supabaseRpc<BadgeSummary[]>("get_badges", accessToken);
}

export async function loadShop(accessToken: string): Promise<ShopData> {
  if (isDemoMode) return getDemoShop(getDemoProfileIdFromToken(accessToken));
  return supabaseRpc<ShopData>("get_shop", accessToken);
}

export async function loadAdminDashboard(accessToken: string): Promise<AdminDashboardData> {
  await assertAdmin(accessToken);
  if (isDemoMode) return getDemoAdminDashboard();
  return supabaseRpc<AdminDashboardData>("get_admin_dashboard", accessToken);
}
