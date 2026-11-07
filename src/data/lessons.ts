export const lessonTitles = {
    linearRegression: 'Linear Regression',
    logisticRegression: 'Logistic Regression',
    svm: 'Support Vector Machine',
    decisionTree: 'Decision Tree',
};

export type LessonId = keyof typeof lessonTitles;
export const lessonIds = Object.keys(lessonTitles) as LessonId[];

export function isLessonId(value: unknown): value is LessonId {
    return typeof value === 'string' && Object.prototype.hasOwnProperty.call(lessonTitles, value);
}
