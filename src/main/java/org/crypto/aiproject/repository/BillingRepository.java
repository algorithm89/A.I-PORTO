package org.crypto.aiproject.repository;

import org.crypto.aiproject.entity.Billing;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BillingRepository extends JpaRepository<Billing, Long> {

    /** Newest payments first. */
    List<Billing> findAllByOrderByPaymentDateDescIdDesc();
}
