"use strict";

import React from "react";
import PropTypes from "prop-types";
import { defaults } from "lodash";
import timeout from "../command/timeout";
import every from "../subscription/every";

export const init = (title = "Counter", count = 0) => ({
  state: {
    title,
    count,
    autoIncrement: false,
    timeoutInput: "",
    timeoutInputInt: 1000
  }
});

export const subscriptions = state => {
  if (state.autoIncrement) return [ every(1000, "onAutoIncrement", { delta: 1 }) ];
  else return [];
};

export const update = (state = {}, message , data) => {
  switch (message) {

    case "modifyCount":
      state.count += data.delta;
      return { state };

    case "toggleAutoIncrement":
      state.autoIncrement = !state.autoIncrement;
      return { state };

    case "onAutoIncrement":
      state.count += data.delta;
      return { state };

    case "onTimeoutInput":
      state.timeoutInput = data.input;
      state.timeoutInputInt = parseInt(data.input) || 1000;
      return { state };

    case "triggerTimeout":
      return {
        state: defaults({
          timeoutInput: "",
          timeoutInputInt: 1000
        }, state),
        command: timeout(state.timeoutInputInt, "modifyCount", { delta: 1 })
      };

    default:
      return { state };
  }
};

export const view = ({ state, dispatch }) => {
  const increment = () => dispatch("modifyCount", { delta: 1 });
  const decrement = () => dispatch("modifyCount", { delta: -1 });
  const toggleAutoIncrement = () => dispatch("toggleAutoIncrement");
  const onTimeoutInput = e => dispatch("onTimeoutInput", { input: e.target.value });
  const triggerTimeout = () => dispatch("triggerTimeout");
  const autoIncrementText = state.autoIncrement ? "Stop Auto-Increment" : "Start Auto-Increment";
  const countStyle = {
    color: state.autoIncrement ? "blue" : "red"
  };
  return (
    <div>
      <h3>{state.title}</h3>
      <p style={countStyle}>{state.count}</p>
      <div className="buttons">
        <button onClick={increment}>Increment</button>
        <button onClick={decrement}>Decrement</button>
        <button onClick={toggleAutoIncrement}>{autoIncrementText}</button>
        <br />
        <input type="text" placeholder="Timeout duration" value={state.timeoutInput} onInput={onTimeoutInput} />
        <button onClick={triggerTimeout}>Increment by 1 in {state.timeoutInputInt}ms</button>
      </div>
    </div>
  );
};

view.propTypes = {
  state: PropTypes.any.isRequired,
  dispatch: PropTypes.func.isRequired
};
