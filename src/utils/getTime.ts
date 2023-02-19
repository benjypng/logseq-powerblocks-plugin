export default function getTime() {
  const d = new Date();
  const hours = d.getHours() < 10 ? "0" + d.getHours() : d.getHours();
  const mins = d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes();

  return `${hours}:${mins}`;
}
