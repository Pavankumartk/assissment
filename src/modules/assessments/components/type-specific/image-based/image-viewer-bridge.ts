import { imageDetails, imageQuestionValid, readImageDraft, type ImageQuestion, type ImageSubtype } from "./image-based-data";

/** Adapt the existing image-based creator draft to the four user-provided viewer pages.
 * The viewer pages and their Figma CSS remain unchanged; no demo question is substituted
 * when a real creator question is present.
 */
export function getImageViewerBridge(subtype: ImageSubtype): {
  title: string; durationSeconds: number; questions: Record<string, unknown>[];
} {
  const draft = readImageDraft();
  const meta = imageDetails();
  const questions = draft.questions.filter((q) => (q.subtype || "multiple-choice") === subtype && imageQuestionValid(q));
  const converted = questions.map((q: ImageQuestion): Record<string, unknown> => {
    switch (subtype) {
      case "image-matching": {
        const pairs = (q.matchPairs ?? []).map((pair, index) => ({
          id: `pair-${index}`, image: pair.image, right: pair.text, correct: pair.text,
          alt: `Picture ${index + 1}`,
        }));
        return {
          ...q, imagePairs: pairs,
          options: [...(q.matchPairs ?? []).map(p => p.text), ...(q.matchExtras ?? [])],
          hint: q.hint, bloom: q.bloom,
        };
      }
      case "image-sequencing": {
        const steps = q.sequenceSteps ?? [];
        return { ...q, steps, correctOrder: steps.map(s => s.id) };
      }
      case "image-sorting": {
        const groups = q.sortingGroups ?? ["Hardware", "Software"];
        return {
          ...q,
          categories: groups.map(group => ({ id: group, label: group })),
          sortItems: (q.sortingItems ?? []).map(item => ({
            ...item, category: item.group, correctCategory: item.group,
          })),
        };
      }
      default:
        return {
          ...q, imageUrl: q.image || q.galleryImages?.find(Boolean) || "",
          correctIndex: q.correct, marks: q.points,
        };
    }
  });
  // The current creator's Details step owns these metadata values.
  return { title: meta.title, durationSeconds: 30 * 60, questions: converted };
}

/** The supplied viewer's tool buttons must stay inside this assessment. */
export function imageViewerToolPath(tool: "scratch" | "calculator" | "formulasheet"): string {
  if (typeof window === "undefined") return `/${tool}`;
  const current = window.location.pathname.match(/\/assessments\/([^/]+)\/viewer(?:\/|$)/i);
  return current ? `/assessments/${encodeURIComponent(decodeURIComponent(current[1]))}/viewer/${tool}` : `/${tool}`;
}
