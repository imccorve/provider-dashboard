"use client";

import { useState } from "react";
import useSWR from "swr";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Patient } from "@/types/patient";
import EditPanel from "./components/edit-panel";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function PatientDetail() {
  const [isEditingOpen, setIsEditingOpen] = useState(false);
  const params = useParams();

  const {
    data: patient,
    error,
    mutate,
  } = useSWR<Patient>(
    `http://localhost:8000/api/patients/${params.id}/`,
    fetcher
  );

  if (error) return <div className="p-6">Failed to load patient</div>;
  if (!patient) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Patient Header */}
          <div className="bg-white rounded-lg border p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold">
                  {patient.first_name}{" "}
                  {patient.middle_name ? `${patient.middle_name} ` : ""}
                  {patient.last_name}
                </h1>
              </div>
            </div>
          </div>

          {/* Patient Information */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Patient Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-500">First Name</Label>
                      <p>{patient.first_name}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Middle Name</Label>
                      <p>{patient.middle_name}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Last Name</Label>
                      <p>{patient.last_name}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Date of Birth</Label>
                      <p>
                        {new Date(patient.date_of_birth).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <EditPanel
        patient={patient}
        mutate={mutate}
        isOpen={isEditingOpen}
        onClose={() => setIsEditingOpen(false)}
      />
    </div>
  );
}