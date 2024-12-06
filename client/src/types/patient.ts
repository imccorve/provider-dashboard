export interface CustomField {
  id?: string;
  name: string;
  value: string;
}

export interface CustomFieldTemplate {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
}

export interface Address {
  id?: string;
  street: string;
  city: string;
  state: string;
  zip_code: string;
  is_primary: boolean;
  custom_fields?: CustomField[];
}

export interface Patient {
  id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  date_of_birth: string;
  status: string;
  addresses?: Address[];
}
