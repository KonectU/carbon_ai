// Quick test to verify Gemini API key is working
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;

console.log('🔍 Testing Gemini API Integration...\n');
console.log('✅ API Key Found:', apiKey ? `${apiKey.substring(0, 10)}...` : '❌ NOT FOUND');
console.log('📝 API Key Length:', apiKey ? apiKey.length : 0);
console.log('🔑 Full Key:', apiKey);

async function testGeminiAPI() {
  if (!apiKey) {
    console.error('\n❌ ERROR: GEMINI_API_KEY not found in .env file');
    return;
  }

  console.log('\n🚀 Making test API call to Gemini...\n');

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: 'Say "Hello! Gemini API is working!" in one sentence.',
                },
              ],
            },
          ],
        }),
      }
    );

    console.log('📡 Response Status:', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('\n❌ API Error:', JSON.stringify(errorData, null, 2));
      return;
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    console.log('\n✅ SUCCESS! Gemini API Response:');
    console.log('📄 Generated Text:', generatedText);
    console.log('\n🎉 Gemini API is working correctly!');
    console.log('✨ Your website scans will now generate AI-powered reports!\n');
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('Stack:', error.stack);
  }
}

testGeminiAPI();
