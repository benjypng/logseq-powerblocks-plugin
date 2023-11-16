import * as chrono from "chrono-node";
import { getDateForPage } from "logseq-dateutils";
import getDateFromJournalDay from "~/utils/getDateFromJournalDay";

export const checkDate = async (content: string): Promise<string> => {
  if (content.includes("<%DATE:") && content.includes("%>")) {
    const regexp = /<%(.*?)%>/;
    const matched = regexp.exec(content);
    if (!matched || !matched[1]) return content;

    const dateToParse = matched[1].replace("DATE:", "").trim();

    const page = await logseq.Editor.getPage(
      (await logseq.Editor.getCurrentBlock())!.parent.id,
    );
    if (!page) return content;

    const referenceDate = !page["journal?"]
      ? new Date()
      : new Date(getDateFromJournalDay(page.journalDay!));

    const date = chrono.parseDate(dateToParse, referenceDate);

    return content.replaceAll(
      matched![0],
      getDateForPage(
        date,
        (await logseq.App.getUserConfigs()).preferredDateFormat,
      ),
    );
  } else {
    return content;
  }
};
