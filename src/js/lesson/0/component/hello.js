"use strict";

import React from "react";
import PropTypes from "prop-types";
import { defaults } from "lodash";

export const init = (text = "Hello, World!") => ({
  text,
  input: ""
});

export const update = (state = {}, message, data) => {
  switch (message) {

    case "setText":
      return {
        text: data,
        input: ""
      };

    case "inputText":
      return defaults({
        input: data
      }, state);

    default:
      return state;
  }
};

export const view = ({ state, dispatch }) => {
  const setText = () => dispatch("setText", state.input);
  const onSubmit = e => e.preventDefault() && setText();
  const onInput = e => dispatch("inputText", e.target.value);
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

view.propTypes = {
  state: PropTypes.any.isRequired,
  dispatch: PropTypes.func.isRequired
};
