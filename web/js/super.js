angular.module('superApp', [])
  .controller('SuperListController', function() {
    var superList = this;
    superList.title = "Liste ultime Années 80";
    superList.brief = "La liste ultime des années 80 par Papa et Kamui, gravée dans le marbre, à jamais, sans aucune mauvaise foi."
    superList.movies = [
      {title:'Robocop', rank:1},
      {title:'Die Hard', rank:2},
      {title:'Akira', rank:3},
      {title:'Blade Runner', rank:4},
      {title:'Raiders of the Lost Ark', rank:5},
      {title:'The Abyss', rank:6},
      {title:'The Thing', rank:7},
      {title:'Full Metal Jacket', rank:8},
      {title:'Back to the Future', rank:9},
      {title:'Mon voisin Totoro', rank:10}
    ];
 
    superList.addMovie = function() {
      if (superList.newMovieTitle == '') {
        return;
      }
      superList.movies.push({title:superList.newMovieTitle, rank:superList.movies.length == 0 ? 1 : 0, done:false});
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

    superList.refresh();
  });

function drag(ev) {
  ev.dataTransfer.setData(
    'title',
    ev.path[0].getElementsByClassName('movie')[0].getAttribute("data-movie-title")
  );
  ev.dataTransfer.setData(
    'rank',
    ev.path[0].getElementsByClassName('movie')[0].getAttribute("data-movie-rank")
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
