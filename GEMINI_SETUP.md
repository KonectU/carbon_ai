# Gemini API Integration Setup

## Overview
This project now uses Google's Gemini AI to generate detailed carbon footprint reports for scanned websites.

## Setup Instructions

### 1. Get Gemini API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### 2. Configure Environment Variable
Open the `.env` file in the project root and replace the placeholder with your actual API key:

```env
GEMINI_API_KEY="your-actual-gemini-api-key-here"
```

### 3. Restart Development Server
If the server is already running, restart it to load the new environment variable:

```bash
npm run dev
```

## What Changed

### New Features
- **AI-Generated Reports**: Gemini AI now analyzes website metrics and generates:
  - Executive summary of carbon footprint
  - Detailed analysis of performance issues
  - Actionable optimization recommendations with effort estimates

### Files Modified
1. **`src/lib/ai/geminiReport.ts`** (NEW)
   - Gemini API integration
   - Report generation logic
   - Fallback handling if API fails

2. **`src/lib/jobs/websiteScanProcessor.ts`**
   - Added Gemini report generation after website crawl
   - Graceful fallback to basic recommendations if Gemini fails

3. **`src/app/dashboard/page.tsx`**
   - Added AI-generated analysis section
   - Enhanced recommendation display with descriptions

4. **`.env`**
   - Added `GEMINI_API_KEY` configuration

## How It Works

1. **Website Scan**: Playwright crawls the website and collects metrics
2. **Energy Calculation**: Basic energy and carbon calculations are performed
3. **AI Analysis**: Gemini AI analyzes the metrics and generates a detailed report
4. **Display**: Results are shown on the dashboard with AI insights

## Fallback Behavior

If Gemini API fails (network issues, invalid key, etc.), the system automatically falls back to basic rule-based recommendations. The scan will still complete successfully.

## Testing

1. Run a website scan from `/scan`
2. Enter any website URL (e.g., `https://example.com`)
3. Wait for the scan to complete
4. Check the dashboard for AI-generated analysis

## API Usage Notes

- Gemini Pro model is used (free tier available)
- Each scan makes 1 API call
- Response is cached in the database
- No additional API calls for viewing results

## Troubleshooting

### "GEMINI_API_KEY is not configured" error
- Make sure you've added the API key to `.env`
- Restart the development server

### API returns error
- Check if your API key is valid
- Verify you have API quota remaining
- Check network connectivity

### No AI analysis shown
- Check browser console for errors
- Verify the scan completed successfully
- Check if fallback recommendations are shown instead
