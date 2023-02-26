export default function getTime(flag?: string) {
  const d = new Date();

  if (!flag) {
    const hours = d.getHours() < 10 ? "0" + d.getHours() : d.getHours();
    const mins = d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes();
    return `${hours}:${mins}`;
  } else if (flag === "ampm") {
    const ampm = d.getHours() > 11 ? "pm" : "am";
    let newHours: number;
    if (d.getHours() === 0) {
      newHours = 12;
    } else if (d.getHours() > 12) {
      newHours = d.getHours() - 12;
    } else {
      newHours = d.getHours();
    }
    return `${newHours}:${d.getMinutes()} ${ampm}`;
  }
}
