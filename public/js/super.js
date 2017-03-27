angular.module('superApp', [])
  .controller('SuperListController', function($http, $timeout) {
    var superList = this;
    var defaultId = 8;

    // local add movie
    superList.addMovie = function() {
      if (superList.newMovieTitle == '') {
        return;
      }
      if (superList.movies == null) {
        superList.movies = [];
      }
      if (superList.movies.length >= 100) {
        alert("Vous ne pouvez pas enregistrer plus de 100 films par liste");
        return;
      }
      superList.movies.push({title:superList.newMovieTitle, rank:superList.movies.length == 0 ? 1 : 0});
      superList.newMovieTitle = '';
      superList.refresh();
    };

    // local move movie
    superList.moveMovie = function(movie, newRank) {
      if (newRank > movie.rank) {
        if (movie.rank == 0) {
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

    // handle drop movie action
    superList.dropMovie = function(title, rank) {
      movie = superList.movies.filter(m => m.title == title)[0];
      superList.moveMovie(movie, rank);
    }

    // local delete movie
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

    // sort movies by rank
    superList.refresh = function() {
      superList.movies.sort((a, b) => {
        if (a.rank > b.rank) {
          return 1;
        }
        return -1;
      });
    }

    // remote list update
    superList.updateList = function() {
     superList.saveDisabled = true; 
     $http.put('http://localhost:8000/list/' + superList.id + '?m=' + superList.urlMagic,
                {
                  "title": superList.title,
                  "brief": superList.brief,
                  "movies": JSON.stringify(superList.movies),
                  "public": superList.public
                }
      ).then(function() {
        superList.saveDisabled = false; 
        superList.showSuccess = true;
        $timeout(() => superList.showSuccess = false, 3000);
      }, function() {
        superList.saveDisabled = false;
        superList.showError = true;
        $timeout(() => superList.showError = false, 3000);
      });
    }

    // remote list remove
    superList.removeList = function() {
      if (!window.confirm("Etes-vous sûr de vouloir supprimer cette liste ?")) {
        return;
      }
      superList.removeDisabled = true;
      $http.delete('http://localhost:8000/list/' + superList.id + '?m=' + superList.urlMagic)
           .then(function() {
             window.location = "/";
           }, function() {
             superList.showRemovalError = true;
             superList.removeDisabled = false;
             $timeout(() => superList.showRemovalError = false, 3000);
           });
    }

    superList.newMovieTitle = '';
    superList.enableReco = true;

    superList.reco = function() {
        if (!superList.enableReco) {
            return;
        }
        $http.post('http://localhost:8000/reco/' + superList.id)
             .then(function(response) {
            superList.recos = response.data.recos;
            superList.enableReco = false;
        });
    }

    superList.id = getParameterByName('id', defaultId);
    superList.urlMagic = getParameterByName('m', '');
    superList.currentUrl = window.location.href;
  
    $http.get('http://localhost:8000/list/' + superList.id + '?m=' + superList.urlMagic)
         .then(function(response) {
        superList.title = response.data.name;
        superList.uriEncodedTitle = encodeURI(superList.title);
        superList.brief = response.data.brief;
        superList.public = (response.data.public == 1);
        superList.movies = JSON.parse(response.data.movies);
        superList.recos = response.data.recos;
      }, function(response) {
        superList.notAuthorized = true;
        if (response.status == 403) {
          superList.title = "Accès réservé";
        } else if (response.status == 404) {
          superList.title = "Perdu ?";
        } else {
          superList.title = "Erreur";
        }
      });

  });  // end controller

function getParameterByName(name, defaultValue) {
    url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return defaultValue;
    if (!results[2]) return defaultValue;
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

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
