import * as m from 'motion/react-m';
import { useRef, useState } from 'react';
import { formatDateTime } from '../../../lib/i18n/format';
import { fillTemplate } from '../../../lib/i18n/template';
import type { Locale, VersionTimelineMessages } from '../../../lib/i18n/ui';
import {
  createVersionedObject,
  getCurrentVersion,
  versioningReducer,
  type ObjectVersion,
  type VersionAction,
  type VersionedObject,
} from '../../../lib/s3/versioning';
import { FileIcon } from '../icons';
import { IslandFrame } from '../IslandFrame';
import { useEnterAnimation } from '../motion-presets';
import { hintClass, primaryButtonClass, secondaryButtonClass } from '../styles';
import type { IslandProps } from '../types';
import { useInteractionTracker } from '../use-interaction-tracker';

type VersionTimelineProps = IslandProps<VersionTimelineMessages>;

// Each action moves a simulated clock one hour ahead, from a fixed start shared by server and browser.
const SIMULATION_START_MS = Date.parse('2026-01-05T09:00:00Z');
const MS_PER_HOUR = 60 * 60 * 1000;
const TIME_FORMAT: Intl.DateTimeFormatOptions = { timeStyle: 'short', timeZone: 'UTC' };

interface TimelineState {
  object: VersionedObject;
  uploads: number;
  step: number;
}

const toSimulatedTime = (step: number): string =>
  new Date(SIMULATION_START_MS + step * MS_PER_HOUR).toISOString();

function createInitialState(messages: VersionTimelineMessages): TimelineState {
  const label = fillTemplate(messages.versionLabel, { n: 1 });
  const object = versioningReducer(createVersionedObject(messages.objectKey), {
    type: 'put',
    label,
    now: toSimulatedTime(0),
  });
  return { object, uploads: 1, step: 0 };
}

function describeStatus(object: VersionedObject, messages: VersionTimelineMessages): string {
  const current = getCurrentVersion(object);
  if (current) return `${messages.currentLabel}: ${current.label}`;
  return object.versions.length === 0 ? messages.deletedForever : messages.deletedWithMarker;
}

function VersionItem({
  version,
  canRestore,
  locale,
  messages,
  onRestore,
}: {
  version: ObjectVersion;
  canRestore: boolean;
  locale: Locale;
  messages: VersionTimelineMessages;
  onRestore: () => void;
}) {
  const enter = useEnterAnimation();
  return (
    <m.li
      {...enter}
      className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-border bg-bg p-3"
      data-version-id={version.versionId}
      data-delete-marker={version.isDeleteMarker ? '' : undefined}
    >
      <code className="rounded bg-accent-soft px-2 py-0.5 text-xs">{version.versionId}</code>
      <span
        className={`text-sm ${version.isDeleteMarker ? 'text-muted line-through' : 'font-medium'}`}
      >
        {version.isDeleteMarker ? messages.deleteMarker : version.label}
      </span>
      <span className="font-mono text-xs text-muted">
        {formatDateTime(version.createdAt, locale, TIME_FORMAT)}
      </span>
      {canRestore && (
        <button type="button" className={`${secondaryButtonClass} ml-auto`} onClick={onRestore}>
          {messages.restore}
          <span className="sr-only">: {version.label}</span>
        </button>
      )}
    </m.li>
  );
}

function VersionActions({
  messages,
  versioningEnabled,
  hasCurrent,
  onEnable,
  onUpload,
  onDelete,
}: {
  messages: VersionTimelineMessages;
  versioningEnabled: boolean;
  hasCurrent: boolean;
  onEnable: () => void;
  onUpload: () => void;
  onDelete: () => void;
}) {
  const uploadRef = useRef<HTMLButtonElement>(null);
  // Enabling removes its button and deleting disables its own, so focus would fall to <body>.
  const thenFocusUpload = (action: () => void) => () => {
    action();
    uploadRef.current?.focus();
  };
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {!versioningEnabled && (
        <button type="button" className={primaryButtonClass} onClick={thenFocusUpload(onEnable)}>
          {messages.enableVersioning}
        </button>
      )}
      <button ref={uploadRef} type="button" className={secondaryButtonClass} onClick={onUpload}>
        {messages.upload}
      </button>
      <button
        type="button"
        className={secondaryButtonClass}
        disabled={!hasCurrent}
        onClick={thenFocusUpload(onDelete)}
      >
        {messages.delete}
      </button>
    </div>
  );
}

