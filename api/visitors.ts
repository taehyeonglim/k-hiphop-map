import { handleVisitorCounter } from '../server/visitor-counter.js';

export default {
  fetch(request: Request) { return handleVisitorCounter(request); },
};
