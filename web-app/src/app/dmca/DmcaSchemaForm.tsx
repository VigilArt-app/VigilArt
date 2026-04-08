import { Plus, Trash2 } from "lucide-react";
import type { DmcaFormField, DmcaFormItem } from "@vigilart/shared/types";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
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

  const renderField = (field: DmcaFormField, path: PathPart[]) => {
    const currentValue = getAtPath(payload, path);
    const fieldLabel = getFieldLabel(field);
    const fieldDescription = getFieldDescription(field);
    const fieldPlaceholder = getFieldPlaceholder(field);

    if (field.type === "textarea") {
      return (
        <div key={path.join("-")} className="space-y-2">
          <Label>{fieldLabel}{field.required ? " *" : ""}</Label>
          {fieldDescription && (
            <p className="text-xs text-muted-foreground">{fieldDescription}</p>
          )}
          <textarea
            value={typeof currentValue === "string" ? currentValue : ""}
            onChange={(event) => onUpdatePath(path, event.target.value)}
            placeholder={fieldPlaceholder}
            required={Boolean(field.required)}
            className="w-full min-h-28 rounded-md border border-input bg-transparent px-3 py-2 text-sm"
          />
        </div>
      );
    }

    if (shouldUseDetectedUrlDropdown(field, path)) {
      return (
        <div key={path.join("-")} className="space-y-2">
          <Label>{fieldLabel}{field.required ? " *" : ""}</Label>
          {fieldDescription && (
            <p className="text-xs text-muted-foreground">{fieldDescription}</p>
          )}
          <select
            value={typeof currentValue === "string" ? currentValue : ""}
            onChange={(event) => onUpdatePath(path, event.target.value)}
            required={Boolean(field.required)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm"
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
      <div key={path.join("-")} className="space-y-2">
        <Label>{fieldLabel}{field.required ? " *" : ""}</Label>
        {fieldDescription && (
          <p className="text-xs text-muted-foreground">{fieldDescription}</p>
        )}
        <Input
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
        />
      </div>
    );
  };

  const renderGroup = (group: DmcaFormGroup, path: PathPart[]) => {
    return (
      <div key={path.join("-")} className="rounded-lg border p-4 space-y-4">
        <div>
          <h3 className="font-semibold">{group.title}</h3>
          {group.description && (
            <p className="text-sm text-muted-foreground mt-1">{group.description}</p>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {group.items.map((item) => renderItem(item, [...path, item.key]))}
        </div>
      </div>
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
      <div key={path.join("-")} className="space-y-3 rounded-lg border p-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="font-semibold">{repeater.title}</h3>
            {repeater.description && (
              <p className="text-sm text-muted-foreground mt-1">{repeater.description}</p>
            )}
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="h-4 w-4 mr-2" />
            {t("dmca_page.add_entry")}
          </Button>
        </div>

        {rows.length === 0 && (
          <p className="text-sm text-muted-foreground">{t("dmca_page.no_entries")}</p>
        )}

        <div className="space-y-3">
          {rows.map((_, index) => (
            <div key={`${path.join("-")}-${index}`} className="rounded-md border p-3 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{t("dmca_page.entry_number", { index: index + 1 })}</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {repeater.itemSchema.map((item) => renderItem(item, [...path, index, item.key]))}
              </div>
            </div>
          ))}
        </div>
      </div>
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

  return <div className="space-y-4">{schema.map((item) => renderItem(item, [item.key]))}</div>;
}
