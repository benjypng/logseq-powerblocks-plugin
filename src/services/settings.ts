import "@logseq/libs";

import { SettingSchemaDesc } from "@logseq/libs/dist/LSPlugin.user";

const settings: SettingSchemaDesc[] = [
  {
    key: "autoParse",
    type: "boolean",
    default: false,
    title: "Auto Parse",
    description:
      "If set to true, plugin will autoparse whatever is between 3 braces e.g. ({{{PowerBlock id}}} and automatically insert the template based on the PowerBlock id.",
  },
];

export default settings;
