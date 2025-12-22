// services/kbService.js
import KnowledgeBase from "../models/KnowledgeBase.js";

/**
 * Get the answer from Knowledge Base for a given user message
 * @param {string} userMsg - The incoming message from the user
 * @returns {string} answer from KB or default fallback
 */
export async function getAnswer(userMsg) {
  if (!userMsg) return "Sorry, I didn't understand your message.";

  const kb = await KnowledgeBase.find(); // Fetch all KB entries
  const lowerMsg = userMsg.toLowerCase();

  // Simple keyword match
  const match = kb.find(entry => lowerMsg.includes(entry.question.toLowerCase()));

  if (match) {
    return match.answer;
  }

  // Optional: Check tags if no question matched
  const tagMatch = kb.find(entry => entry.tags.some(tag => lowerMsg.includes(tag.toLowerCase())));
  if (tagMatch) {
    return tagMatch.answer;
  }

  // Fallback response if no match found
  return "Sorry, I don't know the answer. Our team will contact you soon.";
}

/**
 * Optional: Add a new question-answer to the KB
 */
export async function addKnowledge(question, answer, tags = []) {
  const existing = await KnowledgeBase.findOne({ question });
  if (existing) {
    return existing;
  }
  const kbEntry = new KnowledgeBase({ question, answer, tags });
  await kbEntry.save();
  return kbEntry;
}
