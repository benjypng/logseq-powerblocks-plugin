export default function getDateFromJournalDay(journalDay: number) {
  const y = parseInt(journalDay.toString().substring(0, 4));
  const m = parseInt(journalDay.toString().substring(4, 6));
  const d = parseInt(journalDay.toString().substring(6));

  return `${y}, ${m}, ${d}`;
}
