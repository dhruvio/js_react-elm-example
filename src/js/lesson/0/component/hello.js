"use strict";

import React from "react";
import PropTypes from "prop-types";
import { defaults } from "lodash";

//TODO move this to a command helper module
const timeout = (message, duration) => dispatch => setTimeout(() => dispatch(message), duration);

const MSG = {
  SET_TEXT: 0,
  INPUT_TEXT: 1,
  TIMEOUT_COMPLETE: 2
};

export const init = (text = "Hello, World!") => ({
  state: {
    text,
    input: ""
  }
});

export const update = (state = {}, message , data) => {
  switch (message) {

    case MSG.SET_TEXT:
      return {
        state: {
          text: data,
          input: ""
        },
        command: timeout(MSG.TIMEOUT_COMPLETE, 3000)
      };

    case MSG.INPUT_TEXT:
      state.input = data;
      return { state };

    case MSG.TIMEOUT_COMPLETE:
      state.text = "Timeout Complete";
      return { state };

    default:
      return { state };
  }
};

export const View = ({ state, dispatch }) => {
  const setText = () => dispatch(MSG.SET_TEXT, state.input);
  const onSubmit = e => e.preventDefault() && setText();
  const onInput = e => dispatch(MSG.INPUT_TEXT, e.target.value);
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
