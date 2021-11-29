
'use strict';

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

const query_toggle_error_msg  = () => {
    $(".err-close").each(function() {
        const target_id = $(this).data("target");
        $(this).click(function() {
            $(target_id).hide("slow");
        });
    });
};

const query_forms = () => {
    $("#email").on("focusout", function() {
        if (!($(this).data("ignore")) && $(this).data("ignore") !== true) {
            $.post("/auth/getemail", {username: $("#email").val()}, function(result,err) {
                if (result.exists) {
                    $("#email_err").show();
                    $("#email_err").text("Email already exists.");
                };
            });
        };
    });

    $("#email").on("keyup", function (){
        const val = $(this).val();
        if (!(/^\w+[\+\.\w-]*@([\w-]+\.)*\w+[\w-]*\.([a-z]{2,4}|\d+)$/i.test(val))) {
            $("#email_err").show();
            $("#email_err").text("Email format is invalid");
        } else {
            $("#email_err").hide();
        };
    });

    $("#password").on("keyup", function (){
        const val = $(this).val();
        if (!(/[a-z]/.test(val))) {
            $("#password_err").show();
            $("#password_err").text("Must contain a lowercase");
        } else if (!(/[A-Z]/.test(val))) {
            $("#password_err").show();
            $("#password_err").text("Must contain a uppercase");
        } else if (!(/[0-9]/.test(val))) {
            $("#password_err").show();
            $("#password_err").text("Must contain a number");
        } else if (!(/[^a-zA-Z0-9]/.test(val))) {
            $("#password_err").show();
            $("#password_err").text("Must contain a special character");
        } else if (val.length < 8) {
            $("#password_err").show();
            $("#password_err").text("Must be at least 8 characters");
        } else {
            $("#password_err").hide();
        };
    });

    $("#cfmpassword").on("keyup", function(){
        const val = $(this).val();
        if (val !== $('#password').val()) {
            $("#cfmpassword_err").show();
            $("#cfmpassword_err").text("Password does not match");
        } else {
            $("#cfmpassword_err").hide();
        };
    });

    $('#otp').mask("AAAAAA", {placeholder: "XXXXXX",selectOnFocus: true});

    $("#twitter").on("keyup", function(){
        const val = $(this).val();
        if (!(/^\@{1}([a-zA-Z0-9]+[^a-zA-Z0-9\s]*)$/.test(val))) {
            $("#twitter_err").show();
            $("#twitter_err").text("Twitter format is invalid");
        } else {
            $("#twitter_err").hide();
        };
    });

    $("#instagram").on("keyup", function(){
        const val = $(this).val();
        if (!(/^\@{1}([a-zA-Z0-9]+[^a-zA-Z0-9\s]*)$/.test(val))) {
            $("#instagram_err").show();
            $("#instagram_err").text("Instagram format is invalid");
        } else {
            $("#instagram_err").hide();
        };
    });

    $("#avatar").on("change", function() {
        const myFile = $(this).prop('files')[0];
        const extension = myFile.name.split(".");
        if (!(/png|jpeg|jpg/.test(extension[extension.length - 1]))) {
            $("#avatar_err").show();
            $("#avatar_err").text("Only accepts png, jpg and jpeg");
        } else {
            $("#avatar_preview").attr("src",URL.createObjectURL(myFile))
            $("#avatar_err").hide();
        };
    });

    $("#other_proof").on("change", function() {
        const myFile = $(this).prop('files')[0];
        const extension = myFile.name.split(".");
        if (!(/pdf|txt/.test(extension[extension.length - 1]))) {
            $("#other_proof_err").show();
            $("#other_proof_err").text("Only accepts txt and pdf");
        } else {
            $("#other_proof_err").hide();
        };
    });
};

jQuery(() => {
    query_toggle();
    query_bottom_nav();
    query_toggle_error_msg();  
    query_forms(); 
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