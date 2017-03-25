<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class SuperListController extends Controller
{
    public function getList($id)
    {
        $results = app('db')->select("SELECT l.name, l.brief, l.movies, count(r.userHash) as recos,
                                      l.public, l.official, l.createdAt, l.modifiedAt
                                      FROM list l
                                      LEFT JOIN reco r ON l.id = r.listId 
                                      WHERE l.id=$id");
        if (!$results || count($results) == 0) {
            abort(404);
        }

        return json_encode($results[0]);
    }

    public function createList(Request $request)
    {
        $name = $this->sanitizeString($request->input('title'));
        $brief = $this->sanitizeString($request->input('brief'));
        if (!$name || !$brief) {
            abort(500, "Bad arguments");
        }
        app('db')->insert("INSERT INTO list(name, brief, createdAt, modifiedAt)
                           VALUES ('$name', '$brief', now(), now())");
    }

    public function updateList(Request $request, $id)
    {
        $name = $this->sanitizeString($request->input('title'));
        $brief = $this->sanitizeString($request->input('brief'));
        $public = $this->sanitizeInteger($request->input('public'));
        $official = 0;
        if (!$name || !$brief) {
            abort(500, "Bad arguments");
        }
        $movies = $this->sanitizeMovies($request->input('movies'));
        app('db')->update("UPDATE list 
                           SET name = '$name',
                               brief = '$brief',
                               movies = '$movies',
                               public = $public,
                               official = $official,
                               modifiedAt = now()
                           WHERE id = $id");
    }

    public function deleteList($id)
    {
        app('db')->delete("DELETE FROM list 
                           WHERE id=$id");
    }

    public function addReco($id)
    {
        $userHash = md5($_SERVER['REMOTE_ADDR']);
        app('db')->insert("INSERT IGNORE reco (listId, userHash) 
                           VALUES ($id, '$userHash')");
        $recos = app('db')->select("SELECT count(*) as recos
                                    FROM reco
                                    WHERE listId = $id");
        if (count($recos) === 0) {
            abort(500);
        }
        return json_encode($recos[0]);
    }

    private function sanitizeString($userInput)
    {
        $res = strip_tags(trim($userInput));
        return $res;
    }

    private function sanitizeInteger($userInput)
    {
        $res = intval($userInput);
        return $res;
    }

    private function sanitizeMovies($userInput)
    {
        $movies = json_decode($userInput);
        if (!is_array($movies)) {
            return null;
        }

        $res = array();
        foreach($movies as $movie) {
            if (!property_exists($movie, "title") || !property_exists($movie, "rank")) {
                continue;
            }
            $res[] = [
                "title" => $this->sanitizeString($movie->title),
                "rank"  => $this->sanitizeInteger($movie->rank),
            ];
        }
        return json_encode($res);
    }
}

