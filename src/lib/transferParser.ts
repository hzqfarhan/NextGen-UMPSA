export interface TransferIntent {
  amount: number | null;
  recipient: string | null;
  bank: string | null;
}

const MOCK_CONTACTS = [
  { name: 'Aizat', bank: 'Public Bank' },
  { name: 'Sarah', bank: 'Maybank' },
  { name: 'Irfan', bank: 'CIMB' },
  { name: 'Farhan', bank: 'RHB' },
  { name: 'Mama', bank: 'Bank Islam' }
];

export async function parseTransferIntent(message: string): Promise<TransferIntent> {
  // 1. Try regex first
  // e.g. "Pay RM 50 to Sarah", "Transfer 100 kepada Irfan"
  const regex = /(?:pay|transfer|send|hantar)\s+(?:rm\s*)?(\d+(?:\.\d+)?)\s+(?:to|kepada)\s+(\w+)/i;
  const match = message.match(regex);
  
  let amount: number | null = null;
  let recipient: string | null = null;
  
  if (match) {
    amount = parseFloat(match[1]);
    recipient = match[2];
  } else {
    // 2. AI Fallback if Regex fails
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
      if (apiKey) {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: "Extract transfer details from the message. Return JSON with 'amount' (number) and 'recipient' (string). If missing, return null for that field." }] },
            contents: [{ role: 'user', parts: [{ text: message }] }],
            generationConfig: { responseMimeType: "application/json" }
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          const candidate = data?.candidates?.[0]?.content;
          const textPart = candidate?.parts?.find((p: any) => p.text);
          if (textPart) {
            const parsed = JSON.parse(textPart.text);
            amount = parsed.amount || null;
            recipient = parsed.recipient || null;
          }
        }
      }
    } catch (e) {
      console.error("AI Fallback failed for transfer parsing", e);
    }
  }

  // 3. Contact validation and bank mapping
  let bank: string | null = null;
  if (recipient) {
    // Capitalize recipient to match cleanly
    recipient = recipient.charAt(0).toUpperCase() + recipient.slice(1).toLowerCase();
    
    const contact = MOCK_CONTACTS.find(c => c.name.toLowerCase() === recipient?.toLowerCase());
    if (contact) {
      bank = contact.bank;
    } else {
      bank = 'Unknown Bank'; // 1.3c warning
    }
  }

  return { amount, recipient, bank };
}
