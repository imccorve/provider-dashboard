import { CustomFieldTemplate } from '@/types/patient';
import { useState, useEffect } from 'react';
import useSWR from 'swr';

const initialFormState = {
    first_name: "",
    middle_name: "",
    last_name: "",
    date_of_birth: "",
    status: "INQUIRY",
    custom_fields: [],
    addresses: [{ street: "", city: "", state: "", zip_code: "", is_primary: true }],
};

export function usePatientForm(initialData = null) {
  const [formData, setFormData] = useState(initialData || initialFormState);

  const { data: customFieldTemplates } = useSWR<CustomFieldTemplate[]>(
    "http://localhost:8000/api/custom-field-templates/",
    fetcher
  );

  useEffect(() => {
    if (customFieldTemplates) {
      setFormData(prev => ({
        ...prev,
        custom_fields: customFieldTemplates.map(template => ({
          template_id: template.id,
          field_name: template.name,
          value: prev.custom_fields.find(f => f.template_id === template.id)?.value || "",
        })),
      }));
    }
  }, [customFieldTemplates]);

  const resetForm = () => {
    setFormData({
      ...initialFormState,
      custom_fields: customFieldTemplates?.map(template => ({
        template_id: template.id,
        field_name: template.name,
        value: "",
      })) || [],
    });
  };

  const handleAddressChange = (index: number, field: string, value: string) => {
    const newAddresses = [...formData.addresses];
    newAddresses[index] = {
      ...newAddresses[index],
      [field]: value,
    };
    setFormData(prev => ({ ...prev, addresses: newAddresses }));
  };

  const handlePrimaryChange = (index: number) => {
    setFormData(prev => ({
      ...prev,
      addresses: prev.addresses.map((addr, i) => ({
        ...addr,
        is_primary: i === index,
      })),
    }));
  };

  const addAddress = () => {
    setFormData(prev => ({
      ...prev,
      addresses: [
        ...prev.addresses,
        { street: "", city: "", state: "", zip_code: "", is_primary: false },
      ],
    }));
  };

  const removeAddress = (index: number) => {
    setFormData(prev => ({
      ...prev,
      addresses: prev.addresses.filter((_, i) => i !== index),
    }));
  };

  return {
    formData,
    setFormData,
    customFieldTemplates,
    handleAddressChange,
    handlePrimaryChange,
    addAddress,
    removeAddress,
    resetForm,
  };
}