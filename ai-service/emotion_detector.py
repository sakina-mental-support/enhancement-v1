import numpy as np
import pickle
import os
import re
import json
from dotenv import load_dotenv
from openai import OpenAI

try:
    import tensorflow as tf
    from audio_processor import AudioEmotionProcessor
    AUDIO_SUPPORT = True
except ImportError:
    print("Warning: TensorFlow or librosa not installed. Audio emotion detection disabled.")
    AUDIO_SUPPORT = False

load_dotenv()

class EmotionDetector:
    def __init__(self, api_key=None):
        # 🚀 INITIALIZE NVIDIA MINIMAX 2.7
        self.nvidia_key = os.getenv("NVIDIA_API_KEY")
        self.gemini_key = os.getenv("GEMINI_API_KEY")
        
        if self.nvidia_key:
            self.client = OpenAI(
                base_url="https://integrate.api.nvidia.com/v1",
                api_key=self.nvidia_key
            )
            self.provider = "nvidia"
            self.model_id = "minimaxai/minimax-m2.7"
        elif self.gemini_key:
            import google.generativeai as genai
            genai.configure(api_key=self.gemini_key)
            self.gemini_model = genai.GenerativeModel('gemini-1.5-flash')
            self.provider = "gemini"
        else:
            self.provider = None

    def generate_response(self, user_input, emotion_result, context=None):
        """
        AI Personality Framework implementation using MiniMax 2.7 via NVIDIA.
        """
        emotion = emotion_result['primary_emotion']
        intensity = emotion_result['intensity']
        
        context = context or {}
        user_name = context.get('userName', 'User')
        persona = context.get('persona', 'Gentle Friend')
        history = context.get('history', [])
        world = context.get('systemWorld', 'Equilibrium')
        stress_level = context.get('intensity', 50)

        # 🎭 PERSONA BEHAVIORAL RULES
        persona_configs = {
            'Gentle Friend': "Kind, soft, helpful. Use simple words of comfort.",
            'Calm Therapist': "Steady, quiet, thoughtful. Help the user stay calm.",
            'Motivational Coach': "Positive, active. Help the user do small things.",
            'Scientific Guide': "Logical. Explain things simply.",
            'Minimal Companion': "Short, quiet. Give the user space."
        }
        
        state_rules = "Shorter responses for high distress." if stress_level > 80 else ""
        
        system_prompt = f"""You are Sakina, a helpful Emotion Helper.
ACTING AS: {persona} ({persona_configs.get(persona)})
USER STATE: {emotion} (Stress: {stress_level}%)
NAME: {user_name}

RULES:
1. Use EASY ENGLISH. Use simple words and short sentences.
2. Max 50 words. Be human and very clear.
3. No toxic positivity. 
4. Reference the "{world}" atmosphere.
"""

        messages = [{"role": "system", "content": system_prompt}]
        for msg in history[-5:]:
            role = "assistant" if msg.get('role') == 'assistant' else "user"
            messages.append({"role": role, "content": msg.get('content', '')})
        messages.append({"role": "user", "content": user_input})

        try:
            if self.provider == "nvidia":
                response = self.client.chat.completions.create(
                    model=self.model_id,
                    messages=messages,
                    temperature=0.7,
                    max_tokens=256
                )
                return response.choices[0].message.content.strip()
            elif self.provider == "gemini":
                full_prompt = f"{system_prompt}\n\nUser: {user_input}\nSakina:"
                response = self.gemini_model.generate_content(full_prompt)
                return response.text.strip()
            
            return self._get_smart_fallback(emotion, name=user_name)
        except Exception as e:
            print(f"AI Error: {e}")
            return self._get_smart_fallback(emotion, name=user_name)

    def detect_text_emotion(self, text):
        prompt = f"Analyze emotion in: '{text}'. Return ONLY JSON: {{\"primary_emotion\": \"emotion\", \"intensity\": 0.5}}. Emotions: neutral,calm,happy,sad,angry,fearful,overwhelmed"
        try:
            if self.provider == "nvidia":
                response = self.client.chat.completions.create(
                    model=self.model_id,
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.1
                )
                return self._parse_json_emotion(response.choices[0].message.content)
            elif self.provider == "gemini":
                response = self.gemini_model.generate_content(prompt)
                return self._parse_json_emotion(response.text)
        except: pass
        return {'primary_emotion': 'neutral', 'intensity': 0.3}

    def _parse_json_emotion(self, text):
        try:
            json_match = re.search(r'\{[^}]*\}', text)
            if json_match:
                result = json.loads(json_match.group())
                return {
                    'primary_emotion': result.get('primary_emotion', 'neutral'),
                    'intensity': float(result.get('intensity', 0.5))
                }
        except: pass
        return {'primary_emotion': 'neutral', 'intensity': 0.3}

    def _get_smart_fallback(self, emotion, name):
        fallbacks = {
            'sad': f"I'm sitting here with you, {name}.",
            'fearful': f"You're safe here, {name}.",
            'overwhelmed': f"Let's take a deep breath, {name}."
        }
        return fallbacks.get(emotion, f"I'm here for you, {name}.")
