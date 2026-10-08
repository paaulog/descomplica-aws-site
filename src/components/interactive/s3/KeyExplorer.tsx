import * as m from 'motion/react-m';
import { useId, useState } from 'react';
import type { KeyExplorerMessages } from '../../../lib/i18n/ui';
import { fillTemplate } from '../../../lib/i18n/template';
import { MAX_KEY_BYTES, parseKey, type KeyParseResult } from '../../../lib/s3/key';
import { BucketIcon, FileIcon, FolderIcon, WarningIcon } from '../icons';
import { IslandFrame } from '../IslandFrame';
import { useEnterAnimation } from '../motion-presets';
import { hintClass, inputClass, labelClass, secondaryButtonClass } from '../styles';
import type { IslandProps } from '../types';
import { useInteractionTracker } from '../use-interaction-tracker';

type KeyExplorerProps = IslandProps<KeyExplorerMessages>;

const INDENT_REM = 1.25;

function ConsoleTree({
  result,
  messages,
}: {
  result: KeyParseResult;
  messages: KeyExplorerMessages;
}) {
  const enter = useEnterAnimation();
  const folders = result.segments.slice(0, -1);
  return (
    <ol className="mt-3 space-y-1 font-mono text-sm" data-testid="key-tree">
      <li className="flex items-center gap-2 text-muted">
        <BucketIcon /> {messages.bucketLabel}
      </li>
      {folders.map((segment, index) => (
        <m.li
          key={`${index}:${segment}`}
          {...enter}
          className="flex items-center gap-2"
          style={{ marginInlineStart: `${(index + 1) * INDENT_REM}rem` }}
        >
          <FolderIcon className="size-5 shrink-0 text-accent" />
          <span className={segment ? undefined : 'text-muted italic'}>
            {segment || messages.emptySegment}/
          </span>
          <span className="sr-only">
            ({messages.prefixLabel}: {result.prefixes[index]})
          </span>
        </m.li>
      ))}
      {result.fileName && (
        <m.li
          key={`file:${result.fileName}`}
          {...enter}
          className="flex items-center gap-2"
          style={{ marginInlineStart: `${result.segments.length * INDENT_REM}rem` }}
        >
          <FileIcon /> {result.fileName}
          <span className="sr-only">({messages.fileLabel})</span>
        </m.li>
      )}
    </ol>
  );
}

function KeyFeedback({
  result,
  messages,
}: {
  result: KeyParseResult;
  messages: KeyExplorerMessages;
}) {
  const notes = [
    ...result.errors.map((error) => messages.errors[error]),
    ...result.warnings.map((warning) => messages.warnings[warning]),
  ].map((note) => fillTemplate(note, { max: MAX_KEY_BYTES }));
  if (result.valid && result.segments.length > 0 && !result.fileName)
    notes.push(messages.noFileName);
  return (
    <ul className="mt-3 space-y-1 text-sm" aria-live="polite">
      {notes.map((note) => (
        <li key={note} className="flex items-start gap-2">
          <WarningIcon className="mt-0.5 size-4 shrink-0 text-accent" /> {note}
        </li>
      ))}
    </ul>
  );
}

function KeyExplorerBody({ messages }: KeyExplorerProps) {
  const inputId = useId();
  const [key, setKey] = useState(messages.examples[0] ?? '');
  const markUsed = useInteractionTracker('KeyExplorer');
  const result = parseKey(key);
  const changeKey = (next: string) => {
    setKey(next);
    markUsed();
  };
  return (
    <div className="mt-4">
      <label htmlFor={inputId} className={labelClass}>
        {messages.inputLabel}
      </label>
      <input
        id={inputId}
        className={inputClass}
        value={key}
        onChange={(event) => changeKey(event.target.value)}
        spellCheck={false}
        autoComplete="off"
        aria-invalid={!result.valid}
      />
      <p className={`mt-1 ${hintClass}`}>
        {fillTemplate(messages.byteCount, { bytes: result.byteLength, max: MAX_KEY_BYTES })}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className={hintClass}>{messages.examplesLabel}:</span>
        {messages.examples.map((example) => (
          <button
            key={example}
            type="button"
            className={`${secondaryButtonClass} font-mono`}
            aria-pressed={example === key}
            onClick={() => changeKey(example)}
          >
            {example}
          </button>
        ))}
      </div>
      <p className="mt-5 text-sm font-medium">{messages.consoleHeading}</p>
      <ConsoleTree result={result} messages={messages} />
      <KeyFeedback result={result} messages={messages} />
      <p className={`mt-4 ${hintClass}`}>{messages.flatKey}</p>
    </div>
  );
}

export default function KeyExplorer(props: KeyExplorerProps) {
  return (
    <IslandFrame
      island="KeyExplorer"
      title={props.messages.title}
      fallback={props.messages.fallback}
    >
      <KeyExplorerBody {...props} />
    </IslandFrame>
  );
}
