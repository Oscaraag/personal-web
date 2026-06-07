/**
 * Mission-log timeline (Experience section). Each field carries `es`/`en` token
 * strings; when both are equal the value is simply not translated (rendered
 * static). The first entry is the current role. Content mirrors the CV.
 */
export interface Bilingual {
  es: string;
  en: string;
}

export interface ExperienceItem {
  role: Bilingual;
  date: Bilingual;
  org: Bilingual;
  badge?: Bilingual;
  current?: boolean;
  bullets: Bilingual[];
}

export const experience: ExperienceItem[] = [
  {
    role: { es: 'Head of Engineering', en: 'Head of Engineering' },
    date: { es: 'may 2025 — presente', en: 'May 2025 — present' },
    org: {
      es: 'ZeroQ · Santiago, Chile (Remoto)',
      en: 'ZeroQ · Santiago, Chile (Remote)',
    },
    badge: { es: 'Actual', en: 'Current' },
    current: true,
    bullets: [
      {
        es: 'Responsable del día a día del departamento de ingeniería, apoyando directamente al CTO en la operación del área.',
        en: 'Own the day-to-day of the engineering department, directly supporting the CTO in running the area.',
      },
      {
        es: 'Aseguro plazos y entregas, desbloqueo impedimentos técnicos y gestiono incidentes en producción.',
        en: 'Safeguard deadlines and delivery, unblock technical impediments and manage production incidents.',
      },
      {
        es: 'Defino estándares técnicos y acompaño el crecimiento del equipo.',
        en: "Set technical standards and support the team's growth.",
      },
    ],
  },
  {
    role: { es: 'Tech Lead', en: 'Tech Lead' },
    date: { es: 'feb 2024 — may 2025', en: 'Feb 2024 — May 2025' },
    org: {
      es: 'ZeroQ · Santiago, Chile (Remoto)',
      en: 'ZeroQ · Santiago, Chile (Remote)',
    },
    bullets: [
      {
        es: 'Lideré un equipo de 5 a 10 personas, definiendo la arquitectura y guiando las decisiones técnicas.',
        en: 'Led a team of 5–10, defining architecture and guiding technical decisions.',
      },
      {
        es: 'Llevé Go al backend y orquesté servicios con Docker y Kubernetes sobre AWS.',
        en: 'Brought Go to the backend and orchestrated services with Docker and Kubernetes on AWS.',
      },
    ],
  },
  {
    role: { es: 'Frontend Lead Developer', en: 'Frontend Lead Developer' },
    date: { es: 'dic 2021 — feb 2024', en: 'Dec 2021 — Feb 2024' },
    org: {
      es: 'ZeroQ · Santiago, Chile (Remoto)',
      en: 'ZeroQ · Santiago, Chile (Remote)',
    },
    bullets: [
      {
        es: 'Lideré el equipo de frontend y definí la arquitectura de componentes con React y TypeScript.',
        en: 'Led the frontend team and defined component architecture with React and TypeScript.',
      },
      {
        es: 'Mentoría y code review para asegurar calidad y consistencia.',
        en: 'Mentoring and code review to ensure quality and consistency.',
      },
    ],
  },
  {
    role: { es: 'Front-End Developer', en: 'Front-End Developer' },
    date: { es: 'feb 2021 — dic 2021', en: 'Feb 2021 — Dec 2021' },
    org: {
      es: 'ZeroQ · Santiago, Chile (Remoto)',
      en: 'ZeroQ · Santiago, Chile (Remote)',
    },
    bullets: [
      {
        es: 'Desarrollo de interfaces con React, Redux y TypeScript, aplicando TDD y metodologías ágiles.',
        en: 'Built interfaces with React, Redux and TypeScript, applying TDD and agile methodologies.',
      },
    ],
  },
  {
    role: { es: 'Desarrollador Front-End', en: 'Front-End Developer' },
    date: { es: 'abr 2020 — feb 2021', en: 'Apr 2020 — Feb 2021' },
    org: { es: 'Freelance · Venezuela', en: 'Freelance · Venezuela' },
    bullets: [
      {
        es: 'Sitios y aplicaciones web para distintos clientes con JavaScript y React.',
        en: 'Websites and web apps for various clients with JavaScript and React.',
      },
    ],
  },
];
