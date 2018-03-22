"use strict";

import { defaults } from "lodash";
import mapCommand from "./map-command";

export default ({ key, parentState, parentMessage, childUpdate, childMessage, childData }) => {
  const { state: childState, command } = childUpdate(parentState[key], childMessage, childData);
  return {
    state: defaults({
      [key]: childState
    }, parentState),
    command: mapCommand(parentMessage, command)
  };
};

