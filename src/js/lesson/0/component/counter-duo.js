"use strict";

import React from "react";
import PropTypes from "prop-types";
import { defaults} from "lodash";
import * as Counter from "./counter";

export const init = () => ({
  counterA: Counter.init("Counter A"),
  counterB: Counter.init("Counter B")
});

export const update = (state = {}, message , data) => {
  switch (message) {

    case "counterAMessage":
      return defaults({
        counterA: Counter.update(state.counterA, data.message, data.data)
      }, state);

    case "counterBMessage":
      return defaults({
        counterB: Counter.update(state.counterB, data.message, data.data)
      }, state);

    default:
      return state;
  }
};

export const view = ({ state, dispatch }) => {
  const dispatchCounterA = (message, data) => dispatch("counterAMessage", { message, data });
  const dispatchCounterB = (message, data) => dispatch("counterBMessage", { message, data });
  return (
    <div>
      <h2>Dual Counters</h2>
      <Counter.view state={state.counterA} dispatch={dispatchCounterA} />
      <Counter.view state={state.counterB} dispatch={dispatchCounterB} />
    </div>
  );
};

view.propTypes = {
  state: PropTypes.any.isRequired,
  dispatch: PropTypes.func.isRequired
};
