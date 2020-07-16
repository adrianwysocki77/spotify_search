(function() {
    let nextUrl;
    let userInput;
    let more = false;
    let resultsTrue = false;
    let albumOrArtist = $("select").val();
    let noResult = false;
    let twice = 0;
    let scroll = true;
    // $("input[name=user-input]").attr("placeholder", `artist`);

    $(document).ready(function() {
        console.log("ready!");
        $("input[name=user-input]").attr(
            "placeholder",
            `search for ${albumOrArtist}`
        );
    });

    $("select").on("click", function() {
        console.log("clicked select");

        albumOrArtist = $("select").val();

        if (albumOrArtist == "album") {
            console.log("albumOrArtist: ", albumOrArtist);
            $("input[name=user-input]").attr("placeholder", `search for album`);
        }
    });

    $("#submit-button").on("click", function() {
        $("#results-container").empty();
        userInput = $("input[name=user-input]").val();
        albumOrArtist = $("select").val();
        resultsTrue = true;
        noResult = true;
        scroll = true;
        //Loading info

        let loading = '<div class="results">Loading...</div>';
        $("#results-container").html(loading);

        $.ajax({
            url: "https://elegant-croissant.glitch.me/spotify",
            method: "GET",
            data: {
                query: userInput,
                type: albumOrArtist
            },

            success: function(response) {
                $("#results-container").empty(); // delete loading...
                results(response, noResult);
            },
            error: function(error) {
                console.log("error: ", error);
                $("#results-container").empty(); // delete loading...
                let noResults = " ";
                noResults +=
                    '<div class="results">No results found for &nbsp;" " </div>';
                $("#results-container").html(noResults);
            }
        });
    });

    $("#more").on("click", function() {
        more = true;
        $.ajax({
            url: nextUrl,
            // any sort of data we need to sent to the API so we get response
            success: function(response) {
                results(response);
            }
        });
    });

    function results(response, noResult) {
        response = response.artists || response.albums; // w zaleznosci co napoczatku wybralem, drugie robi sie udefined wiec pierwsze jest przypisane do zmiennej

        var myHtml = "";
        var resultsFor =
            '<div class="resultsfor"><b>Results for &nbsp;<b>"' +
            userInput +
            '"</div>';
        // Add on the top of results name of searched thing
        if (resultsTrue) {
            $("#results-container").html(resultsFor);
            resultsTrue = false;
        }

        if (response.items.length > 0) {
            for (var i = 0; i < response.items.length; i++) {
                var externalUrls = response.items[i].external_urls.spotify;
                var imageUrl = "./default.jpg";

                if (response.items[i].images[0]) {
                    imageUrl = response.items[i].images[0].url; // jezeli jest zdjecie przypisuje je tu jak nie bedzie dodaje domyslne
                    myHtml +=
                        '<div class="flex">' +
                        '<a href="' +
                        externalUrls +
                        '">' +
                        '<img src="' +
                        imageUrl +
                        '">' +
                        "</a>" +
                        '<a href="' +
                        externalUrls +
                        '" class="text">' +
                        response.items[i].name +
                        "</a>" +
                        "</div>";
                } else {
                    myHtml +=
                        '<div class="flex">' +
                        '<a href="' +
                        externalUrls +
                        '">' +
                        '<img src="' +
                        imageUrl +
                        '">' +
                        "</a>" +
                        '<a href="' +
                        externalUrls +
                        '" class="text">' +
                        response.items[i].name +
                        "</a>" +
                        "</div>";
                }
            }
            if (more) {
                $("#results-container").append(myHtml);
            } else {
                $("#results-container").append(myHtml);
            }

            // przy przeszukiwaniu zdjec poprostu wybrac pierwsze, gdy lista jest pusta moge dodac default image
        } else if (noResult && !response.next) {
            $("#results-container").empty();
            let noResults = " ";
            console.log(".", userInput, ".");
            noResults +=
                '<div class="results">No results found for &nbsp;"' +
                userInput +
                '"</div>';
            $("#results-container").html(noResults);
        }
        noResult = false;

        // console.log("response.items: ", response.items);
        // console.log("response: ", response);

        nextUrl =
            response.next &&
            response.next.replace(
                "https://api.spotify.com/v1/search",
                "https://elegant-croissant.glitch.me/spotify"
            );
        // console.log("nextUrl: ", nextUrl);

        if (window.location.search.indexOf("scroll=infinite") != -1) {
            if (!nextUrl || response.items.length < 20) {
                $("#button").addClass("hidden");
                // ajaxInScroll = false;
            } else if (nextUrl && response.items.length == 20) {
                $("#button").removeClass("hidden");
            }
        } else if (scroll) {
            console.log("scroll true checkScroll");
            // check(ajaxInScroll);
            checkScroll();
        }
    }

    function checkScroll() {
        console.log("in check scroll");
        scroll = false;
        if (
            $(document).scrollTop() + $(window).height() >=
            $(document).height() - 200
        ) {
            console.log("you are on bottom");

            $.ajax({
                url: nextUrl,
                success: function(response) {
                    console.log(response);
                    results(response);
                }
            });
        }
        setTimeout(checkScroll, 700);
    }
})();
