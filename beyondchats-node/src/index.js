import "dotenv/config";
import fs from "fs";
import {
  publishUpdatedArticle,
  fetchOriginalArticles,
} from "./services/laravelApi.js";
import { searchReferenceArticles } from "./services/googleSearch.js";
import { scrapeAndNormalizeArticle } from "./services/scrape.js";
import { generateUpdatedArticle } from "./services/llm.js";

async function processArticle(article) {
  console.log(`\n Processing article ID ${article.id}`);
  console.log(`Title: ${article.title}`);

  // 1. Search references
  const referenceLinks = await searchReferenceArticles(article.title);

  const referenceArticles = [];

  for (const link of referenceLinks) {
    if (referenceArticles.length === 2) break;
    try {
      console.log(`Scraping: ${link}`);
      const scraped = await scrapeAndNormalizeArticle(link);
      referenceArticles.push(scraped);
    } catch (err) {
      console.warn(`Skipped reference: ${link}`);
    }
  }

  if (referenceArticles.length < 2) {
    console.warn("Not enough reference articles, skipping...");
    return;
  }

  // 2. Generate updated content
  const updatedContent = await generateUpdatedArticle({
    originalArticle: {
      title: article.title,
      content: article.content,
    },
    referenceArticles,
  });

  fs.writeFileSync(
    `debug/updated_article_${article.id}_${Date.now()}.txt`,
    updatedContent,
    "utf-8"
  );

  // 3. Publish updated article
  const payload = {
    title: article.title,
    content: updatedContent,
    status: "updated",
    parent_article_id: article.id,
    source_url: JSON.stringify(referenceLinks.slice(0, 2)),
  };

  const published = await publishUpdatedArticle(payload);

  console.log(`Published updated article for ID ${article.id}`);
  console.log({
    new_id: published.id,
    parent_article_id: article.id,
  });

  return {
    articleId: article.id,
    status: "published",
    newArticleId: published.id,
  };
}

async function run() {
  console.log("Phase 2 Pipeline Started");

  const articles = await fetchOriginalArticles(5);

  console.log(`Found ${articles.length} original articles`);

  const tasks = articles.map((article) => processArticle(article));

  const results = await Promise.allSettled(tasks);

  results.forEach((result, index) => {
    const article = articles[index];

    if (result.status === "fulfilled") {
      const value = result.value;

      if (value?.status === "published") {
        console.log(
          `Article ID ${value.articleId} published as ${value.newArticleId}`
        );
      } else if (value?.status === "skipped") {
        console.warn(
          `Article ID ${value.articleId} skipped (${value.reason})`
        );
      } else {
        console.log(`Article ID ${article.id} completed`);
      }
    } else {
      console.error(
        `Article ID ${article.id} failed:`,
        result.reason?.message || result.reason
      );
    }
  });

  console.log("\n Batch processing completed");
}

run().catch((err) => {
  console.error("Pipeline crashed:", err.message);
});
