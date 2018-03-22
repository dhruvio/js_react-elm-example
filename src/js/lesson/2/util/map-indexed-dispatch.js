"use strict";

export default (parentMessage, index, dispatch) => (childMessage, childData) => dispatch(parentMessage, {
  message: childMessage,
  data: childData,
  index
});

