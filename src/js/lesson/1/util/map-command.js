"use strict";

import { noop } from "lodash";
import mapDispatch from "./map-dispatch";

export default (parentMessage, command = noop) => dispatch => command(mapDispatch(parentMessage, dispatch));