function useVersionTimeline(messages: VersionTimelineMessages) {
  const [state, setState] = useState(() => createInitialState(messages));
  const markUsed = useInteractionTracker('VersionTimeline');
  // Every action moves the simulated clock; only uploads move the version counter.
  const dispatch = (
    buildAction: (now: string, uploads: number) => VersionAction,
    uploadsDelta = 0,
  ) => {
    setState((previous) => {
      const step = previous.step + 1;
      const uploads = previous.uploads + uploadsDelta;
      const action = buildAction(toSimulatedTime(step), uploads);
      return { object: versioningReducer(previous.object, action), uploads, step };
    });
    markUsed();
  };
  return {
    object: state.object,
    enable: () => dispatch(() => ({ type: 'enableVersioning' })),
    upload: () =>
      dispatch(
        (now, n) => ({ type: 'put', label: fillTemplate(messages.versionLabel, { n }), now }),
        1,
      ),
    remove: () => dispatch((now) => ({ type: 'delete', now })),
    restore: (versionId: string) => dispatch((now) => ({ type: 'restore', versionId, now })),
  };
}

function VersionList({
  object,
  locale,
  messages,
  onRestore,
}: {
  object: VersionedObject;
  locale: Locale;
  messages: VersionTimelineMessages;
  onRestore: (versionId: string) => void;
}) {
  const current = getCurrentVersion(object);
  if (object.versions.length === 0) {
    return <p className={`mt-2 ${hintClass}`}>{messages.emptyHistory}</p>;
  }
  return (
    <ol className="mt-2 space-y-2">
      {object.versions.map((version) => (
        <VersionItem
          key={`${version.versionId}:${version.createdAt}`}
          version={version}
          canRestore={object.versioningEnabled && !version.isDeleteMarker && version !== current}
          locale={locale}
          messages={messages}
          onRestore={() => onRestore(version.versionId)}
        />
      ))}
    </ol>
  );
}

function VersionTimelineBody({ locale, messages }: VersionTimelineProps) {
  const timeline = useVersionTimeline(messages);
  const { object } = timeline;
  return (
    <div className="mt-4">
      <p className="flex items-center gap-2 font-mono text-sm font-semibold">
        <FileIcon className="size-5 shrink-0 text-accent" /> {object.key}
      </p>
      <p className="mt-2 text-sm font-medium" aria-live="polite" data-testid="version-status">
        {describeStatus(object, messages)}
      </p>
      <p className={`mt-1 ${hintClass}`}>
        {object.versioningEnabled ? messages.versioningOn : messages.versioningOff}
      </p>
      <VersionActions
        messages={messages}
        versioningEnabled={object.versioningEnabled}
        hasCurrent={getCurrentVersion(object) !== null}
        onEnable={timeline.enable}
        onUpload={timeline.upload}
        onDelete={timeline.remove}
      />
      <p className="mt-5 text-sm font-medium">{messages.historyHeading}</p>
      <VersionList
        object={object}
        locale={locale}
        messages={messages}
        onRestore={timeline.restore}
      />
    </div>
  );
}

export default function VersionTimeline(props: VersionTimelineProps) {
  return (
    <IslandFrame
      island="VersionTimeline"
      title={props.messages.title}
      fallback={props.messages.fallback}
    >
      <VersionTimelineBody {...props} />
    </IslandFrame>
  );
}
