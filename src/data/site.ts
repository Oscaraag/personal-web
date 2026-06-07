/**
 * Central site identity + SEO defaults. The absolute domain lives in
 * astro.config.mjs (`site`); here we keep content/identity so it's reused by
 * the layout, JSON-LD and components. Keep links in sync with the design.
 */
export const site = {
  name: 'Oscar Angel Gonzalez',
  shortName: 'OAG',
  role: 'Head of Engineering',
  email: 'oscaraag1493@gmail.com',
  cv: '/Oscar_Angel_Gonzalez_CV.pdf',

  // SEO defaults
  title: 'Oscar Angel Gonzalez — Head of Engineering',
  description:
    'Oscar Angel Gonzalez · Head of Engineering · Sistemas distribuidos · React · TypeScript · Go',
  ogImage: '/og-image.png',
  defaultLang: 'es' as const,
  themeColor: '#07040f',

  socials: {
    github: 'https://github.com/Oscaraag',
    twitch: 'https://www.twitch.tv/annatar_eru',
    linkedin: 'https://www.linkedin.com/in/oangeldev/',
  },

  // Used by the JSON-LD Person schema
  knowsAbout: [
    'Distributed systems',
    'High concurrency',
    'React',
    'TypeScript',
    'Go',
    'Node.js',
    'Kubernetes',
    'AWS',
    'Engineering leadership',
  ],
} as const;

export type Site = typeof site;
