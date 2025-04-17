import { h } from "preact";
export default function FileIcon({ filename }: { filename: string }) {
  const extension = filename.split(".").pop()?.toLowerCase();

  const iconMap: Record<string, string> = {
    pdf: "📄",
    mp4: "🎬",
    mp3: "🎵",
    png: "🖼️",
    jpg: "🖼️",
    jpeg: "🖼️",
    doc: "📝",
    docx: "📝",
    zip: "🗜️",
    default: "📁",
  };

  const icon = extension ? iconMap[extension] || iconMap.default : iconMap.default;

  return <span class="text-2xl">{icon}</span>;
}
