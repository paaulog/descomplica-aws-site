import * as m from 'motion/react-m';
import { useEffect, useId, useState, type ChangeEvent, type DragEvent } from 'react';
import { formatBytes, formatDateTime } from '../../../lib/i18n/format';
import { fillTemplate } from '../../../lib/i18n/template';
import type { Locale, UploadToBucketMessages } from '../../../lib/i18n/ui';
import { toS3Object, type FileInfo, type S3ObjectPreview } from '../../../lib/s3/object';
import { BucketIcon, FileIcon } from '../icons';
import { IslandFrame } from '../IslandFrame';
import { useEnterAnimation } from '../motion-presets';
import {
  focusWithinClass,
  hintClass,
  inputClass,
  labelClass,
  primaryButtonClass,
  secondaryButtonClass,
} from '../styles';
import type { IslandProps } from '../types';
import { useInteractionTracker } from '../use-interaction-tracker';

type UploadToBucketProps = IslandProps<UploadToBucketMessages>;

// A typical phone photo; only these three fields exist, there is no content to read.
const SAMPLE_FILE_SIZE = 2_457_600;
const SAMPLE_FILE_TYPE = 'image/jpeg';

interface ObjectCardProps {
  object: S3ObjectPreview;
  locale: Locale;
  messages: UploadToBucketMessages;
}

function ObjectCard({ object, locale, messages }: ObjectCardProps) {
  const enter = useEnterAnimation();
  const fields: [keyof S3ObjectPreview, string][] = [
    ['key', object.key],
    ['size', formatBytes(object.size, locale)],
    ['contentType', object.contentType],
    [
      'lastModified',
      formatDateTime(object.lastModified, locale, { dateStyle: 'medium', timeStyle: 'short' }),
    ],
    ['etag', object.etag],
  ];
  return (
    <m.li {...enter} className="rounded-xl border border-border bg-bg p-3" data-testid="s3-object">
      <p className="flex items-center gap-2 font-mono text-sm font-semibold break-all">
        <FileIcon className="size-5 shrink-0 text-accent" /> {object.key}
      </p>
      <dl className="mt-2 grid gap-x-3 gap-y-1 text-sm sm:grid-cols-[auto_1fr]">
        {fields.map(([field, value]) => (
          <div key={field} className="contents">
            <dt className="text-muted">{messages.fields[field]}</dt>
            <dd className="mb-1 font-mono [overflow-wrap:anywhere] sm:mb-0">{value}</dd>
          </div>
        ))}
      </dl>
    </m.li>
  );
}

function BucketView({
  objects,
  locale,
  messages,
}: Omit<ObjectCardProps, 'object'> & { objects: S3ObjectPreview[] }) {
  return (
    <div className="mt-5 rounded-xl border border-dashed border-accent p-3">
      <p className="flex items-center gap-2 font-mono text-sm font-semibold">
        <BucketIcon className="size-5 shrink-0 text-accent" /> {messages.bucketName}
      </p>
      {objects.length === 0 ? (
        <p className={`mt-2 ${hintClass}`}>{messages.emptyBucket}</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {objects.map((object) => (
            <ObjectCard
              key={`${object.key}:${object.lastModified}`}
              object={object}
              locale={locale}
              messages={messages}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

interface DropZoneProps {
  messages: UploadToBucketMessages;
  onFile: (file: FileInfo) => void;
}

function hasFiles(event: globalThis.DragEvent): boolean {
  return event.dataTransfer?.types.includes('Files') ?? false;
}

// A file dropped beside the zone would make the browser leave the page to open it.
function useBlockStrayDrops(): void {
  useEffect(() => {
    const block = (event: globalThis.DragEvent) => {
      if (hasFiles(event)) event.preventDefault();
    };
    window.addEventListener('dragover', block);
    window.addEventListener('drop', block);
    return () => {
      window.removeEventListener('dragover', block);
      window.removeEventListener('drop', block);
    };
  }, []);
}

function useDropZone(onFile: (file: FileInfo) => void) {
  const [isDragging, setIsDragging] = useState(false);
  useBlockStrayDrops();
  return {
    isDragging,
    handlers: {
      onDragOver: (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(true);
      },
      onDragLeave: () => setIsDragging(false),
      onDrop: (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);
        const file = event.dataTransfer.files[0];
        if (file) onFile(file);
      },
    },
  };
}

const SAMPLE_FILE = { size: SAMPLE_FILE_SIZE, type: SAMPLE_FILE_TYPE };

function DropZone({ messages, onFile }: DropZoneProps) {
  const fileInputId = useId();
  const { isDragging, handlers } = useDropZone(onFile);
  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) onFile(file);
    event.target.value = '';
  };
  return (
    <div
      className={`mt-4 rounded-xl border-2 border-dashed p-4 text-center transition-colors ${isDragging ? 'border-accent bg-accent-soft' : 'border-border'}`}
      {...handlers}
      data-testid="drop-zone"
    >
      <p className={hintClass}>{messages.dropHint}</p>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        <label
          htmlFor={fileInputId}
          className={`${primaryButtonClass} cursor-pointer ${focusWithinClass}`}
        >
          {messages.chooseFile}
          <input id={fileInputId} type="file" className="sr-only" onChange={handleInput} />
        </label>
        <button
          type="button"
          className={secondaryButtonClass}
          onClick={() => onFile({ name: messages.sampleFileName, ...SAMPLE_FILE })}
        >
          {messages.useSample}
        </button>
      </div>
    </div>
  );
}

function UploadToBucketBody({ locale, messages }: UploadToBucketProps) {
  const prefixId = useId();
  const [prefix, setPrefix] = useState(messages.defaultPrefix);
  const [objects, setObjects] = useState<S3ObjectPreview[]>([]);
  const [uploadCount, setUploadCount] = useState(0);
  const markUsed = useInteractionTracker('UploadToBucket');
  // Copies only name, size and type: the File itself (and its bytes) is never kept or read.
  const addFile = ({ name, size, type }: FileInfo) => {
    const object = toS3Object({ name, size, type }, prefix);
    setObjects((current) => [object, ...current.filter((item) => item.key !== object.key)]);
    setUploadCount((count) => count + 1);
    markUsed();
  };
  const latest = objects[0];
  return (
    <div className="mt-4">
      <label htmlFor={prefixId} className={labelClass}>
        {messages.prefixLabel}
      </label>
      <input
        id={prefixId}
        className={inputClass}
        value={prefix}
        onChange={(event) => setPrefix(event.target.value)}
        spellCheck={false}
        autoComplete="off"
      />
      <p className={`mt-1 ${hintClass}`}>{messages.prefixHint}</p>
      <DropZone messages={messages} onFile={addFile} />
      <p className="sr-only" aria-live="polite">
        {/* A new node per upload, so uploading the same key again is announced again. */}
        {latest && (
          <span key={uploadCount}>{fillTemplate(messages.objectAdded, { key: latest.key })}</span>
        )}
      </p>
      <BucketView objects={objects} locale={locale} messages={messages} />
      <p className={`mt-3 ${hintClass}`}>{messages.privacyNote}</p>
    </div>
  );
}

export default function UploadToBucket(props: UploadToBucketProps) {
  return (
    <IslandFrame
      island="UploadToBucket"
      title={props.messages.title}
      fallback={props.messages.fallback}
    >
      <UploadToBucketBody {...props} />
    </IslandFrame>
  );
}
