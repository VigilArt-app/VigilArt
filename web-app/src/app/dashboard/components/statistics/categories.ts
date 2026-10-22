// The category taxonomy and its palette live in the shared matches module so
// the public landing page can use them without importing dashboard code.
// Re-exported here so existing imports keep working.
export {
  CATEGORY_ORDER,
  categoryLabelKey,
  getCategoryColor,
} from "@/src/components/matches/categories";
