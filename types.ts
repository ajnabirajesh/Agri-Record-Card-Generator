
export interface LandDetail {
  id: string;
  district: string;
  subDistrict: string;
  village: string;
  khata: string;
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
  nameHindi: 'चंदर देवी',
  nameEnglish: 'Chandar Devi',
  dob: '01/01/1960',
  gender: 'Female',
  mobile: '7070200199',
  aadhaar: '308269488292',
  farmerId: '234 03 81 09 69',
  address: 'W/o: Rajendra Prasad Yadav, Khakhai, Ward No-02, SUPAUL, 852138',
  photoUrl: 'https://picsum.photos/200/200',
  downloadDate: '13/01/2026',
  landDetails: [
    { id: '1', district: 'SUPAUL', subDistrict: 'Kishanpur', village: 'Abhuaar', khata: '32', khasra: '1684', area: '0.2' },
    { id: '2', district: 'SUPAUL', subDistrict: 'Kishanpur', village: 'Abhuaar', khata: '2715', khasra: '1866', area: '0.028' },
  ],
};
