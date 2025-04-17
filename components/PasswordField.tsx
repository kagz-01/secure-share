import { h } from "preact";
import { Signal } from "@preact/signals";

export default function PasswordField({
  password,
}: {
  password: Signal<string>;
}) {
  return (
    <input
      type="password"
      class="w-full p-2 border rounded mb-2"
      placeholder="Enter decryption password"
      value={password.value}
      onInput={(e) => (password.value = (e.target as HTMLInputElement).value)}
    />
  );
}
