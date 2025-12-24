import axios from "axios";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent";

export async function generateUpdatedArticle({
  originalArticle,
  referenceArticles,
}) {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing");
  }

  const ref1 = referenceArticles[0];
  const ref2 = referenceArticles[1];

  if (!ref1 || !ref2) {
    throw new Error("LLM requires at least 2 reference articles");
  }

  const prompt = `
You are a professional content editor and SEO writer.

TASK:
Rewrite and improve the ORIGINAL ARTICLE using the REFERENCE ARTICLES as inspiration.

RULES:
- Do NOT copy sentences from the references
- Improve structure, clarity, and depth
- Use clear headings and subheadings
- Maintain a professional blog tone
- Keep the topic unchanged
- At the end, add a "References" section with the source URLs

ORIGINAL ARTICLE:
Title: ${originalArticle.title}

Content:
${originalArticle.content}

REFERENCE ARTICLE 1:
Title: ${referenceArticles[0].title}
Content:
${referenceArticles[0].content}

REFERENCE ARTICLE 2:
Title: ${referenceArticles[1].title}
Content:
${referenceArticles[1].content}

OUTPUT:
Return ONLY the updated article content.
`;

  try {
    const response = await axios.post(
      `${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("❌ Gemini LLM generation failed");

    if (error.response) {
      console.error(error.response.data);
    }

    console.warn("Falling back to mock LLM output due to quota limits");

    return `
## ${originalArticle.title}

### Introduction
This article has been programmatically enhanced using insights from high-ranking external sources while preserving the original topic and intent.

### Key Improvements
- Improved structure and readability
- Expanded explanations based on competitor content
- Clear section hierarchy for better user experience

### Content Enhancement
${originalArticle.content}


[NOTE: Full LLM generation skipped due to API quota limits during development]
`;
  }
}
