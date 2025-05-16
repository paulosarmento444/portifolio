(($) => {
  // Check if jQuery is available
  if (typeof jQuery === "undefined") {
    console.error("jQuery is not loaded.");
    return;
  }

  // Check if QRCode is available
  if (typeof QRCode === "undefined") {
    console.error("QRCode library is not loaded.");
    return;
  }

  // Check if wrcodeData is available
  if (typeof wrcodeData === "undefined") {
    console.error("wrcodeData is not defined.");
    return;
  }

  // Quando o documento estiver pronto
  $(document).ready(() => {
    // Procurar por containers de QR code
    $(".wrcode-qrcode-container").each(function () {
      var container = $(this);
      var qrContainer = container.find(".wrcode-qrcode-image");

      // Obter dados
      var orderId = container.data("order-id");
      var amount = container.data("amount");
      var customerName = container.data("customer-name");
      var customerEmail = container.data("customer-email");

      // Gerar QR code via AJAX
      $.ajax({
        url: wrcodeData.ajaxUrl,
        type: "POST",
        data: {
          action: "wrcode_generate_qrcode",
          nonce: wrcodeData.nonce,
          order_id: orderId,
          amount: amount,
          customer_name: customerName,
          customer_email: customerEmail,
        },
        success: (response) => {
          if (response.success) {
            // Gerar QR code
            QRCode.toCanvas(
              qrContainer[0],
              response.data.qrData,
              { width: 200, margin: 1 },
              (error) => {
                if (error) {
                  console.error("Erro ao gerar QR code:", error);
                }
              }
            );
          } else {
            console.error("Erro na resposta AJAX:", response);
          }
        },
        error: (xhr, status, error) => {
          console.error("Erro AJAX:", error);
        },
      });
    });
  });
})(jQuery);
