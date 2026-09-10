"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

interface Order {
  id: string
  total: number
  created_at: string
}

interface DashboardChartProps {
  orders: Order[]
}

export function DashboardChart({ orders }: DashboardChartProps) {
  const [timeRange, setTimeRange] = useState("90d")
  const [chartType, setChartType] = useState<"revenue" | "visitors">("revenue")

  // Generate chart data based on orders
  const chartData = useMemo(() => {
    const days = timeRange === "90d" ? 90 : timeRange === "30d" ? 30 : 7
    const data: { date: string; value: number }[] = []

    // Create date range
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]

      if (chartType === "revenue") {
        // Calculate revenue for this date
        const dayRevenue = orders
          .filter((order) => order.created_at.split("T")[0] === dateStr)
          .reduce((sum, order) => sum + Number(order.total), 0)
        data.push({ date: dateStr, value: dayRevenue })
      } else {
        // Calculate unique visitors (orders) for this date
        const dayOrders = orders.filter((order) => order.created_at.split("T")[0] === dateStr).length
        data.push({ date: dateStr, value: dayOrders })
      }
    }

    return data
  }, [orders, timeRange, chartType])

  const chartConfig = {
    value: {
      label: chartType === "revenue" ? "Revenue" : "Visitors",
      color: "hsl(0, 0%, 0%)",
    },
  }

  return (
    <Card className="border border-black/10 rounded-none @container/card">
      <CardHeader className="flex flex-col gap-4 space-y-0 border-b border-black/10 p-6 sm:flex-row">
        <div className="flex-1">
          <CardTitle className="text-lg font-medium tracking-widest uppercase">
            {chartType === "revenue" ? "REVENUE ANALYTICS" : "VISITOR ANALYTICS"}
          </CardTitle>
          <CardDescription className="text-sm text-zinc-500 tracking-wide mt-1">
            <span className="hidden @[540px]/card:block">
              {timeRange === "90d" ? "Last 3 months" : timeRange === "30d" ? "Last 30 days" : "Last 7 days"}
            </span>
            <span className="@[540px]/card:hidden">
              {timeRange === "90d" ? "3 months" : timeRange === "30d" ? "30 days" : "7 days"}
            </span>
          </CardDescription>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {/* Chart Type Toggle */}
          <Select value={chartType} onValueChange={(value) => setChartType(value as "revenue" | "visitors")}>
            <SelectTrigger className="w-40 rounded-none border-black/20 text-xs tracking-widest uppercase">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-none">
              <SelectItem value="revenue" className="text-xs tracking-widest uppercase">
                REVENUE
              </SelectItem>
              <SelectItem value="visitors" className="text-xs tracking-widest uppercase">
                VISITORS
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Time Range Toggle - Desktop */}
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            className="hidden @[767px]/card:flex border border-black/20"
          >
            <ToggleGroupItem
              value="90d"
              className="rounded-none text-xs tracking-widest uppercase data-[state=on]:bg-black data-[state=on]:text-white"
            >
              3 MONTHS
            </ToggleGroupItem>
            <ToggleGroupItem
              value="30d"
              className="rounded-none text-xs tracking-widest uppercase data-[state=on]:bg-black data-[state=on]:text-white"
            >
              30 DAYS
            </ToggleGroupItem>
            <ToggleGroupItem
              value="7d"
              className="rounded-none text-xs tracking-widest uppercase data-[state=on]:bg-black data-[state=on]:text-white"
            >
              7 DAYS
            </ToggleGroupItem>
          </ToggleGroup>

          {/* Time Range Select - Mobile */}
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40 rounded-none border-black/20 text-xs tracking-widest uppercase @[767px]/card:hidden">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-none">
              <SelectItem value="90d" className="text-xs tracking-widest uppercase">
                3 MONTHS
              </SelectItem>
              <SelectItem value="30d" className="text-xs tracking-widest uppercase">
                30 DAYS
              </SelectItem>
              <SelectItem value="7d" className="text-xs tracking-widest uppercase">
                7 DAYS
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fillValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(0, 0%, 0%)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="hsl(0, 0%, 0%)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(0, 0%, 90%)" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
              className="text-xs tracking-wider uppercase"
            />
            <ChartTooltip
              cursor={{ stroke: "hsl(0, 0%, 0%)", strokeWidth: 1, strokeDasharray: "3 3" }}
              content={
                <ChartTooltipContent
                  className="rounded-none border-black/20 bg-white shadow-lg"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }}
                  formatter={(value) => {
                    if (chartType === "revenue") {
                      return [`$${Number(value).toFixed(2)}`, "Revenue"]
                    }
                    return [`${value}`, "Visitors"]
                  }}
                  indicator="dot"
                />
              }
            />
            <Area dataKey="value" type="natural" fill="url(#fillValue)" stroke="hsl(0, 0%, 0%)" strokeWidth={2} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
