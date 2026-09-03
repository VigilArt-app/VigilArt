"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ExternalLink, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "../../ui/button";
import { FileDropzone, type DroppedFile } from "../../upload/FileDropzone";
import { usePublicScan, type ScanErrorKind } from "../../../hooks/usePublicScan";
import { ScanSweep } from "./scan-sweep";
import { Turnstile } from "./turnstile";
import { isPublicScanDisabled } from "./scan-availability";
import { TURNSTILE_SITE_KEY } from "../../../config";
import type { PublicScanResult } from "@vigilart/shared";
import type { LandingStrings } from "../../../app/landing/locale";

// recharts is around 100 kB. A visitor who never runs a scan never sees a
// chart, so it must not sit in the landing page's first load.
const CategoryBreakdown = dynamic(
  () =>
    import("../../matches/CategoryBreakdown").then((m) => m.CategoryBreakdown),
  { ssr: false }
);

export function ScanPanel({ strings }: { strings: LandingStrings }) {
  const { t } = useTranslation();
  const { phase, result, errorKind, remainingToday, start, reset } =
    usePublicScan();
  const [picked, setPicked] = useState<DroppedFile | null>(null);
  const [localError, setLocalError] = useState<ScanErrorKind | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  // Counts spent bot-check tokens so the widget mints a fresh one; a Turnstile
  // token is single-use and the second scan would be rejected otherwise.
  const [tokensSpent, setTokensSpent] = useState(0);
  const previewRef = useRef<string | null>(null);

  const u = strings.upload;
  const busy = phase === "uploading" || phase === "scanning";
  const budgetSpent = remainingToday === 0 && phase === "idle";

  const errorMessage = useMemo(() => {
    const kind = localError ?? errorKind;
    if (!kind) return null;
    const messages: Record<ScanErrorKind, string> = {
      wrong_type: u.error_wrong_type,
      too_large: u.error_too_large,
      bot_check: u.error_bot_check,
      rate_limited: u.error_rate_limited,
      generic: u.error_generic
    };
    return messages[kind];
  }, [localError, errorKind, u]);

  const onFilesAdded = useCallback((files: DroppedFile[]) => {
    const next = files[0];
    if (!next) return;
    setLocalError(null);
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = next.preview;
    setPicked(next);
  }, []);

  const onScan = useCallback(async () => {
    if (!picked) return;
    setTokensSpent((count) => count + 1);
    // FileDropzone already compressed it on the way in.
    await start(picked.file, turnstileToken);
  }, [picked, turnstileToken, start]);

  const onStartOver = useCallback(() => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = null;
    setPicked(null);
    setLocalError(null);
    reset();
  }, [reset]);

  // The page is card-coloured, so a panel of the same fill would vanish into
  // it. Separation comes from the border and shadow, as on the login panel.
  //
  // One fixed height in every state from `lg` up: the hero row is centred, so a
  // panel that grows with its content drags the headline beside it upwards.
  // 25rem is roughly what the idle state wants on its own, so the card stays
  // compact and the result scrolls inside it rather than the reverse.
  // Below `lg` the columns are stacked and nothing sits beside it, so it grows
  // naturally there.
  const shell =
    "flex flex-col rounded-xl border bg-muted p-6 shadow-sm lg:h-[25rem]";

  if (budgetSpent) {
    return (
      <div className={`${shell} justify-center`}>
        <p className="font-medium">{u.budget_spent_title}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          {u.budget_spent_body}
        </p>
        <Button asChild className="mt-5 w-full">
          <Link href="/sign-up">{u.create_account}</Link>
        </Button>
      </div>
    );
  }

  if (phase === "done" && result) {
    const hidden = result.totalMatches - result.matches.length;
    return (
      <div className={shell}>
        {/* min-h-0 is what lets a flex child actually shrink and scroll; without
            it the child keeps its content height and the panel overflows. */}
        <div className="min-h-0 flex-1 overflow-y-auto">
        {result.totalMatches === 0 ? (
          <>
            <p className="font-medium">{strings.result.no_matches_title}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {strings.result.no_matches_body}
            </p>
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{result.totalMatches}</span>
              <span className="text-sm text-muted-foreground">
                {t("dashboard_page.statistics.total_matches", "total matches")}
              </span>
            </div>

            {/* A stacked strip rather than the donut: on a card this size a
                donut pushes every match link out of view, and the links are
                what prove the reposts are real. The strip still gives the
                legend's colour something to key against. */}
            <CategoryBreakdown
              totalMatches={result.totalMatches}
              categoryDistribution={result.categories}
              variant="bar"
            />

            <ul className="space-y-3 pt-2">
              {result.matches.map((match) => (
                <li key={match.url}>
                  <MatchRow match={match} strings={strings} />
                </li>
              ))}
            </ul>

            <p className="text-xs text-muted-foreground">
              {strings.result.a_match_is_a_lead}
            </p>
          </div>
        )}
        </div>

        {hidden > 0 && (
          // Pinned below the scrolling region. The label carries a count, so it
          // is long in both languages and the Button base sets nowrap; left
          // alone it is clipped at 390px rather than wrapping.
          <Button
            asChild
            className="mt-4 h-auto w-full shrink-0 whitespace-normal py-2.5 text-center"
          >
            <Link href="/sign-up">
              {(hidden === 1
                ? strings.result.see_the_rest_one
                : strings.result.see_the_rest_other
              ).replace("{{count}}", String(hidden))}
            </Link>
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 w-full shrink-0"
          onClick={onStartOver}
        >
          <RotateCcw aria-hidden="true" />
          {u.change_file}
        </Button>
      </div>
    );
  }

  if (busy && picked) {
    return (
      <div className={`${shell} justify-center`}>
        <ScanSweep src={picked.preview} alt={picked.file.name} />
        <p className="mt-4 font-medium" role="status" aria-live="polite">
          {u.scanning}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{u.scanning_note}</p>
      </div>
    );
  }

  return (
    <div className={shell}>
      {picked ? (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-input p-6 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element -- object URL
              of a file the visitor just picked; next/image cannot optimise a
              blob. */}
          <img
            src={picked.preview}
            alt={picked.file.name}
            className="mx-auto max-h-40 w-auto rounded-sm"
          />
          <Button
            variant="link"
            size="sm"
            className="mt-3"
            onClick={onStartOver}
          >
            {u.change_file}
          </Button>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col justify-center">
          <FileDropzone
            onFilesAdded={onFilesAdded}
            multiple={false}
            inputId="public-scan-file"
          />
        </div>
      )}

      {errorMessage && (
        <p className="mt-3 text-sm text-destructive" role="alert">
          {errorMessage}
        </p>
      )}

      <Turnstile onToken={setTurnstileToken} resetSignal={tokensSpent} />

      <Button
        className="mt-4 w-full shrink-0"
        disabled={isPublicScanDisabled({
          hasFile: Boolean(picked),
          busy,
          turnstileRequired: TURNSTILE_SITE_KEY !== null,
          turnstileToken
        })}
        onClick={onScan}
      >
        {u.scan_button}
      </Button>

      {phase === "error" && (
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 w-full"
          onClick={onStartOver}
        >
          {u.retry}
        </Button>
      )}

      <p className="mt-4 shrink-0 text-sm text-muted-foreground">
        {u.deleted_after}
      </p>
    </div>
  );
}

