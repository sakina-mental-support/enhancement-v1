import os
import google.generativeai as genai
from openai import OpenAI

class ChatbotEngine:
    def __init__(self):
        # Support both Gemini and OpenAI
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key or "your_" in self.api_key:
            self.api_key = os.getenv("OPENAI_API_KEY")
            
        self.model_type = None

        if self.api_key and "your_" not in self.api_key:
            if self.api_key.startswith("sk-"):
                self.model_type = "openai"
                self.openai_client = OpenAI(api_key=self.api_key)
            else:
                self.model_type = "gemini"
                genai.configure(api_key=self.api_key)
                self.gemini_model = genai.GenerativeModel('gemini-flash-latest')

    def generate_response(self, user_message: str, emotion: str, exercise: dict, chat_history: list = None, context: dict = None) -> str:
        if not self.model_type:
            return (
                "SYSTEM MESSAGE: API key not configured. "
                "Please add a valid API key to the .env file to enable the AI Chatbot.\n\n"
                f"Detected Emotion: {emotion}\n"
                f"Suggested Exercise: {exercise['name']} - {exercise['instruction']}"
            )
            
        context = context or {}
        user_name = context.get('userName', 'User')
        persona = context.get('persona', 'Your Sakina')
        
        system_prompt = (
            f"You are an empathetic, professional AI emotional support assistant acting in the persona of '{persona}'. "
            f"The user's name is {user_name}. "
            "You must respond to the user with warmth, understanding, and actionable, personalized advice based on your persona.\n"
            "Do NOT provide generic responses like 'I am sorry to hear that'. Instead, validate their feelings "
            "and engage them in a constructive way.\n\n"
            f"Currently, the user's detected emotional state is: {emotion.upper()}.\n"
            f"You MUST seamlessly weave the following exercise into your response as a gentle suggestion:\n"
            f"Exercise Name: {exercise['name']}\n"
            f"Exercise Instructions: {exercise['instruction']}\n\n"
        )
        
        history_text = ""
        if chat_history:
            history_text = "Previous conversation context:\n"
            for msg in chat_history[-4:]:
                role = "User" if msg.get("role") == "user" else "Sakina"
                history_text += f"{role}: {msg.get('content', '')}\n"
        
        final_prompt = (
            f"{system_prompt}"
            f"{history_text}\n"
            f"User's current message: \"{user_message}\"\n\n"
            "Respond naturally, empathetically, and guide them through the exercise. Keep it under 150 words."
        )
        
        try:
            if self.model_type == "openai":
                response = self.openai_client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[{"role": "user", "content": final_prompt}]
                )
                return response.choices[0].message.content
            elif self.model_type == "gemini":
                response = self.gemini_model.generate_content(final_prompt)
                return response.text
        except Exception as e:
            return f"I'm here for you, but I encountered an error with {self.model_type.upper()}: {str(e)}"
