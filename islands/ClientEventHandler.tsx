import { useState } from "preact/hooks";
import { useRouter } from "https://esm.sh/preact-router@4.1.2";

interface ClientEventHandlerProps {
  onClick: () => void;
  label: string;
  route: string; // Added route prop
}

export default function ClientEventHandler({ onClick, label }: ClientEventHandlerProps) {
  const [clicked, setClicked] = useState(false);
  const router = useRouter();

  const handleClick = () => {
    setClicked(true);
    onClick();
    router.push(); // Navigate to the dynamic route
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      class="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
    >
      {clicked ? "Changed!" : label}
    </button>
  );
}