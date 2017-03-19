<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class SuperListController extends Controller
{
    public function getList($id)
    {
        $results = app('db')->select("SELECT * 
                                      FROM list 
                                      WHERE id=$id");
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
}

