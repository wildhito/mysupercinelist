<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class SuperListController extends Controller
{
    public function getList($id)
    {
        $results = app('db')->select("SELECT l.name, l.brief, l.movies, l.author, count(r.userHash) as recos
                                      FROM list l
                                      LEFT JOIN reco r ON l.id = r.listId 
                                      WHERE l.id=$id");
        if (!$results || count($results) == 0) {
            return [];
        }

        return json_encode($results[0]);
    }

    public function createList(Request $request)
    {
        $name = $request->input('title');
        $brief = $request->input('brief');
        if (!$name || $brief) {
            return;
        }
        app('db')->insert("INSERT INTO list(name, brief)
                           VALUES ('$name', '$brief')");
    }

    public function updateList(Request $request, $id)
    {
        $name = $request->input('title');
        $brief = $request->input('brief');
        if (!$name || !$brief) {
            return;
        }
        $movies = $request->input('movies');
        app('db')->update("UPDATE list 
                           SET name = '$name',
                               brief = '$brief',
                               movies = '$movies'
                           WHERE id = $id");
    }

    public function deleteList($id)
    {
        app('db')->delete("DELETE FROM list 
                           WHERE id=$id");
    }

    public function getAuthorLists($author)
    {
        $results = app('db')->select("SELECT name 
                                      FROM list 
                                      WHERE author LIKE '$author'");
        if (!$results || count($results) == 0) {
            return [];
        }
        return json_encode($results);
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
            return 0;
        }
        return json_encode($recos[0]);
    }
}

