export default function checkIfCondition(matched: string) {
  const checkerObj = {
    ["IFDAYOFWEEK"]: "day",
    ["IFMONTHOFYEAR"]: "month",
    ["IFYEAR"]: "year",
    ["IFDATE"]: "date",
  };
  const checker = parseInt(matched.split(":")[1]);

  let comparator: number;
  switch (checkerObj[matched.split(":")[0]]) {
    case "day":
      comparator = new Date().getDay();
      break;

    case "month":
      comparator = new Date().getMonth();
      break;

    case "year":
      comparator = new Date().getFullYear();
      break;

    default:
      return;
  }

  if (checker === comparator) {
    return true;
  } else {
    return false;
  }
}
