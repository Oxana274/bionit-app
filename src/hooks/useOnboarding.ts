'use client';

import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

export type OnboardingStage = {
  id: string;
  name: string;
  description: string | null;
  sortOrder: number;
  durationDays: number;
  icon: string | null;
  isActive: boolean;
};

export type OnboardingProgress = {
  id: string;
  userId: string;
  stageId: string;
  isCompleted: boolean;
  completedAt: string | null;
  mentorId: string | null;
};

export type OnboardingTask = {
  id: string;
  stageId: string;
  name: string;
  description: string | null;
  sortOrder: number;
  isRequired: boolean;
};

export type KnowledgeArticle = {
  id: string;
  title: string;
  content: string;
  category: string | null;
  sortOrder: number;
};

export type FaqQuestion = {
  id: string;
  userId: string;
  question: string;
  answer: string | null;
  answeredBy: string | null;
  status: 'pending' | 'answered' | 'closed';
  createdAt: string;
  answeredAt: string | null;
};

export const onboardingQueryKeys = {
  stages: () => ['onboarding', 'stages'] as const,
  progress: (userId: string) => ['onboarding', 'progress', userId] as const,
  tasks: (stageId: string) => ['onboarding', 'tasks', stageId] as const,
  taskCompletions: (userId: string) => ['onboarding', 'task-completions', userId] as const,
  articles: () => ['onboarding', 'articles'] as const,
  faq: (userId: string) => ['onboarding', 'faq', userId] as const,
};

export function useOnboardingStages() {
  const supabase = useMemo(() => createClient(), []);
  return useQuery<OnboardingStage[], Error>({
    queryKey: onboardingQueryKeys.stages(),
    staleTime: 300_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('onboarding_stages')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      if (error) throw new Error('Не удалось загрузить этапы');
      return data as OnboardingStage[];
    },
  });
}

export function useOnboardingProgress(userId: string) {
  const supabase = useMemo(() => createClient(), []);
  return useQuery<OnboardingProgress[], Error>({
    queryKey: onboardingQueryKeys.progress(userId),
    enabled: Boolean(userId),
    staleTime: 30_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('onboarding_progress')
        .select('*')
        .eq('user_id', userId);
      if (error) throw new Error('Не удалось загрузить прогресс');
      return data as OnboardingProgress[];
    },
  });
}

export function useOnboardingTasks(stageId: string) {
  const supabase = useMemo(() => createClient(), []);
  return useQuery<OnboardingTask[], Error>({
    queryKey: onboardingQueryKeys.tasks(stageId),
    enabled: Boolean(stageId),
    staleTime: 300_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('onboarding_tasks')
        .select('*')
        .eq('stage_id', stageId)
        .order('sort_order', { ascending: true });
      if (error) throw new Error('Не удалось загрузить задания');
      return (data ?? []) as OnboardingTask[];
    },
  });
}

export function useTaskCompletions(userId: string) {
  const supabase = useMemo(() => createClient(), []);
  return useQuery<{ taskId: string; completedAt: string }[], Error>({
    queryKey: onboardingQueryKeys.taskCompletions(userId),
    enabled: Boolean(userId),
    staleTime: 30_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('onboarding_task_completions')
        .select('task_id, completed_at')
        .eq('user_id', userId);
      if (error) throw new Error('Не удалось загрузить выполнения заданий');
      return (data ?? []).map((row: { task_id: string; completed_at: string }) => ({
        taskId: row.task_id,
        completedAt: row.completed_at,
      }));
    },
  });
}

export function useCompleteTask(userId: string) {
  const supabase = useMemo(() => createClient(), []);
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationKey: ['onboarding', 'complete-task'],
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from('onboarding_task_completions')
        .insert({ user_id: userId, task_id: taskId });
      if (error) throw new Error('Не удалось отметить задание');
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: onboardingQueryKeys.taskCompletions(userId) });
    },
  });
}

export function useKnowledgeArticles() {
  const supabase = useMemo(() => createClient(), []);
  return useQuery<KnowledgeArticle[], Error>({
    queryKey: onboardingQueryKeys.articles(),
    staleTime: 300_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('knowledge_articles')
        .select('*')
        .eq('is_published', true)
        .order('sort_order', { ascending: true });
      if (error) throw new Error('Не удалось загрузить статьи');
      return data as KnowledgeArticle[];
    },
  });
}

export function useFaqQuestions(userId: string) {
  const supabase = useMemo(() => createClient(), []);
  return useQuery<FaqQuestion[], Error>({
    queryKey: onboardingQueryKeys.faq(userId),
    enabled: Boolean(userId),
    staleTime: 30_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('faq_questions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw new Error('Не удалось загрузить вопросы');
      return data as FaqQuestion[];
    },
  });
}

export function useAskQuestion(userId: string) {
  const supabase = useMemo(() => createClient(), []);
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationKey: ['onboarding', 'ask-question'],
    mutationFn: async (question: string) => {
      const { error } = await supabase
        .from('faq_questions')
        .insert({ user_id: userId, question: question.trim() });
      if (error) throw new Error('Не удалось задать вопрос');
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: onboardingQueryKeys.faq(userId) });
    },
  });
}
