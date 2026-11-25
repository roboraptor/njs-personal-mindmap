import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { script } = body;

    // Whitelist povolených skriptů pro bezpečnost
    const validScripts = ['seed-map', 'seed-map-psychology', 'clear', 'mydata'];

    if (!script || !validScripts.includes(script)) {
      return NextResponse.json({ error: 'Neplatný nebo nepovolený název skriptu.' }, { status: 400 });
    }

    const scriptPath = path.resolve(process.cwd(), `scripts/${script}.ts`);
    // Používáme 'npx tsx' pro spuštění TypeScript souborů bez nutnosti kompilace
    const command = `npx tsx "${scriptPath}"`;

    console.log(`⚙️ Spouštím skript: ${command}`);

    try {
      const { stdout } = await execAsync(command);
      console.log(`✅ Skript dokončen:\n${stdout}`);
      return NextResponse.json({ success: true, stdout });
    } catch (err) {
      const execErr = err as Error & { stderr?: string };
      console.error(`❌ Chyba při spouštění skriptu: ${execErr.message}`);
      return NextResponse.json(
        {
          success: false,
          error: execErr.message,
          stderr: execErr.stderr ?? '',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Interní chyba serveru' }, { status: 500 });
  }
}
