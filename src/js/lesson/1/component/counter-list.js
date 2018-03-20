"use strict";

import React from "react";
import PropTypes from "prop-types";
import { defaults, flatten } from "lodash";
import * as Counter from "./counter";
import mapIndexedDispatch from "../util/map-indexed-dispatch";
import mapIndexedCommand from "../util/map-indexed-command";
import mapIndexedSubscriptions from "../util/map-indexed-subscriptions";
import updateIndexedChild from "../util/update-indexed-child";

export const init = () => ({
  state: {
    nextId: 1,
    counters: []
  }
});

export const subscriptions = ({ counters }) => {
  const nestedSubs = counters.map((counter, index) => mapIndexedSubscriptions("updateCounter", index, Counter.subscriptions(counter)));
  return flatten(nestedSubs);
};

export const update = (state = {}, message , data) => {
  switch (message) {

    case "addCounter":
      const { state: childState, command: childCommand } = Counter.init(`Counter ${state.nextId}`);
      const command = mapIndexedCommand("updateCounter", state.counters.length, childCommand);
      state.counters.push(childState);
      state.nextId++;
      return { state, command };


    case "removeCounter":
      state.counters.splice(data.index, 1);
      return { state };

    case "updateCounter":
      return updateIndexedChild({
        key: "counters",
        index: data.index,
        parentState: state,
        parentMessage: "updateCounter",
        childUpdate: Counter.update,
        childMessage: data.message,
        childData: data.data
      });

    default:
      return { state };
  }
};

const viewCounters = (counters, dispatch) => {
  return counters.map((counter, index) => {
    const removeCounter = () => dispatch("removeCounter", { index });
    const counterDispatch = mapIndexedDispatch("updateCounter", index, dispatch);
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
