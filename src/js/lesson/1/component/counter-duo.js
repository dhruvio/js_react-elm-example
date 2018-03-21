"use strict";

import { noop, defaults } from "lodash";
import React from "react";
import PropTypes from "prop-types";
import * as Counter from "./counter";
import mapDispatch from "../util/map-dispatch";
import mapCommand from "../util/map-command";
import mapSubscriptions from "../util/map-subscriptions";
import updateChild from "../util/update-child";
import batchCommands from "../util/batch-commands";

export const init = () => {
  const counterA = Counter.init("Counter A");
  const counterB = Counter.init("Counter B");
  return {
    state: {
      counterA: counterA.state,
      counterB: counterB.state,
    },
    command: batchCommands(
      mapCommand("counterAMessage", counterA.command),
      mapCommand("counterBMessage", counterB.command)
    )
  };
};

export const subscriptions = state => {
  const subsA = mapSubscriptions("counterAMessage", Counter.subscriptions(state.counterA));
  const subsB = mapSubscriptions("counterBMessage", Counter.subscriptions(state.counterB));
  return subsA.concat(subsB);
};

export const update = (state = {}, message , data) => {
  switch (message) {

    case "counterAMessage":
      return updateChild({
        key: "counterA",
        parentState: state,
        parentMessage: "counterAMessage",
        childUpdate: Counter.update,
        childMessage: data.message,
        childData: data.data
      });

    case "counterBMessage":
      return updateChild({
        key: "counterB",
        parentState: state,
        parentMessage: "counterBMessage",
        childUpdate: Counter.update,
        childMessage: data.message,
        childData: data.data
      });

    default:
      return { state };
  }
};

export const view = ({ state, dispatch }) => {
  const dispatchA = mapDispatch("counterAMessage", dispatch);
  const dispatchB = mapDispatch("counterBMessage", dispatch);
  return (
    <div>
      <h2>Counter Duo</h2>
      <Counter.view state={state.counterA} dispatch={dispatchA} />
      <Counter.view state={state.counterB} dispatch={dispatchB} />
    </div>
  );
};

view.propTypes = {
  state: PropTypes.any.isRequired,
  dispatch: PropTypes.func.isRequired
};
