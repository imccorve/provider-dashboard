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
import { Plus, Trash } from "lucide-react";
import { Button } from "./ui/button";

export function PatientFormFields({
  formData,
  handleChange,
  handleAddressChange,
  handlePrimaryChange,
  addAddress,
  removeAddress,
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
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Addresses</h2>
          <Button
            type="button"
            variant="outline"
            onClick={addAddress}
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Address
          </Button>
        </div>

        {formData.addresses.map((address, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <input
                type="radio"
                id={`primary-${index}`}
                name="primary-address"
                checked={address.is_primary}
                onChange={() => handlePrimaryChange(index)}
                className="h-4 w-4"
              />
              <Label
                htmlFor={`primary-${index}`}
                className="flex items-center gap-2"
              >
                Primary Address
                {address.is_primary && (
                  <span className="text-sm text-green-600 font-medium">
                    (Current Primary)
                  </span>
                )}
              </Label>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Street</Label>
                <Input
                  value={address.street || ""}
                  onChange={(e) =>
                    handleAddressChange(index, "street", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>City</Label>
                <Input
                  value={address.city || ""}
                  onChange={(e) =>
                    handleAddressChange(index, "city", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <Input
                  value={address.state}
                  onChange={(e) =>
                    handleAddressChange(
                      index,
                      "state",
                      e.target.value.toUpperCase()
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>ZIP Code</Label>
                <Input
                  value={address.zip_code}
                  onChange={(e) =>
                    handleAddressChange(index, "zip_code", e.target.value)
                  }
                />
              </div>
            </div>
            {formData.addresses.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => removeAddress(index)}
                size="sm"
                className="text-red-600 hover:text-red-700"
              >
                <Trash className="w-4 h-4 mr-2" />
                Remove Address
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}