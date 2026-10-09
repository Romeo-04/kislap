type IconName = 'book' | 'map' | 'star' | 'sparkle' | 'arrow' | 'flame' | 'shield' | 'bubble' | 'close' | 'moon' | 'check'
const paths: Record<IconName, string> = {
  book: 'M12 5C8 2 4 3 2 4v15c3-1 7-1 10 2 3-3 7-3 10-2V4c-2-1-6-2-10 1Zm0 0v16',
  map: 'm9 3-7 3v15l7-3 6 3 7-3V3l-7 3-6-3Zm0 0v15m6-12v15',
  star: 'm12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z',
  sparkle: 'm12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z',
  arrow: 'M4 12h16m-6-6 6 6-6 6',
  flame: 'M13 2c1 6-4 6-2 10 2 0 4-2 4-4 5 5 5 8 2 11-3 4-10 3-12-1C2 12 8 10 8 6c2 1 2 3 2 3s3-3 3-7Z',
  shield: 'm12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6l9-4Zm-5 10 3 3 7-7',
  bubble: 'M21 11a9 9 0 0 1-9 9H3l2-5a9 9 0 1 1 16-4ZM8 9h.01M12 9h.01M16 9h.01',
  close: 'm6 6 12 12M6 18 18 6',
  moon: 'M20 15A9 9 0 0 1 9 4 9 9 0 1 0 20 15Z',
  check: 'm5 12 4 4L19 6',
}
export function GameIcon({ name, size = 24 }: { name: IconName; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>
}
