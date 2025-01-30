$(function () {
  $("#contactForm input,#contactForm textarea").jqBootstrapValidation({
    preventSubmit: true,
    submitError: function ($form, event, errors) {
      // additional error messages or events
    },
    submitSuccess: function ($form, event) {
      event.preventDefault();

      // Get all form values
      var formData = {
        name: $("input#name").val().trim(),
        email: $("input#email").val().trim(),
        subject: $("input#subject").val().trim(), // or phone if you changed it
        message: $("textarea#message").val().trim(),
      };

      // Basic validation
      if (!formData.name || !formData.email || !formData.message) {
        return showError("Harap isi semua bidang yang wajib diisi");
      }

      // Email validation
      var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        return showError("Format email tidak valid");
      }

      // Show processing state
      $("#sendMessageButton")
        .prop("disabled", true)
        .html("<i class='fa fa-spinner fa-spin'></i> Mengirim...");

      // Clear previous messages
      $("#success").html("");

      $.ajax({
        url: "../mail/contact_me.php",
        type: "POST",
        dataType: "json",
        data: formData,
        cache: false,
        beforeSend: function () {
          // Clear previous messages
          $("#success").html("");
        },
        success: function (response) {
          // Handle success response
          if (response.success) {
            $("#success").html("<div class='alert alert-success'>");
            $("#success > .alert-success")
              .html(
                "<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;"
              )
              .append("</button>");
            $("#success > .alert-success").append(
              "<strong>Message sent successfully!</strong><br>" +
                "From: " +
                response.details.name +
                "<br>" +
                "Email: " +
                response.details.email
            );
            $("#success > .alert-success").append("</div>");
            // Clear form after successful submission
            $("#contactForm").trigger("reset");
          } else {
            showError(response.message);
          }
        },
        error: function (xhr, status, error) {
          // Handle HTTP errors
          var errorMessage = "Message could not be sent";
          try {
            var response = JSON.parse(xhr.responseText);
            if (response.message) {
              errorMessage = response.message;
              if (response.errorDetails) {
                errorMessage += "<br>Details: " + response.errorDetails;
              }
            }
          } catch (e) {
            errorMessage = "An unexpected error occurred";
          }
          showError(errorMessage);
        },
        complete: function () {
          // Re-enable submit button after AJAX call
          $("#sendMessageButton").prop("disabled", false);
          $("#sendMessageButton").html("Kirim Pesan");
        },
      });
    },
    filter: function () {
      return $(this).is(":visible");
    },
  });

  $('a[data-toggle="tab"]').click(function (e) {
    e.preventDefault();
    $(this).tab("show");
  });

  // Function to display error messages
  function showError(message) {
    $("#success").html("<div class='alert alert-danger'>");
    $("#success > .alert-danger")
      .html(
        "<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;</button>"
      )
      .append("</button>");
    $("#success > .alert-danger").append("<strong>Error: </strong>" + message);
    $("#success > .alert-danger").append("</div>");
  }
});

/*When clicking on Full hide fail/success boxes */
$("#name").focus(function () {
  $("#success").html("");
});
