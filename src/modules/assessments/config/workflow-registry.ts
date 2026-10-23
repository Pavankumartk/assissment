export const CREATOR_STEPS = ["Type","Details","Content","Evaluation","Review"] as const;
export const CREATOR_ROUTES = [
 "/assessments/create", "/assessments/create/details", "/assessments/create/content",
 "/assessments/create/evaluation", "/assessments/create/review"
] as const;
export type CreatorStep = typeof CREATOR_STEPS[number];
