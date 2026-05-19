import os
import json
import asyncio
import edge_tts
import base64
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Try to load .env, fallback to .env.example if missing
if not os.path.exists('.env') and os.path.exists('.env.example'):
    load_dotenv('.env.example', override=True)
else:
    load_dotenv(override=True)

from emotion_detector import EmotionDetector

app = Flask(__name__)
CORS(app)

# Initialize the detector
detector = EmotionDetector()

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy' if detector.provider else 'degraded',
        'provider': detector.provider,
        'tts_status': 'ready',
        'model_version': '4.5.0-emotional-os',
        'capabilities': ['contextual_memory', 'persona_mapping', 'world_awareness', 'edge_tts']
    })

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    if not data or 'text' not in data:
        return jsonify({'error': 'Missing text field'}), 400
    
    text = data['text']
    context = data.get('context', {}) # Extract rich context from frontend
    
    try:
        # 1. Detect emotion (Text-based)
        emotion_result = detector.detect_text_emotion(text)
        
        # 2. Generate response using full contextual awareness
        response_text = detector.generate_response(text, emotion_result, context)
        
        return jsonify({
            'emotion': emotion_result,
            'response': response_text,
            'context_processed': True
        })
    except Exception as e:
        print(f"Error processing chat: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/tts', methods=['POST'])
def tts():
    data = request.json
    if not data or 'text' not in data:
        return jsonify({'error': 'Missing text field'}), 400
    
    text = data['text']
    # Use a calm, therapeutic voice
    voice = "en-US-EmmaMultilingualNeural" 
    
    async def _generate():
        communicate = edge_tts.Communicate(text, voice)
        audio_bytes = b""
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_bytes += chunk["data"]
        return audio_bytes

    try:
        # Run async code in sync flask route
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        audio_content = loop.run_until_complete(_generate())
        loop.close()
        
        audio_base64 = base64.b64encode(audio_content).decode('utf-8')
        
        return jsonify({
            'success': True,
            'audio_base64': audio_base64,
            'format': 'mp3'
        })
    except Exception as e:
        print(f"TTS Error: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Run on port 5001 to avoid conflicting with Node.js on 5000
    app.run(host='0.0.0.0', port=5001, debug=True)
