"use client";

import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface StatsData {
  status_distribution: Array<{ status: string; count: number }>;
  new_patients_30d: number;
  monthly_growth: number;
  total_patients: number;
}

export default function PatientStats() {
  const { data, error } = useSWR<StatsData>(
    "http://localhost:8000/api/patients/stats/",
    fetcher
  );

  if (error) return <div>Failed to load stats</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <div className="grid gap-4 md:grid-cols-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Total Patients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.total_patients}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>New Patients (30d)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.new_patients_30d}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.status_distribution.map((item) => (
              <div key={item.status} className="flex justify-between">
                <span>{item.status}</span>
                <span className="font-bold">{item.count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}