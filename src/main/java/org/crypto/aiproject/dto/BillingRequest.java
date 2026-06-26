package org.crypto.aiproject.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

public class BillingRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email")
    private String payerEmail;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Amount must be greater than 0")
    private BigDecimal amount;

    @NotNull(message = "Payment date is required")
    private LocalDate paymentDate;

    @NotBlank(message = "Payment method is required")
    @Pattern(regexp = "CASH|ETRANSFER", message = "Method must be CASH or ETRANSFER")
    private String method;

    @Size(max = 1000, message = "Note is too long")
    private String note;

    public String getPayerEmail() { return payerEmail; }
    public void setPayerEmail(String payerEmail) { this.payerEmail = payerEmail; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public LocalDate getPaymentDate() { return paymentDate; }
    public void setPaymentDate(LocalDate paymentDate) { this.paymentDate = paymentDate; }

    public String getMethod() { return method; }
    public void setMethod(String method) { this.method = method; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
