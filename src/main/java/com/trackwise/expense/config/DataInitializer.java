package com.trackwise.expense.config;

import com.trackwise.expense.model.Transaction;
import com.trackwise.expense.repository.TransactionRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.time.LocalDate;

@Configuration
public class DataInitializer {
    @Bean
    CommandLineRunner seedDemoData(TransactionRepository repository) {
        return args -> {
            if (repository.count() == 0) {
                LocalDate today = LocalDate.now();
                repository.save(new Transaction("Monthly salary", "Salary", "INCOME",
                        new BigDecimal("65000.00"), today, "Monthly salary credit", "Bank transfer"));
                repository.save(new Transaction("Apartment rent", "Housing", "EXPENSE",
                        new BigDecimal("18000.00"), today, "Monthly rent", "Bank transfer"));
                repository.save(new Transaction("Grocery run", "Groceries", "EXPENSE",
                        new BigDecimal("2450.50"), today, "Weekly essentials", "UPI"));
                repository.save(new Transaction("Freelance design", "Freelance", "INCOME",
                        new BigDecimal("8500.00"), today.minusDays(3), "Website design project", "Bank transfer"));
                repository.save(new Transaction("Fuel", "Transport", "EXPENSE",
                        new BigDecimal("1200.00"), today.minusDays(1), "Vehicle fuel", "UPI"));
                repository.save(new Transaction("Streaming subscription", "Entertainment", "EXPENSE",
                        new BigDecimal("499.00"), today.minusDays(2), "Monthly subscription", "Card"));
            }
        };
    }
}
