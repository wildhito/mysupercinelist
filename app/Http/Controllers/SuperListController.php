<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class SuperListController extends Controller
{
    public function getList(Request $request, $id)
    {
        $results = app('db')->select("SELECT l.name, l.brief, l.movies, count(r.userHash) as recos,
                                      l.public, l.official, l.createdAt, l.modifiedAt
                                      FROM list l
                                      LEFT JOIN reco r ON l.id = r.listId 
                                      WHERE l.id=$id");
        if (!$results || count($results) == 0) {
            abort(404);
        }

        $list = $results[0];
        if (!$list->public) {
          $this->requireMagic($request, $id);
        }

        return json_encode($list);
    }

    public function createList(Request $request)
    {
        $name = $this->sanitizeString($request->input('title'));
        $brief = $this->sanitizeString($request->input('brief'));
        if (!$name || !$brief) {
            abort(500, "Bad arguments");
        }
        $magic = $this->generateMagic();
        $dbRes = app('db')->insert("INSERT INTO list(name, brief, createdAt, modifiedAt, magic)
                                    VALUES ($name, $brief, now(), now(), '$magic')");
        if (!$dbRes) {
          abort(500, "DB error");
        }
        $id = app('db')->connection()->getPDO()->lastInsertId();
        $response = [
          "id"    => $id,
          "magic" => $magic,
        ];
        return json_encode($response);
    }

    public function updateList(Request $request, $id)
    {
        $this->requireMagic($request, $id);
        $name = $this->sanitizeString($request->input('title'));
        $brief = $this->sanitizeString($request->input('brief'));
        $public = $this->sanitizeInteger($request->input('public'));
        $official = 0;
        if (!$name || !$brief) {
            abort(500, "Bad arguments");
        }
        $movies = $this->sanitizeMovies($request->input('movies'));
        app('db')->update("UPDATE list 
                           SET name = $name,
                               brief = $brief,
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
        $res = app('db')->connection()->getPdo()->quote($res);
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
                "title" => trim($this->sanitizeString($movie->title), "'"),
                "rank"  => $this->sanitizeInteger($movie->rank),
            ];
        }
        return json_encode($res);
    }

    private function generateMagic()
    {
      $salt = env('MAGIC_SALT', false);
      if (!$salt) {
        abort(500, 'Internal configuration error');
      }
      $data = openssl_random_pseudo_bytes(256) . $salt;
      for ($i = 0; $i < 79; $i++) {
        $data = hash("sha256", $data);
      }
      return $data;
    }

    private function requireMagic(Request $request, $id)
    {
       $magic = $this->sanitizeString($request->input("m"));
       if ($magic == '') {
         abort(403);
       }
       $dbRes = app('db')->select("SELECT id
                                   FROM list
                                   WHERE id = $id
                                   AND magic = $magic");
      if (!$dbRes) {
        abort(403);
      }
    }
}

