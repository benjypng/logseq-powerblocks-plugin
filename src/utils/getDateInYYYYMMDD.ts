export default function getDateInYYYYMMDD(d: Date) {
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const date = d.getDate();

  return `${year}-${month}-${date}`;
}
