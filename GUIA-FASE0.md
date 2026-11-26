# Garrafeira · Fase 0 — o que tens de fazer

Tempo total: cerca de 15 minutos. Nunca coles chaves no chat; ficam só no Supabase e no Vercel.

## 1. Criar o Supabase (grátis)
1. Entra em https://supabase.com e cria conta (podes usar o GitHub).
2. **New project** → nome `garrafeira`, região **Central EU (Frankfurt)**, inventa uma password da base de dados e guarda-a no teu gestor de passwords.
3. Quando o projeto estiver pronto: **SQL Editor** → **New query** → cola todo o conteúdo de `supabase/migrations/001_inicial.sql` → **Run**. Deve dizer "Success. No rows returned".
4. **Authentication → Emails → Templates → Magic Link**: substitui o corpo por:
   ```
   <h2>Garrafeira</h2>
   <p>O teu código de entrada: <strong>{{ .Token }}</strong></p>
   ```
   (Assim o email traz o código de 6 dígitos em vez de um link.)
5. **Authentication → Sign In / Providers → Email**: confirma que "Email OTP Length" está em **6**.
6. **Project Settings → API**: vais precisar do **Project URL** e da **anon public key** no passo 2.

## 2. Publicar no Vercel
1. Em https://vercel.com → **Add New → Project** e importa a pasta (ou, se preferires, eu faço o deploy a partir do teu PC com a tua sessão do Vercel).
2. Em **Settings → Environment Variables** cria:
   - `VITE_SUPABASE_URL` = Project URL
   - `VITE_SUPABASE_ANON_KEY` = anon public key
   - `CRON_SECRET` = uma frase qualquer comprida (protege o keepalive)
3. **Redeploy**. O cron diário (`/api/keepalive`, 06:00 UTC) fica ativo sozinho por causa do `vercel.json`.

## 3. Testar no iPhone
1. Abre o endereço do Vercel no **Safari** → botão Partilhar → **Adicionar ao ecrã principal**.
2. Abre a app pelo ícone (não pelo Safari), escreve o teu email, recebe o código e escreve-o na app.
3. Deves ver a Garrafeira vazia, a barra de baixo com o "+" e as Definições com o teu email.
4. Fecha e volta a abrir a app: deve continuar com sessão iniciada.

## 4. Depois do teu primeiro login
**Authentication → Sign In / Providers → "Allow new users to sign up" → desligar.** Assim mais ninguém consegue criar conta.

## Para testar no PC (opcional)
Copia `.env.example` para `.env.local`, preenche os dois valores e corre `npm install` e `npm run dev` → http://localhost:5174
