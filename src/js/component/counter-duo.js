"use strict";

import React from "react";
import PropTypes from "prop-types";
import { defaults} from "lodash";
import * as Counter from "./counter";

export const ACTIONS = {
  COUNTER_A_MESSAGE: 0,
  COUNTER_B_MESSAGE: 1
};

export const init = () => ({
  counterA: Counter.init("Counter A"),
  counterB: Counter.init("Counter B")
});

export const update = (state = {}, message , data) => {
  switch (message) {

    case ACTIONS.COUNTER_A_MESSAGE:
      return defaults({
        counterA: Counter.update(state.counterA, data.message, data.data)
      }, state);

    case ACTIONS.COUNTER_B_MESSAGE:
      return defaults({
        counterB: Counter.update(state.counterB, data.message, data.data)
      }, state);

    default:
      return state;
  }
};

export const View = ({ state, dispatch }) => {
  const dispatchCounterA = (message, data) => dispatch(ACTIONS.COUNTER_A_MESSAGE, { message, data });
  const dispatchCounterB = (message, data) => dispatch(ACTIONS.COUNTER_B_MESSAGE, { message, data });
  return (
    <div>
      <h2>Dual Counters</h2>
      <Counter.View state={state.counterA} dispatch={dispatchCounterA} />
      <Counter.View state={state.counterB} dispatch={dispatchCounterB} />
    </div>
  );
};

View.propTypes = {
  state: PropTypes.any.isRequired,
  dispatch: PropTypes.func.isRequired
};
