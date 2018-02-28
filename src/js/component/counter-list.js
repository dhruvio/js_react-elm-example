"use strict";

import React from "react";
import PropTypes from "prop-types";
import { defaults } from "lodash";
import * as Counter from "./counter";

export const ACTIONS = {
  ADD_COUNTER: 0,
  REMOVE_COUNTER: 1,
  UPDATE_COUNTER: 2
};

export const init = () => ({
  nextId: 1,
  counters: []
});

export const update = (state = {}, message , data) => {
  switch (message) {

    case ACTIONS.ADD_COUNTER:
      state.counters.push(Counter.init(`Counter ${state.nextId}`));
      state.nextId++;
      return state;


    case ACTIONS.REMOVE_COUNTER:
      state.counters.splice(data.index, 1);
      return state;

    case ACTIONS.UPDATE_COUNTER:
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

const viewCounter = (counter, dispatch, key) => (
  <Counter.View state={counter} dispatch={dispatch} key={key} />
);

const viewCounters = (counters, dispatch) => {
  return counters.map((counter, index) => {
    const removeCounter = () => dispatch(ACTIONS.REMOVE_COUNTER, { index });
    const counterDispatch = (message, data) => dispatch(ACTIONS.UPDATE_COUNTER, {
      index,
      message,
      data
    });
    return (
      <div className="counter">
        {viewCounter(counter, counterDispatch, index)}
        <button onClick={removeCounter}>Remove</button>
      </div>
    );
  });
};

export const View = ({ state, dispatch }) => {
  const addCounter = () => dispatch(ACTIONS.ADD_COUNTER);
  return (
    <div>
      <h2>Counter List</h2>
      <button onClick={addCounter}>Add Counter</button>
      {viewCounters(state.counters, dispatch)}
    </div>
  );
};

View.propTypes = {
  state: PropTypes.any.isRequired,
  dispatch: PropTypes.func.isRequired
};
