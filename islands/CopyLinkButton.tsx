import { useState } from "preact/hooks";

interface CopyLinkButtonProps {
  link: string;
}

export default function CopyLinkButton({ link }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    });
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      class="text-blue-500 hover:underline text-sm"
    >
      {copied ? "Link Copied!" : "Copy Link"}
    </button>
  );
}