import { getJson } from "serpapi";

const SERP_API_KEY = process.env.SERP_API_KEY;

export async function searchReferenceArticles(articleTitle) {
  if (!SERP_API_KEY) {
    throw new Error("SERP_API_KEY is missing");
  }

  const query = `${articleTitle}`;

  console.log(`Searching Google for reference articles with query: ${query}`);

  try {
    const response = await getJson({
      q: query,
      engine: "google",
      api_key: SERP_API_KEY,
      num: 10,
      gl: "us",
      hl: "en",
      google_domain: "google.com",
    });

    const results = response.organic_results || [];

    // console.log(`Google search returned ${results.length} results before filtering.\n`);
    // console.log('Raw Results:', results);

    const blockedDomains = [
      "amazon.",
      "pinterest.",
      "linkedin.",
      "facebook.",
      "twitter.",
      "x.com",
      "reddit.",
      "quora.",
      "youtube.",
      "beyondchats.com",
    ];

    const filteredLinks = results
      .map((r) => r.link)
      .filter((link) => {
        if (!link) return false;

        const lower = link.toLowerCase();
        if (blockedDomains.some(d => lower.includes(d))) return false;

        return (
          !lower.includes("beyondchats.com") &&
          !lower.endsWith(".pdf") &&
          !lower.includes("/tag/") &&
          !lower.includes("/category/")
        );
      });

    const uniqueLinks = [...new Set(filteredLinks)];
    // console.log(`Filtered down to ${uniqueLinks.length} unique valid links. \n`);
    // console.log('Links:', uniqueLinks);

    if (uniqueLinks.length < 2) {
      throw new Error("Less than 2 valid reference articles found");
    }

    return uniqueLinks.slice(0, 6);
  } catch (error) {
    console.error("Google search failed:", error.message);
    throw error;
  }
}
