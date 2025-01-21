import * as log from "@std/log";
import * as colors from "@std/fmt/colors";

log.setup({
  handlers: {
    console: new log.ConsoleHandler("DEBUG", {
      formatter: (r) => {
        if (r.level === log.LogLevels.INFO) {
          return colors.white(`${r.msg}`);
        } else if (r.level === log.LogLevels.DEBUG) {
          return colors.gray(`${r.msg}`);
        }
        return `[${r.levelName}] ${r.msg}`;
      },
    }),
  },
  loggers: {
    default: {
      level: "DEBUG",
      handlers: ["console"],
    },
  },
});

export const logger = log.getLogger();
