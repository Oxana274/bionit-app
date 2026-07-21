import Link from "next/link";
import { Button, Progress } from "antd";
import { BadgeArtwork, BionicCoin, CourseArtwork } from "@/components/Brand";
import { Icon } from "@/components/Icon";
import { formatDate } from "@/lib/utils/format";
import type { DashboardData } from "@/types/domain";

export function HomeView({ data }: { data: DashboardData }) {
  const firstName = data.profile.firstName;
  return <div className="home-page">
    <section className="home-hero">
      <div className="home-hero-copy"><span className="eyebrow light">Сегодня в деле</span><h1>Здравствуйте,<br/>{firstName}</h1><p>Работайте, учитесь, получайте признание и меняйте Бионики на мерч.</p><div className="hero-actions"><Link href="/onboarding"><Button type="primary" size="large">Продолжить онбординг</Button></Link><Link href="/learning" className="text-link">Все классы <Icon name="arrow-right" size={18}/></Link></div></div>
      <div className="hero-balance"><span>Ваш баланс</span><BionicCoin value={data.profile.balance}/><small>+{data.weeklyEarned} за эту неделю</small></div>
      <div className="hero-pattern"/>
    </section>

    <section className="metrics-grid">
      <article className="metric-card"><span className="metric-icon"><Icon name="onboarding"/></span><div><strong>{data.stats.onboardingPercent}%</strong><span>Онбординг</span></div><Progress percent={data.stats.onboardingPercent} showInfo={false}/></article>
      <article className="metric-card"><span className="metric-icon"><Icon name="learning"/></span><div><strong>{data.stats.learningPercent}%</strong><span>Обучение</span></div><Progress percent={data.stats.learningPercent} showInfo={false}/></article>
      <article className="metric-card"><span className="metric-icon"><Icon name="rating"/></span><div><strong>№ {data.stats.companyRank}</strong><span>В рейтинге</span></div><Link href="/rating">Посмотреть</Link></article>
      <article className="metric-card"><span className="metric-icon"><Icon name="badges"/></span><div><strong>{data.stats.badgeCount}</strong><span>Бейджей</span></div><Link href="/badges">Коллекция</Link></article>
    </section>

    <section className="home-grid">
      <div className="home-column">
        <div className="section-title"><div><span className="eyebrow">Адаптация</span><h2>Ваш маршрут</h2></div><Link href="/onboarding">Открыть <Icon name="arrow-right" size={17}/></Link></div>
        {data.activeOnboarding ? <article className="onboarding-preview">
          <div className="preview-top"><span className="icon-box"><Icon name="onboarding"/></span><div><strong>{data.activeOnboarding.title}</strong><span>Этап: {data.activeOnboarding.currentStage}</span></div></div>
          <div className="preview-progress"><span>{data.activeOnboarding.completedTasks} из {data.activeOnboarding.totalTasks} заданий</span><strong>{data.stats.onboardingPercent}%</strong></div>
          <Progress percent={data.stats.onboardingPercent} showInfo={false}/><small><Icon name="calendar" size={16}/> Завершить до {formatDate(data.activeOnboarding.dueDate)}</small>
        </article> : <article className="empty-card"><Icon name="success"/><h3>Онбординг завершён</h3><p>Все обязательные этапы пройдены.</p></article>}
      </div>

      <div className="home-column">
        <div className="section-title"><div><span className="eyebrow">Развитие</span><h2>Рекомендуем</h2></div><Link href="/learning">Все классы <Icon name="arrow-right" size={17}/></Link></div>
        {data.recommendedClass ? <Link href={`/learning/${data.recommendedClass.id}`} className="course-preview"><CourseArtwork course={data.recommendedClass}/><div className="course-preview-body"><span>{data.recommendedClass.category}</span><h3>{data.recommendedClass.title}</h3><p>{data.recommendedClass.description}</p><div><small><Icon name="clock" size={16}/>{data.recommendedClass.durationMinutes} мин</small><small><Icon name="coin" size={16}/>{data.recommendedClass.reward}</small></div></div></Link> : null}
      </div>
    </section>

    {data.latestBadge ? <section className="latest-badge"><div className="latest-badge-art"><BadgeArtwork kind={data.latestBadge.kind}/></div><div><span className="eyebrow">Новое достижение</span><h2>{data.latestBadge.title}</h2><p>{data.latestBadge.description}</p></div><Link href="/badges"><Button>Все бейджи</Button></Link></section> : null}
  </div>;
}
