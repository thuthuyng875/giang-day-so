import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envText = fs.readFileSync('.env.local', 'utf8');
const env = envText.split('\n').reduce((acc, line) => {
  const [k, v] = line.split('=');
  if (k && v) acc[k.trim()] = v.trim();
  return acc;
}, {});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  const { data } = await supabase.from('products').select('id, name, docType');
  console.log(data);
  for (const p of data || []) {
    if (p.docType === 'Tài liệu theo môn' || p.docType === 'Tất cả' || !p.docType) {
      let newDocType = 'Chuyên đề bài tập';
      if (p.name.toLowerCase().includes('đề thi') || p.name.toLowerCase().includes('đề kiểm tra')) newDocType = 'Đề kiểm tra GK - CK';
      if (p.name.toLowerCase().includes('thpt')) newDocType = 'Ôn thi TN THPTQG';
      if (p.name.toLowerCase().includes('hsg')) newDocType = 'Ôn thi HSG';
      if (p.name.toLowerCase().includes('powerpoint') || p.name.toLowerCase().includes('ppt')) newDocType = 'Bài giảng PowerPoint';
      
      await supabase.from('products').update({docType: newDocType}).eq('id', p.id);
      console.log('Updated', p.name, 'to', newDocType);
    }
  }
}
run();
