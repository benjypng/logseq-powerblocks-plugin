import getTime from "../utils/getTime";
import * as chrono from "chrono-node";
import getDateFromJournalDay from "../utils/getDateFromJournalDay";
import { getDateForPage } from "logseq-dateutils";

export default async function processPowerBlock(content: string) {
  if (content.includes("<%DATE:") && content.includes("%>")) {
    const regexp = /\<\%(.*?)\%\>/;
    const matched = regexp.exec(content);
    const dateToParse = matched![1].replace("DATE:", "").trim();

    const page = await logseq.Editor.getPage(
      (await logseq.Editor.getCurrentBlock())!.parent.id
    );

    const referenceDate = !page?.journal
      ? new Date()
      : new Date(getDateFromJournalDay(page.journalDay!));

    const date = chrono.parseDate(dateToParse, referenceDate);

    content = content.replace(
      matched![0],
      getDateForPage(
        date,
        (await logseq.App.getUserConfigs()).preferredDateFormat
      )
    );
  }

  if (content.includes("<%IFDAYOFWEEK:") && content.includes("%>")) {
    const regexp = /\<\%(.*?)\%\>/;
    const matched = regexp.exec(content);

    const checker = parseInt(matched![1].replace("IFDAYOFWEEK:", ""));
    const dayInInteger = new Date().getDay();

    if (checker === dayInInteger) {
      content = content.replace(matched![0], "");
    } else {
      throw new Error("Day is not matched");
    }
  } else if (content.includes("<%IFMONTHOFYEAR:") && content.includes("%>")) {
    const regexp = /\<\%(.*?)\%\>/;
    const matched = regexp.exec(content);

    const checker = parseInt(matched![1].replace("IFMONTHOFYEAR:", ""));
    const monthInInteger = new Date().getMonth();

    if (checker === monthInInteger) {
      content = content.replace(matched![0], "");
    } else {
      throw new Error("Month is not matched");
    }
  }

  // Handle replacement of template strings
  const templateStrArr = [
    {
      tKey: "<%TIME%>",
      tValue: getTime(),
      type: "replace",
    },
  ];

  for (const t of templateStrArr) {
    content = content.replace(t.tKey, t.tValue);
  }

  // Handle inline power blocks
  if (content.includes("<%PB:") && content.includes("%>")) {
    // Get power block ID
    const regexp = /\<\%(.*?)\%\>/;
    const matched = regexp.exec(content);

    // Parse matched[1]
    const pbToRender = matched![1].replace("PB:", "").trim();
    content = content.replace(
      matched![0],
      `{{renderer :powerblocks_, ${pbToRender}}}`
    );
  }

  return content;
}
