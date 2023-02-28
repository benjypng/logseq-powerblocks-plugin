import * as chrono from "chrono-node";
import { getWeek, getWeekOfMonth } from "date-fns";
import getDateInYYYYMMDD from "../utils/getDateInYYYYMMDD";

export default function checkIfCondition(matched: string, nlp?: boolean) {
  const checkerObj = {
    ["IFDAYOFWEEK"]: "day",
    ["IFMONTHOFYEAR"]: "month",
    ["IFYEAR"]: "year",
    ["IFWEEKOFMONTH"]: "weekofmonth",
    ["IFWEEKOFYEAR"]: "weekofyear",
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

      case "weekofmonth":
        comparator = getWeekOfMonth(new Date());
        break;

      case "weekofyear":
        comparator = getWeek(new Date());
        break;

      default:
        return false;
    }

    return checker === comparator;
  } else {
    const dateToCheck = chrono.parseDate(matched.split(":")[1]);
    return getDateInYYYYMMDD(dateToCheck) === getDateInYYYYMMDD(new Date());
  }
}
