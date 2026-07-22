import "server-only";

import { notFound } from "next/navigation";

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
  getDemoShop,
  getDemoSurvey,
  getDemoSurveyAdminControl,
  getDemoSurveyResults,
  getDemoSurveys
} from "@/lib/data/demo";
import { isDemoMode } from "@/lib/env";
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
  ShopData,
  SurveyAdminControl,
  SurveyDetail,
  SurveyFilterState,
  SurveyResultsData,
  SurveySummary
} from "@/types/domain";

export async function loadCurrentProfile(
  accessToken: string
): Promise<ProfileSummary> {
  if (isDemoMode) {
    return getDemoProfile(getDemoProfileIdFromToken(accessToken));
  }

  return supabaseRpc<ProfileSummary>("get_profile_summary", accessToken);
}

export async function assertAdmin(
  accessToken: string
): Promise<ProfileSummary> {
  const profile = await loadCurrentProfile(accessToken);
  if (!["hr", "admin"].includes(profile.role)) {
    throw new Error("Недостаточно прав.");
  }
  return profile;
}

export async function assertSurveyAdmin(
  accessToken: string
): Promise<ProfileSummary> {
  const profile = await loadCurrentProfile(accessToken);
  if (profile.role !== "admin") {
    throw new Error("Аналитика опросов доступна только администратору.");
  }
  return profile;
}

export async function loadDashboard(
  accessToken: string
): Promise<DashboardData> {
  if (isDemoMode) {
    return getDemoDashboard(getDemoProfileIdFromToken(accessToken));
  }

  return supabaseRpc<DashboardData>("get_dashboard", accessToken);
}

export async function loadOnboarding(
  accessToken: string
): Promise<OnboardingData> {
  if (isDemoMode) return getDemoOnboarding();
  return supabaseRpc<OnboardingData>("get_onboarding", accessToken);
}

export async function loadLearningCatalog(
  accessToken: string
): Promise<LearningClassSummary[]> {
  if (isDemoMode) return demoCourses;
  return supabaseRpc<LearningClassSummary[]>("get_learning_catalog", accessToken);
}

export async function loadLearningClass(
  accessToken: string,
  classId: string
): Promise<LearningClassDetail> {
  if (isDemoMode) return getDemoLearningClass(classId);

  const value = await supabaseRpc<LearningClassDetail | null>(
    "get_learning_class",
    accessToken,
    { p_class_id: classId }
  );
  if (!value) notFound();
  return value;
}

export async function loadAchievements(
  accessToken: string
): Promise<AchievementStory[]> {
  if (isDemoMode) return demoAchievements;
  return supabaseRpc<AchievementStory[]>("get_achievement_stories", accessToken);
}

export async function loadLeaderboards(
  accessToken: string
): Promise<LeaderboardsData> {
  if (isDemoMode) {
    return getDemoLeaderboards(getDemoProfileIdFromToken(accessToken));
  }
  return supabaseRpc<LeaderboardsData>("get_leaderboards", accessToken);
}

export async function loadBadges(
  accessToken: string
): Promise<BadgeSummary[]> {
  if (isDemoMode) return demoBadges;
  return supabaseRpc<BadgeSummary[]>("get_badges", accessToken);
}

export async function loadShop(accessToken: string): Promise<ShopData> {
  if (isDemoMode) {
    return getDemoShop(getDemoProfileIdFromToken(accessToken));
  }
  return supabaseRpc<ShopData>("get_shop", accessToken);
}

export async function loadAdminDashboard(
  accessToken: string
): Promise<AdminDashboardData> {
  await assertAdmin(accessToken);
  if (isDemoMode) return getDemoAdminDashboard();
  return supabaseRpc<AdminDashboardData>("get_admin_dashboard", accessToken);
}

export async function loadSurveys(
  accessToken: string
): Promise<SurveySummary[]> {
  if (isDemoMode) {
    return getDemoSurveys(getDemoProfileIdFromToken(accessToken));
  }

  return supabaseRpc<SurveySummary[]>("get_surveys", accessToken);
}

export async function loadSurvey(
  accessToken: string,
  surveyId: string
): Promise<SurveyDetail> {
  if (isDemoMode) {
    const survey = getDemoSurvey(
      getDemoProfileIdFromToken(accessToken),
      surveyId
    );
    if (!survey) notFound();
    return survey;
  }

  const survey = await supabaseRpc<SurveyDetail | null>(
    "get_survey",
    accessToken,
    { p_survey_id: surveyId }
  );
  if (!survey) notFound();
  return survey;
}

export async function loadSurveyResults(
  accessToken: string,
  surveyId: string,
  filters: SurveyFilterState
): Promise<SurveyResultsData> {
  await assertSurveyAdmin(accessToken);

  if (isDemoMode) {
    const results = getDemoSurveyResults(surveyId, filters);
    if (!results) notFound();
    return results;
  }

  const results = await supabaseRpc<SurveyResultsData | null>(
    "get_survey_results",
    accessToken,
    {
      p_survey_id: surveyId,
      p_department: filters.department,
      p_employee_category: filters.employeeCategory,
      p_production_tenure: filters.productionTenure
    }
  );
  if (!results) notFound();
  return results;
}

export async function loadSurveyAdminControl(
  accessToken: string
): Promise<SurveyAdminControl> {
  await assertSurveyAdmin(accessToken);
  if (isDemoMode) return getDemoSurveyAdminControl();
  return supabaseRpc<SurveyAdminControl>(
    "get_admin_survey_control",
    accessToken
  );
}
