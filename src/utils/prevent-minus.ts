export default function preventMinus(e: React.KeyboardEvent) {
  if (e.code === "Minus" || e.code === "Slash" || e.code === "NumpadSubtract") {
    e.preventDefault();
  }
}
