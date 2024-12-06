"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import useSWR from "swr";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
  } from "@/components/ui/pagination";
import PatientTable from "@/components/patient-table";
import { Patient } from "@/types/patient";
import { Button } from "@/components/ui/button";
import PatientStats from "@/components/patient-stats";

interface PaginatedResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Patient[];
}

interface FilterParams {
  name?: string;
  status?: string;
  ordering?: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function PatientList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterParams>({
    name: "",
    status: "",
    ordering: "-created_at",
  });
  
  const queryString = new URLSearchParams({
    page: currentPage.toString(),
    page_size: "10",
    ...Object.fromEntries(
      Object.entries(filters).filter(
        ([key, value]) => value && !(key === "status" && value === "all")
      )
    ),
  }).toString();

  const { data } = useSWR<PaginatedResponse>(
    `http://localhost:8000/api/patients/?${queryString}`,
    fetcher
  );

  const totalPages = data ? Math.ceil(data.count / 10) : 0;

  // Debounce the name search to avoid too many API calls
  useEffect(() => {
      const timeoutId = setTimeout(() => {
        setFilters((prev) => ({ ...prev, name: searchTerm }));
      }, 300);
  
      return () => clearTimeout(timeoutId);
  }, [searchTerm]);
    
  return (
    <div className="space-y-4">
      <PatientStats />
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search patients..."
              className="pl-10 pr-4 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-3 items-center">
          <Select
            value={filters.status}
            onValueChange={(value) =>
              setFilters((prev) => ({ ...prev, status: value }))
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="INQUIRY">Inquiry</SelectItem>
              <SelectItem value="ONBOARDING">Onboarding</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="CHURNED">Churned</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.ordering}
            onValueChange={(value) =>
              setFilters((prev) => ({ ...prev, ordering: value }))
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="-created_at">Newest First</SelectItem>
              <SelectItem value="created_at">Oldest First</SelectItem>
              <SelectItem value="last_name">Name A-Z</SelectItem>
              <SelectItem value="-last_name">Name Z-A</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
              <Link href="/patients/add">
                <Button variant="default">Add Patient</Button>
              </Link>
              <Link href="/settings">
                <Button variant="default">Settings</Button>
              </Link>
            </div>
        </div>
      <PatientTable data={data} />
      </div>
        {/* Pagination */}
        {totalPages > 1 && (
        <div className="mt-4 mb-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => {
                    if (currentPage > 1) {
                      setCurrentPage(currentPage - 1);
                      window.scrollTo(0, 0);
                    }
                  }}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }).map((_, i) => (
                <PaginationItem key={i + 1}>
                  <PaginationLink
                    onClick={() => {
                      setCurrentPage(i + 1);
                      window.scrollTo(0, 0);
                    }}
                    isActive={currentPage === i + 1}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => {
                    if (currentPage < totalPages) {
                      setCurrentPage(currentPage + 1);
                      window.scrollTo(0, 0);
                    }
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}