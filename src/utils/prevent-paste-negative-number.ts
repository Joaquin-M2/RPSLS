export default function preventPasteNegativeNumber(e: React.ClipboardEvent) {
  const clipboardData = e.clipboardData || window.clipboardData;
  const pastedData = parseFloat(clipboardData.getData("text"));

  if (pastedData < 0) {
    e.preventDefault();
  }
}
