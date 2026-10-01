import { ArrowUpRight } from 'lucide-react';

export default function CreatorCredit() {
  return <a className="creator-credit" href="https://github.com/taehyeonglim" target="_blank" rel="noopener noreferrer">
    <span className="creator-credit-label" aria-hidden="true">CREATED BY</span>
    <span>임태형 a.k.a. Lyricist</span><ArrowUpRight size={12} aria-hidden="true" />
  </a>;
}
