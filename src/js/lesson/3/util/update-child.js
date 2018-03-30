"use strict";

import { defaultsDeep, get, set } from "lodash";
import mapCommand from "./map-command";

export default ({ key, parentState, parentMessage, childUpdate, childMessage, childData }) => {
  const currentChildState = key ? get(parentState, key) : parentState;
  const { state: newChildState, command: childCommand } = childUpdate(currentChildState, childMessage, childData);
  const newParentStateSubset = key ? set({}, key, newChildState) : newChildState;
  return {
    state: defaultsDeep(newParentStateSubset, parentState),
    command: mapCommand(parentMessage, childCommand)
  };
};

