"use strict";

import { assign } from "lodash";
import mapDispatch from "./map-dispatch";

export default (parentMessage, childSubs) => {
  return childSubs.map(({ id, start }) => ({
    id: assign(id, { message: `${parentMessage}/${id.message}` }),
    start: dispatch => start(mapDispatch(parentMessage, dispatch))
  }));
};
