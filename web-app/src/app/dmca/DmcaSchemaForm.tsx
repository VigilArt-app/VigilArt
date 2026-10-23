import { Plus, Trash2 } from "lucide-react";
import type { DmcaFormField, DmcaFormItem } from "@vigilart/shared/types";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { InfoHint } from "@/src/components/ui/info-hint";
import {
  createDefaultValueForItems,
  getAtPath,
  inputTypeFromField,
  type ArtworkPrefill,
  type JsonLike,
  type PathPart,
} from "./dmca-form-utils";

type DmcaFormGroup = Extract<DmcaFormItem, { kind: "group" }>;
type DmcaFormRepeater = Extract<DmcaFormItem, { kind: "array" }>;

// Same look as <Input>, for the controls it cannot render. The DMCA forms are
// long legal text, so labels and values are a step larger than elsewhere.
export const DMCA_CONTROL_CLASS =
  "w-full rounded-md border border-input bg-transparent px-3 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30";
export const DMCA_INPUT_CLASS = "h-10 md:text-base";
export const DMCA_LABEL_CLASS = "text-base leading-snug";

type DmcaSchemaFormProps = {
  schema: DmcaFormItem[];
  payload: JsonLike;
  artworkPrefill: ArtworkPrefill;
  detectedInfringingUrls: string[];
  onUpdatePath: (path: PathPart[], value: JsonLike) => void;
  t: (...args: any[]) => any;
};

