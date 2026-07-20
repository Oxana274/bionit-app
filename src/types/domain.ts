export type UserRole = "employee" | "mentor" | "manager" | "hr" | "admin";
export type ProgressStatus = "not_started" | "in_progress" | "completed" | "overdue";
export type LearningStatus = "not_started" | "in_progress" | "passed" | "failed";
export type OrderStatus = "new" | "approved" | "assembling" | "ready" | "issued" | "cancelled";
export type BadgeKind = "first-step" | "gmp" | "team" | "mentor" | "anniversary" | "safety" | "streak" | "leader";

export interface ProfileSummary {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  position: string;
  departmentName: string;
  role: UserRole;
  avatarUrl: string | null;
  hiredAt: string;
  balance: number;
}

export interface DashboardData {
  profile: ProfileSummary;
  stats: {
    onboardingPercent: number;
    learningPercent: number;
    companyRank: number;
    badgeCount: number;
  };
  activeOnboarding: {
    assignmentId: string;
    title: string;
    currentStage: string;
    completedTasks: number;
    totalTasks: number;
    dueDate: string;
  } | null;
  recommendedClass: LearningClassSummary | null;
  latestBadge: BadgeSummary | null;
  weeklyEarned: number;
}

export interface OnboardingTask {
  id: string;
  title: string;
  description: string;
  points: number;
  dueDate: string | null;
  status: ProgressStatus;
  required: boolean;
  completedAt: string | null;
}

export interface OnboardingStage {
  id: string;
  title: string;
  description: string;
  sortOrder: number;
  status: ProgressStatus;
  tasks: OnboardingTask[];
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  summary: string;
  category: string;
  readMinutes: number;
  body?: string;
}

export interface OnboardingQuestion {
  id: string;
  question: string;
  answer: string | null;
  status: "new" | "answered" | "closed";
  createdAt: string;
  answeredAt: string | null;
}

export interface OnboardingData {
  assignmentId: string;
  title: string;
  mentorName: string;
  mentorPosition: string;
  startDate: string;
  dueDate: string;
  progressPercent: number;
  stages: OnboardingStage[];
  knowledge: KnowledgeArticle[];
  questions: OnboardingQuestion[];
}

export interface LearningClassSummary {
  id: string;
  title: string;
  description: string;
  category: string;
  durationMinutes: number;
  reward: number;
  passThreshold: number;
  maxAttempts: number;
  attemptsUsed: number;
  progressPercent: number;
  status: LearningStatus;
  modulesCount: number;
  coverKind: "quality" | "safety" | "product" | "leadership";
}

export interface LearningModule {
  id: string;
  title: string;
  sortOrder: number;
  durationMinutes: number;
  content: string;
  completed: boolean;
}

export interface LearningQuestion {
  id: string;
  prompt: string;
  sortOrder: number;
  options: Array<{ id: string; label: string }>;
}

export interface LearningClassDetail extends LearningClassSummary {
  longDescription: string;
  modules: LearningModule[];
  questions: LearningQuestion[];
  bestScore: number | null;
}

export interface LearningAttemptResult {
  attemptId: string;
  score: number;
  passed: boolean;
  attemptsUsed: number;
  attemptsLeft: number;
  rewardGranted: number;
}

export interface AchievementStory {
  id: string;
  year: number;
  title: string;
  description: string;
  accent: "red" | "dark" | "light";
  metric: string | null;
}

export interface BadgeSummary {
  id: string;
  code: string;
  title: string;
  description: string;
  kind: BadgeKind;
  reward: number;
  earnedAt: string | null;
  progressPercent: number;
  locked: boolean;
}

export interface EmployeeLeaderboardRow {
  rank: number;
  profileId: string;
  fullName: string;
  position: string;
  departmentName: string;
  score: number;
  avatarUrl: string | null;
  isCurrentUser: boolean;
}

export interface DepartmentLeaderboardRow {
  rank: number;
  departmentId: string;
  departmentName: string;
  score: number;
  membersCount: number;
}

export interface LeaderboardsData {
  employees: EmployeeLeaderboardRow[];
  departments: DepartmentLeaderboardRow[];
  periodLabel: string;
}

export interface ProductVariant {
  id: string;
  title: string;
  stock: number;
}

export interface ShopProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  kind: "polo" | "sweatshirt" | "thermos" | "tote" | "notebook" | "pins";
  variants: ProductVariant[];
  featured: boolean;
}

export interface ShopOrder {
  id: string;
  number: string;
  productTitle: string;
  variantTitle: string | null;
  quantity: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  employeeName?: string;
}

export interface ShopData {
  balance: number;
  products: ShopProduct[];
  recentOrders: ShopOrder[];
}

export interface AdminEmployeeRow {
  id: string;
  employeeNumber: string;
  fullName: string;
  departmentName: string;
  position: string;
  role: UserRole;
  status: "active" | "inactive" | "archived";
  authLinked: boolean;
}

export interface AdminDashboardData {
  metrics: {
    newOrders: number;
    activeEmployees: number;
    onboardingInProgress: number;
    learningPassRate: number;
  };
  orders: ShopOrder[];
  employees: AdminEmployeeRow[];
  departments: Array<{ id: string; name: string }>;
}
