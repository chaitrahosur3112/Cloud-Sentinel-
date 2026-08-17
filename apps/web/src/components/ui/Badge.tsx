type Color = "green" | "red" | "yellow" | "blue" | "gray" | "purple";

interface Props { label: string; color?: Color }

const colors: Record<Color, string> = {
  green:  "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  red:    "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  yellow: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  blue:   "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  gray:   "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
  purple: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

export function Badge({ label, color = "gray" }: Props) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors[color]}`}>
      {label}
    </span>
  );
}