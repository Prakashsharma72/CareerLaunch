export const RESOURCE_CATEGORIES = [
  { id: "web-development", name: "Web Development", icon: "💻" },
  { id: "react", name: "React", icon: "⚛️" },
  { id: "nodejs", name: "Node.js", icon: "🟢" },
  { id: "database", name: "Database", icon: "🗄️" },
  { id: "interview-preparation", name: "Interview Preparation", icon: "🧠" },
  { id: "dsa", name: "DSA", icon: "📚" },
  { id: "ai-tools", name: "AI & Tools", icon: "🤖" },
  { id: "career-guides", name: "Career Guides", icon: "🎯" },
];

export const getResourceCategory = (id) =>
  RESOURCE_CATEGORIES.find((category) => category.id === id) || { id, name: id, icon: "📘" };