import os
import google.generativeai as genai
from dotenv import load_dotenv

class AudioProcessor:
    def __init__(self):
        load_dotenv()
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.is_ready = False

        if self.api_key:
            try:
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel("gemini-flash-latest")
                self.is_ready = True
            except Exception as e:
                print(f"Warning: Failed to initialize Gemini client for audio. {str(e)}")

    def transcribe_audio(self, audio_file_path: str) -> str:
        """
        Converts spoken audio into text using Google Gemini's audio understanding.
        """
        if not self.is_ready:
            return "Voice transcription is unavailable. Please check your GEMINI_API_KEY in .env"

        if not os.path.exists(audio_file_path):
            raise FileNotFoundError(f"Audio file not found: {audio_file_path}")

        try:
            # Upload the audio file to Gemini
            audio_file = genai.upload_file(
                path=audio_file_path,
                mime_type="audio/webm"
            )

            # Ask Gemini to transcribe it
            response = self.model.generate_content([
                audio_file,
                "Please transcribe exactly what is spoken in this audio. Return only the transcribed text, nothing else."
            ])

            # Clean up the uploaded file
            try:
                genai.delete_file(audio_file.name)
            except Exception:
                pass
            return response.text.strip()

        except Exception as e:
            raise Exception(f"Failed to process audio via Gemini: {str(e)})")

