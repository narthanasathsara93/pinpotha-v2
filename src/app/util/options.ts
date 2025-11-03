export const options = [
  { label: 'ධර්ම දාන', value: 'dharma_dana' },
  { label: 'සාංඝික දාන', value: 'sanghika_dana' },
  { label: 'විහාර කර්මාන්ත', value: 'vihara_karmanta' },
  { label: 'අභය දාන', value: 'abahay_dana' },
  { label: 'වස්සාන කාල සහ කඨිණ පින්කම්', value: 'kathina' },
  { label: 'විශේෂ වස්තු පූජා කිරීම්', value: 'wishesha_wasthu_puja_kirim' },
  { label: 'ආලෝක පූජා', value: 'aloka_pooja' },
  { label: 'තෙරුවන්ට පූජා', value: 'theruwanta_pooja' },
  { label: 'භාණ්ඩ/උපකරණ පූජා ', value: 'upakarana_puja' },
  { label: 'ස්වර්ණමාලී මහා සෑය', value: 'swarnamali_maha_seya' },
  { label: 'පිරිකර පූජා', value: 'pirikara_pooja' },
  { label: 'ශිලා සමාදාන', value: 'shila_samadana' },
  { label: 'දන්සැල්', value: 'dansal' },
  { label: 'විවිධ දාන', value: 'vivida_dana' },
  { label: 'වන්දනා ගමන්', value: 'vandana_gaman' },
  { label: 'වන රෝපණ', value: 'wana_ropana' },
  { label: 'අධ්‍යාපන', value: 'adhyaapana' },
  { label: 'තිරිසන් සතුන් සම්බන්ධ', value: 'thirisan_sathun_sambanda' },
  { label: 'සෞඛ්‍ය සම්බන්ධ', value: 'saukhya_sambandha' },
  { label: 'විවිධ', value: 'vividha' },
];

export const statusOptions = [
  { label: 'සම්පූර්ණයි', value: 'DONE' },
  { label: 'භාර ගත්', value: 'PROMISED' },
  { label: 'අදහස් කර ගත්', value: 'TO_BE_DONE' },
  { label: 'අත්හිටවූ ', value: 'ABANDONED' },
];

export const receiversDefault = [
  { label: 'බෝසත් විශ්මකර්ම සමූහය', value: 'bvf' },
  { label: 'කලණ මිතුරු හමුව', value: 'kmh' },
  { label: 'A.A. කලන අමරදාස මහතා', value: 'aaka' },
  { label: 'සසුන් කෙත අස්වද්දමු සමූහය', value: 'ska' },
];

export const sinhalaMonths = [
  'ජනවාරි',
  'පෙබරවාරි',
  'මාර්තු',
  'අප්‍රේල්',
  'මැයි',
  'ජූනි',
  'ජූලි',
  'අගෝස්තු',
  'සැප්තැම්බර්',
  'ඔක්තෝබර්',
  'නොවැම්බර්',
  'දෙසැම්බර්',
];

export interface Option {
  label: string;
  value: string;
}
