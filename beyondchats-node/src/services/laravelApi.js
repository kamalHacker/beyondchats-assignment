import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.LARAVEL_API_BASE_URL,
  timeout: 10000,
});

/**
 * Fetch latest original article
 */
export async function fetchOriginalArticles(limit = 5) {
  try {
    const response = await apiClient.get("/articles", {
      params: {
        status: "original",
        sort: "created_at",
        order: "asc",
        limit,
      },
    });

    const articles = response.data?.data || response.data;

    if (!articles || articles.length === 0) {
      throw new Error("No original articles found");
    }

    return articles;
  } catch (error) {
    console.error("❌ Failed to fetch original articles");

    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else {
      console.error("Error:", error.message);
    }

    throw error;
  }
}

export async function fetchLatestOriginalArticle() {
  try {
    const response = await apiClient.get('/articles', {
      params: {
        status: 'original',
        sort: 'created_at',
        order: 'desc',
        limit: 1,
      },
    });

    const articles = response.data?.data || response.data;

    if (!articles || articles.length === 0) {
      throw new Error('No original articles found');
    }

    return articles[0];
  } catch (error) {
    console.error('❌ Failed to fetch latest original article');

    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }

    throw error;
  }
}


export async function publishUpdatedArticle(articleData) {
  try {
    const response = await apiClient.post("/articles", articleData);

    return response.data;
  } catch (error) {
    console.error("❌ Failed to publish updated article");

    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else {
      console.error("Error:", error.message);
    }

    throw error;
  }
}