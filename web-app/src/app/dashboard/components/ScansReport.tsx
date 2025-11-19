"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Switch } from "../../../components/ui/switch";
import { Image as ImageIcon, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

const mockScans = [
  { id: "#01", image: "/placeholder-art-1.jpg", matches: 46, creditedMatches: 46, source: "https://google.com", color: "orange", date: "2025-08-15" },
  { id: "#02", image: "/placeholder-art-2.jpg", matches: 68, creditedMatches: 32, source: "https://instagram.com", color: "purple", date: "2025-08-16" },
  { id: "#03", image: "/placeholder-art-3.jpg", matches: 25, creditedMatches: 25, source: "https://twitter.com", color: "gray", date: "2025-08-14" },
  { id: "#04", image: "/placeholder-art-4.jpg", matches: 89, creditedMatches: 12, source: "https://facebook.com", color: "orange", date: "2025-08-17" },
];

type SortField = 'id' | 'matches' | 'creditedMatches' | 'date';
type SortDirection = 'asc' | 'desc' | null;

export default function ScansReport() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [sortByDate, setSortByDate] = useState(false);
  const [onlyUncredited, setOnlyUncredited] = useState(false);
  const [selectedDate, setSelectedDate] = useState("2025-08-17");

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
        <CardTitle className="text-2xl">Scans Report</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4 items-center">
            <Input type="date" value={selectedDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedDate(e.target.value)} className="w-auto" />
            <Input type="text" placeholder="Search by ID or source..." className="w-48" value={searchQuery} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)} />
          </div>
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <Label htmlFor="sort-by-date">Sort by date</Label>
              <Switch id="sort-by-date" checked={sortByDate} onCheckedChange={setSortByDate} />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="only-uncredited">Only uncredited</Label>
              <Switch id="only-uncredited" checked={onlyUncredited} onCheckedChange={setOnlyUncredited} />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-2 cursor-pointer hover:bg-muted/50" onClick={() => handleSort('id')}>
                  <div className="flex items-center">ID<SortIcon field="id" /></div>
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
                <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No scans found</td></tr>
              ) : (
                filteredAndSortedScans.map((scan) => (
                  <tr key={scan.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-2 text-gray-500">{scan.id}</td>
                    <td className="py-3 px-2">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-purple-600 rounded-lg flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-white" />
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <span className="px-3 py-1 rounded text-white font-bold" style={{ backgroundColor: getGradientColor(scan.matches), textShadow: '0 0 3px rgba(0,0,0,0.8), 1px 1px 2px rgba(0,0,0,0.5)' }}>{scan.matches}%</span>
                    </td>
                    <td className="py-3 px-2">
                      <span className="px-3 py-1 rounded text-white font-bold" style={{ backgroundColor: getGradientColor(scan.creditedMatches, true), textShadow: '0 0 3px rgba(0,0,0,0.8), 1px 1px 2px rgba(0,0,0,0.5)' }}>{scan.creditedMatches}%</span>
                    </td>
                    <td className="py-3 px-2">
                      <a href={scan.source} className="px-3 py-1 rounded bg-purple-900 text-white text-sm hover:bg-purple-800" target="_blank" rel="noreferrer">{scan.source}</a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
