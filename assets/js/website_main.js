(function () {
  "use strict";

  // Booleans to find whether user uses iPhone or Android (mobile in general)
  var isMobile = {
    Android: function () {
      return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function () {
      return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function () {
      return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function () {
      return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function () {
      return navigator.userAgent.match(/IEMobile/i);
    },
    any: function () {
      return (
        isMobile.Android() ||
        isMobile.BlackBerry() ||
        isMobile.iOS() ||
        isMobile.Opera() ||
        isMobile.Windows()
      );
    },
  };
  var isiPad = function () {
    return navigator.platform.indexOf("iPad") != -1;
  };
  var isiPhone = function () {
    return (
      navigator.platform.indexOf("iPhone") != -1 ||
      navigator.platform.indexOf("iPod") != -1
    );
  };

  // Maximize
  var fullHeight = function () {
    if (!isMobile.any()) {
      $(".js-fullheight").css("height", $(window).height());
      $(window).resize(function () {
        $(".js-fullheight").css("height", $(window).height());
      });
    }
  };

  // Parallax
  var parallax = function () {
    if (!isMobile.any()) {
      $(window).stellar();
    }
  };

  var animateSectionResults = function () {
    var section_results = $("#section-results");
    if (section_results.length > 0) {
      section_results.waypoint(
        function (direction) {
          if (direction === "down" && !$(this.element).hasClass("animated")) {
            setTimeout(function () {
              section_results.find(".to-animate").each(function (k) {
                var element = $(this);

                setTimeout(
                  function () {
                    element.addClass("fadeInUp animated");
                  },
                  k * 200,
                  "easeInOutExpo"
                );
              });
            }, 200);

            setTimeout(function () {
              section_results.find(".to-animate-2").each(function (k) {
                var el = $(this);

                setTimeout(
                  function () {
                    el.addClass("bounceIn animated");
                  },
                  k * 200,
                  "easeInOutExpo"
                );
              });
            }, 700);

            setTimeout(function () {
              section_results.find(".to-animate-3").each(function (k) {
                var el = $(this);

                setTimeout(
                  function () {
                    el.addClass("fadeInRight animated");
                  },
                  k * 200,
                  "easeInOutExpo"
                );
              });
            }, 1000);

            $(this.element).addClass("animated");
          }
        },
        { offset: "80%" }
      );
    }
  };

  var animateSectionMain = function () {
    var section_main = $("#section-main");
    if (section_main.length > 0) {
      section_main.waypoint(
        function (direction) {
          if (direction === "down" && !$(this.element).hasClass("animated")) {
            var sec = section_main.find(".to-animate").length,
              sec = parseInt(sec * 200 + 400);

            setTimeout(function () {
              section_main.find(".to-animate").each(function (k) {
                var el = $(this);

                setTimeout(
                  function () {
                    el.addClass("fadeInUp animated");
                  },
                  k * 200,
                  "easeInOutExpo"
                );
              });
            }, 200);

            setTimeout(function () {
              section_main.find(".to-animate-2").each(function (k) {
                var element = $(this);

                setTimeout(
                  function () {
                    element.addClass("bounceIn animated");
                  },
                  k * 200,
                  "easeInOutExpo"
                );
              });
            }, sec);

            $(this.element).addClass("animated");
          }
        },
        { offset: "80%" }
      );
    }
  };

  var animateSectionCredits = function () {
    var section_credits = $("#section-team");
    if (section_credits.length > 0) {
      section_credits.waypoint(
        function (direction) {
          if (direction === "down" && !$(this.element).hasClass("animated")) {
            var sec = section_credits.find(".to-animate").length,
              sec = parseInt(sec * 200 + 400);

            setTimeout(function () {
              section_credits.find(".to-animate").each(function (k) {
                var el = $(this);

                setTimeout(
                  function () {
                    el.addClass("fadeIn animated");
                  },
                  k * 200,
                  "easeInOutExpo"
                );
              });
            }, 200);

            setTimeout(function () {
              section_credits.find(".to-animate-2").each(function (k) {
                var el = $(this);

                setTimeout(
                  function () {
                    el.addClass("fadeInUp animated");
                  },
                  k * 200,
                  "easeInOutExpo"
                );
              });
            }, sec);

            $(this.element).addClass("animated");
          }
        },
        { offset: "80%" }
      );
    }
  };

  var counter = function () {
    $(".js-counter").countTo({
      formatter: function (value, options) {
        return value.toFixed(options.decimals);
      },
    });
  };

  var counterTimeoutWaypoint = function () {
    if ($("#subsection-image-data-counter").length > 0) {
      $("#subsection-image-data-counter").waypoint(
        function (direction) {
          if (direction === "down" && !$(this.element).hasClass("animated")) {
            setTimeout(counter, 400);
            $(this.element).addClass("animated");
          }
        },
        { offset: "90%" }
      );
    }
  };

  // Document on load
  $(function () {
    // Styling Specific
    parallax();
    fullHeight();

    // Animations
    animateSectionResults();
    animateSectionMain();
    animateSectionCredits();
    counter();
    counterTimeoutWaypoint();
  });
})();
