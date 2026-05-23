import { ComponentProps, JSX } from 'react';

export type Role = 'admin' | 'staff' | 'manager' | 'vendor';

// Tipe khusus untuk komponen SVG
type IconComponent = (props: ComponentProps<'svg'>) => JSX.Element;

export interface NavItem {
  label: string;
  href: string;
  allowedRoles: Role[];
  icon: IconComponent;
}

// 1. Buat SVG dari Figma menjadi sebuah komponen
const DashboardIcon: IconComponent = (props) => (
  // {...props} diletakkan di sini agar className dari Navbar bisa masuk
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const LogisticTrackingIcon: IconComponent = (props) => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V7a2 2 0 00-2-2h-3V3H9v2H6a2 2 0 00-2 2v6m16 0l-2 6H6l-2-6m16 0H4" />
  </svg>
);

const HistoryIcon: IconComponent = (props) => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

const NewShipmentIcon: IconComponent = (props) => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

export const NAV_ITEMS: NavItem[] = [
  // Manajemen
  {
    label: 'Dashboard',
    href: '/manajemen/dashboard',
    allowedRoles: ['manager'],
    icon: DashboardIcon // Panggil nama komponennya di sini
  },
  {
    label: 'History',
    href: '/manajemen/history',
    allowedRoles: ['manager'],
    icon: HistoryIcon // Panggil nama komponennya di sini
  },

  // Vendor
  {
    label: 'Dashboard',
    href: '/vendor/dashboard',
    allowedRoles: ['vendor'],
    icon: DashboardIcon // Panggil nama komponennya di sini
  },
  {
    label: 'NewShipment',
    href: '/vendor/new-shipment',
    allowedRoles: ['vendor'],
    icon: NewShipmentIcon // Panggil nama komponennya di sini
  },
  {
    label: 'History',
    href: '/vendor/history',
    allowedRoles: ['vendor'],
    icon: HistoryIcon // Panggil nama komponennya di sini
  },

  // Petugas Gudang/Staff
  {
    label: 'Dashboard',
    href: '/petugas/dashboard',
    allowedRoles: ['staff'],
    icon: DashboardIcon // Panggil nama komponennya di sini
  },
  {
    label: 'Logistik Tracking',
    href: '/petugas/logistic-tracking',
    allowedRoles: ['staff'],
    icon: DashboardIcon // Panggil nama komponennya di sini
  },
  {
    label: 'History',
    href: '/petugas/history',
    allowedRoles: ['staff'],
    icon: HistoryIcon // Panggil nama komponennya di sini
  },
];