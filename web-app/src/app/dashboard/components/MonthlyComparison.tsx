"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";

const monthlyData = [
  { month: "Jan", lastMonth: 3004, thisMonth: 4504 },
  { month: "Feb", lastMonth: 3200, thisMonth: 4200 },
  { month: "Mar", lastMonth: 2800, thisMonth: 4000 },
  { month: "Apr", lastMonth: 3100, thisMonth: 4300 },
  { month: "May", lastMonth: 2900, thisMonth: 4100 },
  { month: "Jun", lastMonth: 3000, thisMonth: 4500 },
];

export default function MonthlyComparison() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Monthly Comparison Graphs</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full h-72">
          <svg viewBox="0 0 600 160" preserveAspectRatio="none" className="w-full">
            <defs>
              <linearGradient id="gThis" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#16a34a" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#16a34a" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="gLast" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#2563eb" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
              </linearGradient>
            </defs>
            {
              (() => {
                const width = 600;
                const height = 120;
                const padding = 20;
                const max = Math.max(...monthlyData.map(d => Math.max(d.thisMonth, d.lastMonth)));
                const pointsThis = monthlyData.map((d, i) => {
                  const x = padding + (i * (width - padding * 2)) / (monthlyData.length - 1);
                  const y = height - (d.thisMonth / max) * (height - 10) + 10;
                  return [x, y];
                });
                const pointsLast = monthlyData.map((d, i) => {
                  const x = padding + (i * (width - padding * 2)) / (monthlyData.length - 1);
                  const y = height - (d.lastMonth / max) * (height - 10) + 10;
                  return [x, y];
                });

                const pathFromPoints = (pts: number[][]) => pts.map((p, i) => `${i===0? 'M':'L'} ${p[0]} ${p[1]}`).join(' ');

                const areaPath = (pts: number[][]) => {
                  const line = pathFromPoints(pts);
                  const last = pts[pts.length-1];
                  const first = pts[0];
                  return `${line} L ${last[0]} ${height+20} L ${first[0]} ${height+20} Z`;
                }

                return (
                  <g>
                    <path d={areaPath(pointsThis)} fill="url(#gThis)" stroke="none" />
                    <path d={pathFromPoints(pointsThis)} fill="none" stroke="#16a34a" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

                    <path d={areaPath(pointsLast)} fill="url(#gLast)" stroke="none" />
                    <path d={pathFromPoints(pointsLast)} fill="none" stroke="#2563eb" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

                    {pointsThis.map((p, i) => (
                      <circle key={`t-${i}`} cx={p[0]} cy={p[1]} r={3.5} fill="#16a34a" />
                    ))}
                    {pointsLast.map((p, i) => (
                      <circle key={`l-${i}`} cx={p[0]} cy={p[1]} r={3.5} fill="#2563eb" />
                    ))}

                    {monthlyData.map((d, i) => {
                      const x = padding + (i * (600 - padding * 2)) / (monthlyData.length - 1);
                      return <text key={`lab-${i}`} x={x} y={150} fontSize={10} textAnchor="middle" fill="#6b7280">{d.month}</text>
                    })}
                  </g>
                )
              })()
            }
          </svg>

          <div className="flex items-center gap-6 mt-3 text-sm text-muted-foreground flex-wrap">
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-blue-500 inline-block"></span> <span>Last Month Average</span> <span className="font-semibold ml-2">3,004 credited matches</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-green-500 inline-block"></span> <span>This Month Average</span> <span className="font-semibold ml-2">4,504 credited matches</span></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
