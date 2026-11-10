import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const docsRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rawDirectory = path.join(docsRoot, '.generated');
const rawOutput = path.join(rawDirectory, 'typedoc.json');
const publicOutput = path.join(docsRoot, 'src', 'generated', 'api-reference.json');
const typedocBinary = path.join(docsRoot, 'node_modules', 'typedoc', 'bin', 'typedoc');
const moduleManifest = JSON.parse(fs.readFileSync(path.join(docsRoot, '..', 'package.json'), 'utf8'));

fs.mkdirSync(rawDirectory, { recursive: true });
fs.mkdirSync(path.dirname(publicOutput), { recursive: true });

const typedoc = spawnSync(
  process.execPath,
  [
    typedocBinary,
    '--entryPoints',
    '../src/index.ts',
    '--tsconfig',
    '../tsconfig.json',
    '--json',
    rawOutput,
    '--skipErrorChecking',
    '--excludePrivate',
    '--excludeInternal',
    '--logLevel',
    'Warn',
  ],
  { cwd: docsRoot, encoding: 'utf8' }
);

if (typedoc.status !== 0) {
  process.stderr.write(typedoc.stdout ?? '');
  process.stderr.write(typedoc.stderr ?? '');
  process.exit(typedoc.status ?? 1);
}

const project = JSON.parse(fs.readFileSync(rawOutput, 'utf8'));
const reflections = new Map();

function indexReflection(reflection) {
  if (!reflection || typeof reflection !== 'object') return;
  if (typeof reflection.id === 'number') reflections.set(reflection.id, reflection);
  for (const child of reflection.children ?? []) indexReflection(child);
  for (const signature of reflection.signatures ?? []) indexReflection(signature);
  if (reflection.declaration) indexReflection(reflection.declaration);
}

indexReflection(project);

function textFromParts(parts = []) {
  return parts.map((part) => part.text ?? '').join('').trim();
}

function commentText(reflection) {
  const comment = reflection?.comment ?? reflection?.signatures?.[0]?.comment;
  return textFromParts(comment?.summary);
}

function typeText(type) {
  if (!type) return 'void';
  switch (type.type) {
    case 'intrinsic':
    case 'unknown':
      return type.name ?? 'unknown';
    case 'reference': {
      const typeArguments = type.typeArguments?.map(typeText);
      return `${type.name}${typeArguments?.length ? `<${typeArguments.join(', ')}>` : ''}`;
    }
    case 'array':
      return `${typeText(type.elementType)}[]`;
    case 'union':
      return type.types.map(typeText).join(' | ');
    case 'intersection':
      return type.types.map(typeText).join(' & ');
    case 'literal':
      return JSON.stringify(type.value);
    case 'tuple':
      return `[${type.elements.map(typeText).join(', ')}]`;
    case 'reflection':
      return type.declaration?.signatures?.length
        ? signatureText(type.declaration.signatures[0], '')
        : 'object';
    default:
      return type.name ?? type.type ?? 'unknown';
  }
}

function signatureText(signature, name) {
  const parameters = (signature.parameters ?? []).map((parameter) => {
    const optional = parameter.flags?.isOptional ? '?' : '';
    return `${parameter.name}${optional}: ${typeText(parameter.type)}`;
  });
  return `${name}(${parameters.join(', ')}): ${typeText(signature.type)}`;
}

function unwrapReference(reflection) {
  return reflection?.kind === 4194304 && typeof reflection.target === 'number'
    ? reflections.get(reflection.target) ?? reflection
    : reflection;
}

function entryFor(exportedReflection) {
  const reflection = unwrapReference(exportedReflection);
  const name = exportedReflection.name ?? reflection.name;
  const signatures = reflection.signatures ?? [];
  const signature = signatures.length
    ? signatures.map((item) => signatureText(item, name)).join('\n')
    : reflection.type
      ? `${name}: ${typeText(reflection.type)}`
      : name;
  const kind = signatures.length
    ? /^[A-Z]/.test(name) ? 'component' : 'function'
    : reflection.kind === 2097152 ? 'type' : 'value';

  return {
    name,
    kind,
    signature,
    description: commentText(reflection) || commentText(exportedReflection),
  };
}

const entries = (project.children ?? [])
  .map(entryFor)
  .filter((entry) => entry.name && entry.name !== 'default')
  .sort((left, right) => left.name.localeCompare(right.name));

fs.writeFileSync(
  publicOutput,
  `${JSON.stringify({ moduleVersion: moduleManifest.version, entries }, null, 2)}\n`
);

process.stdout.write(`Generated ${entries.length} API entries from TypeDoc.\n`);
