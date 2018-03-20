"use strict";

import { noop, defaults} from "lodash";
import React from "react";
import PropTypes from "prop-types";
import * as Counter from "./counter";

//TODO move these helpers to an architecture helper module
//s/message/msg/g

const mapDispatch = (parentMessage, dispatch) => (childMessage, childData) => dispatch(parentMessage, {
  message: childMessage,
  data: childData
});

const mapCommand = (message, command = noop) => dispatch => command(mapDispatch(message, dispatch));

const batchCommands = (...commands) => dispatch => commands.forEach(c => c(dispatch));

const mapChildUpdate = ({ key, parentState, parentMessage, childUpdate, childMessage, childData }) => {
  const { state: childState, command } = childUpdate(parentState[key], childMessage, childData);
  return {
    state: defaults({
      [key]: childState
    }, parentState),
    command: mapCommand(parentMessage, command)
  };
};


const MSG = {
  COUNTER_A_MESSAGE: 0,
  COUNTER_B_MESSAGE: 1
};

export const init = () => {
  const counterA = Counter.init("Counter A");
  const counterB = Counter.init("Counter B");
  return {
    state: {
      counterA: counterA.state,
      counterB: counterB.state,
    },
    command: batchCommands(counterA.command, counterB.command)
  };
};

export const update = (state = {}, message , data) => {
  switch (message) {

    case MSG.COUNTER_A_MESSAGE:
      return mapChildUpdate({
        key: "counterA",
        parentState: state,
        parentMessage: MSG.COUNTER_A_MESSAGE,
        childUpdate: Counter.update,
        childMessage: data.message,
        childData: data.data
      });

    case MSG.COUNTER_B_MESSAGE:
      return mapChildUpdate({
        key: "counterB",
        parentState: state,
        parentMessage: MSG.COUNTER_B_MESSAGE,
        childUpdate: Counter.update,
        childMessage: data.message,
        childData: data.data
      });

    default:
      return { state };
  }
};

export const View = ({ state, dispatch }) => {
  const dispatchA = mapDispatch(MSG.COUNTER_A_MESSAGE, dispatch);
  const dispatchB = mapDispatch(MSG.COUNTER_B_MESSAGE, dispatch);
  return (
    <div>
      <h2>Counter Duo</h2>
      <Counter.View state={state.counterA} dispatch={dispatchA} />
      <Counter.View state={state.counterB} dispatch={dispatchB} />
    </div>
  );
};

View.propTypes = {
  state: PropTypes.any.isRequired,
  dispatch: PropTypes.func.isRequired
};
