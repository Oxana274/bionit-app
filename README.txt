Бионит В Деле — исправление demo.ts

1. Замените файл в репозитории:
   src/lib/data/demo.ts

2. Сделайте commit и push в main.

3. В Vercel запустится новый deploy.

Исправлено:
- экспорты getDemoProfile/getDemoDashboard/getDemoLearningClass/getDemoLeaderboards/getDemoShop/getDemoAdminDashboard;
- экспорты demoCourses и demoAchievements;
- submitDemoLearningAttempt;
- типы под текущий src/types/domain.ts;
- сохранён индивидуальный онбординг менеджера по продажам.
