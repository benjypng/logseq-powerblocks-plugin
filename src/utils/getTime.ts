export default function getTime(flag?: string) {
  const d = new Date();

  if (!flag) {
    const hours = d.getHours() < 10 ? "0" + d.getHours() : d.getHours();
    const mins = d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes();
    return `${hours}:${mins}`;
  } else if (flag === "ampm") {
    const ampm = d.getHours() > 11 ? "pm" : "am";
    const newHours = d.getHours() > 12 ? d.getHours() - 12 : d.getHours();
    return `${newHours}:${d.getMinutes()} ${ampm}`;
  }
}
