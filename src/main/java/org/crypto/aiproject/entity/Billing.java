package org.crypto.aiproject.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "billings")
public class Billing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Email the payment is associated with (the person being billed). */
    @Column(nullable = false)
    private String payerEmail;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    /** Date the money was paid / received. */
    @Column(nullable = false)
    private LocalDate paymentDate;

    /** "CASH" or "ETRANSFER". */
    @Column(nullable = false)
    private String method;

    @Column(length = 1000)
    private String note;

    /** Typed electronic signature (the signer's name). Required for new entries
     *  via the request DTO; left nullable in the schema so adding the column to a
     *  table that already has rows doesn't break the migration. */
    @Column
    private String signature;

    /** Username of whoever entered the record. */
    @Column(nullable = false)
    private String createdBy;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Billing() {}

    public Billing(String payerEmail, BigDecimal amount, LocalDate paymentDate,
                   String method, String note, String signature, String createdBy) {
        this.payerEmail = payerEmail;
        this.amount = amount;
        this.paymentDate = paymentDate;
        this.method = method;
        this.note = note;
        this.signature = signature;
        this.createdBy = createdBy;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

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

    public String getSignature() { return signature; }
    public void setSignature(String signature) { this.signature = signature; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
