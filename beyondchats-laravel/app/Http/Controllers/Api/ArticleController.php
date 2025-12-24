<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Article;
use Illuminate\Http\Request;

class ArticleController extends Controller
{
    public function index()
    {
        return Article::latest()->paginate(10);
    }

    // POST /api/articles
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string',
            'content' => 'required|string',
            'source_url' => 'nullable|string',
            'status' => 'in:original,updated',
            'parent_article_id' => 'nullable|exists:articles,id',
        ]);

        return Article::create($validated);
    }

    // GET /api/articles/{id}
    public function show($id)
    {
        return Article::with(['parent', 'updates'])->findOrFail($id);
    }

    // PUT /api/articles/{id}
    public function update(Request $request, $id)
    {
        $article = Article::findOrFail($id);

        $article->update(
            $request->only(['title', 'content'])
        );

        return $article;
    }

    // DELETE /api/articles/{id}
    public function destroy($id)
    {
        Article::findOrFail($id)->delete();

        return response()->json([
            'message' => 'Article deleted successfully'
        ]);
    }
    
}
