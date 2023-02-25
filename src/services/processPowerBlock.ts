import getTime from "../utils/getTime";
import * as chrono from "chrono-node";
import getDateFromJournalDay from "../utils/getDateFromJournalDay";
import { getDateForPage } from "logseq-dateutils";

export default async function processPowerBlock(content: string, input?: any) {
  if (input !== "") {
    if (content.includes("<%INPUT:") && content.includes("%>")) {
      //@ts-expect-error
      Object.entries(input).map((i) => (content = content.replace(i[0], i[1])));
    }
  }

  if (content.includes("<%DATE:") && content.includes("%>")) {
    const regexp = /\<\%(.*?)\%\>/;
    const matched = regexp.exec(content);
    const dateToParse = matched![1].replace("DATE:", "").trim();

    const page = await logseq.Editor.getPage(
      (await logseq.Editor.getCurrentBlock())!.parent.id
    );

    const referenceDate = !page!["journal?"]
      ? new Date()
      : new Date(getDateFromJournalDay(page!.journalDay!));

    const date = chrono.parseDate(dateToParse, referenceDate);

    content = content.replaceAll(
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
      content = content.replaceAll(matched![0], "");
    } else {
      throw new Error("Day is not matched");
    }
  } else if (content.includes("<%IFMONTHOFYEAR:") && content.includes("%>")) {
    const regexp = /\<\%(.*?)\%\>/;
    const matched = regexp.exec(content);

    const checker = parseInt(matched![1].replace("IFMONTHOFYEAR:", ""));
    const monthInInteger = new Date().getMonth();

    if (checker === monthInInteger) {
      content = content.replaceAll(matched![0], "");
    } else {
      throw new Error("Month is not matched");
    }
  }

  if (content.includes("<%RANDOMTAG:") && content.includes("%>")) {
    const regexp = /\<\%(.*?)\%\>/;
    const matched = regexp.exec(content);

    const tag = matched![1].replace("RANDOMTAG:", "");
    content = content.replaceAll(
      matched![0],
      `
												#+BEGIN_QUERY
												{:title [:h2 "Random Quote 🎙"]
												 :query [:find (pull ?b [*])
												         :where
												         [?p :block/name "${tag}"]
												         (or [?b :block/refs ?p]
												         [?b :block/page ?p])
												    ]
												 :result-transform (fn [result]
												         [(rand-nth result)])
												 :breadcrumb-show? false
												}
												#+END_QUERY
			`
    );
  }

  // Handle replacement of template strings
  const templateStrArr = [
    {
      tKey: "<%TIME%>",
      tValue: getTime(),
      type: "replace",
    },
    {
      tKey: "<%TIMEAMPM%>",
      tValue: getTime("ampm"),
      type: "replace",
    },
  ];

  for (const t of templateStrArr) {
    content = content.replaceAll(t.tKey, t.tValue);
  }

  // Handle inline power blocks
  if (content.includes("<%PB:") && content.includes("%>")) {
    // Get power block ID
    const regexp = /\<\%(.*?)\%\>/;
    const matched = regexp.exec(content);

    // Parse matched[1]
    const pbToRender = matched![1].replace("PB:", "").trim();
    content = content.replaceAll(
      matched![0],
      `{{renderer :powerblocks_, ${pbToRender}}}`
    );
  }

  return content;
}
