"use strict";

import { noop } from "lodash";
import mapIndexedDispatch from "./map-indexed-dispatch";

export default (parentMessage, index, command = noop) => dispatch => command(mapIndexedDispatch(parentMessage, index, dispatch));
