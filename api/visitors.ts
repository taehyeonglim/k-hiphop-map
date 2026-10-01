import { handleVisitorCounter } from '../server/visitor-counter';

export default {
  fetch(request: Request) { return handleVisitorCounter(request); },
};
