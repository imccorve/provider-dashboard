export interface Address {
    id?: string;
    street: string;
    city: string;
    state: string;
    zip_code: string;
    is_primary: boolean;
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
