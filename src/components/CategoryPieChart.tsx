"use client";

import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { getCategoryColor } from "@/lib/category-colors";

interface CategoryStat {
  category: {
    id: number;
    name: string;
    slug: string;
  };
  count: number;
}

interface CategoryPieChartProps {
  categoryStats: CategoryStat[];
}

export function CategoryPieChart({ categoryStats }: CategoryPieChartProps) {
  const data = categoryStats.map(({ category, count }) => ({
    name: category.name,
    slug: category.slug,
    value: count,
  }));

  return (
    <div
      style={{
        backgroundColor: "white",
        border: "1px solid #DFDFDF",
        borderRadius: "8px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
        padding: "26px 20px",
        display: "flex",
        alignItems: "center",
        gap: "32px",
      }}
    >
      <PieChart width={220} height={220}>
        <Pie
          data={data}
          cx={105}
          cy={105}
          innerRadius={0}
          outerRadius={100}
          dataKey="value"
          strokeWidth={2}
        >
          {data.map((entry, index) => {
            const colors = getCategoryColor(entry.slug);
            return (
              <Cell
                key={`cell-${index}`}
                fill={colors.bg}
                stroke={colors.text}
              />
            );
          })}
        </Pie>
        <Tooltip
          formatter={(value: number, name: string) => [value, name]}
          contentStyle={{
            fontFamily: "Source Sans 3, sans-serif",
            fontSize: "14px",
            borderRadius: "6px",
            border: "1px solid #DFDFDF",
          }}
        />
      </PieChart>

      {/* Custom legend */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {categoryStats.map(({ category, count }) => {
          const colors = getCategoryColor(category.slug);
          return (
            <div
              key={category.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  backgroundColor: colors.bg,
                  border: `2px solid ${colors.text}`,
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontFamily: "Source Sans 3, sans-serif",
                  fontSize: "14px",
                  color: "#000",
                  whiteSpace: "nowrap",
                }}
              >
                {category.name} &mdash; {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
