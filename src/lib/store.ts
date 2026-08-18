import { useCallback, useEffect, useState } from "react";

export function useLocalState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) setValue(JSON.parse(raw) as T);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore */
    }
  }, [key, value, hydrated]);

  const reset = useCallback(() => setValue(initial), [initial]);
  return { value, setValue, hydrated, reset } as const;
}

export type StudentProfile = {
  fullName: string;
  idNumber: string;
  email: string;
  phone: string;
  level: string;
  institution: string;
  institutionType: string;
  fieldOfStudy: string;
  province: string;
  average: string;
  householdIncome: string;
  financialNeed: string;
  documents: string[];
};

export const emptyProfile: StudentProfile = {
  fullName: "",
  idNumber: "",
  email: "",
  phone: "",
  level: "University",
  institution: "",
  institutionType: "Public University",
  fieldOfStudy: "",
  province: "Gauteng",
  average: "",
  householdIncome: "",
  financialNeed: "High",
  documents: [],
};

export const REQUIRED_DOCS = [
  "Certified ID copy",
  "Latest academic transcript",
  "Proof of income",
  "Proof of registration",
  "Motivational letter",
  "Reference letter",
];

export function profileCompletion(p: StudentProfile) {
  const fields: (keyof StudentProfile)[] = [
    "fullName",
    "idNumber",
    "email",
    "phone",
    "institution",
    "fieldOfStudy",
    "province",
    "average",
    "householdIncome",
  ];
  const filled = fields.filter((f) => String(p[f] ?? "").trim().length > 0).length;
  const docScore = Math.min(p.documents.length / REQUIRED_DOCS.length, 1);
  return Math.round(((filled / fields.length) * 0.75 + docScore * 0.25) * 100);
}

export type Bursary = {
  id: string;
  name: string;
  sponsor: string;
  fields: string[];
  amount: string;
  closing: string;
  requirements: string[];
  benefits: string[];
  minAverage: number;
  needBased: boolean;
  levels: string[];
};

export const BURSARIES: Bursary[] = [
  {
    id: "nsfas",
    name: "NSFAS Bursary",
    sponsor: "National Student Financial Aid Scheme",
    fields: ["Any"],
    amount: "Full cost of study",
    closing: "2027-01-31",
    requirements: ["South African citizen", "Household income < R350 000", "Accepted at public institution"],
    benefits: ["Tuition", "Accommodation", "Learning materials", "Living allowance"],
    minAverage: 50,
    needBased: true,
    levels: ["High School", "University", "TVET"],
  },
  {
    id: "sasol",
    name: "Sasol Bursary",
    sponsor: "Sasol Limited",
    fields: ["Engineering", "Science", "Geology", "Chemistry"],
    amount: "Full cost + laptop",
    closing: "2026-09-30",
    requirements: ["Minimum 70% in Maths & Physical Science", "STEM degree", "SA citizen"],
    benefits: ["Tuition", "Vacation work", "Mentorship", "Job placement"],
    minAverage: 70,
    needBased: false,
    levels: ["High School", "University"],
  },
  {
    id: "investec",
    name: "Investec Bursary",
    sponsor: "Investec Bank",
    fields: ["Commerce", "Accounting", "Finance", "Actuarial Science"],
    amount: "Up to R180 000 p/a",
    closing: "2026-10-15",
    requirements: ["Strong academic record", "Financial need", "Leadership potential"],
    benefits: ["Tuition", "Mentorship", "Internships", "Laptop"],
    minAverage: 65,
    needBased: true,
    levels: ["University", "Postgraduate"],
  },
  {
    id: "funza",
    name: "Funza Lushaka Bursary",
    sponsor: "Department of Basic Education",
    fields: ["Education", "Teaching"],
    amount: "Full cost of study",
    closing: "2027-01-15",
    requirements: ["Teaching degree", "Priority subject specialisation", "Commit to teach in public school"],
    benefits: ["Tuition", "Accommodation", "Guaranteed placement"],
    minAverage: 60,
    needBased: true,
    levels: ["University", "Postgraduate"],
  },
  {
    id: "mtn",
    name: "MTN Foundation Scholarship",
    sponsor: "MTN Foundation",
    fields: ["ICT", "Computer Science", "Engineering", "Data Science"],
    amount: "Up to R150 000 p/a",
    closing: "2026-11-20",
    requirements: ["ICT-related field", "Financial need", "65% average"],
    benefits: ["Tuition", "Devices & data", "Skills programme"],
    minAverage: 65,
    needBased: true,
    levels: ["University", "TVET"],
  },
  {
    id: "vodacom",
    name: "Vodacom Foundation Bursary",
    sponsor: "Vodacom Foundation",
    fields: ["ICT", "Engineering", "Computer Science", "Business"],
    amount: "Up to R160 000 p/a",
    closing: "2026-12-05",
    requirements: ["SA citizen", "Financial need", "Registered at accredited institution"],
    benefits: ["Tuition", "Accommodation", "Work readiness programme"],
    minAverage: 60,
    needBased: true,
    levels: ["University", "TVET", "Postgraduate"],
  },
];

export function matchScore(b: Bursary, p: StudentProfile) {
  let score = 45;
  const avg = Number(p.average) || 0;
  if (avg >= b.minAverage) score += 20;
  else if (avg > 0) score -= Math.min(20, (b.minAverage - avg) / 2);
  const field = p.fieldOfStudy.toLowerCase();
  if (b.fields.includes("Any")) score += 12;
  else if (field && b.fields.some((f) => f.toLowerCase().includes(field) || field.includes(f.toLowerCase())))
    score += 22;
  if (b.levels.includes(p.level)) score += 10;
  if (b.needBased && (p.financialNeed === "High" || p.financialNeed === "Very High")) score += 12;
  if (p.institution.trim()) score += 4;
  return Math.max(18, Math.min(98, Math.round(score)));
}

export type Application = {
  bursaryId: string;
  status: "Not started" | "In progress" | "Submitted" | "Interview" | "Awarded" | "Declined";
  submittedAt?: string;
  consentAt?: string;
  referencesReceived: number;
};

export type Task = {
  id: string;
  title: string;
  due: string;
  priority: "Urgent" | "Important" | "Normal";
  done: boolean;
};

export type ConsentRecord = {
  id: string;
  institution: string;
  fields: string[];
  purpose: string;
  date: string;
};

export function daysUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / 86400000);
}
