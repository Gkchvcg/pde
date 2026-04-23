# DataKart: The Global Data Aggregation Engine 🚀

**Built by Maroof Husain** | [maroofhusain2006@gmail.com](mailto:maroofhusain2006@gmail.com)

DataKart is a decentralized, dual-sided marketplace designed to solve the data ownership crisis. It provides a secure bridge between **Companies** requiring large-scale, high-quality datasets for AI training and **Individual Sellers** who want to monetize their digital footprint without sacrificing privacy.

---

## 🤖 AI-Powered Ecosystem

DataKart leverages a multi-layered AI architecture to ensure data quality and user trust:
- **Karty AI Assistant**: A live, Llama-3 powered chatbot on the landing page that guides users through the ecosystem.
- **AI Smart Scanner**: Integrated into the Marketplace, using Vision AI (BLIP) to automatically tag data and an LLM to provide real-time market value estimates.
- **DataKart AI Guard**: A dedicated Python/Flask backend for NSFW detection, duplicate prevention (pHash), and metadata extraction.

---

## 🏗️ How It Works

### 1. For Data Sellers (Individual Users)
*   **Secure Vault**: Upload data to a private, encrypted vault.
*   **AI Scan**: Automatically identify and value your data points using our AI Scanner.
*   **Earn Tokens**: Contribute to bounties and receive instant POL/USDC payouts via smart contracts.

### 2. For Companies (Data Buyers)
*   **Bulk Bounties**: Post large-scale data aggregation requests.
*   **Verified Data**: Receive data that has been pre-screened by the AI Guard for safety and relevance.
*   **Global Reach**: Source high-quality training data from a global network of verified contributors.

---

## 🛠️ Technical Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js 14, React, Tailwind CSS |
| **AI Models** | Meta-Llama-3-8B, Salesforce BLIP, NudeNet |
| **Web3** | RainbowKit, Wagmi, Solidity, Polygon Amoy |
| **Backends** | Node.js (Core), Python/Flask (AI Guard) |

---

## 📂 Project Structure

```text
├── apps/
│   ├── web/          # Next.js App (Portals, ChatBot, API Routes)
│   └── api/          # Node.js API (Marketplace Logic)
├── nudenetadd/       # Python AI Guard (NSFW, Tagging, Duplicate Check)
├── contracts/        # Smart Contracts
└── README.md         # You are here!
```

---

## 🚀 Quick Start

### 1. Frontend & Core API (Node.js)
```bash
# Install dependencies
npm install

# Run dev server
npm run dev
# Visit http://localhost:3000
```

### 2. AI Guard Server (Python)
The AI Guard handles content moderation and advanced data analysis.
```bash
cd nudenetadd

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install requirements
pip install -r requirements.txt

# Run the server
python app.py
# Server runs on http://localhost:5001
```

### 3. Environment Setup
Create a `.env` file in `apps/web/` and add:
```text
HUGGINGFACE_API_KEY=your_key_here
```

---

## ⚖️ Legal & Compliance
DataKart adheres to **GDPR**, **CCPA**, and **India's DPDP Act** by ensuring data minimization and user-controlled permissions.

---

## 📧 Contact
Built with ❤️ by **Maroof Husain**.
[GitHub](https://github.com/maroofhusain) | [Email](mailto:maroofhusain2006@gmail.com)

*© 2026 DataKart. Decentralizing the Data Economy.*
