/**
 * Onboard instruments (Stack section). `icon` holds the inner SVG markup; the
 * component wraps it in a shared <svg viewBox="0 0 24 24" …>. `delay` maps to the
 * reveal stagger class (''/d1/d2). Translatable chips/titles use es/en.
 */
import type { Bilingual } from './experience';

export interface StackCard {
  title: Bilingual;
  icon: string;
  chips: Bilingual[];
  delay: '' | 'd1' | 'd2';
}

const chip = (es: string, en = es): Bilingual => ({ es, en });

export const stack: StackCard[] = [
  {
    title: { es: 'Lenguajes', en: 'Languages' },
    delay: '',
    icon: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
    chips: [chip('JavaScript'), chip('TypeScript'), chip('Go'), chip('HTML'), chip('CSS')],
  },
  {
    title: { es: 'Frontend', en: 'Frontend' },
    delay: 'd1',
    icon: '<rect x="2" y="4" width="20" height="14" rx="2"/><path d="M8 21h8M12 18v3"/>',
    chips: [
      chip('React.js'),
      chip('Next.js'),
      chip('Astro'),
      chip('Vite'),
      chip('Redux'),
      chip('Zustand'),
      chip('styled-components'),
      chip('SASS'),
    ],
  },
  {
    title: { es: 'Backend & APIs', en: 'Backend & APIs' },
    delay: 'd2',
    icon: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v6c0 1.7 4 3 9 3s9-1.3 9-3V5M3 11v6c0 1.7 4 3 9 3s9-1.3 9-3v-6"/>',
    chips: [chip('Node.js'), chip('Go'), chip('PostgreSQL'), chip('MongoDB')],
  },
  {
    title: { es: 'Cloud & DevOps', en: 'Cloud & DevOps' },
    delay: '',
    icon: '<path d="M17.5 19a4.5 4.5 0 0 0 .9-8.9A6 6 0 0 0 6.7 9 4.5 4.5 0 0 0 6 18h11.5z"/>',
    chips: [chip('AWS'), chip('Docker'), chip('Kubernetes')],
  },
  {
    title: { es: 'Arquitectura', en: 'Architecture' },
    delay: 'd1',
    icon: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>',
    chips: [
      chip('Distribuidas', 'Distributed'),
      chip('Microservicios', 'Microservices'),
      chip('Alta concurrencia', 'High concurrency'),
      chip('Performance'),
    ],
  },
  {
    title: { es: 'Procesos & Liderazgo', en: 'Process & Leadership' },
    delay: 'd2',
    icon: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
    chips: [
      chip('Ágil / Scrum'),
      chip('TDD'),
      chip('Code Review'),
      chip('Mentoría', 'Mentoring'),
      chip('Liderazgo técnico', 'Tech leadership'),
    ],
  },
];
