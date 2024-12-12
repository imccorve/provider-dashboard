"use client";

import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const addressSchema = z.object({
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
  is_primary: z.boolean().default(false),
}).refine(
    data => {
      // Check if at least one field has a value
      return !Object.values(data).some(Boolean) ||
             (data.street || data.city || data.state || data.zip_code);
    },
    {
      message: "Address must have at least one field filled out if not empty",
    }
  );

const customFieldSchema = z.object({
  template_id: z.string(),
  value: z.string(),
});

export const patientFormSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  middle_name: z.string().optional(),
  last_name: z.string().min(1, "Last name is required"),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  status: z.enum(["INQUIRY", "ONBOARDING", "ACTIVE", "CHURNED"]),
  addresses: z.array(addressSchema).default([])
    .refine(
      addresses => {
        if (addresses.length === 0) return true;
        const primaryCount = addresses.filter(addr => addr.is_primary).length;
        return primaryCount === 1;
      },
      {
        message: "Must have one primary address",
      }
    ),
  custom_fields: z.array(customFieldSchema),
});

export type PatientFormValues = z.infer<typeof patientFormSchema>;

interface PatientFormProps {
  initialData?: PatientFormValues;
  customFieldTemplates: any[];
  onSubmit: (data: PatientFormValues) => Promise<void>;
  submitButtonText?: string;
  onCancel?: () => void;
  isEditMode?: boolean;
  resetAfterSubmit?: boolean;
}

export function PatientForm({
  initialData,
  customFieldTemplates = [],
  onSubmit,
  submitButtonText = "Save",
  onCancel,
  isEditMode = false,
  resetAfterSubmit = false,
}: PatientFormProps) {
  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: initialData || {
      first_name: "",
      middle_name: "",
      last_name: "",
      date_of_birth: "",
      status: "INQUIRY",
      addresses: [],
      custom_fields: customFieldTemplates.map(template => ({
        template_id: template.id,
        value: "",
      })),
    },
  });

  const { fields: addressFields, append, remove } = useFieldArray({
    name: "addresses",
    control: form.control,
  });

  const handlePrimaryChange = (index: number) => {
    const addresses = form.getValues("addresses");
    const updatedAddresses = addresses.map((addr, i) => ({
      ...addr,
      is_primary: i === index,
    }));
    form.setValue("addresses", updatedAddresses, { 
      shouldValidate: true
    });
  };

  const handleAddAddress = () => {
    const currentAddresses = form.getValues("addresses");
    append({
      street: "",
      city: "",
      state: "",
      zip_code: "",
      is_primary: currentAddresses.length === 0, // First address is primary
    });
  };

  const handleRemoveAddress = (index: number) => {
    const addresses = form.getValues("addresses");
    const isRemovingPrimary = addresses[index].is_primary;
    
    remove(index);
  
    // If we removed the primary and there are still addresses, make the first one primary
    if (isRemovingPrimary && addresses.length > 1) {
      const remaining = form.getValues("addresses");
      if (remaining.length > 0) {
        const updatedAddresses = remaining.map((addr, i) => ({
          ...addr,
          is_primary: i === 0,
        }));
        form.setValue("addresses", updatedAddresses, {
          shouldValidate: true
        });
      }
    }
  };
  const handleSubmit = async (data: PatientFormValues) => {
    console.log("Patientform handleSubmit called with:", data);
    const validAddresses = data.addresses.filter(
      (addr) => addr.street || addr.city || addr.state || addr.zip_code
    );
  
    const processedData = {
      ...data,
      addresses: validAddresses
    };
  
    try {
      await onSubmit(processedData);
      if (resetAfterSubmit) {
        form.reset(form.formState.defaultValues);
      }
    } catch (error) {
      console.error("Error in form submission:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(handleSubmit)} className="space-y-8">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Basic Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="middle_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Middle Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date_of_birth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      {...field} 
                      value={isEditMode ? field.value?.split("T")[0] : field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="INQUIRY">Inquiry</SelectItem>
                      <SelectItem value="ONBOARDING">Onboarding</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="CHURNED">Churned</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Additional Information</h2>
          {customFieldTemplates.map((template) => (
            <FormField
              key={template.id}
              control={form.control}
              name={`custom_fields.${template.id}.value`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {template.name}
                    {template.is_required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </FormLabel>
                  {template.description && (
                    <p className="text-sm text-gray-500">{template.description}</p>
                  )}
                  <FormControl>
                    <Input {...field} placeholder={`Enter ${template.name.toLowerCase()}`} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Addresses</h2>
            <Button
              type="button"
              variant="outline"
              onClick={handleAddAddress}
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Address
            </Button>
          </div>

          {addressFields.map((field, index) => (
            <div key={field.id} className="p-4 border rounded-lg space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="radio"
                  id={`primary-${index}`}
                  name="primary-address"
                  checked={form.getValues(`addresses.${index}.is_primary`)}
                  onChange={() => handlePrimaryChange(index)}
                  className="h-4 w-4"
                />
                <FormLabel htmlFor={`primary-${index}`} className="flex items-center gap-2">
                  Primary Address
                  {form.getValues(`addresses.${index}.is_primary`) && (
                    <span className="text-sm text-green-600 font-medium">
                      (Current Primary)
                    </span>
                  )}
                </FormLabel>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name={`addresses.${index}.street`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`addresses.${index}.city`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`addresses.${index}.state`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                          maxLength={2}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`addresses.${index}.zip_code`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ZIP Code</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {addressFields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => handleRemoveAddress(index)}
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

        <div className="flex justify-end gap-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit">{submitButtonText}</Button>
        </div>
      </form>
    </Form>
  );
}