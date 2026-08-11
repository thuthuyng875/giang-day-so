import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wsfkyauilgxhtpuawvxr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzZmt5YXVpbGd4aHRwdWF3dnhyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjIyNDA4MiwiZXhwIjoyMDkxODAwMDgyfQ.x7or-9FR-0TrrtYlL460e_D5IilW5i7gDII3woybvG8'; // SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProduct() {
  const { data, error } = await supabase
    .from('products')
    .select('id, name')
    .eq('id', 'ff963397-ae87-493d-b4f6-c25d25b6aba2');
    
  console.log('Result:', data);
  if (error) console.error('Error:', error);
}

checkProduct();
