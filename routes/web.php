<?php

$app->get('/', function () use ($app) {
    return $app->version();
});

$app->get('list/{id:[0-9]+}', 'SuperListController@getList');

$app->post('list', 'SuperListController@createList');

$app->put('list/{id:[0-9]+}', 'SuperListController@updateList');

$app->delete('list/{id:[0-9]+}', 'SuperListController@deleteList');

$app->post('reco/{id:[0-9]+}', 'SuperListController@addReco');

