"use client";
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export function PatientFormFields({
  formData,
  handleChange,
  isEditMode = false,
}) {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Basic Information</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>First Name</Label>
            <Input
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Middle Name</Label>
            <Input
              name="middle_name"
              value={formData.middle_name}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label>Last Name</Label>
            <Input
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Date of Birth</Label>
            <Input
              type="date"
              name="date_of_birth"
              value={
                isEditMode
                  ? formData.date_of_birth.split("T")[0]
                  : formData.date_of_birth
              }
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              name="status"
              value={formData.status}
              onValueChange={(value) =>
                handleChange({ target: { name: "status", value } })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INQUIRY">Inquiry</SelectItem>
                <SelectItem value="ONBOARDING">Onboarding</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="CHURNED">Churned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}