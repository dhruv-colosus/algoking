/* Static illustration for Module 8. Values are illustrative. */

const series: [number, number, number][] = [
  [100, 96, 42],
  [300, 205, 88],
  [1000, 520, 265],
  [3000, 1290, 850],
  [10000, 3550, 3080],
];

export function DictionaryEffect() {
  return <div className="fx-dict">
    <ol className="fx-dict-rows">{series.map(([raw, alone, dict]) => <li key={raw}>
      <span className="fx-dict-label">{raw >= 1000 ? `${raw / 1000} KB` : `${raw} B`} message</span>
      <span className="fx-dict-bars">
        <span className="is-alone" style={{ width: `${(alone / raw) * 100}%` }}><em>{Math.round((alone / raw) * 100)}%</em></span>
        <span className="is-dict" style={{ width: `${(dict / raw) * 100}%` }}><em>{Math.round((dict / raw) * 100)}%</em></span>
      </span>
    </li>)}</ol>
    <div className="fx-legend"><span><i className="is-alone" />Compressed alone (share of original)</span><span><i className="is-dict" />With a trained dictionary</span></div>
  </div>;
}
