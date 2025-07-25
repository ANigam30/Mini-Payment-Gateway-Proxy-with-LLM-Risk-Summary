# Mini Payment Gateway Proxy with LLM Risk Summary

## Features

- **Fraud Risk Scoring:**
  - Internally simulates a fraud risk score (float between 0 and 1) using simple heuristics:
    - Large amount (default threshold: 1000)
    - Suspicious email domains (e.g., `.ru`, `test.com`)
- **Routing Logic:**
  - Routes to payment processor if score < 0.5
  - Blocks submission if score ≥ 0.5
- **LLM Risk Summary:**
  - Generates a natural-language summary of the risk using Gemini LLM (Google)
- **Transaction Logging:**
  - Logs all transactions in memory with timestamp and metadata
- **Input Validation:**
  - Validates all payment requests and returns basic error responses
- **Unit Tests:**
  - Includes Jest-based unit tests for fraud scoring, routing, and logging
- **Modern TypeScript:**
  - Uses modern TypeScript conventions and structure

## Setup

1. **Install dependencies:**
   ```sh
   npm install
   ```

2. **Environment Variables:**
   Create a `.env` file in the project root with the following (example):
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent
   FRAUD_AMOUNT_THRESHOLD=1000
   FRAUD_SUSPICIOUS_DOMAINS=.ru,test.com
   FRAUD_BLOCKING_THRESHOLD=0.5
   ```
   - `GEMINI_API_KEY` is required for LLM summaries.
   - Other variables are optional (defaults shown above).

3. **Run the server:**
   ```sh
   npm run dev
   # or
   npm run build && npm start
   ```

4. **Run tests:**
   ```sh
   npm test
   ```

## API Usage

- **POST /payment**
  - Request body:
    ```json
    {
      "amount": 123.45,
      "email": "user@example.com",
      "method": "paypal", // or "stripe"
      "source": "web"
    }
    ```
  - Response:
    ```json
    {
      "success": true,
      "riskScore": 0.6,
      "explanation": ["High amount detected."],
      "status": "blocked", // or "allowed"
      "transactionId": "...",
      "timestamp": "..."
    }
    ```

## Notes
- All fraud rules are now implemented as code and LLM prompt, not in config files.
- Transaction logs are in-memory only (for demo/testing).
- LLM summary is generated by Gemini and may require a valid API key. 