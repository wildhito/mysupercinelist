<?php

$app->get('/', function () use ($app) {
    return $app->version();
});

$app->get('the/{author}/lists', 'SuperListController@getAuthorLists');

$app->get('list/{id}', 'SuperListController@getList');

$app->post('list', 'SuperListController@createList');

$app->put('list/{id}', 'SuperListController@updateList');

$app->delete('list/{id}', 'SuperListController@deleteList');

$app->get('reco/{id}', 'SuperListController@addReco');

