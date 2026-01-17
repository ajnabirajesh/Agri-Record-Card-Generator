
export interface LandDetail {
  id: string;
  district: string;
  subDistrict: string;
  village: string;
  mOwnerNo: string;
  khasra: string;
  area: string;
}

export interface FarmerData {
  nameHindi: string;
  nameEnglish: string;
  dob: string;
  gender: string;
  mobile: string;
  aadhaar: string;
  farmerId: string;
  address: string;
  photoUrl: string;
  landDetails: LandDetail[];
  downloadDate: string;
}

export const INITIAL_FARMER_DATA: FarmerData = {
  nameHindi: 'Hindi Name',
  nameEnglish: 'English Name',
  dob: '01/01/2026',
  gender: 'Male',
  mobile: '7070200199',
  aadhaar: '0000-0000-0000',
  farmerId: '000-00-00-00-00',
  address: 'Address',
  photoUrl: 'https://picsum.photos/200/200',
  downloadDate: '0',
  landDetails: [
    { id: '1', district: 'Jila', subDistrict: 'Block', village: 'Moja', mOwnerNo: '0', khasra: '0', area: '0' },
    { id: '2', district: 'Jila', subDistrict: 'Block', village: 'Moja', mOwnerNo: '0', khasra: '0', area: '0' },
  ],
};
