<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Article extends Model
{
    protected $fillable = [
        'title',
        'content',
        'source_url',
        'status',
        'parent_article_id',
    ];

    public function parent()
    {
        return $this->belongsTo(Article::class, 'parent_article_id');
    }

    public function updates()
    {
        return $this->hasMany(Article::class, 'parent_article_id');
    }
}
