"use strict";

import { defaults, noop } from "lodash";
import batchCommands from "./batch-commands";
import mapIndexedCommand from "./map-indexed-command";

export default ({ key, index, parentState, parentMessage, childUpdate, childMessage, childData }) => {
  const childUpdateResults = parentState[key].map((childState, childIndex) => {
    if (index !== childIndex) return { state: childState };
    return childUpdate(childState, childMessage, childData);
  });
  const childStates = childUpdateResults.map(({ state }) => state);
  const childCommands = childUpdateResults.map(({ command }) => command);
  const mappedChildCommands = childCommands.map(
    (childCommand, childIndex) => mapIndexedCommand(parentMessage, childIndex, childCommand)
  );
  return {
    state: defaults({
      [key]: childStates
    }, parentState),
    command: batchCommands(...mappedChildCommands) 
  };
};