function MatchRow({
  match,
  strings
}: {
  match: PublicScanResult["matches"][number];
  strings: LandingStrings;
}) {
  const title = match.pageTitle || match.url;

  // `unsafeDomain` is set by isBlacklisted() against a list of adult image
  // boards. This page is public and anonymous, so those are listed and counted
  // but never opened from here; an artist documenting one does it signed in.
  if (match.unsafeDomain) {
    return (
      <div className="text-sm">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1 font-medium">
          {match.websiteName}
          <span className="rounded-sm border border-destructive/40 px-1.5 py-0.5 text-[11px] font-normal text-destructive">
            {strings.result.unsafe_flag}
          </span>
          <span className="text-[11px] font-normal text-muted-foreground">
            {strings.result.unsafe_not_linked}
          </span>
        </span>
        <span className="mt-0.5 block truncate text-muted-foreground">
          {title}
        </span>
      </div>
    );
  }

  return (
    <a
      href={match.url}
      target="_blank"
      // nofollow on top of the usual pair: this page is public, and it should
      // not pass ranking to a site reposting someone's work.
      rel="noopener noreferrer nofollow"
      className="group block rounded-sm text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      <span className="flex items-center gap-1.5 font-medium group-hover:underline">
        {match.websiteName}
        <ExternalLink className="size-3 shrink-0 text-muted-foreground" aria-hidden="true" />
      </span>
      <span className="mt-0.5 block truncate text-muted-foreground">
        {title}
      </span>
    </a>
  );
}
