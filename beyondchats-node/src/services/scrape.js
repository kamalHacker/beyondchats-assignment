import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";
import path from "path";

export async function scrapeAndNormalizeArticle(url) {
  try {
    const { data: html } = await axios.get(url, {
      timeout: 15000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    const $ = cheerio.load(html);

    $("script, style, nav, footer, header, aside, iframe, noscript").remove();

    const articleSelectors = [
      "article",
      "main",
      ".post-content",
      ".blog-content",
      ".entry-content",
      ".content",
      "div[class*='content']",
      "div[class*='article']",
    ];

    let contentRoot = null;
    for (const selector of articleSelectors) {
      if ($(selector).length) {
        contentRoot = $(selector).first();
        break;
      }
    }

    if (!contentRoot) {
      throw new Error("Unable to locate main content");
    }

    const title =
      $("h1").first().text().trim() ||
      $("title").text().trim() ||
      "Untitled Article";

    let cleanedContent = extractCleanText($, contentRoot);

    if (cleanedContent.split(/\s+/).length < 200) {
      console.warn("⚠️ Content too short, retrying with broader selector");

      const fallbackRoot = $("body");
      const fallbackContent = extractCleanText($, fallbackRoot);

      if (
        fallbackContent.split(/\s+/).length > cleanedContent.split(/\s+/).length
      ) {
        cleanedContent = fallbackContent;
      }
    }

    const articleData = {
      title,
      content: cleanedContent,
      source_url: url,
    };

    writeDebugFile(articleData);

    console.log(`✅ Successfully scraped article: ${url}`);

    return articleData;
  } catch (error) {
    console.error(`❌ Failed to scrape article: ${url}`);
    throw error;
  }
}

function extractCleanText($, root) {
  const allowedTags = ["h1", "h2", "h3", "p", "ul", "ol", "li"];

  let output = [];

  root.find(allowedTags.join(",")).each((_, el) => {
    const tag = el.tagName.toLowerCase();
    const text = $(el).text().trim();

    if (!text || text.length < 30) return;

    if (tag.startsWith("h")) {
      output.push(`\n## ${text}\n`);
    } else if (tag === "li") {
      output.push(`- ${text}`);
    } else {
      const paragraphs = text
        .split(/\. |\n+/)
        .map((p) => p.trim())
        .filter((p) => p.length > 60);

      paragraphs.forEach((p) => output.push(p + "."));
    }
  });

  const finalText = output.join("\n");
  return limitLength(finalText, 1500);
}

function limitLength(text, maxWords) {
  const words = text.split(/\s+/);

  if (words.length <= maxWords) return text;

  return (
    words.slice(0, maxWords).join(" ") + "\n\n[Content truncated for brevity]"
  );
}

function writeDebugFile(article) {
  const safeTitle = article.title
    .replace(/[^a-z0-9]/gi, "_")
    .toLowerCase()
    .slice(0, 50);

  const fileName = `${safeTitle}_${Date.now()}.txt`;
  const filePath = path.join(process.cwd(), "debug", fileName);

  const fileContent = `
TITLE:
${article.title}

SOURCE URL:
${article.source_url}

CONTENT:
${article.content}
  `.trim();

  fs.writeFileSync(filePath, fileContent, "utf-8");

  console.log(`📝 Scraped article saved to ${filePath}`);
}
