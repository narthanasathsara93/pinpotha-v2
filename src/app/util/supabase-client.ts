import { createClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

export const supbaseStorageUrl = environment.SUPABASE_STORAGE_URL;
export const bucketName =environment.SUPABASE_BUCKET_NAME;
export const mertisTable =environment.SUPABASE_MERITS_TABLE;
export const supabase = createClient(environment.SUPABASE_URL, environment.SUPABASE_ANON_KEY);



