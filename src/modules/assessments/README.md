# Assessment-only feature module

- `components/common/steps`: **one** Type/Create, Details, Content, Evaluation, Review implementation; these are shared among types.
- `components/common/AssessmentForm.tsx`: centralized shared Creator route renderer.
- `components/common/header`, `sidebar`, `AssessmentDashboard`: shared UI.
- `components/viewer`: assessment-taking and results screens (common Viewer routes).
- `components/type-specific`: adapters and future **question widgets**, not copies of five Creator pages.
- `config`: visible assessment type list, component capabilities, field and workflow registries.
- `storage`: Local Storage only; all persisted records are keyed by unique assessment IDs.

The MCQ Creator/Viewer comes from the user-provided ZIP. Short Answer and One Word support can be integrated when their files are supplied. Don't enable them in `config/component-registry.ts` until their Creator and Viewer both work.
