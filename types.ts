
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

export const BIHAR_DISTRICTS = [
  "Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", "Bhojpur", "Buxar", 
  "Darbhanga", "East Champaran", "Gaya", "Gopalganj", "Jamui", "Jehanabad", "Kaimur", 
  "Katihar", "Khagaria", "Kishanganj", "Lakhisarai", "Madhepura", "Madhubani", "Munger", 
  "Muzaffarpur", "Nalanda", "Nawada", "Patna", "Purnia", "Rohtas", "Saharsa", "Samastipur", 
  "Saran", "Sheikhpura", "Sheohar", "Sitamarhi", "Siwan", "Supaul", "Vaishali", "West Champaran"
].sort();

export const BIHAR_SUB_DISTRICTS: Record<string, string[]> = {
  "Araria": ["Araria", "Forbesganj", "Jokihat", "Kursakanta", "Palasi", "Raniganj", "Sikakti", "Bhargama", "Narpatganj"],
  "Arwal": ["Arwal", "Kaler", "Karpi", "Kurtha", "Sonbhadra Banshi Suryapur"],
  "Aurangabad": ["Aurangabad", "Barun", "Daudnagar", "Deo", "Goh", "Haspura", "Kutumba", "Madanpur", "Nabinagar", "Obra", "Rafiganj"],
  "Banka": ["Banka", "Amarpur", "Bausi", "Belhar", "Chanan", "Dhoraiya", "Fullidumar", "Katoriya", "Panchrukhi", "Rajoun", "Shambhuganj"],
  "Begusarai": ["Begusarai", "Bakhri", "Ballia", "Barauni", "Bhagwanpur", "Cheria Bariarpur", "Chhorahi", "Garhpura", "Khodawandpur", "Mansurchak", "Matihani", "Naokothi", "Sahebpur Kamal", "Shamho Akurha", "Teghra"],
  "Bhagalpur": ["Bhagalpur", "Gopalpur", "Goradih", "Ismailpur", "Jagdishpur", "Kahalgaon", "Kharik", "Narayanpur", "Nathnagar", "Pirpainti", "Rangrachowk", "Sabour", "Shahkund", "Sultanganj"],
  "Bhojpur": ["Arrah", "Agiaon", "Barhara", "Bihiya", "Charpokhari", "Garhani", "Jagdishpur", "Koilwar", "Piro", "Sahar", "Sandesh", "Shahpur", "Tarari", "Udwantnagar"],
  "Buxar": ["Buxar", "Brahmpur", "Chakki", "Chausa", "Dumraon", "Itarhi", "Nawanagar", "Rajpur", "Simri"],
  "Darbhanga": ["Darbhanga", "Alinagar", "Bahadurpur", "Baheri", "Biraul", "Ghanshyampur", "Hanuman Nagar", "Hayaghat", "Jale", "Keoti", "Kiratpur", "Kushmeshwar Asthan", "Kushmeshwar Asthan East", "Singhwara", "Tardih"],
  "East Champaran": ["Motihari", "Adapur", "Areraj", "Banjaria", "Chakia", "Chiraia", "Dhaka", "Ghorasahan", "Harsidhi", "Kesaria", "Madhuban", "Mehsi", "Paharpur", "Pakri Dayal", "Phenhara", "Piprakothi", "Ramgarhwa", "Raxaul", "Sangrampur", "Sugauli", "Turkaulia"],
  "Gaya": ["Gaya Sadar", "Amas", "Atri", "Bankey Bazar", "Barachatti", "Belaganj", "Bodh Gaya", "Dobhi", "Dumaria", "Fatehpur", "Guraru", "Gurua", "Imamganj", "Khizirsarai", "Konch", "Manpur", "Mohanpur", "Muhra", "Neem Chak Bathani", "Paraiya", "Sherghati", "Tan Kuppa", "Tickari", "Wazirganj"],
  "Gopalganj": ["Gopalganj", "Baikunthpur", "Barauli", "Bhorey", "Hathua", "Kuchaikote", "Manjha", "Panchdeori", "Phulwariya", "Sidhwalia", "Thawe", "Uchka Gaon", "Vijayipur"],
  "Jamui": ["Jamui", "Barhat", "Chakai", "Gidhaur", "Isklampur", "Jhajha", "Khaira", "Laxmipur", "Sono"],
  "Jehanabad": ["Jehanabad", "Ghoshi", "Hulasganj", "Kako", "Modanganj", "Makhdumpur", "Ratni Faridpur"],
  "Kaimur": ["Bhabua", "Adhaura", "Chainpur", "Chand", "Durgawati", "Kudra", "Mohania", "Ramgarh", "Rampur", "Rohtas"],
  "Katihar": ["Katihar", "Amdabad", "Azamnagar", "Balrampur", "Barari", "Barsoi", "Dandkhora", "Falka", "Hasanganj", "Kadwa", "Korha", "Kursela", "Manihari", "Mansahi", "Pranpur", "Sameli"],
  "Khagaria": ["Khagaria", "Alauli", "Beldaur", "Chautham", "Gogri", "Mansi", "Parbatta"],
  "Kishanganj": ["Kishanganj", "Bahadurganj", "Dighalbank", "Kochadhaman", "Pothia", "Terhagachh", "Thakurganj"],
  "Lakhisarai": ["Lakhisarai", "Barahiya", "Chanan", "Halsi", "Pipariya", "Ramgarh Chowk", "Surajgarha"],
  "Madhepura": ["Madhepura", "Alamnagar", "Bihariganj", "Chausa", "Gwalpara", "Kishanganj", "Kumarkhand", "Murliganj", "Puraini", "Singheshwar", "Udakishanganj"],
  "Madhubani": ["Madhubani", "Andhratharhi", "Babubarhi", "Basopatti", "Benipatti", "Bisfi", "Ghoghardiha", "Harlakhi", "Jainagar", "Jhanjharpur", "Kaluahi", "Khajauli", "Khutauna", "Ladania", "Lakhnaur", "Madhepur", "Pandaul", "Phulparas", "Rajnagar", "Sahatwar"],
  "Munger": ["Munger", "Bariarpur", "Dharhara", "Haveli Kharagpur", "Jamalpur", "Sangrampur", "Tarapur", "Tetia Bambar"],
  "Muzaffarpur": ["Muzaffarpur", "Aurai", "Bandra", "Baruraj", "Bochahan", "Gaighat", "Kanti", "Katra", "Kurhani", "Marwan", "Minapur", "Motipur", "Musahari", "Paroo", "Sahebganj", "Sakra", "Saraiya"],
  "Nalanda": ["Bihar Sharif", "Asthawan", "Ben", "Bind", "Chandi", "Ekangarsarai", "Giriak", "Harnaut", "Hilsa", "Islampur", "Karai Parsurai", "Katrisarai", "Nagarnausa", "Noorsarai", "Parwalpur", "Rahui", "Rajgir", "Sarabera", "Silao", "Tharthari"],
  "Nawada": ["Nawada", "Akbarpur", "Govindpur", "Hisua", "Kashichak", "Kauwacol", "Meskaur", "Narhat", "Pakribarawan", "Rajauli", "Roh", "Sirdala", "Warisaliganj"],
  "Patna": ["Patna Sadar", "Anisabad", "Athmalgola", "Bakhtiyarpur", "Barh", "Belchhi", "Bihta", "Bikram", "Danapur", "Daniyawan", "Dulhin Bazar", "Fatwah", "Ghoswari", "Khagaul", "Khusrupur", "Masaurhi", "Mokama", "Naubatpur", "Paliganj", "Pandarak", "Phulwari Sharif", "Punpun", "Sampatchak"],
  "Purnia": ["Purnia", "Amour", "Baisi", "Banmankhi", "Bhawanipur", "Dagarua", "Dhamdaha", "Jalalgadh", "Kasba", "Krityanand Nagar", "Purnia East", "Rupauli", "Srinagar"],
  "Rohtas": ["Sasaram", "Akhorigola", "Banjari", "Chenari", "Dawath", "Dehri", "Dinara", "Karakat", "Kochas", "Nasriganj", "Nauhatta", "Nokha", "Rajpur", "Rohtas", "Sanjhauli", "Sheosagar", "Suryapura", "Tilouthu"],
  "Saharsa": ["Saharsa", "Banma Itahari", "Kahara", "Mahishi", "Nauhatta", "Patarghat", "Salkhua", "Simri Bakhtiarpur", "Sonbarsa"],
  "Samastipur": ["Samastipur", "Bibhutipur", "Bithan", "Dalsinghsarai", "Hasanpur", "Kalyanpur", "Khanpur", "Mohanpur", "Mohiuddin Nagar", "Morwa", "Patori", "Pusa", "Rosera", "Sarairanjan", "Shivaji Nagar", "Singhia", "Tajpur", "Ujiarpur", "Warisnagar"],
  "Saran": ["Chhapra", "Amnour", "Baniapur", "Dariapur", "Dighwara", "Ekma", "Garkha", "Isuapur", "Jalalpur", "Lahladpur", "Mashrakh", "Nagra", "Panapur", "Parsa", "Revelganj", "Sonepur", "Taraiya"],
  "Sheikhpura": ["Sheikhpura", "Ariari", "Barbigha", "Chewara", "Ghat Kusumbha", "Shekhopur Sarai"],
  "Sheohar": ["Sheohar", "Dumri Katsari", "Piprarhi", "Purnahiya", "Tariyani"],
  "Sitamarhi": ["Sitamarhi", "Bairgania", "Bajpatti", "Bathnaha", "Belsand", "Bokhra", "Choraut", "Dumra", "Majorganj", "Nanpur", "Parihar", "Parsauni", "Pupri", "Riga", "Runni Saidpur", "Sonbarsa", "Suppi", "Sursand"],
  "Siwan": ["Siwan", "Andar", "Barharia", "Basantpur", "Bhagwanpur Hat", "Darauli", "Daraunda", "Gautam Budh Nagar", "Gopalpur", "Guraiakothi", "Hasanpura", "Hussainganj", "Lakri Nabiganj", "Maharajganj", "Mairwa", "Nautan", "Panchrukhi", "Raghunathpur", "Siswan", "Ziradei"],
  "Supaul": ["Supaul", "Basantpur", "Chhatapur", "Kishanpur", "Marauna", "Nirmali", "Pipra", "Raghopur", "Saraigarh Bhaptiyahi", "Tribeniganj"],
  "Vaishali": ["Hajipur", "Bhagwanpur", "Bidupur", "Chehra Kalan", "Desri", "Garaul", "Jandaha", "Lalganj", "Mahnar", "Mahua", "Patedhi Belsar", "Patepur", "Raghopur", "Raja Pakar", "Sahdei Buzurg", "Vaishali"],
  "West Champaran": ["Bettiah", "Bagaha-1", "Bagaha-2", "Bairia", "Chanpatia", "Gaunaha", "Jogapatti", "Lauriya", "Mainatand", "Majhaulia", "Narkatiaganj", "Nautan", "Piprasi", "Ramnagar", "Sikta", "Thakrahan", "Yogapatti"]
};

export const INITIAL_FARMER_DATA: FarmerData = {
  nameHindi: 'किसान का नाम',
  nameEnglish: 'Farmer Name',
  dob: '01/01/2026',
  gender: 'Male',
  mobile: '7070200199',
  aadhaar: '000000000000',
  farmerId: '000-00-00-00-00',
  address: 'Address',
  photoUrl: 'https://picsum.photos/200/200',
  downloadDate: '0',
  landDetails: [
    { id: '1', district: '', subDistrict: '', village: '', mOwnerNo: '0', khasra: '0', area: '0' },
  ],
};
