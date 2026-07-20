export function demoLearningDetail(classId: string): LearningClassDetail {
  const card = demoLearningCatalog.find((item) => item.id === classId);
  const source = detailContent[classId];
  if (!card || !source) throw new Error(`Класс ${classId} не найден`);
  return {
    ...card,
    longDescription: source.long,
    bestScore: card.status === 'passed' ? 100 : null,
    modules: source.modules.map((content, index) => ({
      id: `${classId}-module-${index + 1}`,
      title: ['Ключевые принципы', 'Практика на площадке', 'Проверка и следующий шаг'][index] ?? `Модуль ${index + 1}`,
      sortOrder: index + 1,
      durationMinutes: Math.max(8, Math.round(card.durationMinutes / source.modules.length)),
      content,
      completed: index < Math.round(card.modulesCount * card.progressPercent / 100)
    })),
    questions: source.questions.map((question, questionIndex) => ({
      id: `${classId}-question-${questionIndex + 1}`,
      prompt: question.prompt,
      sortOrder: questionIndex + 1,
      options: question.options.map((label, optionIndex) => ({
        id: `${classId}-question-${questionIndex + 1}-option-${optionIndex + 1}`,
        label
      }))
    }))
  };
}
