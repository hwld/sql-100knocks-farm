import { Command } from "@cliffy/command";

export const buildCommand = () => {
  return new Command().noExit().helpOption(false);
};
