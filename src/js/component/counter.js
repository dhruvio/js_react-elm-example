"use strict";

import React from "react";
import PropTypes from "prop-types";
import { defaults } from "lodash";

export const ACTIONS = {
  MODIFY_COUNT: 0
};

export const init = (title = "Counter", count = 0) => ({ title, count });

export const update = (state = {}, message , data) => {
  switch (message) {

    case ACTIONS.MODIFY_COUNT:
      return defaults({
        count: state.count += data
      }, state);

    default:
      return state;
  }
};

export const View = ({ state, dispatch }) => {
  const increment = () => dispatch(ACTIONS.MODIFY_COUNT, 1);
  const decrement = () => dispatch(ACTIONS.MODIFY_COUNT, -1);
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
