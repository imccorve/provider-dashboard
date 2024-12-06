import { useState } from "react";
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
import PatientTable from "@/components/patient-table";
import { Patient } from "@/types/patient";

interface FilterParams {
  name?: string;
  status?: string;
  ordering?: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function PatientList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<FilterParams>({
    name: "",
    status: "",
    ordering: "-created_at",
  });
  
  const queryString = new URLSearchParams({
    ...Object.fromEntries(
      Object.entries(filters).filter(
        ([key, value]) => value && !(key === "status" && value === "all")
      )
    ),
  }).toString();

  const { data } = useSWR<Patient>(
    `http://localhost:8000/api/patients/?${queryString}`,
    fetcher
  );

  return (
    <div className="space-y-4">
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
        </div>
      </div>

      <PatientTable data={data} />
    </div>
  );
}