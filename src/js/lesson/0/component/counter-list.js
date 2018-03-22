"use strict";

import React from "react";
import PropTypes from "prop-types";
import { defaults } from "lodash";
import * as Counter from "./counter";

export const init = () => ({
  nextId: 1,
  counters: []
});

export const update = (state = {}, message , data) => {
  switch (message) {

    case "addCounter":
      state.counters.push(Counter.init(`Counter ${state.nextId}`));
      state.nextId++;
      return state;


    case "removeCounter":
      state.counters.splice(data.index, 1);
      return state;

    case "updateCounter":
      const { index: index_, message: message_, data: data_ } = data;
      const counters = state.counters.map((counter, index) => {
        if (index !== index_) return counter;
        else return Counter.update(counter, message_, data_);
      });
      return defaults({ counters }, state);

    default:
      return state;
  }
};

const viewCounters = (counters, dispatch) => {
  return counters.map((counter, index) => {
    const removeCounter = () => dispatch("removeCounter", { index });
    const counterDispatch = (message, data) => dispatch("updateCounter", {
      index,
      message,
      data
    });
    return (
      <div className="counter" key={index}>
        <Counter.view state={counter} dispatch={counterDispatch} />
        <button onClick={removeCounter}>Remove</button>
      </div>
    );
  });
};

export const view = ({ state, dispatch }) => {
  const addCounter = () => dispatch("addCounter");
  return (
    <div>
      <h2>Counter List</h2>
      <button onClick={addCounter}>Add Counter</button>
      {viewCounters(state.counters, dispatch)}
    </div>
  );
};

view.propTypes = {
  state: PropTypes.any.isRequired,
  dispatch: PropTypes.func.isRequired
};
