import { ArrowDown, ArrowUp, ArrowUpDown, Image as ImageIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SortDirection, SortField, ScanRow } from "./types";

interface ScansReportTableProps {
  loading: boolean;
  rows: ScanRow[];
  rowsPerPage: number;
  currentPage: number;
  totalPages: number;
  sortField: SortField | null;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  onSelectArtwork: (scan: ScanRow) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
}

const TABLE_ROW_CELL_CLASS = "py-3 px-2";

const getMatchColor = (matches: number): string => {
  if (matches === 0) return "rgb(200, 200, 200)";
  if (matches < 5) return "rgb(255, 193, 7)";
  if (matches < 10) return "rgb(255, 152, 0)";
  return "rgb(244, 67, 54)";
};

function SortIcon({
  field,
  sortField,
  sortDirection,
}: {
  field: SortField;
  sortField: SortField | null;
  sortDirection: SortDirection;
}) {
  if (sortField !== field) return <ArrowUpDown className="w-4 h-4 ml-1 opacity-30" />;
  if (sortDirection === "asc") return <ArrowUp className="w-4 h-4 ml-1" />;
  if (sortDirection === "desc") return <ArrowDown className="w-4 h-4 ml-1" />;
  return <ArrowUpDown className="w-4 h-4 ml-1 opacity-30" />;
}

export function ScansReportTable({
  loading,
  rows,
  rowsPerPage,
  currentPage,
  totalPages,
  sortField,
  sortDirection,
  onSort,
  onSelectArtwork,
  onPrevPage,
  onNextPage,
}: ScansReportTableProps) {
  const { t } = useTranslation();
  const paginatedRows = rows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const emptyRowsCount = Math.max(0, rowsPerPage - paginatedRows.length);

  if (loading) {
    return <div className="flex-1 flex items-center justify-center text-muted-foreground">{t("dashboard_page.scans_report.loading")}</div>;
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-2 cursor-pointer hover:bg-muted/50" onClick={() => onSort("title")}>
                <div className="flex items-center">
                  {t("dashboard_page.scans_report.name")}
                  <SortIcon field="title" sortField={sortField} sortDirection={sortDirection} />
                </div>
              </th>
              <th className="text-left py-3 px-2">{t("dashboard_page.scans_report.image")}</th>
              <th className="text-left py-3 px-2 cursor-pointer hover:bg-muted/50" onClick={() => onSort("matches")}>
                <div className="flex items-center">
                  {t("dashboard_page.scans_report.number_of_matches")}
                  <SortIcon field="matches" sortField={sortField} sortDirection={sortDirection} />
                </div>
              </th>
              <th className="text-left py-3 px-2 cursor-pointer hover:bg-muted/50" onClick={() => onSort("creditedMatches")}>
                <div className="flex items-center">
                  {t("dashboard_page.scans_report.credited_matches")}
                  <SortIcon field="creditedMatches" sortField={sortField} sortDirection={sortDirection} />
                </div>
              </th>
              <th className="text-left py-3 px-2">{t("dashboard_page.scans_report.most_recent")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <>
                <tr>
                  <td colSpan={5} className="text-center py-8 text-muted-foreground">{t("dashboard_page.scans_report.no_scans")}</td>
                </tr>
                {Array.from({ length: rowsPerPage - 1 }).map((_, index) => (
                  <tr key={`empty-no-data-${index}`} className="border-b">
                    <td className={TABLE_ROW_CELL_CLASS}>&nbsp;</td>
                    <td className={TABLE_ROW_CELL_CLASS}>&nbsp;</td>
                    <td className={TABLE_ROW_CELL_CLASS}>&nbsp;</td>
                    <td className={TABLE_ROW_CELL_CLASS}>&nbsp;</td>
                    <td className={TABLE_ROW_CELL_CLASS}>&nbsp;</td>
                  </tr>
                ))}
              </>
            ) : (
              <>
                {paginatedRows.map((scan) => (
                  <tr
                    key={`${scan.artworkId}-${scan.title}-${scan.mostRecentDate}`}
                    className="border-b hover:bg-muted/50 cursor-pointer"
                    onClick={() => onSelectArtwork(scan)}
                    tabIndex={0}
                    role="button"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSelectArtwork(scan);
                      }
                    }}
                  >
                    <td className={`${TABLE_ROW_CELL_CLASS} text-gray-500`}>{(scan.title || t("dashboard_page.scans_report.unknown_artwork")).substring(0, 20)}</td>
                    <td className={TABLE_ROW_CELL_CLASS}>
                      {scan.imageUrl ? (
                        <img
                          src={scan.imageUrl}
                          alt={scan.title}
                          className="w-12 h-12 object-cover rounded"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            e.currentTarget.nextElementSibling?.classList.remove("hidden");
                          }}
                        />
                      ) : null}
                      <div className={scan.imageUrl ? "hidden" : "w-12 h-12 bg-gradient-to-br from-orange-400 to-purple-600 rounded-lg flex items-center justify-center"}>
                        <ImageIcon className="w-6 h-6 text-white" />
                      </div>
                    </td>
                    <td className={TABLE_ROW_CELL_CLASS}>
                      <span
                        className="px-3 py-1 rounded text-white font-bold"
                        style={{
                          backgroundColor: getMatchColor(scan.matches),
                          textShadow: "0 0 3px rgba(0,0,0,0.8), 1px 1px 2px rgba(0,0,0,0.5)",
                        }}
                      >
                        {scan.matches}
                      </span>
                    </td>
                    <td className={TABLE_ROW_CELL_CLASS}>
                      <span className="px-3 py-1 rounded text-gray-700 font-bold">{t("dashboard_page.scans_report.not_available")}</span>
                    </td>
                    <td className={TABLE_ROW_CELL_CLASS}>
                      <span className="px-3 py-1 rounded bg-purple-900 text-white text-sm">{scan.mostRecentSource}</span>
                    </td>
                  </tr>
                ))}

                {Array.from({ length: emptyRowsCount }).map((_, index) => (
                  <tr key={`empty-${index}`} className="border-b">
                    <td className={TABLE_ROW_CELL_CLASS}>&nbsp;</td>
                    <td className={TABLE_ROW_CELL_CLASS}>&nbsp;</td>
                    <td className={TABLE_ROW_CELL_CLASS}>&nbsp;</td>
                    <td className={TABLE_ROW_CELL_CLASS}>&nbsp;</td>
                    <td className={TABLE_ROW_CELL_CLASS}>&nbsp;</td>
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>

      <div className="pt-4 border-t flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {t("dashboard_page.scans_report.page")} {currentPage} / {totalPages}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPrevPage}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded border border-border text-sm disabled:opacity-50"
          >
            {t("dashboard_page.scans_report.previous")}
          </button>
          <button
            type="button"
            onClick={onNextPage}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded border border-border text-sm disabled:opacity-50"
          >
            {t("dashboard_page.scans_report.next")}
          </button>
        </div>
      </div>
    </>
  );
}
