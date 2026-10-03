import { LoaderCircle, RefreshCw } from 'lucide-react';
import { DatasetChangedError } from '@/lib/detail-data';
export default function DetailStatus({ error, onRetry }: { error?: Error; onRetry: () => void }) {
  return <div className="detail-loading" role={error ? 'alert' : 'status'}>
    {error ? <><p>{error.message}</p><button onClick={() => error instanceof DatasetChangedError ? window.location.reload() : onRetry()}><RefreshCw size={16} />{error instanceof DatasetChangedError ? '페이지 새로고침' : '다시 불러오기'}</button></> : <><LoaderCircle className="spin" size={20} /><p>발매곡과 출처를 불러오는 중…</p></>}
  </div>;
}
