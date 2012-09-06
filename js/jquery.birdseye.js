// Generated by CoffeeScript 1.3.3
(function() {
  var $;

  $ = jQuery;

  $.fn.extend({
    birdseye: function(options) {
      var current_params, exports, makeAjaxRequest, map, markers, pagination_status, processPagination, processResults, settings,
        _this = this;
      settings = {
        initial_coordinates: [40, -100],
        initial_zoom: 3,
        tile_layer: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        request_uri: '',
        request_geo_params: {
          ne_lat: function(map) {
            return map.getBounds().getNorthEast().lat;
          },
          ne_lng: function(map) {
            return map.getBounds().getNorthEast().lng;
          },
          sw_lat: function(map) {
            return map.getBounds().getSouthWest().lat;
          },
          sw_lng: function(map) {
            return map.getBounds().getSouthWest().lng;
          }
        },
        response_json_key: 'results',
        response_params_latlng: function(result) {
          return [result.latitude, result.longitude];
        },
        response_params_pagination: {
          page: function(data) {
            return data.meta.page;
          },
          per_page: function(data) {
            return data.meta.per_page;
          },
          total_pages: function(data) {
            return data.meta.total_pages;
          },
          count: function(data) {
            return data.meta.count;
          }
        },
        results_el: $(".birdseye-results"),
        results_template: function(key, result) {
          return "        <div># " + key + ": " + result['name'] + "</div>        ";
        },
        no_results_template: function() {
          return "        <div>Sorry, no results found.</div>        ";
        },
        pagination_el: $(".birdseye-pagination"),
        pagination_template: function(pagination) {
          var i, loopTimes, p, str, _i, _j;
          str = "              <div class='counts'>                " + (pagination.count === 0 ? "0" : (pagination.page - 1) * pagination.per_page + 1) + "                  to                " + ((pagination.page * pagination.per_page) > pagination.count ? pagination.count : pagination.page * pagination.per_page) + "                of " + pagination.count + "              </div>              |              Go to page:              <ul class='pages'>              ";
          loopTimes = ((pagination.total_pages - pagination.page) < 5 ? 8 - (pagination.total_pages - pagination.page) : 4);
          p = pagination.page - loopTimes - 1;
          for (i = _i = 1; 1 <= loopTimes ? _i <= loopTimes : _i >= loopTimes; i = 1 <= loopTimes ? ++_i : --_i) {
            p = p + 1;
            if (p < 1) {
              continue;
            }
            str += "<li><a data-birdseye-role='change-page' data-birdseye-pagenumber='" + p + "'>" + p + "</a></li>";
          }
          str += "<li>" + pagination.page + "</li>";
          loopTimes = (pagination.page < 5 ? 9 - pagination.page : 4);
          p = pagination.page;
          for (i = _j = 1; 1 <= loopTimes ? _j <= loopTimes : _j >= loopTimes; i = 1 <= loopTimes ? ++_j : --_j) {
            p = p + 1;
            if (p > pagination.total_pages) {
              continue;
            }
            str += "<li><a data-birdseye-role='change-page' data-birdseye-pagenumber='" + p + "'>" + p + "</a></li>";
          }
          str += "                </ul>                <div class='prev-next'>                  <a data-birdseye-role='change-page' data-birdseye-pagenumber='" + (pagination.page - 1) + "'>Previous</a>                  |                  <a data-birdseye-role='change-page' data-birdseye-pagenumber='" + (pagination.page + 1) + "'>Next</a>                </div>                ";
          return str;
        }
      };
      settings = $.extend(settings, options);
      current_params = {};
      pagination_status = {};
      markers = [];
      map = L.map(this[0]).setView(settings.initial_coordinates, settings.initial_zoom);
      L.tileLayer(settings.tile_layer).addTo(map);
      makeAjaxRequest = function(new_params) {
        var func, key, request_params, _ref;
        request_params = new_params || current_params;
        _ref = settings.request_geo_params;
        for (key in _ref) {
          func = _ref[key];
          request_params[key] = func(map);
        }
        current_params = request_params;
        return $.ajax({
          url: settings.request_uri + "?" + $.param(request_params),
          type: 'GET',
          success: function(data) {
            if (settings.response_json_key) {
              processResults(data[settings.response_json_key]);
            } else {
              processResults(data);
            }
            return processPagination(data);
          }
        });
      };
      processResults = function(results) {
        var marker, _i, _len;
        settings.results_el.html('');
        for (_i = 0, _len = markers.length; _i < _len; _i++) {
          marker = markers[_i];
          map.removeLayer(marker);
        }
        if (results.length > 0) {
          return $(results).each(function(key, result) {
            var new_marker;
            key = key + 1;
            new_marker = L.marker(settings.response_params_latlng(result), {
              icon: new L.NumberedDivIcon({
                number: key
              })
            });
            markers.push(new_marker.addTo(map));
            return settings.results_el.append(settings.results_template(key, result));
          });
        } else {
          return settings.results_el.append(settings.no_results_template());
        }
      };
      processPagination = function(data) {
        var page_params;
        settings.pagination_el.html('');
        page_params = {
          page: settings.response_params_pagination.page(data),
          per_page: settings.response_params_pagination.per_page(data),
          total_pages: settings.response_params_pagination.total_pages(data),
          count: settings.response_params_pagination.count(data)
        };
        settings.pagination_el.append(settings.pagination_template(page_params));
        return pagination_status = page_params;
      };
      map.on('dragend zoomend', function() {
        return makeAjaxRequest($.extend(current_params, {
          page: 1
        }));
      });
      $(document).on("click", "[data-birdseye-role=change-page]", function() {
        return exports.change_page($(this).data('birdseye-pagenumber'));
      });
      exports = {};
      exports.set_view = arguments.callee.set_view = function(latlng, zoom, updateMap) {
        if (updateMap == null) {
          updateMap = true;
        }
        map.setView(latlng, zoom);
        if (updateMap) {
          return exports.update();
        }
      };
      exports.update = arguments.callee.update = function(new_params) {
        return makeAjaxRequest(new_params);
      };
      return exports.change_page = arguments.callee.change_page = function(page) {
        if (page > pagination_status.total_pages || page === 0) {
          return;
        }
        return makeAjaxRequest($.extend(current_params, {
          page: page
        }));
      };
    }
  });

}).call(this);
