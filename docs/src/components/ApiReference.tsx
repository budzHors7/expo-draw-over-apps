import apiReference from '../generated/api-reference.json';

type ApiEntry = {
  name: string;
  kind: string;
  signature: string;
  description: string;
};

export function ApiReference() {
  const entries = apiReference.entries as ApiEntry[];

  return (
    <div className="api-list">
      {entries.map((entry) => (
        <article className="api-entry" id={entry.name.toLowerCase()} key={entry.name}>
          <div className="api-entry-heading">
            <h2>{entry.name}</h2>
            <span>{entry.kind}</span>
          </div>
          <pre><code>{entry.signature}</code></pre>
          {entry.description ? <p>{entry.description}</p> : null}
        </article>
      ))}
    </div>
  );
}
