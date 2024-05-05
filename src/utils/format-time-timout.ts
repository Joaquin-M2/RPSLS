// Prepend `0` for one digit numbers. For that the number has to be
// converted to string, as numbers don't have length method.
function setSeconds(seconds: number) {
  return String(seconds).length === 1 ? `0${seconds}` : `${seconds}`;
}

export default function formatTimeout(counter: number) {
  // Convert seconds into minutes and take the whole part
  const minutes = Math.floor(counter / 60);

  // Get the seconds left after converting minutes
  const seconds = counter % 60;

  //Return combined values as string in format mm:ss
  return `${minutes}:${setSeconds(seconds)}`;
}
