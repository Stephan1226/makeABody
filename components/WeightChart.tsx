"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Entry } from "@/lib/db";
import { colors } from "@/lib/theme";

export default function WeightChart({
  entries,
  season1Target,
  season2Target,
  startWeight,
  height = 200,
  recent,
}: {
  entries: Entry[];
  season1Target: number;
  season2Target: number | null;
  startWeight: number;
  height?: number;
  recent?: number; // 최근 N개만
}) {
  const sliced = recent ? entries.slice(-recent) : entries;
  const data = sliced.map((e) => ({
    date: e.date,
    label: e.date.slice(5).replace("-", "/"), // MM/DD
    weight: e.weight,
  }));

  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-lg bg-surface text-sm text-text-faint shadow-card"
        style={{ height }}
      >
        기록을 남기면 추이 그래프가 그려져요
      </div>
    );
  }

  const weights = data.map((d) => d.weight);
  const referencePoints = [season1Target, season2Target ?? season1Target, startWeight];
  const min = Math.min(...weights, ...referencePoints);
  const max = Math.max(...weights, ...referencePoints);
  const pad = 0.6;

  return (
    <div className="rounded-lg bg-surface p-4 pr-5 shadow-card" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -16 }}>
          <CartesianGrid stroke={colors.border} strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: colors.textFaint }}
            tickLine={false}
            axisLine={{ stroke: colors.border }}
            minTickGap={20}
          />
          <YAxis
            domain={[Math.floor(min - pad), Math.ceil(max + pad)]}
            tick={{ fontSize: 11, fill: colors.textFaint }}
            tickLine={false}
            axisLine={false}
            width={40}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 10,
              border: `1px solid ${colors.border}`,
              fontSize: 12,
              boxShadow: "none",
            }}
            labelFormatter={(l) => `${l}`}
            formatter={(v) => [`${v} kg`, "체중"]}
          />
          <ReferenceLine
            y={season1Target}
            stroke={colors.season1}
            strokeDasharray="4 4"
            label={{ value: `시즌1 ${season1Target}`, fontSize: 10, fill: colors.season1, position: "insideTopRight" }}
          />
          {season2Target !== null && (
            <ReferenceLine
              y={season2Target}
              stroke={colors.season2}
              strokeDasharray="4 4"
              label={{ value: `시즌2 ${season2Target}`, fontSize: 10, fill: colors.season2, position: "insideBottomRight" }}
            />
          )}
          <Line
            type="monotone"
            dataKey="weight"
            stroke={colors.primary}
            strokeWidth={2.5}
            dot={{ r: 3, fill: colors.primary, strokeWidth: 0 }}
            activeDot={{ r: 5 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
