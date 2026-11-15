import apiReference from '../generated/api-reference.json';
import { CodeBlock } from './CodeBlock';

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
            <h2><a className="heading-link" href={`#${entry.name.toLowerCase()}`}>{entry.name}</a></h2>
          </div>
          <CodeBlock code={entry.signature} language="typescript" />
          {entry.description ? <p>{entry.description}</p> : null}
        </article>
      ))}
    </div>
  );
}
