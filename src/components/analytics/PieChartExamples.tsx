"use client"

import { PieChart } from "./PieChart"

export function SalesPieChart() {
  const salesData = [
    { label: "Electronics", value: 1250000 },
    { label: "Clothing", value: 980000 },
    { label: "Home & Kitchen", value: 750000 },
    { label: "Books", value: 450000 },
    { label: "Sports", value: 320000 },
  ]

  return (
    <PieChart
      data={salesData}
      title="Sales by Category"
      showTitle={true}
      layout="chart-left"
      labelPosition="right"
      showPercentages={true}
    />
  )
}

export function SimplePieChart() {
  const data = [
    { label: "Category A", value: 400 },
    { label: "Category B", value: 300 },
    { label: "Category C", value: 200 },
    { label: "Category D", value: 100 },
  ]

  return (
    <PieChart
      data={data}
      layout="chart-center"
      labelPosition="hidden"
      chartSize={250}
      outerRadius={100}
    />
  )
}

export function TrafficSourcesChart() {
  const data = [
    { label: "Organic Search", value: 45 },
    { label: "Direct", value: 25 },
    { label: "Social Media", value: 15 },
    { label: "Email", value: 10 },
    { label: "Paid Ads", value: 5 },
  ]

  return (
    <PieChart
      data={data}
      title="Traffic Sources"
      showTitle={true}
      layout="chart-right"
      labelPosition="left"
      colors={["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FECA57"]}
      customTooltipFormatter={(value, name) => [`${value}% - ${name}`, ""]}
    />
  )
}
