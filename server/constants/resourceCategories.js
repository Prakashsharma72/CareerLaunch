export const RESOURCE_CATEGORIES = [
  { id: "web-development", name: "Web Development" },
  { id: "react", name: "React" },
  { id: "nodejs", name: "Node.js" },
  { id: "database", name: "Database" },
  { id: "interview-preparation", name: "Interview Preparation" },
  { id: "dsa", name: "DSA" },
  { id: "ai-tools", name: "AI & Tools" },
  { id: "career-guides", name: "Career Guides" },
];

const CATEGORY_ALIASES = {
  javascript: "web-development",
  frontend: "web-development",
  "web development": "web-development",
  "node.js": "nodejs",
  node: "nodejs",
  "interview prep": "interview-preparation",
  interview: "interview-preparation",
  "ai & tools": "ai-tools",
  ai: "ai-tools",
  "career guide": "career-guides",
  "career guides": "career-guides",
};

export const normalizeResourceCategory = (value) => {
  const raw = String(value || "").trim().toLowerCase();
  if (RESOURCE_CATEGORIES.some((category) => category.id === raw)) return raw;
  const category = RESOURCE_CATEGORIES.find((item) => item.name.toLowerCase() === raw);
  return category?.id || CATEGORY_ALIASES[raw] || null;
};

export const getResourceCategoryName = (id) =>
  RESOURCE_CATEGORIES.find((category) => category.id === id)?.name || id;