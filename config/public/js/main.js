const query_toggle = () => {
    $(".toggle-event").each(function() {
        const current_element = $(this);
        const toggle_target = $(this).data("toggle-target");
        const toggle_targets = $(this).data("toggle-targets");
        const open_icon = $(this).data("open-icon");
        const close_icon = $(this).data("close-icon");
        if (toggle_target) {
            $(this).click(function() {
                if ($(toggle_target).hasClass("collapse")) {
                    $(toggle_target).removeClass("collapse");
                    if (open_icon) {
                        $(current_element).text(open_icon);
                    };
                } else {
                    $(toggle_target).addClass("collapse");
                    if (close_icon) {
                        $(current_element).text(close_icon);
                    };
                };
            });
        };

        if (toggle_targets) {
            $(this).click(function() {
                $(toggle_targets).each(function (){
                    if ($(this).hasClass("collapse")) {
                        $(this).removeClass("collapse");
                        if (open_icon) {
                            $(current_element).text(open_icon);
                        };
                    } else {
                        $(this).addClass("collapse");
                        if (close_icon) {
                            $(current_element).text(close_icon);
                        };
                    };
                });
            });
        };
        
    });
};

const query_bottom_nav = () => {
    $(".bottom-nav-item").each(function() {
        if ($(this).data("link-type") === window.location.hash) {
            $(this).addClass("active");
        } else {
            $(this).removeClass("active");
        };
    });
};

jQuery(() => {
    query_toggle();
    query_bottom_nav();
    $(window).on("hashchange", function(event) {
        query_bottom_nav();
    });
})

// For Search Modal ---------------------------------------------

var modal = document.getElementById("searchModal");
var btn = document.getElementById("openSearchBtn");
var btnSpan = document.getElementById("openSearch");
// When the user clicks on the button, open the modal
btn.onclick = function() {
  modal.style.display = "block";
  btnSpan.text = "close";
}
// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
    btnSpan.text = "search";
  }
}