export const SUBJECT_MAPPING: Record<string, string> = {
  "tai-lieu-toan-hoc": "Toán học",
  "tai-lieu-vat-ly": "Vật lý",
  "tai-lieu-hoa-hoc": "Hóa học",
  "tai-lieu-sinh-hoc": "Sinh học",
  "tai-lieu-tin-hoc": "Tin học",
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
  return SUBJECT_MAPPING[slug] || null;
}
