import React from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import db from "@/db/db";
import { formatCurrency, formatNumber } from "@/lib/formatters";

async function getSalesData() {
  const data = await db.order.aggregate({
    _sum: { pricePaidInCents: true },
    _count: true,
  });
  return {
    amount: data._sum.pricePaidInCents || 0 / 100,
    numberOfSales: data._count,
    numberOfCustomers: data._count,
  };
}

async function getUserData() {
  const [userCount, orderCount] = await Promise.all([
    db.user.count(),
    db.order.aggregate({
      _count: true,
      _sum: { pricePaidInCents: true },
    }),
  ]);
  return {
    userCount,
    averageValuePerUser:
      userCount === 0
        ? 0
        : (orderCount._sum.pricePaidInCents || 0) / userCount / 100,
  };
}

async function getProductData() {
  const [activeCount, inActiveCount] = await Promise.all([
    db.product.count({
      where: { isAvailableForPurchase: true },
    }),
    db.product.count({
      where: { isAvailableForPurchase: false },
    }),
  ]);
  return { activeCount, inActiveCount };
}

export default async function AdminDashboard() {
  const [salesData, userData, productData] = await Promise.all([
    getSalesData(),
    getUserData(),
    getProductData(),
  ]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <DashboardCard
        title="Total Revenue"
        desc={`${formatNumber(salesData.numberOfSales)} Orders`}
        content={
          <div className="text-4xl font-bold">
            {formatCurrency(salesData.amount)}
          </div>
        }
      />
      <DashboardCard
        title="Customers"
        desc={`${formatCurrency(userData.averageValuePerUser)} Average Value`}
        content={
          <div className="text-4xl font-bold">{`${formatNumber(
            userData.userCount
          )} `}</div>
        }
      />
      <DashboardCard
        title="Active Products"
        desc={`${formatNumber(productData.inActiveCount)} inActive Product`}
        content={
          <div className="text-4xl font-bold">{`${formatNumber(
            productData.activeCount
          )} Active Product`}</div>
        }
      />
    </div>
  );
}

type DashboardCardProps = {
  title: string;
  desc: string;
  content: React.ReactNode;
};
function DashboardCard({ title, desc, content }: DashboardCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{desc}</CardDescription>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}
