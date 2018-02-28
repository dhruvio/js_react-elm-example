"use strict";

import React from "react";
import PropTypes from "prop-types";
import { defaults } from "lodash";

export const ACTIONS = {
  SET_TEXT: 0,
  INPUT_TEXT: 1
};

export const init = (text = "Hello, World!") => ({
  text,
  input: ""
});

export const update = (state = {}, message , data) => {
  switch (message) {

    case ACTIONS.SET_TEXT:
      return {
        text: data,
        input: ""
      };

    case ACTIONS.INPUT_TEXT:
      return defaults({
        input: data
      }, state);

    default:
      return state;
  }
};

export const View = ({ state, dispatch }) => {
  const setText = () => dispatch(ACTIONS.SET_TEXT, state.input);
  const onSubmit = e => e.preventDefault() && setText();
  const onInput = e => dispatch(ACTIONS.INPUT_TEXT, e.target.value);
  return (
    <div>
      <p>{state.text}</p>
      <form onSubmit={onSubmit}>
        <input type="text" value={state.input} onInput={onInput} />
        <button onClick={setText}>
          Change Text
        </button>
      </form>
    </div>
  );
};

View.propTypes = {
  state: PropTypes.any.isRequired,
  dispatch: PropTypes.func.isRequired
};