export function DmcaSchemaForm({
  schema,
  payload,
  artworkPrefill,
  detectedInfringingUrls,
  onUpdatePath,
  t,
}: DmcaSchemaFormProps) {
  const getFieldLabel = (field: DmcaFormField) =>
    t(`dmca_page.core.${field.key}`, field.title);

  const getFieldDescription = (field: DmcaFormField) => {
    if (!field.description) {
      return "";
    }

    return t(`dmca_page.core.${field.key}_hint`, field.description);
  };

  const getFieldPlaceholder = (field: DmcaFormField) =>
    t(`dmca_page.core.${field.key}_placeholder`, field.placeholder || "");

  const shouldUseDetectedUrlDropdown = (field: DmcaFormField, path: PathPart[]) => {
    if (detectedInfringingUrls.length === 0) {
      return false;
    }

    const key = field.key.toLowerCase();
    const title = (field.title || "").toLowerCase();
    const pathText = path.map((part) => String(part)).join(".").toLowerCase();

    if (key.includes("original") || pathText.includes("original_work")) {
      return false;
    }

    if (key === "infringing_url") {
      return true;
    }

    if (field.type !== "url") {
      return false;
    }

    return (
      key === "link" ||
      key === "url" ||
      key.includes("infring") ||
      key.includes("report") ||
      title.includes("link") ||
      title.includes("url")
    );
  };

  // Platforms send long legal explanations as field descriptions; inline they
  // bury the form, so they sit behind an "i" next to the label instead.
  const renderFieldHeader = (field: DmcaFormField, fieldId: string, hintId: string) => {
    const fieldDescription = getFieldDescription(field);
    return (
      <div className="flex items-start gap-1.5 [&>button]:mt-0.5">
        <Label htmlFor={fieldId} className={DMCA_LABEL_CLASS}>
          {/* One text run joined by a no-break space, so a wrapped label never leaves its star alone on a line. */}
          <span>
            {getFieldLabel(field)}
            {field.required && <span className="text-destructive" aria-hidden="true">{"\u00A0"}*</span>}
          </span>
        </Label>
        {fieldDescription && <InfoHint id={hintId}>{fieldDescription}</InfoHint>}
      </div>
    );
  };

  const renderField = (field: DmcaFormField, path: PathPart[]) => {
    const currentValue = getAtPath(payload, path);
    const fieldPlaceholder = getFieldPlaceholder(field);
    const isFullWidth = field.key === "infringing_url" || field.type === "textarea";
    // The control is pushed to the bottom of its grid cell, so inputs on one
    // row stay level when a neighbour's label wraps onto two lines.
    const wrapperClass = `flex h-full flex-col justify-between gap-2${isFullWidth ? " md:col-span-2" : ""}`;
    const fieldId = `dmca-${path.join("-")}`;
    const hintId = `${fieldId}-hint`;
    const describedBy = getFieldDescription(field) ? hintId : undefined;

    if (field.type === "textarea") {
      return (
        <div key={path.join("-")} className={wrapperClass}>
          {renderFieldHeader(field, fieldId, hintId)}
          <textarea
            id={fieldId}
            aria-describedby={describedBy}
            value={typeof currentValue === "string" ? currentValue : ""}
            onChange={(event) => onUpdatePath(path, event.target.value)}
            placeholder={fieldPlaceholder}
            required={Boolean(field.required)}
            className={`${DMCA_CONTROL_CLASS} min-h-28 py-2`}
          />
        </div>
      );
    }

    if (shouldUseDetectedUrlDropdown(field, path)) {
      return (
        <div key={path.join("-")} className={wrapperClass}>
          {renderFieldHeader(field, fieldId, hintId)}
          <select
            id={fieldId}
            aria-describedby={describedBy}
            value={typeof currentValue === "string" ? currentValue : ""}
            onChange={(event) => onUpdatePath(path, event.target.value)}
            required={Boolean(field.required)}
            className={`${DMCA_CONTROL_CLASS} h-10 text-foreground`}
          >
            <option value="">{t("dmca_page.detected_urls_dropdown_placeholder")}</option>
            {detectedInfringingUrls.map((url) => (
              <option key={url} value={url} className="bg-background text-foreground">
                {url}
              </option>
            ))}
          </select>
        </div>
      );
    }

    return (
      <div key={path.join("-")} className={wrapperClass}>
        {renderFieldHeader(field, fieldId, hintId)}
        <Input
          id={fieldId}
          aria-describedby={describedBy}
          type={inputTypeFromField(field)}
          value={typeof currentValue === "number" ? String(currentValue) : typeof currentValue === "string" ? currentValue : ""}
          onChange={(event) => {
            if (field.type === "number") {
              const raw = event.target.value;
              onUpdatePath(path, raw === "" ? "" : Number(raw));
              return;
            }
            onUpdatePath(path, event.target.value);
          }}
          placeholder={fieldPlaceholder}
          required={Boolean(field.required)}
          className={DMCA_INPUT_CLASS}
        />
      </div>
    );
  };

  const renderGroup = (group: DmcaFormGroup, path: PathPart[]) => {
    return (
      // Sections are told apart by their headings, not by another box: the
      // step is already a card, and nested borders only add noise.
      <section key={path.join("-")} className="space-y-4">
        <div className="flex items-center gap-1.5 border-b pb-2">
          <h3 className="text-lg font-semibold">{group.title}</h3>
          {group.description && <InfoHint>{group.description}</InfoHint>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
          {group.items.map((item) =>
            // Fields are grid cells themselves so their own column span applies.
            item.kind === "field" ? (
              renderItem(item, [...path, item.key])
            ) : (
              <div key={item.key} className="md:col-span-2">
                {renderItem(item, [...path, item.key])}
              </div>
            )
          )}
        </div>
      </section>
    );
  };

  const renderRepeater = (repeater: DmcaFormRepeater, path: PathPart[]) => {
    const raw = getAtPath(payload, path);
    const rows = Array.isArray(raw) ? raw : [];

    const addItem = () => {
      if (repeater.maxItems !== undefined && rows.length >= repeater.maxItems) {
        return;
      }

      const nextRows = [...rows, createDefaultValueForItems(repeater.itemSchema, artworkPrefill)];
      onUpdatePath(path, nextRows);
    };

    const removeItem = (index: number) => {
      const minItems = repeater.minItems ?? 0;
      if (rows.length <= minItems) {
        return;
      }

      const nextRows = rows.filter((_, currentIndex) => currentIndex !== index);
      onUpdatePath(path, nextRows);
    };

    return (
      <section key={path.join("-")} className="space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap border-b pb-2">
          <div className="flex min-w-0 items-center gap-1.5">
            <h3 className="text-lg font-semibold">{repeater.title}</h3>
            {repeater.description && <InfoHint>{repeater.description}</InfoHint>}
          </div>
          <Button type="button" variant="outline" onClick={addItem} className="flex-shrink-0 text-base">
            <Plus className="size-5 mr-2" />
            {t("dmca_page.add_entry")}
          </Button>
        </div>

        {rows.length === 0 && (
          <p className="text-sm text-muted-foreground">{t("dmca_page.no_entries")}</p>
        )}

        <div className="space-y-3">
          {rows.map((_, index) => (
            <div key={`${path.join("-")}-${index}`} className="rounded-lg border bg-muted/30 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-base font-medium">{t("dmca_page.entry_number", { index: index + 1 })}</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(index)}
                >
                  <Trash2 className="size-5" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                {repeater.itemSchema.map((item) => renderItem(item, [...path, index, item.key]))}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderItem = (item: DmcaFormItem, path: PathPart[]) => {
    if (item.kind === "field") {
      return renderField(item, path);
    }

    if (item.kind === "group") {
      return renderGroup(item, path);
    }

    return renderRepeater(item, path);
  };

  return <div className="space-y-8">{schema.map((item) => renderItem(item, [item.key]))}</div>;
}
