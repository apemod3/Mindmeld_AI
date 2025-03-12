from flask import Flask, render_template, request, jsonify
import anthropic
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Initialize Anthropic client
api_key = os.getenv("ANTHROPIC_API_KEY")
if not api_key:
    raise ValueError("No API key found. Please set the ANTHROPIC_API_KEY environment variable.")

client = anthropic.Anthropic(api_key=api_key)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/process_entry', methods=['POST'])
def process_entry():
    data = request.json
    journal_entry = data.get('entry', '')
    
    if not journal_entry:
        return jsonify({'error': 'No journal entry provided'}), 400
    
    try:
        # Create system prompt to guide the AI response
        system_prompt = """
        You are Mindmeld AI, a thoughtful AI journal assistant. Your purpose is to provide supportive, 
        insightful, and personalized responses to users' journal entries about their day.
        
        Guidelines for your response:
        - Begin with a warm, empathetic acknowledgment of their day
        - Identify and reflect on emotional themes in their entry
        - Offer a thoughtful insight or gentle perspective
        - End with an encouraging message or thought-provoking question that invites reflection
        - Keep your responses warm, supportive and conversational
        - Your tone should be like a supportive friend, not clinical or overly formal
        - Vary your response style based on the mood of the entry
        
        Important: Never claim to be a therapist or offer medical/mental health advice.
        """
        
        # Ask Claude to respond to the journal entry
        message = client.messages.create(
            model="claude-3-opus-20240229",  # You can also use other Claude models
            max_tokens=800,
            system=system_prompt,
            messages=[
                {"role": "user", "content": f"Here is my journal entry about my day:\n\n{journal_entry}"}
            ]
        )
        
        # Extract the response from the Claude API response
        ai_response = message.content[0].text
        
        return jsonify({'response': ai_response})
    
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': 'Failed to process your entry'}), 500

if __name__ == '__main__':
    app.run(debug=True)