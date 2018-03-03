"use strict";

import React from "react";
import PropTypes from "prop-types";
import { defaults } from "lodash";

//TODO move this to a command helper module
const timeout = (message, data, duration) => dispatch => setTimeout(() => dispatch(message, data), duration);

const MSG = {
  MODIFY_COUNT: 0
};

export const init = (title = "Counter", count = 0) => ({
  state: { title, count }
});

export const update = (state = {}, message , data) => {
  switch (message) {

    case MSG.MODIFY_COUNT:
      state.count += data;
      return {
        state,
        command: timeout(MSG.TIMEOUT_COMPLETE, data * -1, 3000)
      };

    case MSG.TIMEOUT_COMPLETE:
      state.count += data;
      return { state };

    default:
      return { state };
  }
};

export const View = ({ state, dispatch }) => {
  const increment = () => dispatch(MSG.MODIFY_COUNT, 1);
  const decrement = () => dispatch(MSG.MODIFY_COUNT, -1);
  const buttonsStyle = {
    display: "flex",
    flexFlow: "row nowrap"
  };
  return (
    <div>
      <h3>{state.title}</h3>
      <p>{state.count}</p>
      <div className="buttons" style={buttonsStyle}>
        <button onClick={increment}>Increment</button>
        <button onClick={decrement}>Decrement</button>
      </div>
    </div>
  );
};

View.propTypes = {
  state: PropTypes.any.isRequired,
  dispatch: PropTypes.func.isRequired
};
