// src/lib/env.ts

const demoMode =
  process.env.NEXT_PUBLIC_DEMO_MODE === "true";


const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL;


const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;



export const publicEnv = {

  demoMode,

  supabaseUrl,

  supabaseAnonKey,

};



export const isSupabaseConfigured =
Boolean(
  supabaseUrl &&
  supabaseAnonKey
);



/**
 * В production demo включается только явно
 *
 * NEXT_PUBLIC_DEMO_MODE=true
 *
 * Никакого автоматического перехода
 * в демо при ошибке Supabase
 */

export const isDemoMode =
  demoMode;



/**
 * Проверка конфигурации
 */

export function checkSupabaseConfig(){

if(
 !isDemoMode &&
 !isSupabaseConfigured
){

throw new Error(
"Supabase не настроен. Проверьте NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY"
);

}

}
