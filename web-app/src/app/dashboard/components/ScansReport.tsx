"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Switch } from "../../../components/ui/switch";
import { Image as ImageIcon, ArrowUpDown, ArrowUp, ArrowDown, X } from "lucide-react";

interface MatchingPage {
  id: string;
  artworkId: string;
  category: string;
  url: string;
  websiteName: string;
  imageUrl: string;
  pageTitle: string;
  firstDetectedAt: string;
}

interface Artwork {
  id: string;
  originalFilename: string;
  title: string;
  description?: string;
  storageKey?: string;
}

interface ScanRow {
  artworkId: string;
  title: string;
  imageUrl?: string;
  matches: number;
  creditedMatches: number;
  mostRecentSource: string;
  mostRecentDate: string;
  matchingPages: MatchingPage[];
}

interface ArtworksReportEntry {
  artworkId: string;
  matchingPages: MatchingPage[];
}

interface ArtworksReport {
  detectionDate: string;
  entries: ArtworksReportEntry[];
}

type SortField = 'title' | 'matches' | 'creditedMatches' | 'mostRecentDate';
type SortDirection = 'asc' | 'desc' | null;

export default function ScansReport() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [sortByDate, setSortByDate] = useState(false);
  const [onlyUncredited, setOnlyUncredited] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [scans, setScans] = useState<ScanRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArtwork, setSelectedArtwork] = useState<ScanRow | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const rowsPerPage = 4;

  useEffect(() => {
    const fetchData = async () => {
      const token = getAuthToken();
      if (!token) {
        setLoading(false);
        return;
      }

      const userId = getUserIdFromToken(token);
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";
        const base = API_BASE.replace(/\/+$/, "");

        const artworksRes = await fetch(`${base}/artworks/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const artworksResponse = await artworksRes.json();
        const artworks: Artwork[] = Array.isArray(artworksResponse) ? artworksResponse : (artworksResponse.data || []);

        const reportRes = await fetch(`${base}/reports/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const reportResponse = await reportRes.json();
        const fullReport: ArtworksReport = reportResponse.data || reportResponse;
        const reportEntries = fullReport?.entries || [];

        if (reportEntries.length === 0) {
          setScans(artworks.map(art => ({
            artworkId: art.originalFilename,
            title: art.title || `Artwork`,
            matches: 0,
            creditedMatches: 0,
            mostRecentSource: "N/A",
            mostRecentDate: new Date().toISOString(),
            matchingPages: [],
          })));
          setSelectedDate(new Date().toISOString().split('T')[0]);
          setLoading(false);
          return;
        }

        const artworkStorageKeys = artworks
          .map((art) => art.storageKey)
          .filter((key): key is string => !!key);

        let downloadUrlsByStorageKey: Record<string, string> = {};
        if (artworkStorageKeys.length > 0) {
          const downloadUrlsRes = await fetch(`${base}/storage/artworks/download-urls`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ storageKeys: artworkStorageKeys }),
          });

          if (downloadUrlsRes.ok) {
            const rawUrls = await downloadUrlsRes.json();
            downloadUrlsByStorageKey = rawUrls.data || rawUrls || {};
          }
        }

        const matchesByArtwork = new Map<string, MatchingPage[]>();
        reportEntries.forEach((entry) => {
          matchesByArtwork.set(entry.artworkId, entry.matchingPages || []);
        });

        const scanRows: ScanRow[] = artworks.map(art => {
          const matches = matchesByArtwork.get(art.id) || [];
          const mostRecentMatch = matches.length > 0
            ? matches.reduce((prev, curr) => 
                new Date(curr.firstDetectedAt) > new Date(prev.firstDetectedAt) ? curr : prev
              )
            : null;

          const artworkImageUrl = art.storageKey
            ? downloadUrlsByStorageKey[art.storageKey]
            : undefined;

          return {
            artworkId: art.originalFilename,
            title: art.title || art.originalFilename.split('.').slice(0, -1).join('.'),
            imageUrl: artworkImageUrl,
            matches: matches.length,
            creditedMatches: 0,
            mostRecentSource: mostRecentMatch ? mostRecentMatch.websiteName : "N/A",
            mostRecentDate: mostRecentMatch?.firstDetectedAt || new Date().toISOString(),
            matchingPages: matches,
          };
        });

        setScans(scanRows);
        setSelectedDate(new Date(fullReport.detectionDate).toISOString().split('T')[0]);
      } catch (err) {
        console.error("Failed to fetch report data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else if (sortDirection === 'desc') { setSortDirection(null); setSortField(null); }
    } else { setSortField(field); setSortDirection('asc'); }
  };

  const filteredAndSortedScans = useMemo(() => {
    let result = [...mockScans];

    if (searchQuery) {
      result = result.filter(scan =>
        scan.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scan.source.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (sortByDate && selectedDate) result = result.filter(scan => scan.date === selectedDate);
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
  }, [searchQuery, sortField, sortDirection, sortByDate, selectedDate, onlyUncredited]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4 ml-1 opacity-30" />;
    if (sortDirection === 'asc') return <ArrowUp className="w-4 h-4 ml-1" />;
    if (sortDirection === 'desc') return <ArrowDown className="w-4 h-4 ml-1" />;
    return <ArrowUpDown className="w-4 h-4 ml-1 opacity-30" />;
  };

  const getGradientColor = (percentage: number, reverse: boolean = false) => {
    const normalized = Math.max(0, Math.min(100, percentage)) / 100;
    const value = reverse ? 1 - normalized : normalized;
    let r, g, b;
    if (value < 0.5) { r = Math.round(value * 2 * 200 + 55); g = 200; b = 50; }
    else { r = 220; g = Math.round((1 - (value - 0.5) * 2) * 180 + 40); b = 40; }
    return `rgb(${r}, ${g}, ${b})`;
  };

  return (
    <Card className="lg:col-span-2 w-full">
      <CardHeader>
        <CardTitle className="text-2xl">{t("dashboard_page.scans_report.scan_report")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4 items-center">
            <Input type="date" value={selectedDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedDate(e.target.value)} className="w-auto" />
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

          {loading ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">Loading scans...</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 cursor-pointer hover:bg-muted/50" onClick={() => handleSort('title')}>
                        <div className="flex items-center">Name<SortIcon field="title" /></div>
                      </th>
                      <th className="text-left py-3 px-2">Image</th>
                      <th className="text-left py-3 px-2 cursor-pointer hover:bg-muted/50" onClick={() => handleSort('matches')}>
                        <div className="flex items-center">Number of Matches<SortIcon field="matches" /></div>
                      </th>
                      <th className="text-left py-3 px-2 cursor-pointer hover:bg-muted/50" onClick={() => handleSort('creditedMatches')}>
                        <div className="flex items-center">Credited Matches<SortIcon field="creditedMatches" /></div>
                      </th>
                      <th className="text-left py-3 px-2">Most recent source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSortedScans.length === 0 ? (
                      <>
                        <tr>
                          <td colSpan={5} className="text-center py-8 text-muted-foreground">No scans found</td>
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
                        {paginatedScans.map((scan) => (
                          <tr 
                            key={`${scan.artworkId}-${scan.title}-${scan.mostRecentDate}`} 
                            className="border-b hover:bg-muted/50 cursor-pointer"
                            onClick={() => setSelectedArtwork(scan)}
                          >
                            <td className={`${TABLE_ROW_CELL_CLASS} text-gray-500`}>{(scan.title || "Unknown").substring(0, 20)}</td>
                            <td className={TABLE_ROW_CELL_CLASS}>
                              {scan.imageUrl ? (
                                <img
                                  src={scan.imageUrl}
                                  alt={scan.title}
                                  className="w-12 h-12 object-cover rounded"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
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
                                  textShadow: '0 0 3px rgba(0,0,0,0.8), 1px 1px 2px rgba(0,0,0,0.5)' 
                                }}
                              >
                                {scan.matches}
                              </span>
                            </td>
                            <td className={TABLE_ROW_CELL_CLASS}>
                              <span className="px-3 py-1 rounded text-gray-700 font-bold">N/A</span>
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
                  Page {currentPage} / {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded border border-border text-sm disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded border border-border text-sm disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      {selectedArtwork && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{selectedArtwork.title || "Unknown Artwork"}</CardTitle>
              <button
                onClick={() => setSelectedArtwork(null)}
                className="p-1 hover:bg-muted rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p><strong>Total Matches:</strong> {selectedArtwork.matches}</p>
                <p><strong>Most Recent Source:</strong> {selectedArtwork.mostRecentSource}</p>
              </div>

              {selectedArtwork.matchingPages.length > 0 ? (
                <div className="space-y-3">
                  <h3 className="font-semibold">All Detected Reposts:</h3>
                  {selectedArtwork.matchingPages.map((page) => (
                    <div key={`${page.artworkId}-${page.id}-${page.url}-${page.firstDetectedAt}`} className="border rounded-lg p-3">
                      <div className="flex gap-3">
                        {page.imageUrl && (
                          <img
                            src={page.imageUrl}
                            alt="Detected"
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div className="flex-grow text-sm">
                          <p><strong>Category:</strong> {page.category}</p>
                          <p><strong>Website:</strong> {page.websiteName}</p>
                          <p><strong>Title:</strong> {page.pageTitle}</p>
                          <p><strong>Found:</strong> {new Date(page.firstDetectedAt).toLocaleString('fr-FR')}</p>
                          <a
                            href={page.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 inline-block mt-2"
                          >
                            Visit →
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No matches found for this artwork</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
