import * as chrono from "chrono-node";
import getDateInYYYYMMDD from "../utils/getDateInYYYYMMDD";

export default function checkIfCondition(matched: string, nlp?: boolean) {
  const checkerObj = {
    ["IFDAYOFWEEK"]: "day",
    ["IFMONTHOFYEAR"]: "month",
    ["IFYEAR"]: "year",
    ["IFDATE"]: "date",
  };

  if (!nlp) {
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
  } else {
    const dateToCheck = chrono.parseDate(matched![1].replace("IFDATE:", ""));

    if (getDateInYYYYMMDD(dateToCheck) === getDateInYYYYMMDD(new Date())) {
      return true;
    } else {
      return false;
    }
  }
}
