angular.module('superApp', [])
  .controller('SuperListController', function($http) {
    var superList = this;
    superList.addMovie = function() {
      if (superList.newMovieTitle == '') {
        return;
      }
      console.log("push new movie " + superList.newMovieTitle);
      superList.movies.push({title:superList.newMovieTitle, rank:superList.movies.length == 0 ? 1 : 0});
      superList.newMovieTitle = '';
      superList.refresh();
    };

    superList.moveMovie = function(movie, newRank) {
      if (newRank > movie.rank) {
        if (movie.rank == 0) {
          console.log("Move a 0 ranked movie");
          superList.movies.filter((m) => m.rank >= newRank)
                          .forEach((m) => m.rank++);
        } else {
          console.log("Move down");
          superList.movies.filter((m) => m.rank > movie.rank && m.rank <= newRank)
                          .forEach((m) => m.rank--);  
        }
      } else if (newRank < movie.rank) {
        console.log("Move up");
        superList.movies.filter((m) => m.rank < movie.rank && m.rank >= newRank)
                        .forEach((m) => m.rank++);
      }
      movie.rank = newRank;
      superList.refresh();
      superList.newRank = 0;
    };

    superList.dropMovie = function(title, rank) {
      console.log("drop " + title + " to rank " + rank);
      movie = superList.movies.filter(m => m.title == title)[0];
      superList.moveMovie(movie, rank);
    }

    superList.deleteMovie = function(movie) {
      var index = superList.movies.indexOf(movie);
      if (index == -1) {
        return;
      }
      superList.movies.splice(index, 1);
      if (movie.rank == 0) {
        return;
      }
      superList.movies.filter((m) => m.rank > movie.rank)
                      .forEach((m) => m.rank--);
      superList.refresh();
    }

    superList.refresh = function() {
      console.log("refresh");
      superList.movies.sort((a, b) => {
        if (a.rank > b.rank) {
          return 1;
        }
        return -1;
      });
    }

    superList.updateList = function() {
      $http.put('http://localhost:8000/list/1',
                {
                  "title": superList.title,
                  "brief": superList.brief,
                  "movies": JSON.stringify(superList.movies)
                }
      );
    }
  
    $http.get('http://localhost:8000/list/1')
         .then(function(response) {
        superList.title = response.data.name;
        superList.brief = response.data.brief;
        superList.movies = JSON.parse(response.data.movies);
      });
  });

function drag(ev) {
  console.log(ev.originalTarget.getElementsByClassName('movie')[0]);

  ev.dataTransfer.setData(
    'title',
    ev.originalTarget.getElementsByClassName('movie')[0].getAttribute("data-movie-title")
  );
  ev.dataTransfer.setData(
    'rank',
    ev.originalTarget.getElementsByClassName('movie')[0].getAttribute("data-movie-rank")
  );
}

function dragLeave(ev) {
  ev.target.classList.remove('movie-separator-hover');
}

function dragEnter(ev) {
  ev.preventDefault();
  ev.target.classList.add('movie-separator-hover');
}

function drop(ev) {
    ev.preventDefault();
    ev.target.classList.remove('movie-separator-hover');

    var title = ev.dataTransfer.getData("title");
    var oldRank = parseInt(ev.dataTransfer.getData("rank"));
    var newRank = parseInt(ev.target.getElementsByClassName('drop-below')[0].getAttribute("data-movie-rank"));
    if (oldRank == 0) {
      newRank++;
    } else if (oldRank == newRank) {
      return;
    } else if (oldRank > newRank) {
      newRank++;
    }
    var scope = angular.element(document.getElementById('superListControllerID')).scope();
    scope.$apply(
      () => scope.superList.dropMovie(title, newRank)
    );
}
