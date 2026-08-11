export const SUBJECT_MAPPING: Record<string, string> = {
  "tai-lieu-toan-hoc": "Toán học",
  "tai-lieu-vat-ly": "Vật lý",
  "tai-lieu-hoa-hoc": "Hóa học",
  "tai-lieu-sinh-hoc": "Sinh học",
  "tai-lieu-khtn": "KHTN",
  "tai-lieu-tieng-anh": "Tiếng Anh",
  "tai-lieu-ngu-van": "Ngữ văn",
  "tai-lieu-lich-su": "Lịch sử",
  "tai-lieu-dia-ly": "Địa lý",
  "tai-lieu-gdktpl": "GD KT&PL",
  "hsa": "HSA",
  "vact": "VACT",
  "tsa": "TSA",
  "spt": "SPT",
};

export function getSubjectFromSlug(slug: string): string | null {
  if (SUBJECT_MAPPING[slug]) {
    return SUBJECT_MAPPING[slug];
  }
  // Hỗ trợ trường hợp slug từ component SubjectShowcase (ví dụ: 'khtn', 'toan-hoc' thay vì 'tai-lieu-khtn')
  const slugWithPrefix = `tai-lieu-${slug}`;
  if (SUBJECT_MAPPING[slugWithPrefix]) {
    return SUBJECT_MAPPING[slugWithPrefix];
  }
  return null;
}
