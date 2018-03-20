"use strict";

import { defaults } from "lodash";
import mapIndexedDispatch from "./map-indexed-dispatch";

export default (parentMessage, index, childSubs) => {
  return childSubs.map(({ id, start }) => ({
    id: defaults({ message: `${parentMessage}.${index}/${id.message}` }, id),
    start: dispatch => start(mapIndexedDispatch(parentMessage, index, dispatch))
  }));
};
