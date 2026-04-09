import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { sarvamTranscribe } from '@/lib/sarvam';

async function getAuthUser(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return null;
  return verifyToken(token);
}

/**
 * POST /api/transcribe
 * Accepts multipart/form-data with:
 *   - audio: audio file (webm, wav, mp3, etc.)
 *   - language: optional BCP-47 language code (default: hi-IN)
 * Returns: { transcript, language_code, confidence }
 */
export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File | null;
    const language = (formData.get('language') as string) || 'hi-IN';

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    const audioBuffer = await audioFile.arrayBuffer();
    const result = await sarvamTranscribe(audioBuffer, language);

    return NextResponse.json({
      transcript: result.transcript,
      language_code: result.language_code,
      confidence: result.confidence,
    });
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: 'Transcription failed. Please try typing instead.' },
      { status: 503 }
    );
  }
}
