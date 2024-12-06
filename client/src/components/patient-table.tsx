"use client";
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getStatusColor } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const PatientTable = ({ data }) => {
  if (!data?.results || data.results.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center">
        <p className="text-muted-foreground">No patients found</p>
      </div>
    );
  }
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>DOB</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.results?.map((patient) => (
            <TableRow key={patient.id}>
              <TableCell className="font-medium">
                {patient.first_name} {patient.middle_name} {patient.last_name}
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(patient.status)}>
                  {patient.status}
                </Badge>
              </TableCell>
              <TableCell>
                {new Date(patient.date_of_birth).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/patients/${patient.id}`}>View Details</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PatientTable;