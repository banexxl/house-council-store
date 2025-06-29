import * as Yup from 'yup';

export type ClientStatus = 'active' | 'inactive' | 'pending_activation' | 'suspended' | 'trial' | 'archived' | 'vip';

export type ClientType = 'agency' | 'business' | 'enterprise' | 'government' | 'individual';

export type ClientRole = 'admin' | 'client' | 'tenant';

export interface Client {
  id: string;
  created_at?: Date;
  updated_at?: Date;
  name: string;
  email: string;
  password: string;
  phone?: string;
  address_1: string;
  contact_person: string;
  client_type: ClientType;
  client_status: ClientStatus;
  client_role: ClientRole;
  notes?: string;
  address_2?: string;
  mobile_phone?: string;
  avatar?: string;
  invoice_email_recipient?: string;
  ////////
  balance?: number;
  has_accepted_marketing?: boolean;
  has_accepted_terms_and_conditions?: boolean;
  has_accepted_privacy_policy?: boolean;
  is_potential?: boolean;
  is_returning?: boolean;
  is_verified?: boolean;
}

export interface ClientLog {
  id: string;
  created_at: Date;
  description: string;
  ip: string;
  method: string;
  route: string;
  status: number;
}

export interface ClientEmail {
  id: string;
  description: string;
  created_at: Date;
}

export interface ClientInvoice {
  id: string;
  issueDate: number;
  status: string;
  amount: number;
}

export const clientValidationSchema = (t: (key: string) => string) => {
  return Yup.object({
    name: Yup.string().max(255).required(t('clients.clientNameRequired')),
    contact_person: Yup.string().max(255).required(t('clients.clientContactPersonRequired')),
    email: Yup.string().email(t('clients.clientEmailMustBeValid')).max(255).required(t('clients.clientEmailRequired')),
    password: Yup.string().max(255).required(t('clients.clientPasswordRequired')),
    phone: Yup.string().max(15),
    mobile_phone: Yup.string().max(15).required(t('clients.clientMobilePhoneRequired')),
    address_1: Yup.string().max(255),
    address_2: Yup.string().max(255),
    client_type: Yup.string()
      .oneOf(['agency', 'business', 'enterprise', 'government', 'individual'],
        t('clients.clientTypeMustBeValid'))
      .required(t('clients.clientTypeRequired')),
    has_discount: Yup.bool(),
    is_verified: Yup.bool(),
    client_status: Yup.string()
      .oneOf(['active', 'inactive', 'pending_activation', 'suspended', 'trial', 'archived', 'vip'],
        t('clients.clientStatusMustBeValid'))
      .required(t('clients.clientStatusRequired')),
    client_role: Yup.string()
      .oneOf(['admin', 'client', 'tenant'], t('clients.clientRoleMustBeValid'))
      .required(t('clients.clientRoleRequired')),
    subscription_plan: Yup.string().max(40).nullable(),
    next_billing_date: Yup.date().nullable(),
    billing_information: Yup.string().max(255).nullable(),
    notes: Yup.string().max(255),
    avatar: Yup.string().max(255),
    has_accepted_marketing: Yup.bool(),
    has_accepted_terms_and_conditions: Yup.bool(),
    has_accepted_privacy_policy: Yup.bool(),
    is_potential: Yup.bool(),
    is_returning: Yup.bool()
  })
}

// Add all iniitial values
export const clientInitialValues: Client = {
  id: '',
  created_at: new Date(),
  updated_at: new Date(),
  name: '',
  email: '',
  password: '',
  address_1: '',
  contact_person: '',
  client_type: 'individual',
  client_status: 'active',
  client_role: 'client',
  address_2: '',
  phone: '',
  mobile_phone: '',
  avatar: '',
  balance: 0,
  has_accepted_marketing: false,
  has_accepted_terms_and_conditions: false,
  has_accepted_privacy_policy: false,
  is_potential: false,
  is_returning: false,
  is_verified: false,
};
