<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Article;
use GuzzleHttp\Client;
use Symfony\Component\DomCrawler\Crawler;

class ScrapeBeyondChatsBlogs extends Command
{
    protected $signature = 'scrape:beyondchats';
    protected $description = 'Scrape 5 oldest BeyondChats blog articles';

    public function handle()
    {
        $client = new Client([
            'timeout' => 20,
            'headers' => [
                'User-Agent' => 'Mozilla/5.0',
            ],
            'verify' => false, // local-safe (SSL already discussed)
        ]);

        $baseUrl = 'https://beyondchats.com/blogs/';
        $collectedLinks = [];

        /* ---------------------------------------------------
         | 1. Detect LAST pagination page
         ---------------------------------------------------*/
        $html = $client->get($baseUrl)->getBody()->getContents();
        $crawler = new Crawler($html);

        $pageNumbers = $crawler->filter('.page-numbers')
            ->each(fn($node) => (int) trim($node->text()));

        $lastPage = !empty($pageNumbers) ? max($pageNumbers) : 1;

        $this->info("Detected last page: {$lastPage}");

        /* ---------------------------------------------------
         | 2. Walk backwards & collect article links
         ---------------------------------------------------*/
        for ($page = $lastPage; $page >= 1 && count($collectedLinks) < 5; $page--) {

            $pageUrl = $page === 1
                ? $baseUrl
                : $baseUrl . 'page/' . $page . '/';

            $this->info("Scraping listing page: {$pageUrl}");

            $pageHtml = $client->get($pageUrl)->getBody()->getContents();
            $pageCrawler = new Crawler($pageHtml);

            $links = $pageCrawler
                ->filter('article.entry-card h2.entry-title a')
                ->each(fn(Crawler $node) => $node->link()->getUri());

            $links = array_reverse($links);

            $this->info('Found ' . count($links) . ' article links on this page.');

            foreach ($links as $link) {
                if (count($collectedLinks) >= 5) {
                    break;
                }
                if (!in_array($link, $collectedLinks)) {
                    $collectedLinks[] = $link;
                }
            }
        }

        if (empty($collectedLinks)) {
            $this->error('❌ No article links collected. Aborting.');
            return;
        }

        /* ---------------------------------------------------
         | 3. Visit article pages & extract content
         ---------------------------------------------------*/
        foreach ($collectedLinks as $url) {

            if (Article::where('source_url', $url)->exists()) {
                $this->info("Skipping duplicate: {$url}");
                continue;
            }

            $this->info("Scraping article: {$url}");

            $articleHtml = $client->get($url)->getBody()->getContents();
            $articleCrawler = new Crawler($articleHtml);

            // Title
            $title = $articleCrawler->filter('h1')->count()
                ? trim($articleCrawler->filter('h1')->text())
                : 'Untitled Article';

            // Content (Elementor-safe)
            $contentBlocks = $articleCrawler
                ->filter('.elementor-widget-theme-post-content')
                ->filter('p, h2, h3, ul li, ol li')
                ->each(function ($node) {
                    $text = trim($node->text());

                    if ($text === '') {
                        return null;
                    }

                    // 🔑 Remove BeyondChats CTA line only
                    if (
                        stripos($text, 'for more such amazing content') !== false
                    ) {
                        return null;
                    }

                    return $text;
                });

            $content = implode("\n\n", array_filter($contentBlocks));


            Article::create([
                'title' => $title,
                'content' => $content,
                'source_url' => $url,
                'status' => 'original',
            ]);
        }

        $this->info('✅ Successfully scraped 5 oldest articles with content.');
    }
}
