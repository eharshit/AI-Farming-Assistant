import React, { useState } from 'react';
import { predictPrice } from '../services/api';
import { TrendingUp, MapPin, Package, Loader2, AlertCircle, IndianRupee, ArrowUpRight, ArrowDownRight, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

const availableCommodities = ["Ajwan", "Alasande+Gram", "Almond(Badam)", "Alsandikai", "Amaranthus", "Ambada+Seed", "Amla(Nelli+Kai)", "Amphophalus", "Antawala", "Apple", "Arhar+Dal(Tur+Dal)", "Ashgourd", "Avare+Dal", "Balekai", "Bamboo", "Banana", "Banana+-+Green", "Barley+(Jau)", "Beans", "Beaten+Rice", "Beetroot", "Betal+Leaves", "Bitter+gourd", "Black+pepper", "Bottle+gourd", "Bran", "Brinjal", "Broken+Rice", "Bull", "Bunch+Beans", "Butter", "Cabbage", "Calf", "Capsicum", "Cardamoms", "Carrot", "Cashewnuts", "Castor+Seed", "Cauliflower", "Chapparad+Avare", "Chennangi+Dal", "Cherry", "Chikoos(Sapota)", "Chili+Red", "Chilly+Capsicum", "Chow+Chow", "Chrysanthemum(Loose)", "Cloves", "Cluster+beans", "Coca", "Cock", "Cocoa", "Coconut", "Coconut+Oil", "Coconut+Seed", "Coffee", "Colacasia", "Copra", "Coriander(Leaves)", "Corriander+seed", "Cotton", "Cotton+Seed", "Cow", "Cowpea(Veg)", "Cucumbar(Kheera)", "Cummin+Seed(Jeera)", "Dalda", "Dhaincha", "Drumstick", "Dry+Chillies", "Dry+Fodder", "Dry+Grapes", "Duck", "Duster+Beans", "Egg", "Elephant+Yam+(Suran)", "Field+Pea", "Firewood", "Fish", "Galgal(Lemon)", "Garlic", "Ghee", "Gingelly+Oil", "Ginger(Dry)", "Ginger(Green)", "Goat", "Gram+Raw(Chholia)", "Gramflour", "Grapes", "Green+Avare+(W)", "Green+Chilli", "Green+Fodder", "Green+Peas", "Ground+Nut+Seed", "Groundnut", "Groundnut+(Split)", "Groundnut+pods+(raw)", "Guar", "Guava", "Gur(Jaggery)", "Gurellu", "He+Buffalo", "Hen", "Hippe+Seed", "Honge+seed", "Hybrid+Cumbu", "Indian+Beans+(Seam)", "Indian+Colza(Sarson)", "Isabgul+(Psyllium)", "Jack+Fruit", "Jamun(Narale+Hannu)", "Jasmine", "Jowar(Sorghum)", "Jute", "Karbuja(Musk+Melon)", "Kartali+(Kantola)", "Khoya", "Kinnow", "Knool+Khol", "Kodo+Millet(Varagu)", "Kulthi(Horse+Gram)", "Lak(Teora)", "Leafy+Vegetable", "Lemon", "Lime", "Linseed", "Lint", "Litchi", "Long+Melon(Kakri)", "Lotus+Sticks", "Lukad", "Mace", "Mahedi", "Mahua", "Maida+Atta", "Maize", "Mango", "Mango+(Raw-Ripe)", "Marigold(Calcutta)", "Marigold(loose)", "Mashrooms", "Masur+Dal", "Mataki", "Methi(Leaves)", "Methi+Seeds", "Millets", "Mint(Pudina)", "Moath+Dal", "Mousambi(Sweet+Lime)", "Mustard", "Mustard+Oil", "Myrobolan(Harad)", "Neem+Seed", "Niger+Seed+(Ramtil)", "Nutmeg", "Onion", "Onion+Green", "Orange", "Other+Pulses", "Ox", "Paddy(Dhan)(Basmati)", "Paddy(Dhan)(Common)", "Papaya", "Papaya+(Raw)", "Peach", "Pear(Marasebu)", "Peas(Dry)", "Peas+Wet", "Peas+cod", "Pepper+garbled", "Pepper+ungarbled", "Persimon(Japani+Fal)", "Pigs", "Pineapple", "Plum", "Pomegranate", "Potato", "Pumpkin", "Raddish", "Ragi+(Finger+Millet)", "Rajgir", "Ram", "Rice", "Ridge+gourd(Tori)", "Ridgeguard(Tori)", "Rose(Local)", "Rose(Loose)", "Round+gourd", "Rubber", "Sabu+Dan", "Sabu+Dana", "Safflower", "Sajje", "Same/Savi", "Season+Leaves", "Seemebadnekai", "Seetafal", "Seetapal", "She+Buffalo", "She+Goat", "Sheep", "Siddota", "Snake+gourd", "Snakeguard", "Soanf", "Soji", "Soyabean", "Spinach", "Sponge+gourd", "Sugar", "Sugarcane", "Sunflower", "Sunhemp", "Surat+Beans+(Papadi)", "Suva+(Dill+Seed)", "Suvarna+Gadde", "Sweet+Potato", "Sweet+Pumpkin", "T.V.+Cumbu", "Tamarind+Fruit", "Tamarind+Seed", "Tapioca", "Taramira", "Tender+Coconut", "Thogrikai", "Thondekai", "Tinda", "Tobacco", "Tomato", "Toria", "Tube+Rose(Loose)", "Turmeric", "Turmeric+(raw)", "Turnip", "Unknown", "Walnut", "Water+Melon", "Wheat", "Wheat+Atta", "White+Peas", "White+Pumpkin", "Wood", "Yam", "Yam+(Ratalu)"];

const availableStates = ["Andaman and Nicobar", "Andhra Pradesh", "Assam", "Chattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "NCT of Delhi", "Nagaland", "Odisha", "Pondicherry", "Punjab", "Rajasthan", "Tamil Nadu", "Telangana", "Tripura", "Unknown", "Uttar Pradesh", "Uttrakhand", "West Bengal"];

const availableDistricts = ["Adilabad", "Agra", "Ahmedabad", "Ahmednagar", "Aizawl", "Ajmer", "Akola", "Alappuzha", "Aligarh", "Alirajpur", "Allahabad", "Alwar", "Amarawati", "Ambala", "Ambedkarnagar", "Amreli", "Amritsar", "Anand", "Anantapur", "Anantnag", "Angul", "Anupur", "Ariyalur", "Ashoknagar", "Auraiya", "Aurangabad", "Azamgarh", "Badaun", "Badwani", "Bagalkot", "Baghpat", "Bahraich", "Balaghat", "Balasore", "Ballia", "Balod", "Balodabazar", "Balrampur", "Banaskanth", "Banda", "Bangaigaon", "Bangalore", "Bankura", "Barabanki", "Baramulla", "Baran", "Bareilly", "Bargarh", "Barmer", "Barnala", "Barpeta", "Bastar", "Basti", "Beed", "Belgaum", "Bellary", "Bemetara", "Betul", "Bhadrak", "Bhandara", "Bharatpur", "Bharuch", "Bhatinda", "Bhavnagar", "Bhilwara", "Bhind", "Bhiwani", "Bhopal", "Bidar", "Bijapur", "Bijnor", "Bikaner", "Bilaspur", "Birbhum", "Bishnupur", "Bolangir", "Botad", "Boudh", "Bulandshahar", "Buldhana", "Bundi", "Burdwan", "Burhanpur", "Cachar", "Chamba", "Champawat", "Chamrajnagar", "Chandauli", "Chandel", "Chandrapur", "Chhatarpur", "Chhindwara", "Chikmagalur", "Chitradurga", "Chitrakut", "Chittor", "Chittorgarh", "Churu", "Coimbatore", "Coochbehar", "Cuddalore", "Cuddapah", "Cuttack", "Dahod", "Dakshin Dinajpur", "Damoh", "Dantewada", "Darjeeling", "Darrang", "Datia", "Dausa", "Davangere", "Dehradoon", "Delhi", "Deoria", "Dewas", "Dhalai", "Dhamtari", "Dhar", "Dharmapuri", "Dharwad", "Dhenkanal", "Dholpur", "Dhubri", "Dhule", "Dibrugarh", "Dimapur", "Dindigul", "Dindori", "Durg", "East Godavari", "East Jaintia Hills", "East Khasi Hills", "Ernakulam", "Erode", "Etah", "Etawah", "Faizabad", "Faridabad", "Faridkot", "Farukhabad", "Fatehabad", "Fatehgarh", "Fatehpur", "Fazilka", "Ferozpur", "Firozabad", "Gadag", "Gadchiroli", "Gajapati", "Gandhinagar", "Ganganagar", "Ganjam", "Garhwa", "Garhwal (Pauri)", "Gariyaband", "Gautam Budh Nagar", "Ghaziabad", "Ghazipur", "Giridih", "Goalpara", "Golaghat", "Gomati", "Gonda", "Gondiya", "Gorakhpur", "Gulbarga", "Guna", "Guntur", "Gurdaspur", "Gurgaon", "Gwalior", "Hailakandi", "Hamirpur", "Hanumangarh", "Harda", "Hardoi", "Haridwar", "Hassan", "Hathras", "Haveri", "Hingoli", "Hissar", "Hooghly", "Hoshangabad", "Hoshiarpur", "Howrah", "Hyderabad", "Idukki", "Imphal East", "Imphal West", "Indore", "Jabalpur", "Jagatsinghpur", "Jaipur", "Jaisalmer", "Jajpur", "Jalana", "Jalandhar", "Jalaun (Orai)", "Jalgaon", "Jalore", "Jalpaiguri", "Jammu", "Jamnagar", "Janjgir", "Jashpur", "Jaunpur", "Jhabua", "Jhajar", "Jhalawar", "Jhansi", "Jharsuguda", "Jhunjunu", "Jind", "Jodhpur", "Jorhat", "Junagarh", "Jyotiba Phule Nagar", "Kabirdham", "Kachchh", "Kaithal", "Kalahandi", "Kamrup", "Kancheepuram", "Kandhamal", "Kangra", "Kanker", "Kannuj", "Kannur", "Kanpur", "Karaikal", "Karauli", "Karimganj", "Karimnagar", "Karnal", "Karwar(Uttar Kannad)", "Kasargod", "Kathua", "Katni", "Kaushambi", "Kendrapara", "Keonjhar", "Khammam", "Khandwa", "Khargone", "Kheda", "Khiri (Lakhimpur)", "Khowai", "Khurda", "Kiphire", "Koderma", "Kohima", "Kokrajhar", "Kolar", "Kolhapur", "Kolkata", "Kollam", "Kondagaon", "Koppal", "Koraput", "Korba", "Koria", "Kota", "Kottayam", "Kozhikode(Calicut)", "Krishnagiri", "Kullu", "Kurnool", "Kurukshetra", "Lakhimpur", "Lalitpur", "Latur", "Lohardaga", "Longleng", "Lucknow", "Ludhiana", "Madikeri(Kodagu)", "Madurai", "Maharajganj", "Mahasamund", "Mahbubnagar", "Mahendragarh-Narnaul", "Mahoba", "Mainpuri", "Malappuram", "Malda", "Malkangiri", "Mandi", "Mandla", "Mandsaur", "Mandya", "Mansa", "Marigaon", "Mathura", "Mau(Maunathbhanjan)", "Mayurbhanja", "Medak", "Medinipur(E)", "Medinipur(W)", "Meerut", "Mehsana", "Mewat", "Mirzapur", "Moga", "Mohali", "Mokokchung", "Morbi", "Morena", "Muktsar", "Mumbai", "Mungeli", "Muradabad", "Murshidabad", "Muzaffarnagar", "Mysore", "Nadia", "Nagaon", "Nagapattinam", "Nagaur", "Nagpur", "Nalbari", "Nalgonda", "Namakkal", "Nanded", "Nandurbar", "Nanital", "Narayanpur", "Narmada", "Narsinghpur", "Nashik", "Navsari", "Nawanshahr", "Nayagarh", "Neemuch", "Nicobar", "Nizamabad", "Nongpoh (R-Bhoi)", "North 24 Parganas", "North Goa", "North Tripura", "Nowarangpur", "Nuapada", "Osmanabad", "Padrauna(Kusinagar)", "Palakad", "Pali", "Palwal", "Panchkula", "Panchmahals", "Panipat", "Panna", "Parbhani", "Patan", "Pathanamthitta", "Pathankot", "Patiala", "Peren", "Phek", "Pillibhit", "Pondicherry", "Porbandar", "Pratapgarh", "Pulwama", "Pune", "Puri", "Puruliya", "Raebarelli", "Raichur", "Raigad", "Raigarh", "Raipur", "Raisen", "Rajasamand", "Rajgarh", "Rajkot", "Rajnandgaon", "Rajouri", "Ramanathapuram", "Rampur", "Ranga Reddy", "Ratlam", "Ratnagiri", "Rayagada", "Rewa", "Rewari", "Rohtak", "Ropar (Rupnagar)", "Sabarkantha", "Sagar", "Saharanpur", "Salem", "Sambalpur", "Sangli", "Sangrur", "Sant Kabir Nagar", "Satara", "Satna", "Sehore", "Seoni", "Sepahijala", "Shahjahanpur", "Shajapur", "Shehdol", "Sheopur", "Shimla", "Shimoga", "Shivpuri", "Sholapur", "Shravasti", "Siddharth Nagar", "Sidhi", "Sikar", "Singroli", "Sirmore", "Sirohi", "Sirsa", "Sitapur", "Sivaganga", "Solan", "Sonbhadra", "Sonepur", "Sonipat", "Sonitpur", "Sounth 24 Parganas", "South District", "South Goa", "Srinagar", "Sukma", "Sultanpur", "Sundergarh", "Surajpur", "Surat", "Surendranagar", "Surguja", "Swai Madhopur", "Tarntaran", "Thane", "Thanjavur", "The Dangs", "Theni", "Thirssur", "Thiruchirappalli", "Thiruvananthapuram", "Thiruvannamalai", "Thiruvarur", "Thoubal", "Tikamgarh", "Tonk", "Tuensang", "Tumkur", "Udaipur", "UdhamSinghNagar", "Udhampur", "Udupi", "Ujjain", "Umariya", "Una", "Unknown", "Unnao", "Unokoti", "Uttar Dinajpur", "Vadodara(Baroda)", "Valsad", "Varanasi", "Vashim", "Vellore", "Vidisha", "Vijayanagaram", "Villupuram", "Virudhunagar", "Visakhapatnam", "Warangal", "Wardha", "Wayanad", "West District", "West Garo Hills", "West Godavari", "West Jaintia Hills", "Wokha", "Yamuna Nagar", "Yavatmal", "Zunheboto", "kapurthala"];

const availableMarkets = ["A lot", "Aarni", "Aatpadi", "Abhanpur", "Abohar", "Abu Road", "Achalda", "Achalpur", "Achampet", "Acharapakkam", "Achnera", "Adampur", "Adilabad", "Adimali", "Adoni", "Agar", "Agra", "Aheri", "Ahirora", "Ahmedabad", "Ahmedgarh", "Ahmednagar", "Ahmedpur", "Ahwa-Dang", "Ait", "Ajaygarh", "Ajitwal", "Ajitwal (Chogawan)", "Ajitwal (Dala)", "Ajmer (Grain)", "Ajmer(F&V)", "Ajnala", "Ajnala (Sudhar)", "Ajuha", "Akaltara", "Akbarpur", "Akhadabalapur", "Akhnoor", "Akkalkot", "Akkalkuwa", "Aklera", "Akluj", "Akodia", "Akola", "Akole", "Akot", "Alampur", "Alangeyam", "Alappuzha", "Alibagh", "Aliganj", "Aligarh", "Alipurduar", "Alirajpur", "Alirajpur(F&V)", "Allahabad", "Alur", "Aluva", "Alwar", "Alwar(FV)", "Amadula", "Amalner", "Amangal", "Amarawati", "Amargarh", "Amarpatan", "Amarwda", "Ambad (Vadigodri)", "Ambaha", "Ambajipeta", "Ambala Cantt.", "Ambejaogai", "Ambikapur", "Amgaon", "Amirgadh", "Amloh", "Ammoor", "Amoda", "Amreli", "Amritsar", "Amroha", "Anaimalai", "Anajngaon", "Anakapally", "Anand", "Anandapur", "Anandnagar", "Anantapur", "Anchal", "Andimadom", "Angamaly", "Angaura", "Angul", "Angul(Atthamallick)", "Angul(Jarapada)", "Anjad", "Anjar", "Ankleshwar", "Annigeri", "Annur", "Anoop Shahar", "Anoopgarh", "Anta", "Anthiyur", "Anuppur", "Anwala", "Anyara(EEC)", "Arakalgud", "Aralamoodu", "Arang", "Arani", "Arasikere", "Ariyalur Market", "Arjuni", "Armoor", "Armori", "Armori(Desaiganj)", "Aron", "Aroor", "Arvi", "Asandh", "Asansol", "Ashoknagar", "Ashta", "Ashti", "Ashti(Karanja)", "Asifabad", "Atarra", "Ateli", "Athani", "Athirampuzha", "Atmakur", "Atrauli", "Atru", "Atru(Kawai Salpura)", "Attabira", "Attari", "Attili", "Attingal", "Attur", "Aurad Shahajani", "Auraiya", "Aurangabad", "Ausa", "Avalpoonthurai", "Avalurpet", "Awagarh", "Azadpur", "Azamgarh", "Babai", "Babain", "Baberu", "Babhulgaon", "Babra", "Babrala", "Bachaibari", "Bachau", "Bachranwa", "Badamalhera", "Badami", "Badarwas", "Badayoun", "Badda", "Badepalli", "Badhni Kalan", "Badnagar", "Badnawar", "Badnawar(F&V)", "Badod", "Badrisadri", "Badwaha", "Badwani", "Bagalakot", "Bagasara", "Bagbahra", "Bagepalli", "Baghapurana", "Baghry", "Bagpat", "Bagru", "Bahadajholla", "Bahadurgarh", "Bahedi", "Bahraich", "Baikunthpur", "Bailahongal", "Bajju", "Bakswaha", "Baktara", "Balachaur", "Balaghat", "Balapur", "Balarampur", "Balasinor", "Ballabhgarh", "Ballia", "Balod", "Balodabazar", "Balotra", "Balrampur", "Balugaon", "Balurghat", "Balwadi", "Bamora", "Bampada", "Banaganapalli", "Banapura", "Banda", "Bandhabazar", "Bandikui", "Bandikui(Geejgarh)", "Bandrol", "Banga", "Bangalore", "Bangarmau", "Bangarpet", "Bankhedi", "Banki", "Bankura Sadar", "Banmorkalan", "Banswada", "Banthara", "Banur", "Banur (Kheragaju)", "Barabanki", "Barad", "Baradwar", "Baramati", "Baran", "Barara", "Barasat", "Baraut", "Bardewri", "Bardoli(Katod)", "Bardoli(Madhi)", "Bareilly", "Bareli", "Bareta", "Bargarh", "Bargarh(Barapalli)", "Barghat", "Barhaj", "Barikpur", "Baripada", "Bariwala", "Bariya", "Barmer", "Barnala", "Barpathari", "Barshi", "Barshi Takli", "Baruch(Vagara)", "Baruipur(Canning)", "Baruwasagar", "Barwala", "Barwala(Hisar)", "Basana", "Basava Kalayana", "Basmat", "Basmat(Kurunda)", "Bassi Pathana", "Bastar", "Basti", "Batala", "Bathinda", "Batote", "Baxirhat", "Bayana", "Bazar Atriya", "Bazpur", "Beawar", "Becharaji", "Beed", "Begamganj", "Begu", "Belacoba", "Belarbahara", "Belargaon", "Beldanga", "Belgaum", "Bellary", "Bemetara", "Beohari", "Berachha", "Berasia", "Bethuadahari", "Betnoti", "Betul", "Bewar", "Bhabhar", "Bhadara", "Bhadaur", "Bhadaur(Sehna)", "Bhadrachalam", "Bhadrak", "Bhadravathi", "Bhadrawati", "Bhadson", "Bhagta Bhai Ka", "Bhainsa", "Bhaisma", "Bhakhara", "Bhalki", "Bhandara", "Bhander", "Bhanjanagar", "Bhanpura", "Bhanupratappur", "Bhanvad", "Bharamgarh", "Bharatpur", "Bharatpur(Kumer)", "Bharthna", "Bharuasumerpur", "Bharuch", "Bharwari", "Bhatapara", "Bhatgaon", "Bhattu Kalan", "Bhavani", "Bhavarpur", "Bhavnagar", "Bhawani Mandi", "Bhawanigarh", "Bhawanipatna", "Bheemkhoj", "Bheenmal(Ranlwada)", "Bhehjoi", "Bhensdehi", "Bhesan", "Bhikangaon", "Bhikhi", "Bhikhiwind", "Bhikhiwind (Algo)", "Bhikhiwind (Basarke)", "Bhikhiwind(Khalra)", "Bhiknoor", "Bhiloda", "Bhilwara", "Bhimadole", "Bhimavaram", "Bhind", "Bhinmal", "Bhivandi", "Bhiwani", "Bhiwapur", "Bhogpur", "Bhokar", "Bhokardan", "Bhongir", "Bhopal", "Bhopal(F&V)", "Bhopalpattnam", "Bhor", "Bhoring", "Bhucho", "Bhuj", "Bhulath", "Bhulath (Nadala)", "Bhuntar", "Bhurkoni", "Bhusaval", "Biaora", "Bichhiya", "Bichkunda", "Bidar", "Bijapur", "Bijawar", "Bijay Nagar", "Bijnaur", "Bijolia", "Bikaner (Grain)", "Bikaner(F&V)", "Bilara", "Bilaspur", "Bilga", "Bilga (Talwan )", "Bilimora", "Bilimora(Gandevi)", "Billsadda", "Bilsi", "Bina", "Binaganj", "Bindki", "Biokhora", "Birbhum", "Birmaharajpur", "Birra", "Bishalgarh", "Bishenpur", "Bishnupur(Bankura)", "Bishramganj", "Boath", "Bodeli", "Bodeli(Hadod)", "Bodeli(Kalediya)", "Bodeli(Modasar)", "Bodhan", "Boha", "Bohorihat", "Bolangir", "Bolpur", "Bonai", "Bongiagaon", "Boothapadi", "Boraee", "Bori", "Borsad", "Botad", "Botad(Haddad)", "Boudh", "Bowenpally", "Boxonagar", "Brahmpuri", "Budalada", "Budalur", "Budhar", "Buland Shahr", "Buldhana", "Buldhana(Dhad)", "Bundi", "Burdwan", "Burgampadu", "Burhanpur", "Burhanpur(F&V)", "Byadagi", "Cachar", "Car Nicobar", "Ch. Dadri", "Chaakghat", "Chaandpur", "Chabhal", "Chail Chowk", "Chakdah", "Chaksu", "Chakur", "Chala", "Chalakudy", "Chalisgaon", "Challakere", "Chamaraj Nagar", "Chamba", "Chamkaur Sahib", "Chamorshi", "Champa", "Champadanga", "Champaknagar", "Chanarthal", "Chandabali", "Chandausi", "Chanderi", "Chandoli", "Chandrapur", "Chandrapur(Ganjwad)", "Chandur", "Chandur Bazar", "Chandur Railway", "Chandur(Mungodu)", "Chandvad", "Channagiri", "Channapatana", "Channarayapatna", "Charama", "Charkhari", "Charla", "Charra", "Chathanoor", "Chatta Krushak Bazar", "Chaurai", "Chavakkad", "Chavassery", "Chechat", "Cheeka", "Chelakkara", "Chengalpattu", "Chengannur", "Chengeri", "Cherial", "Cherthala", "Chethupattu", "Chevella", "Cheyyar", "Chhabra", "Chhabra(Chhipabadod)", "Chhachrauli", "Chhapiheda", "Chhatarpur", "Chhati", "Chhibramau(Kannuj)", "Chhindwara", "Chhindwara(F&V)", "Chhpara", "Chickkaballapura", "Chikali", "Chikhali", "Chikkamagalore", "Chikli(Khorgam)", "Chimur", "Chinnasalem", "Chinnoar", "Chintalapudi", "Chintamani", "Chirgaon", "Chithode", "Chitradurga", "Chittapur", "Chittoor", "Chittorgarh", "Chitwadagaon", "Chityal", "Chogawan", "Chomu", "Chomu(F&V)", "Chopada", "Choppadandi", "Chorichora", "Chotila", "Choubepur", "Chowmanu", "Chuliaposi", "Chura", "Churu", "Chutmalpur", "Coimbatore", "Coochbehar", "Cuddalore", "Cuddapah", "DEI(Bundi)", "Dabra", "Dabwali", "Dadengiri", "Dadri", "Dahod", "Dahod(Veg. Market)", "Dakala", "Daloda", "Dammapet", "Damnagar", "Damoh", "Damoh(F&V)", "Dankaur", "Darjeeling", "Daryapur", "Dasada Patadi", "Dasda", "Dasuya", "Dataganj", "Datia", "Dausa", "Davangere", "Davgadbaria(Piplod)", "Deedwana", "Deeg", "Deesa", "Deesa(Bhildi)", "Degana", "Dehgam", "Dehgam(Rekhiyal)", "Dehradoon", "Denduluru", "Deoli", "Deori", "Deoulgaon Raja", "Dera Baba Nanak", "Dera Bassi", "Desur", "Devala", "Devandranagar", "Devani", "Devarakadra", "Devarakonda", "Devariya", "Devarkonda(Dindi)", "Devband", "Devbhog", "Devda", "Devgadhbaria", "Dewas", "Dewas(F&V)", "Dhadgaon", "Dhamngaon-Railway", "Dhamnod", "Dhampur", "Dhamtari", "Dhanaula", "Dhand", "Dhandhuka", "Dhanera", "Dhanora", "Dhanotu (Mandi)", "Dhansura", "Dhanula (Kaleke)", "Dhanura", "Dhar", "Dhar(F&V)", "Dharamkot", "Dharampuri", "Dharangaon", "Dharapuram", "Dhari", "Dhari(Chalala)", "Dhariwal", "Dharmabad", "Dharmapuri", "Dharmaram", "Dharni", "Dharwar", "Dhekiajuli", "Dhenkanal", "Dhilwan", "Dhing", "Dholka", "Dholka(Koth)", "Dholpur", "Dhoraji", "Dhrol", "Dhule", "Dhupguri", "Dhuri", "Dibiapur", "Dibrugarh", "Digapahandi", "Digras", "Dimapur", "Dinanagar", "Dindigul", "Dindori", "Dindori(Vani)", "Ding", "Dinhata", "Dirba", "Divai", "Doddaballa Pur", "Doharighat", "Dondaicha", "Dondi", "Dondilohara", "Dongargaon", "Dongargarh", "Doraha", "Doranpal", "Dound", "Dubbak", "Dudhani", "Dudhansadhan", "Dudhawa", "Dudhi", "Duggirala", "Dumal", "Dungurapalli", "Durg", "Durgapur", "Egra/contai", "Elevancheri", "Ellanabad", "Elumathur", "Eluru", "English Bazar", "Enkoor", "Ernakulam", "Erode", "Etah", "Etawah", "Ettumanoor", "Ezhamkulam", "F.G.Churian", "Faizabad", "Falakata", "Faridabad", "Faridkot", "Farukh Nagar", "Farukhabad", "Fatehabad", "Fatehnagar", "Fatehpur", "Fatehpur Sikri", "Fazilka", "Fazilka (Ladhuka)", "Ferozepur Cantt.", "Firozabad", "Firozepur City", "Fruit Market", "Fulmbri", "Gadag", "Gadarpur", "Gadarwada", "Gadaura", "Gaddiannaram", "Gadhinglaj", "Gadhwah", "Gadwal", "Gadwal(Lezza)", "Gairatganj", "Gajol", "Gajsinghpur", "Gajwel", "Ganaur", "Gandacharra", "Gandai", "Gandchiroli", "Ganderbal", "Gandhari", "Gandhwani", "Gangadhara", "Gangakhed", "Gangapur", "Gangapur City", "Gangavalli", "Gangavathi", "Gangoh", "Ganjbasoda", "Ganjdudwara", "Garbeta(Medinipur)", "Garh Shankar", "Garhakota", "Gariyaband", "Garjee", "Garoth", "Gattasilli", "Gauripur", "Gautampura", "Gazipur", "Gevrai", "Ghanaur", "Ghanpur", "Ghansawangi", "Ghansour", "Gharaunda", "Gharghoda", "Gharsana", "Ghatal", "Ghatanji", "Ghathashi", "Ghaziabad", "Ghiraur", "Ghoti", "Gidam", "Giddarbaha", "Gingee", "Giridih", "Goalpara", "Gobichettipalayam", "Godabhaga", "Godhra", "Godhra(Kakanpur)", "Godhra(Timbaroad)", "Gogamba", "Gogamba(Similiya)", "Gohad", "Gohana", "Gokak", "Golaghat", "Golagokarnath", "Gollapally", "Goluwala", "Gonda", "Gondal", "Gondiya", "Gondpimpri", "Goniana", "Gonikappal", "Gooti", "Gopa", "Gopalpatti", "Gopalraopet", "Gorakhpur", "Goraya", "Goregaon", "Gotegaon", "Gowribidanoor", "Gubbi", "Gudimalkapur", "Gudiyatham", "Gulabganj", "Gulavati", "Gulbarga", "Guna", "Guna(F&V)", "Gundlupet", "Gunpur", "Guntakal", "Guntur", "Gurdaspur", "Gurgaon", "Guru Har Sahai", "Gurur", "Gurusarai", "Guskara(Burdwan)", "H.B. Halli", "Haathras", "Haatpipliya", "Habra", "Hadgaon", "Hadgaon(Tamsa)", "Hailakandi", "Halahali", "Haldaur", "Haldibari", "Haldwani", "Halia", "Haliyala", "Halvad", "Hamirpur", "Hamirpur(Nadaun)", "Hanagal", "Hanumana", "Hanumangarh", "Hanumangarh Town", "Hanumangarh(Urlivas)", "Hapur", "Harappana Halli", "Harda", "Harda(F&V)", "Hardoi", "Hargaon (Laharpur)", "Haridwar Union", "Harihara", "Harij", "Harike", "Harippad", "Harpalpur", "Harsood", "Hasanpur", "Hata", "Hathur", "Haveri", "Himalyatnagar", "Himatnagar", "Hindol", "Hindoun", "Hindupur", "Hinganghat", "Hingna", "Hingoli", "Hinjilicut", "Hirekerur", "Hiriyur", "Hissar", "Holalkere", "Holenarsipura", "Honnali", "Hoovinahadagali", "Hosadurga", "Hosanagar", "Hoshangabad", "Hoshiarpur", "Hoskote", "Hospet", "Howly", "Hubli (Amaragol)", "Huliyar", "Hungund", "Hunsur", "Huzurnagar", "Huzzurabad", "Iamailabad", "Ibrahimpatnam", "Ibrahimputnam", "Ichhawar", "Imphal", "Indapur", "Indore", "Indore(F&V)", "Indravelly(Utnoor)", "Indri", "Indus(Bankura Sadar)", "Irikkur", "Irinjalakkuda", "Irityy", "Isagarh", "Islampur", "Itarsi", "Itawa", "Jabalpur", "Jabalpur(F&V)", "Jafarganj", "Jafrabad", "Jagadhri", "Jagalur", "Jagatsinghpur", "Jagdalpur", "Jaggampet", "Jagnair", "Jagraon", "Jagtial", "Jahanabad", "Jahangirabad", "Jaijaipur", "Jainath", "Jaipur (Grain)", "Jaipur(Bassi)", "Jaipur(F&V)", "Jairamnagar", "Jaisalmer", "Jaisinagar", "Jaitgiri", "Jaithari", "Jaitsar", "Jaitu", "Jaitu(Bajakhana)", "Jajpur", "Jakhal", "Jalalabad", "Jalana", "Jalandhar Cantt.", "Jalandhar City", "Jalaun", "Jaleswar", "Jalgaon", "Jalgaon(Masawat)", "Jalkot", "Jalna(Badnapur)", "Jalore", "Jalpaiguri Sadar", "Jalukie", "Jamanian", "Jambusar", "Jambusar(Kaavi)", "Jamkandorna", "Jamkhed", "Jammikunta", "Jamnagar", "Jamner", "Jamner(Neri)", "Jangaon", "Jangipur", "Jangipura", "Jaora", "Jarar", "Jasdan", "Jaspur", "Jaspur(UC)", "Jasra", "Jasvantnagar", "Jatara", "Jaunpur", "Javad", "Javer", "Javera", "Jawala-Bajar", "Jawar", "Jayamkondam", "Jayas", "Jeerapur", "Jetpur(Dist.Rajkot)", "Jetpur-Pavi", "Jeypore", "Jeypore(Kotpad)", "Jhabua", "Jhajjar", "Jhalap", "Jhalarapatan", "Jhalod", "Jhansi", "Jhargram", "Jharsuguda", "Jhijhank", "Jhumpura", "Jhunjhunu", "Jiaganj", "Jind", "Jintur", "Jintur(Bori)", "Jobat", "Jodhpur(F&V)(Paota)", "Jogipet", "Jora", "Jorhat", "Jowai", "Jullana", "Jumpuijala", "Junagadh", "Junagarh", "Jundla", "Junnar", "Junnar(Alephata)", "Junnar(Narayangaon)", "Junnar(Otur)", "K.Mandvi", "K.R. Pet", "K.R.Nagar", "Kada", "Kadamtala", "Kadaura", "Kadhle", "Kadi", "Kadur", "Kahnuwan", "Kaij", "Kailaras", "Kairana", "Kaithal", "Kakni", "Kalagategi", "Kalamb", "Kalamb(Osmanabad)", "Kalamnuri", "Kalanaur", "Kalapipal", "Kalavai", "Kalawad", "Kaliaganj", "Kalikiri", "Kalimpong", "Kalipur", "Kaliyanchanda", "Kallachi", "Kallakurichi", "Kallur", "Kalmeshwar", "Kalna", "Kalol", "Kalpetta", "Kalpi", "Kalsi", "Kalvan", "Kalwakurthy", "Kalyan", "Kalyani", "Kalyanpur", "Kama", "Kamakhyanagar", "Kamalghat", "Kamareddy", "Kamlaganj", "Kammarpally", "Kamthi", "Kamuthi", "Kanakapura", "Kanchipuram", "Kandi", "Kangeyam", "Kangra", "Kangra(Baijnath)", "Kangra(Jaisinghpur)", "Kangra(Jassour)", "Kanjangadu", "Kanjirappally", "Kanker", "Kannad", "Kannauj", "Kannod", "Kannur", "Kanpur(Grain)", "Kantabaji", "Kapadvanj", "Kapasan", "Kapurthala", "Karad", "Karaikal", "Karaikudi", "Karamadai", "Karanja", "Karanjia", "Karatgi", "Kareli", "Karera", "Karhi", "Karimganj", "Karimnagar", "Karimpur", "Karjan", "Karjat", "Karjat(Raigad)", "Karkala", "Karmala", "Karnailganj", "Karpawand", "Karsiyang(Matigara)", "Karumanturai", "Karvi", "Karwar", "Kasargod", "Kasdol", "Kasganj", "Kashipur", "Kasimbazar", "Kasinagar", "Kasipur", "Kasrawad", "Katangi", "Kataram", "Katghora", "Kathalapur", "Kathua", "Katni", "Katol", "Katra", "Kattakada", "Kattappana", "Katwa", "Kaveripakkam", "Kavunthapadi", "Kawardha", "Kayamganj", "Kayamkulam", "Keezhampara", "Kekri", "Kendrapara", "Kendupatna", "Kendupatna(Niali)", "Keolari", "Keonjhar", "Keonjhar(Dhekikote)", "Kesamudram", "Kesarisinghpur", "Keshkal", "Keshopur", "Keshoraipatan", "Kesinga", "Kesli", "Khachrod", "Khadur Sahib", "Khaga", "Khair", "Khairagarh", "Khairlangi", "Khairthal", "Khajuwala", "Khalilabad", "Khamano", "Khambha", "Khamgaon", "Khammam", "Khanapur", "Khanauri", "Khandwa", "Khandwa(F&V)", "Khaniadhana", "Khanna", "Khanpur", "Kharar", "Khargapur", "Khargone", "Khariar", "Khariar Road", "Kharora", "Kharsiya", "Kharupetia", "Khatauli", "Khateema", "Khategaon", "Khatora", "Khatra", "Khed", "Khed(Chakan)", "Khedbrahma", "Khedh(Bodaramev)", "Khedli(laxmangarh)", "Khekda", "Khem karan", "Khemkaran (Amarkot)", "Kheragarh", "Kherli", "Khetia", "Khilchipur", "Khirakiya", "Khliehriat", "Khujner", "Khunthabandha", "Khurai", "Khurja", "Kianthukadavu", "Kicchha", "Kila Raipur", "Kille Dharur", "Kilpennathur", "Kilvelur", "Kinwat", "Kipheri", "Kiratpur", "Kishangarh Renwal", "Kishunpur", "Kodad", "Kodakandal", "Koderma", "Kodumudi", "Kodungalloor", "Koduvayoor", "Kohima", "Kolaghat", "Kolar", "Kolaras", "Kolathur", "Kolhapur", "Kolhapur(Malkapur)", "Kollam", "Kollegal", "Kollengode", "Komakhan", "Konch", "Kondagoan", "Kondotty", "Konganapuram", "Konta", "Koovapadi", "Kopaganj", "Kopargaon", "Koppa", "Koppal", "Koradacheri", "Koraput", "Koraput(Semilguda)", "Korar", "Koratla", "Korpana", "Kosamba", "Kosamba(Vankal)", "Kosamba(Zangvav)", "Kosikalan", "Kot ise Khan", "Kota", "Kota (FV)", "Kotadwara", "Kotba", "Kothagudem", "Kothamangalam", "Kotkapura", "Kotma", "Kotmi", "Kotputli", "Kottakkal", "Kottarakkara", "Kottayam", "Kottur", "Kovvur", "Krosuru", "Kuber", "Kuchaman City", "Kuchinda", "Kudavasal", "Kudchi", "Kukanar", "Kukshi", "Kulai", "Kulgam", "Kullu", "Kullu(Chauri Bihal)", "Kullu(Patli Kuhal)", "Kumbakonam", "Kumbhraj", "Kumta", "Kundapura", "Kunigal", "Kunjpura", "Kunkuri", "Kunnathukkal", "Kunnathur", "Kuppam", "Kurali", "Kurara", "Kurawar", "Kurdwadi", "Kurdwadi(Modnimb)", "Kurinchipadi", "Kurnool", "Kurud", "Kuruppanthura", "Kushtholy", "Kusmee", "Kustagi", "Kuthuparambu", "Kuttoor", "Kuttulam", "L B Nagar", "Ladwa", "Lahar", "Lakhandur", "Lakhani", "Lakhanpuri", "Lakhimpur", "Lakhnadon", "Lakshar", "Lalbagh", "Lalganj", "Lalgarh Jatan", "Lalgudi", "Lalitpur", "Lalru", "Lalsot", "Lalsot(Mandabari)", "Lamlong Bazaar", "Lasalgaon", "Lasalgaon(Niphad)", "Lasalgaon(Vinchur)", "Lashkar", "Lashkar(F&V)", "Laskein", "Lasur Station", "Lateri", "Latur", "Latur(Murud)", "Laxettipet", "Laxmeshwar", "Lehra Gaga", "Limdi", "Limkheda", "Lingasugur", "Loha", "Lohandiguda", "Loharda", "Lohardaga", "Loharu", "Lohian Khas", "Lonand", "Lonar", "Longleng", "Lormi", "Lucknow", "Ludhiana", "Lunkaransar", "Maanachar", "Machalpur", "Madagadipet", "Madanapalli", "Madathukulam", "Maddur", "Madhavapuram", "Madhira", "Madhoganj", "Madhogarh", "Madhugiri", "Madlauda", "Maduranthagam", "Magroni", "Mahabubabad", "Mahagaon", "Maharajganj", "Mahasamund", "Mahboob Manison", "Mahbubnagar", "Mahidpur", "Mahoba", "Maholi", "Mahur", "Mahuva", "Mahuva(Station Road)", "Mahuwa Mandawar", "Maigalganj", "Mailaduthurai", "Mainpuri", "Majalgaon", "Majitha", "Makdi", "Makhu", "Maksi", "Maksudangarh", "Makthal", "Malegaon", "Malegaon(Umarane)", "Malegaon(Vashim)", "Malerkotla", "Malkanagiri", "Malkapur", "Mallanwala", "Mallial(Cheppial)", "Malout", "Malout (Kilianwali)", "Malout (Panniwala)", "Malpura", "Malthone", "Malur", "Mamdot", "Mamdot(Tibbi Khurd)", "Manalurpet", "Manasa", "Manathavady", "Manavdar", "Manawar", "Mancharial", "Mandal", "Mandalgarh", "Mandhal", "Mandi(Mandi)", "Mandi(Takoli)", "Mandla", "Mandsaur", "Mandsaur(F&V)", "Mandvi", "Mandya", "Manendragarh", "Mangal Wedha", "Mangaon", "Mangkolemba", "Manglaur", "Mangrol", "Mangrulpeer", "Manjeri", "Manjeswaram", "Manmad", "Mannar", "Mannargudi", "Manora", "Mansa", "Mansa (Bhamekalan)", "Mansa (Khiala kalan)", "Mantha", "Manthani", "Manubazar", "Manvi", "Manwat", "Mapusa", "Maranelloor", "Margao", "Masli", "Matar", "Matar(Limbasi)", "Mathabhanga", "Mathania", "Mathura", "Mau", "Mau(Chitrakut)", "Maudaha", "Maur", "Mauranipur", "Mawana", "Mazhuvannur", "Mechua", "Medchal", "Medinipur(West)", "Medipally", "Meerut", "Meghraj", "Mehal Kalan", "Meham", "Mehatpur", "Mehekar", "Mehgaon", "Mehmadabad", "Mehmoodabad", "Mehrauni", "Mehsana", "Mehsana(Jornang)", "Mehsana(Mehsana Veg)", "Mehta", "Mekhliganj", "Melaghar", "Melur", "Memari", "Merta City", "Metpally", "Mhalingapur", "Mhow", "Mihipurwa", "Milak", "Miryalaguda", "Mirzapur", "Misrikh", "Modasa", "Modasa(Tintoi)", "Moga", "Mohamadabad", "Mohammdi", "Mohanpur", "Mohgaon", "Mohindergarh", "Mohol", "Momanbadodiya", "Moodigere", "Moolanur", "Moonak", "Moovattupuzha", "Morbi", "Moreh", "Morena", "Morena(F&V)", "Morinda", "Morshi", "Morva Hafad", "Moth", "Mottagaon", "Mow", "Moynaguri", "Mudkhed", "Mugrabaadshahpur", "Mukerian", "Mukerian(Talwara)", "Mukhed", "Mukkom", "Muktsar", "Mul", "Mulabagilu", "Mulakalacheruvu", "Muli", "Mullana", "Mullana(saha)", "Mullanpur", "Multai", "Mulugu", "Mumbai", "Mundaragi", "Mundgod", "Mungawali", "Munguli", "Munnar", "Muradabad", "Muradnagar", "Murbad", "Murim", "Murtizapur", "Murud", "Muskara", "Mustafabad", "Muthur", "Muzzafarnagar", "Mysore (Bandipalya)", "Naanpara", "Nabha", "Nadia", "Nadiyad(Chaklasi)", "Nadiyad(Piplag)", "Nadwai", "Nagamangala", "Nagapattinam", "Nagar", "Nagari", "Nagbhid", "Nagda", "Nagina", "Nagod", "Nagpur", "Nahan", "Naigaon", "Naila", "Nainpur", "Najibabad", "Nakodar", "Nakodar(Sarih)", "Nakrekal", "Nakud", "Nalbari", "Nalgonda", "Nalkehda", "Namagiripettai", "Namakkal", "Nampur", "Nanakmatta", "Nandgaon", "Nandura", "Nandurbar", "Nandyal", "Nanggaon", "Nanjangud", "Nanuta", "Naraingarh", "Narayankhed", "Narayanpet", "Narayanpur", "Narela", "Nargunda", "Narharpur", "Narnaund", "Narsampet", "Narsapuram", "Narsinghgarh", "Narsinghpur", "Narsingi", "Narwal Jammu (F&V)", "Narwana", "Nasik", "Nasrullaganj", "Nasvadi", "Nasvadi(Thalkala)", "Natham", "Naugaon", "Naugarh", "Naushera Pannuan", "Nautnava", "Navapara", "Navapur", "Nawabganj", "Nawalgarh", "Nawanshahar", "Nawarangpur", "Nedumangadu", "Nedumkandam", "Neeleswaram", "Neem Ka Thana", "Neemuch", "Negamam", "Nelakondapally", "Neora", "Ner Parasopant", "Neredcherla", "New Market Aizawl", "Newasa", "Newasa(Ghodegaon)", "Neyyatinkara", "Nihal Singh Wala", "Nilagiri", "Nilanga", "Nilokheri", "Nimapara", "Nimbahera", "Nippani", "Nira", "Nirmal", "Nissing", "Niuland", "Niwadi", "Niwai", "Nizamabad", "Nizar", "Noida", "Nokha", "Nongpoh (R-Bhoi)", "Noor Mehal", "North Lakhimpur", "Nowpora", "Nutanbazar", "Obedullaganj", "Oddunchairum", "Omalloor", "Omalur", "Orai", "Orathanadu", "Osmanabad", "Paatan", "Pabiacherra", "Pachaur", "Pachora", "Pachora(Bhadgaon)", "Padampur", "Padra", "Paithan", "Pakala", "Pala", "Palakkad", "Palakode", "Palakole", "Palam", "Palamaner", "Palampur", "Palani", "Palanpur", "Palari", "Palayam", "Palera", "Palghar", "Pali", "Paliakala", "Palitana", "Pallahara", "Pallipattu", "Palthan", "Palus", "Palwal", "Pamohi(Garchuk)", "Pampady", "Panchkul(Kalka)", "Panchpedwa", "Pandalam", "Pandariya", "Pandavapura", "Pandhakawada", "Pandhana", "Pandhana(F&V)", "Pandharpur", "Pandhurna", "Pandkital", "Pandua", "Panichowki", "Panipat", "Panisagar", "Panna", "Panposh", "Panruti", "Panthawada", "Panvel", "Paonta Sahib", "Papanasam", "Pappireddipatti", "Parakkodu", "Parali Vaijyanath", "Paranda", "Parappanangadi", "Parassala", "Parbhani", "Pargi", "Parikshitgarh", "Parimpore", "Pariyaram", "Parkal", "Parlakhemundi", "Parner", "Parshiwani", "Partaval", "Partur", "Patan", "Pataudi", "Pathalgaon", "Pathankot", "Pathardi", "Pathari", "Patharia", "Patiala", "Patran", "Patran(Ghagga Mandi)", "Pattambi", "Pattamundai", "Patti", "Pattikonda", "Patur", "Pavagada", "Pavani", "Pawai", "Payagpur", "Payyannur", "Pazhayannur", "Peddapalli", "Peddapuram", "Pehowa", "Pen", "Pendraroad", "Penugonda", "Perambra", "Perinthalmanna", "Pernem", "Perumbavoor", "Perundurai", "Pethappampatti", "Petlawad", "Pfatsero", "Phagwara", "Pharasgaon", "Phek", "Phillaur", "Phillaur(Apra Mandi)", "Pichhour", "Piler", "Pilibhit", "Pilli Banga", "Pillukhera", "Pimpalgaon", "Pipar City", "Pipariya", "Pipli", "Piplya", "Piprai", "Pipriya", "Piravam", "Pirda", "Piriya Pattana", "Pithoura", "Pitlam", "Pohari", "Polavaram", "Pollachi", "Pombhurni", "Ponda", "Pongalur", "Poonthottam", "Porbandar", "Porsa", "Porsa(F&V)", "Pothencode", "Pothgal", "Praswada", "Pratapgarh", "Pratappur", "Prithvipur", "Pudupalayam", "Pudur", "Pukhrayan", "Pulgaon", "Pulpally", "Pulwama (F&V)", "Punalur", "Punchaipuliyampatti", "Pundibari", "Pune", "Pune(Hadapsar)", "Pune(Khadiki)", "Pune(Manjri)", "Pune(Moshi)", "Pune(Pimpri)", "Punganur", "Punhana", "Puramattom", "Puranpur", "Purna", "Purulia", "Purwa", "Puttur", "Puwaha", "Quadian", "Quilandy", "Raath", "Radaur", "Radhanpur", "Raghogarh", "Raghunathpur", "Rahata", "Rahatgarh", "Rahuri", "Rahuri(Vambori)", "Raibareilly", "Raichur", "Raiganj", "Raigarh", "Raikot", "Raipur", "Raipur Rai", "Raisen", "Raisingh Nagar", "Rajahmundry", "Rajapalayam", "Rajasamand", "Rajasingamangalam", "Rajgarh", "Rajim", "Rajkot", "Rajkot(Ghee Peeth)", "Rajnagar", "Rajnandgaon", "Rajouri (F&V)", "Rajpipla", "Rajpur", "Rajpura", "Rajula", "Rajura", "Ralegaon", "Ramaganj Mandi", "Raman", "Ramanagara", "Ramannapet", "Ramanujganj", "Ramdurga", "Ramnagar", "Rampur", "Rampura Phul", "Rampuraphul(Chowke)", "Rampuraphul(Dhapali)", "Rampuraphul(Mehraj)", "Rampurhat", "Rampurmaniharan", "Ramtek", "Ranaghat", "Ranebennur", "Rani", "Rania", "Ranniangadi", "Rapar", "Rasda", "Rasipuram", "Ratanpur", "Ratia", "Ratlam", "Ratlam(F&V)", "Ratnagiri (Nachane)", "Raver", "Ravulapelem", "Rawatsar", "Rawla", "Rayagada", "Rayagada(Muniguda)", "Rayya", "Rayya(Sathiala)", "Reasi", "Rehati", "Rehli", "Rewa", "Rewari", "Richha", "Ridmalsar", "Rishikesh", "Risia", "Risod", "Robertsganj", "Roha", "Rohroo", "Rompicherla", "Rona", "Rongram", "Roorkee", "Ropar", "Rudauli", "Rudrapur", "Ruperdeeha", "Rura", "S.Mandvi", "Sabalgarh", "Sadasivpet", "Sadhaura", "Sadiq", "Sadulpur", "Sadulshahar", "Safdarganj", "Safidon", "Sagar", "Sagar(F&V)", "Saharanpur", "Saharpada", "Sahidngar", "Sahiyapur", "Sahnewal", "Saidpur", "Sailana", "Sainthia", "Saja", "Sakaleshpura", "Sakhigopal", "Sakra", "Sakri", "Salem", "Salon", "Samalkha", "Samana", "Samana(Gajewas)", "Samana(Kakrala)", "Samba", "Sambalpur", "Sambhal", "Sami", "Sampara", "Sampla", "Samrala", "Samsabad", "Samsi", "Samudrapur", "Sanad", "Sanawad", "Sanchor", "Sandi", "Sandila", "Sangamner", "Sangarapuram", "Sangareddy", "Sangat", "Sangli", "Sangli(Miraj)", "Sangola", "Sangriya", "Sangrur", "Sankeshwar", "Sanquelim", "Santhesargur", "Santir Bazar", "Santoshgarh", "Sanwer", "Sarangapur", "Sarangarh", "Sarangpur", "Sarankul", "Saraskana", "Sarayapali", "Sardarnagar", "Sardhana", "Sardulgarh", "Sargaon", "Sargipali", "Sarona", "Sarsiwan", "Sasthamkotta", "Satana", "Satara", "Sathur", "Sathyamangalam", "Satna", "Satna(F&V)", "Sattupalli", "Saunsar", "Savali", "Savanur", "Savarkundla", "Savli", "Savner", "Sawai Madhopur", "Sealdah Koley Market", "Segaon", "Sehjanwa", "Sehore", "Selu", "Sembanarkoil", "Semriharchand", "Sendhwa", "Sengoan", "Senjeri", "Seoni", "Sevda", "Sevur", "Shadabad", "Shadnagar", "Shadora", "Shahabad", "Shahabad(New Mandi)", "Shahada", "Shahagarh", "Shahaswan", "Shahdara", "Shahdol", "Shahganj", "Shahjahanpur", "Shahkot", "Shahpur", "Shahpura", "Shahpura(Jabalpur)", "Shahzadpur", "Shajapur", "Shajapur(F&V)", "Shakot (Malsian)", "Shakti", "Shamgarh", "Shamgarh(F&V)", "Shamli", "Shamshabad", "Shankarapally", "Shegaon", "Sheopurbadod", "Sheopurkalan", "Sheoraphuly", "Sherpur", "Shevgaon", "Shevgaon(Bodhegaon)", "Shiggauv", "Shikaripura", "Shikohabad", "Shillong", "Shimla", "Shimoga", "Shirpur", "Shirur", "Shivpuri", "Shivpuri(F&V)", "Shivrinarayanpur", "Shopian", "Shorapur", "Shrigonda(Gogargaon)", "Shrimushnam", "Shrirampur", "Shrirampur(Belapur)", "Shujalpur", "Shyampur", "Siddapur", "Siddhpur", "Siddipet", "Sidhi", "Sidhwan Bet", "Sihora", "Sikanderabad", "Sikandraraau", "Sikar", "Sikarpur", "Silachhari", "Siliguri", "Sillod", "Silvani", "Simariya", "Sindagi", "Sindevahi", "Sindhanur", "Sindholi", "Sindi", "Sindi(Selu)", "Sindkhed Raja", "Singampuneri", "Singroli", "Sinner", "Sira", "Sircilla", "Sirhind", "Sirkali", "Siroli", "Sironcha", "Sironj", "Sirsa", "Sirsaganj", "Sirsi", "Sitapur", "Sitarganj", "Sitmau", "Sivagangai", "Sivagiri", "Siwan", "Siwani", "Siyana", "Soharatgarh", "Sohela", "Sohna", "Sohra", "Sojat City", "Sojat Road", "Solan", "Solan(Nalagarh)", "Solan(Rajgarh)", "Solapur", "Somvarpet", "Sonamura", "Sonepat", "Songadh", "Songadh(Umrada)", "Sonkatch", "Sonpeth", "Sorabha", "Soundati", "Soyatkalan", "Sri Har Gobindpur", "Sri Madhopur", "Sri Vijayanagar", "Sridungargarh", "Sriganganagar", "Sriganganagar(F&V)", "Srikalahasti", "Srinivasapur", "Srirampur", "Srirangapattana", "Sujangarh(Churu)", "Sukma", "Sulargharat", "Sultan bathery", "Sultanabad", "Sultanpur", "Sultanpurchilkana", "Sumerganj", "Sumerpur", "Sunam", "Sunguvarchatram", "Surajgarh", "Surajpur", "Surat", "Suratgarh", "Suryapeta", "Susner", "Suthalia", "Suvasra", "Syopurkalan(F&V)", "T. Narasipura", "Taal", "Tadepalligudem", "Tadkalas", "Takhatpur", "Talalagir", "Talcher", "Taliparamba", "Talod", "Talod(Harsol)", "Taloda", "Talwandi Bhai", "Talwandi Sabo", "Tamkuhi Road", "Tamluk (Medinipur E)", "Tanakpur", "Tanda", "Tanda Urmur", "Tanda(Rampur)", "Tanduru", "Tanuku", "Tapa(Sadar Bazar)", "Tapa(Tapa Mandi)", "Tarana", "Tarantaran", "Tarapur", "Tarikere", "Tarori", "Tasgaon", "Taura", "Telhara", "Teliamura", "Tenali", "Tendukheda", "Tendukona", "Tenning", "Thalaivasal", "Thalasserry", "Thalavadi", "Thalayolaparambu", "Thamarassery", "Thammampati", "Thanabhawan", "Thandla", "Thanesar", "Thanjavur", "Thara", "Thara(Shihori)", "Tharad", "Tharad(Rah)", "Thasara", "Thasara(Dokar)", "Thattanchavady", "Theni", "Thirthahalli", "Thirukovilur", "Thirupoondi", "Thiruppananthal", "Thiruppur", "Thirurrangadi", "Thiruvannamalai", "Thiruvarur", "Thiryagadurgam", "Thodupuzha", "Thondamuthur", "Thoubal", "Thrippunithura", "Thrissur", "Tikabali", "Tikamgarh", "Tikonia", "Tilhar", "Timarni", "Tindivanam", "Tiphra", "Tiptur", "Tiroda", "Tiruchengode", "Tirumalagiri", "Tirupati", "Tiruthuraipoondi", "Tiruvennainallur", "Tokapal", "Tonk", "Toofanganj", "Tosham", "Tral", "Tseminyu", "Tuensang", "Tuljapur", "Tulsipur", "Tumkur", "Tumsar", "Tundla", "Tura", "Turvekere", "Tusura", "Uchana", "Uchhal", "Udaipur", "Udaipur(F&V)", "Udaipura", "Udala", "Udaypur", "Udgir", "Udgir(Devanibud)", "Udhampur", "Udumalpet", "Udupi", "Ujhani", "Ujjain", "Ujjain(F&V)", "Ulhasnagar", "Uluberia", "Ulundurpettai", "Umared", "Umarga", "Umari", "Umariya", "Umarked(Danki)", "Umarkhed", "Umrane", "Umreth", "Una", "Unava", "Unhel", "Uniyara", "Unjha", "Unknown", "Unnao", "Upleta", "Usilampatty", "Uthangarai", "Uthiramerur", "Utraula", "Uttaripura", "Vadakkenchery", "Vadali", "Vadgam", "Vadgaonpeth", "Vadhvan", "Vadodara", "Vadodara(Navapura)", "Vadodara(Sayajipura)", "Vaduj", "Vaduvur", "Vadvani", "Vagodiya", "Vai", "Vaijpur", "Valangaiman", "Valathi", "Valia", "Vallam", "Valod(Buhari)", "Valpol", "Valsad", "Vamanapuram", "Vandavasi", "Vandiperiyar", "Vani", "Vankaner", "Vankaner(Sub yard)", "Vansda", "Vansda(Limzar)", "Varanasi(F&V)", "Varanasi(Grain)", "Varaseoni", "Varipaal", "Varni", "Varora", "Vasai", "Vashi New Mumbai", "Vav", "Vayalapadu", "Vazhapadi", "Vedachandur", "Vedaranyam", "Vellakkoil", "Vellore", "Velur", "Vemulawada", "Vengeri(Kozhikode)", "Venkateswarnagar", "Vessue", "Vettavalam", "Vidisha", "Vijapur", "Vijapur(Gojjariya)", "Vijapur(Kukarvada)", "Vijapur(Ladol)", "Vijapur(veg)", "Vijayanagaram", "Vijaypur", "Vikarabad", "Vikasnagar", "Vikkiravandi", "Vilaspur", "Villupuram", "Vilthararoad", "Virudhachalam", "Virudhunagar", "Visavadar", "Vishalpur", "Vishrampur", "Visnagar", "Visoli", "Viswan", "Vita", "Vithinasserri", "Voligonda", "Vyara(Paati)", "Vyra", "Wadakkanchery", "Wanaparthy Road", "Wanaparthy town", "Wansi", "Warangal", "Wardha", "Washim", "Washim(Ansing)", "Wazirganj", "Wokha Town", "Wyra", "Yadgir", "Yamuna Nagar", "Yawal", "Yellandu", "Yellapur", "Yellareddy", "Yeola", "Yeotmal", "Yusufpur", "Zaheerabad", "ZariZamini", "Zira", "Zunheboto", "kalanwali", "vadakarapathy"];

const PricePrediction = () => {
    const [formData, setFormData] = useState({
        commodity_name: availableCommodities[0],
        state: availableStates[0],
        district: availableDistricts[0],
        market: availableMarkets[0]
    });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [step, setStep] = useState(0);

    const steps = [
        "Analyzing market data...",
        "Evaluating regional trends...",
        "Processing seasonal patterns...",
        "Generating 6-month forecast..."
    ];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);
        setStep(0);

        const interval = setInterval(() => {
            setStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
        }, 700);

        try {
            const response = await predictPrice(formData);
            setResult(response);
        } catch (err) {
            setError(err.detail || "Failed to fetch price predictions");
        } finally {
            clearInterval(interval);
            setLoading(false);
        }
    };

    const getStats = (predictions) => {
        if (!predictions || predictions.length === 0) return {};
        const prices = predictions.map(p => p.price);
        const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        const trend = prices[prices.length - 1] - prices[0];
        return { avg: avg.toFixed(2), min: min.toFixed(2), max: max.toFixed(2), trend: trend.toFixed(2) };
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    background: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(46,125,50,0.2)',
                    borderRadius: '12px',
                    padding: '14px 18px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                }}>
                    <p style={{ margin: 0, fontWeight: 600, color: 'var(--primary-dark)', fontSize: '0.9rem' }}>{label}</p>
                    <p style={{ margin: '6px 0 0', fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-color)' }}>
                        ₹{payload[0].value.toLocaleString()}
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#999' }}>Modal Price / Quintal</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="container section animate-fade-in">
            <div className="text-center" style={{ marginBottom: '40px' }}>
                <div className="badge" style={{ marginBottom: '16px' }}>
                    <BarChart3 size={16} /> ML-Powered Forecasting
                </div>
                <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <TrendingUp color="var(--primary-color)" /> Market Price Prediction
                </h1>
                <p className="hero-subtitle">Forecast agricultural commodity prices for the next 6 months using our Random Forest model trained on 800K+ market records.</p>
            </div>

            <div className="glass-panel" style={{ maxWidth: '960px', margin: '0 auto', padding: '40px' }}>

                {/* Form */}
                {!result && !loading && (
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.95rem' }}>
                                <Package size={16} color="var(--primary-color)" /> Commodity Name
                            </label>
                            <select id="input-commodity" name="commodity_name" value={formData.commodity_name} onChange={handleChange} required 
                                style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #ddd', fontSize: '1rem', transition: 'border-color 0.3s', outline: 'none', backgroundColor: 'white' }}
                                onFocus={e => e.target.style.borderColor = 'var(--primary-color)'}
                                onBlur={e => e.target.style.borderColor = '#ddd'}
                            >
                                {availableCommodities.map(item => (
                                    <option key={item} value={item}>{item}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.95rem' }}>
                                <MapPin size={16} color="var(--primary-color)" /> State
                            </label>
                            <select id="input-state" name="state" value={formData.state} onChange={handleChange} required 
                                style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #ddd', fontSize: '1rem', transition: 'border-color 0.3s', outline: 'none', backgroundColor: 'white' }}
                                onFocus={e => e.target.style.borderColor = 'var(--primary-color)'}
                                onBlur={e => e.target.style.borderColor = '#ddd'}
                            >
                                {availableStates.map(item => (
                                    <option key={item} value={item}>{item}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.95rem' }}>
                                <MapPin size={16} color="var(--primary-color)" /> District
                            </label>
                            <select id="input-district" name="district" value={formData.district} onChange={handleChange} required 
                                style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #ddd', fontSize: '1rem', transition: 'border-color 0.3s', outline: 'none', backgroundColor: 'white' }}
                                onFocus={e => e.target.style.borderColor = 'var(--primary-color)'}
                                onBlur={e => e.target.style.borderColor = '#ddd'}
                            >
                                {availableDistricts.map(item => (
                                    <option key={item} value={item}>{item}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.95rem' }}>
                                <MapPin size={16} color="var(--primary-color)" /> Market
                            </label>
                            <select id="input-market" name="market" value={formData.market} onChange={handleChange} required 
                                style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid #ddd', fontSize: '1rem', transition: 'border-color 0.3s', outline: 'none', backgroundColor: 'white' }}
                                onFocus={e => e.target.style.borderColor = 'var(--primary-color)'}
                                onBlur={e => e.target.style.borderColor = '#ddd'}
                            >
                                {availableMarkets.map(item => (
                                    <option key={item} value={item}>{item}</option>
                                ))}
                            </select>
                        </div>

                        <button id="btn-predict-price" type="submit" disabled={loading} className="btn btn-primary" style={{ gridColumn: 'span 2', justifyContent: 'center', fontSize: '1.15rem', marginTop: '10px', padding: '14px' }}>
                            <TrendingUp size={20} /> Predict Market Trends
                        </button>
                    </form>
                )}

                {/* Loading Animation */}
                {loading && (
                    <div style={{ textAlign: 'center', padding: '60px 0' }}>
                        <Loader2 size={48} className="animate-spin" style={{ margin: '0 auto 20px', color: 'var(--primary-color)' }} />
                        <h3 style={{ marginBottom: '10px' }}>{steps[step]}</h3>
                        <div style={{ width: '100%', height: '8px', background: '#eee', borderRadius: '4px', overflow: 'hidden', maxWidth: '350px', margin: '0 auto' }}>
                            <div style={{ width: `${((step + 1) / steps.length) * 100}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary-color), var(--primary-light))', transition: 'width 0.5s ease', borderRadius: '4px' }}></div>
                        </div>
                        <p style={{ marginTop: '12px', color: '#999', fontSize: '0.85rem' }}>Querying trained model on 800K+ records...</p>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div style={{ marginTop: '20px', padding: '16px 20px', background: '#ffebee', color: '#c62828', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <AlertCircle size={20} /> {error}
                        <button onClick={() => { setResult(null); setError(null); }} className="btn btn-secondary" style={{ marginLeft: 'auto', padding: '6px 16px', fontSize: '0.85rem' }}>Try Again</button>
                    </div>
                )}

                {/* Results */}
                {result && !loading && (() => {
                    const stats = getStats(result.predictions);
                    return (
                        <div className="animate-fade-in">
                            {/* Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <div>
                                    <h2 style={{ margin: 0, color: 'var(--primary-dark)' }}>
                                        {result.commodity}
                                    </h2>
                                    <p style={{ margin: '4px 0 0', color: '#888', fontSize: '0.9rem' }}>6-Month Price Forecast</p>
                                </div>
                                <button onClick={() => setResult(null)} className="btn btn-secondary" style={{ padding: '8px 20px', fontSize: '0.9rem' }}>
                                    New Prediction
                                </button>
                            </div>

                            {/* Stat Cards */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '30px' }}>
                                <div style={{ background: 'linear-gradient(135deg, #e8f5e9, #c8e6c9)', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#555', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Average</p>
                                    <p style={{ margin: '6px 0 0', fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-dark)' }}>
                                        <IndianRupee size={18} style={{ verticalAlign: 'middle' }} />{Number(stats.avg).toLocaleString()}
                                    </p>
                                </div>
                                <div style={{ background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#555', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Lowest</p>
                                    <p style={{ margin: '6px 0 0', fontSize: '1.5rem', fontWeight: 700, color: '#1565c0' }}>
                                        <IndianRupee size={18} style={{ verticalAlign: 'middle' }} />{Number(stats.min).toLocaleString()}
                                    </p>
                                </div>
                                <div style={{ background: 'linear-gradient(135deg, #fff3e0, #ffe0b2)', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#555', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Highest</p>
                                    <p style={{ margin: '6px 0 0', fontSize: '1.5rem', fontWeight: 700, color: '#e65100' }}>
                                        <IndianRupee size={18} style={{ verticalAlign: 'middle' }} />{Number(stats.max).toLocaleString()}
                                    </p>
                                </div>
                                <div style={{ background: Number(stats.trend) >= 0 ? 'linear-gradient(135deg, #e8f5e9, #c8e6c9)' : 'linear-gradient(135deg, #ffebee, #ffcdd2)', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#555', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Trend</p>
                                    <p style={{ margin: '6px 0 0', fontSize: '1.5rem', fontWeight: 700, color: Number(stats.trend) >= 0 ? '#2e7d32' : '#c62828', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                        {Number(stats.trend) >= 0 ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                                        ₹{Math.abs(Number(stats.trend)).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {/* Chart */}
                            <div style={{ height: '380px', width: '100%', background: 'white', padding: '24px 20px 16px', borderRadius: '14px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', marginBottom: '24px' }}>
                                <h4 style={{ margin: '0 0 16px', fontSize: '0.85rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Forecast Trend</h4>
                                <ResponsiveContainer width="100%" height="90%">
                                    <AreaChart data={result.predictions} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                        <defs>
                                            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--primary-color)" stopOpacity={0.25} />
                                                <stop offset="95%" stopColor="var(--primary-color)" stopOpacity={0.02} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 13 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 13 }} dx={-10} tickFormatter={(val) => `₹${val.toLocaleString()}`} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area
                                            type="monotone"
                                            dataKey="price"
                                            stroke="var(--primary-color)"
                                            strokeWidth={3}
                                            fill="url(#priceGradient)"
                                            dot={{ r: 5, fill: 'var(--primary-color)', strokeWidth: 2, stroke: 'white' }}
                                            activeDot={{ r: 7, strokeWidth: 0 }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Data Table */}
                            <div style={{ background: 'white', borderRadius: '14px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                                <h4 style={{ margin: 0, padding: '18px 24px 12px', fontSize: '0.85rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Monthly Breakdown</h4>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: 'rgba(46,125,50,0.05)' }}>
                                            <th style={{ textAlign: 'left', padding: '12px 24px', fontSize: '0.85rem', color: '#555', fontWeight: 600 }}>Month</th>
                                            <th style={{ textAlign: 'right', padding: '12px 24px', fontSize: '0.85rem', color: '#555', fontWeight: 600 }}>Predicted Price (₹/Qt)</th>
                                            <th style={{ textAlign: 'right', padding: '12px 24px', fontSize: '0.85rem', color: '#555', fontWeight: 600 }}>Change</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {result.predictions.map((p, idx) => {
                                            const prev = idx > 0 ? result.predictions[idx - 1].price : p.price;
                                            const diff = p.price - prev;
                                            return (
                                                <tr key={idx} style={{ borderTop: '1px solid #f5f5f5', transition: 'background 0.2s' }}
                                                    onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                                    <td style={{ padding: '14px 24px', fontWeight: 500 }}>{p.month}</td>
                                                    <td style={{ padding: '14px 24px', textAlign: 'right', fontWeight: 700, fontFamily: 'monospace', fontSize: '1.05rem' }}>
                                                        ₹{p.price.toLocaleString()}
                                                    </td>
                                                    <td style={{ padding: '14px 24px', textAlign: 'right' }}>
                                                        {idx === 0 ? (
                                                            <span style={{ color: '#999', fontSize: '0.85rem' }}>—</span>
                                                        ) : (
                                                            <span style={{ color: diff >= 0 ? '#2e7d32' : '#c62828', fontWeight: 600, fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                                                {diff >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                                                ₹{Math.abs(diff).toFixed(2)}
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Disclaimer */}
                            <div style={{ marginTop: '20px', padding: '14px 20px', background: 'rgba(0,0,0,0.03)', borderRadius: '10px', fontSize: '0.8rem', color: '#999' }}>
                                <strong>Disclaimer:</strong> Predictions are generated by a Random Forest model trained on historical APMC market data. Actual prices may vary due to factors not captured by the model such as government policy changes, natural disasters, and international trade conditions.
                            </div>
                        </div>
                    );
                })()}
            </div>
        </div>
    );
};

export default PricePrediction;
