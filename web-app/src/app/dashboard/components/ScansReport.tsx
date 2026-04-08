"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Switch } from "../../../components/ui/switch";
import { useTranslation } from "react-i18next";
import { ScansReportModal } from "./scans-report/ScansReportModal";
import { ScansReportTable } from "./scans-report/ScansReportTable";
import { useScansReportData } from "./scans-report/useScansReportData";
import { ScanRow, SortDirection, SortField } from "./scans-report/types";

export default function ScansReport() {
  const { t } = useTranslation();
  const { scans, loading, error, selectedDate, setSelectedDate } = useScansReportData();

  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [sortByDate, setSortByDate] = useState(false);
  const [onlyUncredited, setOnlyUncredited] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedArtwork, setSelectedArtwork] = useState<ScanRow | null>(null);
  const rowsPerPage = 4;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else if (sortDirection === 'desc') { setSortDirection(null); setSortField(null); }
    } else { setSortField(field); setSortDirection('asc'); }
  };

  const filteredAndSortedScans = useMemo(() => {
    let result = [...scans];

    if (searchQuery) {
      result = result.filter(scan =>
        scan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scan.mostRecentSource.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (sortByDate && selectedDate) result = result.filter(scan => scan.mostRecentDate.split('T')[0] === selectedDate);
    if (onlyUncredited) result = result.filter(scan => scan.matches > scan.creditedMatches);

    if (sortField && sortDirection) {
      result.sort((a, b) => {
        let aValue: string | number = a[sortField];
        let bValue: string | number = b[sortField];
        if (typeof aValue === 'string') {
          return sortDirection === 'asc' ? aValue.localeCompare(bValue as string) : (bValue as string).localeCompare(aValue);
        } else {
          return sortDirection === 'asc' ? aValue - (bValue as number) : (bValue as number) - aValue;
        }
      });
    }

    return result;
  }, [scans, searchQuery, sortField, sortDirection, sortByDate, selectedDate, onlyUncredited]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedScans.length / rowsPerPage));

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortField, sortDirection, sortByDate, selectedDate, onlyUncredited]);

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  return (
    <Card className="lg:col-span-2 w-full">
      <CardHeader>
        <CardTitle className="text-2xl">{t("dashboard_page.scans_report.scan_report")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4 items-center">
            <Input type="text" placeholder={t("dashboard_page.scans_report.Search_by_name")} className="w-48" value={searchQuery} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)} />
          </div>
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <Label htmlFor="sort-by-date">{t("dashboard_page.scans_report.sort_date")}</Label>
              <Switch id="sort-by-date" checked={sortByDate} onCheckedChange={setSortByDate} />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="only-uncredited">{t("dashboard_page.scans_report.only_uncredited")}</Label>
              <Switch id="only-uncredited" checked={onlyUncredited} onCheckedChange={setOnlyUncredited} />
            </div>
          </div>
        </div>

        <ScansReportTable
          loading={loading}
          rows={filteredAndSortedScans}
          rowsPerPage={rowsPerPage}
          currentPage={currentPage}
          totalPages={totalPages}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          onSelectArtwork={setSelectedArtwork}
          onPrevPage={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          onNextPage={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
        />
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {t("dashboard_page.scans_report.failed_to_load")}
          </p>
        )}
        </CardContent>

      <ScansReportModal artwork={selectedArtwork} onClose={() => setSelectedArtwork(null)} />
    </Card>
  );
}
